"""Orchestrator: coordinates all agents for a single transcription cycle."""
from __future__ import annotations

import uuid

from agents.action import ActionAgent
from agents.base import BaseAgent, utcnow
from agents.listening import ListeningAgent
from agents.sign_out import SignOutAgent
from agents.speaker_id import SpeakerIdAgent
from agents.translate import TranslateAgent
from api.models import (
    ActionItem,
    AgentEvent,
    MeetingSummary,
    Speaker,
    TranscriptSegment,
)
from llm_router import get_router


SPEAKER_COLORS = ["#6366f1", "#ec4899", "#22c55e", "#f59e0b", "#06b6d4", "#a855f7", "#ef4444", "#84cc16"]


class Orchestrator(BaseAgent):
    name = "orchestrator"

    def __init__(self) -> None:
        self.listening = ListeningAgent()
        self.speaker_id = SpeakerIdAgent()
        self.translate = TranslateAgent()
        self.sign_out = SignOutAgent()
        self.action = ActionAgent()
        self._router = get_router()

    async def run(self, **kwargs):  # not used directly — see methods below
        raise NotImplementedError("Use process_segment / generate_summary")

    async def process_segment(
        self,
        *,
        meeting_id: str,
        audio_chunk_b64: str | None,
        text_hint: str | None,
        speakers: list[Speaker],
    ) -> tuple[TranscriptSegment, list[AgentEvent]]:
        events: list[AgentEvent] = []
        events.append(self.emit("active", "Coordinating agents for new segment"))

        capture = await self.listening.run(audio_chunk_b64=audio_chunk_b64, text=text_hint)
        events.append(self.listening.emit("done", "Audio captured"))

        hint_names = [s.name for s in speakers]
        turns = await self.speaker_id.run(audio_bytes=capture["audio_bytes"], hint_speakers=hint_names)
        speaker_name = turns[0].speaker_id if turns else (hint_names[0] if hint_names else "Speaker 1")
        events.append(self.speaker_id.emit("done", f"Speaker: {speaker_name}"))

        speaker = next((s for s in speakers if s.name == speaker_name), None)
        if not speaker:
            speaker = Speaker(
                id=str(uuid.uuid4())[:8],
                name=speaker_name,
                color=SPEAKER_COLORS[len(speakers) % len(SPEAKER_COLORS)],
            )

        raw = capture["text_hint"] or "(audio not transcribed in mock mode)"
        cleaned = await self.translate.run(raw_text=raw)
        events.append(self.translate.emit("done", "Transcript cleaned"))

        clips = await self.sign_out.run(text=cleaned)
        events.append(self.sign_out.emit("done", f"{len(clips)} sign clips matched"))

        segment = TranscriptSegment(
            id=str(uuid.uuid4())[:8],
            meeting_id=meeting_id,
            speaker=speaker,
            text=cleaned,
            timestamp=utcnow(),
            sign_clip_ids=[c.id for c in clips],
            confidence=turns[0].confidence if turns else 1.0,
        )

        events.append(self.emit("done", "Segment processed"))
        return segment, events

    async def generate_summary(
        self,
        *,
        meeting_id: str,
        title: str,
        transcript: list[TranscriptSegment],
        speakers: list[Speaker],
        duration_seconds: int,
    ) -> MeetingSummary:
        action_items = await self.action.run(transcript=transcript)
        summary_text, topics = await self._summarize(transcript)
        return MeetingSummary(
            meeting_id=meeting_id,
            title=title,
            duration_seconds=duration_seconds,
            speakers=speakers,
            summary=summary_text,
            key_topics=topics,
            action_items=action_items,
            transcript=transcript,
            generated_at=utcnow(),
        )

    async def _summarize(self, transcript: list[TranscriptSegment]) -> tuple[str, list[str]]:
        if not transcript:
            return ("No content was captured during this meeting.", [])
        if not self._router.has_any_provider:
            return (f"{len(transcript)} segments captured (LLM disabled — summary skipped).", [])

        body = "\n".join(f"{seg.speaker.name}: {seg.text}" for seg in transcript)
        try:
            data = await self._router.generate_json(
                prompt=f"Meeting transcript:\n{body}\n\nProduce summary + key topics:",
                system=(
                    "Summarize the meeting in 2-3 sentences. Then list 3-6 key topics discussed. "
                    "Return JSON: {\"summary\": str, \"topics\": [str, ...]}"
                ),
                max_tokens=512,
            )
            return (data.get("summary", ""), data.get("topics", []))
        except Exception:
            return (f"{len(transcript)} segments captured.", [])


_orch: Orchestrator | None = None


def get_orchestrator() -> Orchestrator:
    global _orch
    if _orch is None:
        _orch = Orchestrator()
    return _orch
