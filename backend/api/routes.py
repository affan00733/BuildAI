from __future__ import annotations

import uuid

from fastapi import APIRouter, HTTPException

from agents.base import utcnow
from agents.orchestrator import SPEAKER_COLORS, get_orchestrator
from api.models import (
    AgentEvent,
    CreateMeetingRequest,
    CreateMeetingResponse,
    HealthResponse,
    MeetingSummary,
    SignClip,
    Speaker,
    TranscribeRequest,
    TranscriptSegment,
)
from config import get_settings
from llm_router import get_router
from services.sign_lookup import get_sign_lookup


router = APIRouter()


# --- in-memory store (hackathon scope; swap for Firestore/Redis in prod) ---
class _Store:
    def __init__(self) -> None:
        self.meetings: dict[str, dict] = {}  # meeting_id -> {title, mode, speakers, transcript, started_at}

    def create(self, req: CreateMeetingRequest) -> CreateMeetingResponse:
        mid = str(uuid.uuid4())[:8]
        speakers = [
            Speaker(id=str(uuid.uuid4())[:8], name=name, color=SPEAKER_COLORS[i % len(SPEAKER_COLORS)])
            for i, name in enumerate(req.expected_speakers)
        ]
        now = utcnow()
        self.meetings[mid] = {
            "title": req.title,
            "mode": req.mode,
            "speakers": speakers,
            "transcript": [],
            "started_at": now,
        }
        return CreateMeetingResponse(meeting_id=mid, title=req.title, mode=req.mode, started_at=now)

    def get(self, mid: str) -> dict:
        if mid not in self.meetings:
            raise HTTPException(status_code=404, detail=f"Meeting {mid} not found")
        return self.meetings[mid]


_store = _Store()


@router.get("/health", response_model=HealthResponse)
async def health() -> HealthResponse:
    settings = get_settings()
    router_ = get_router()
    active = None
    if router_._gemini_client is not None:
        active = "gemini"
    elif router_._claude_client is not None:
        active = "claude"
    return HealthResponse(
        status="ok" if router_.has_any_provider else "degraded",
        llm_provider_active=active,
        has_gemini=router_._gemini_client is not None,
        has_claude=router_._claude_client is not None,
        mock_mode=settings.use_mock_diarization or settings.use_mock_sign_lookup,
    )


@router.post("/meetings", response_model=CreateMeetingResponse)
async def create_meeting(req: CreateMeetingRequest) -> CreateMeetingResponse:
    return _store.create(req)


@router.get("/meetings/{meeting_id}")
async def get_meeting(meeting_id: str) -> dict:
    m = _store.get(meeting_id)
    return {
        "meeting_id": meeting_id,
        "title": m["title"],
        "mode": m["mode"],
        "speakers": m["speakers"],
        "transcript": m["transcript"],
        "started_at": m["started_at"],
    }


@router.post("/transcribe")
async def transcribe(req: TranscribeRequest) -> dict:
    """Process one segment through the agent pipeline.
    Returns the new TranscriptSegment + agent activity events.
    """
    m = _store.get(req.meeting_id)
    orch = get_orchestrator()
    segment, events = await orch.process_segment(
        meeting_id=req.meeting_id,
        audio_chunk_b64=req.audio_chunk_b64,
        text_hint=req.text,
        speakers=m["speakers"],
    )
    m["transcript"].append(segment)
    if segment.speaker not in m["speakers"]:
        m["speakers"].append(segment.speaker)
    return {"segment": segment, "events": events}


@router.post("/meetings/{meeting_id}/end", response_model=MeetingSummary)
async def end_meeting(meeting_id: str) -> MeetingSummary:
    m = _store.get(meeting_id)
    duration = int((utcnow() - m["started_at"]).total_seconds())
    orch = get_orchestrator()
    summary = await orch.generate_summary(
        meeting_id=meeting_id,
        title=m["title"],
        transcript=m["transcript"],
        speakers=m["speakers"],
        duration_seconds=duration,
    )
    return summary


@router.get("/signs/lookup")
async def lookup_signs(text: str) -> list[SignClip]:
    """Lookup sign clips for arbitrary text — useful for the demo."""
    return get_sign_lookup().find_signs(text)


@router.get("/signs/vocabulary")
async def sign_vocabulary() -> list[str]:
    return get_sign_lookup().vocabulary()
