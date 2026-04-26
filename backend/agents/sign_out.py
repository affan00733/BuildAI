from __future__ import annotations

from agents.base import BaseAgent
from api.models import SignClip
from services.sign_lookup import get_sign_lookup


class SignOutAgent(BaseAgent):
    name = "sign_out"

    def __init__(self) -> None:
        self._lookup = get_sign_lookup()

    async def run(self, *, text: str) -> list[SignClip]:
        self.emit("active", "Looking up sign clips...")
        clips = self._lookup.find_signs(text)
        if clips:
            self.emit("done", f"Matched {len(clips)} signs: {', '.join(c.word for c in clips)}")
        else:
            self.emit("done", "No signs in vocabulary for this segment")
        return clips
