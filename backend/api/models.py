from __future__ import annotations

from datetime import datetime
from enum import Enum
from typing import Literal

from pydantic import BaseModel, Field


class MeetingMode(str, Enum):
    GENERAL = "general"
    MEDICAL = "medical"
    LEGAL = "legal"
    EDUCATION = "education"


class CreateMeetingRequest(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    mode: MeetingMode = MeetingMode.GENERAL
    expected_speakers: list[str] = Field(default_factory=list)
    target_language: str = "en"


class CreateMeetingResponse(BaseModel):
    meeting_id: str
    title: str
    mode: MeetingMode
    started_at: datetime


class TranscribeRequest(BaseModel):
    meeting_id: str
    audio_chunk_b64: str | None = None
    text: str | None = None  # for testing without real audio


class Speaker(BaseModel):
    id: str
    name: str
    color: str  # hex color for UI


class TranscriptSegment(BaseModel):
    id: str
    meeting_id: str
    speaker: Speaker
    text: str
    timestamp: datetime
    sign_clip_ids: list[str] = Field(default_factory=list)
    confidence: float = 1.0


class SignClip(BaseModel):
    id: str
    word: str
    video_url: str
    duration_ms: int
    description: str


class AgentEvent(BaseModel):
    agent: Literal["orchestrator", "listening", "speaker_id", "translate", "sign_out", "action"]
    status: Literal["thinking", "active", "done", "error"]
    message: str
    timestamp: datetime
    meta: dict | None = None


class ActionItem(BaseModel):
    id: str
    text: str
    owner: str
    deadline: str | None = None
    priority: Literal["low", "medium", "high"] = "medium"


class MeetingSummary(BaseModel):
    meeting_id: str
    title: str
    duration_seconds: int
    speakers: list[Speaker]
    summary: str
    key_topics: list[str]
    action_items: list[ActionItem]
    transcript: list[TranscriptSegment]
    generated_at: datetime


class HealthResponse(BaseModel):
    status: Literal["ok", "degraded"]
    llm_provider_active: str | None
    has_gemini: bool
    has_claude: bool
    mock_mode: bool
