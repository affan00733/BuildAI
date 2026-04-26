from __future__ import annotations

from agents.base import BaseAgent
from services.diarization import DiarizedTurn, get_diarizer


class SpeakerIdAgent(BaseAgent):
    name = "speaker_id"

    def __init__(self) -> None:
        self._diarizer = get_diarizer()

    async def run(self, *, audio_bytes: bytes | None, hint_speakers: list[str]) -> list[DiarizedTurn]:
        self.emit("active", "Identifying speaker...")
        turns = await self._diarizer.diarize(audio_bytes, hint_speakers)
        if turns:
            self.emit("done", f"Identified: {turns[0].speaker_id}", meta={"confidence": turns[0].confidence})
        else:
            self.emit("error", "No speakers detected")
        return turns
