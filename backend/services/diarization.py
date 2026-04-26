"""Speaker diarization service.

Currently mocked for hackathon velocity. Replace `MockDiarizer` with
`PyannoteDiarizer` (which calls pyannote.audio with a HF token) for
real audio processing.
"""
from __future__ import annotations

import random
from dataclasses import dataclass


@dataclass
class DiarizedTurn:
    speaker_id: str
    start_seconds: float
    end_seconds: float
    confidence: float


class BaseDiarizer:
    async def diarize(self, audio_chunk: bytes | None, hint_speakers: list[str]) -> list[DiarizedTurn]:
        raise NotImplementedError


class MockDiarizer(BaseDiarizer):
    """Round-robins through hint speakers to simulate diarization."""

    def __init__(self) -> None:
        self._counter = 0

    async def diarize(self, audio_chunk: bytes | None, hint_speakers: list[str]) -> list[DiarizedTurn]:
        if not hint_speakers:
            hint_speakers = ["Speaker 1", "Speaker 2", "Speaker 3"]
        speaker = hint_speakers[self._counter % len(hint_speakers)]
        self._counter += 1
        return [
            DiarizedTurn(
                speaker_id=speaker,
                start_seconds=0.0,
                end_seconds=2.5,
                confidence=round(random.uniform(0.85, 0.99), 2),
            )
        ]


def get_diarizer() -> BaseDiarizer:
    """Factory — returns mock unless real model is wired in."""
    from config import get_settings
    settings = get_settings()
    if settings.use_mock_diarization:
        return MockDiarizer()
    raise NotImplementedError(
        "Real diarization not wired up. Set USE_MOCK_DIARIZATION=true or "
        "implement PyannoteDiarizer with a HuggingFace token."
    )
