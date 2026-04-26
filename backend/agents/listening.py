from __future__ import annotations

import base64

from agents.base import BaseAgent


class ListeningAgent(BaseAgent):
    """Captures audio chunks. In mock mode, accepts text directly."""

    name = "listening"

    async def run(self, *, audio_chunk_b64: str | None = None, text: str | None = None) -> dict:
        if text:
            self.emit("done", f"Captured text input: {len(text)} chars")
            return {"audio_bytes": None, "text_hint": text}
        if audio_chunk_b64:
            audio_bytes = base64.b64decode(audio_chunk_b64)
            self.emit("done", f"Captured audio chunk: {len(audio_bytes)} bytes")
            return {"audio_bytes": audio_bytes, "text_hint": None}
        self.emit("error", "No audio or text provided")
        return {"audio_bytes": None, "text_hint": None}
