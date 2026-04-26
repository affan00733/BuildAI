from __future__ import annotations

from agents.base import BaseAgent
from llm_router import get_router


SYSTEM_PROMPT = """You are a meeting transcription assistant. Given a raw audio
transcript snippet (or text hint), produce a clean, grammatically correct sentence
that captures what the speaker said. Keep it concise and faithful to the original.
Output ONLY the cleaned sentence, nothing else."""


class TranslateAgent(BaseAgent):
    """Cleans up raw ASR output into readable sentences using the LLM."""

    name = "translate"

    def __init__(self) -> None:
        self._router = get_router()

    async def run(self, *, raw_text: str) -> str:
        if not raw_text or not raw_text.strip():
            self.emit("error", "Empty input")
            return ""

        if not self._router.has_any_provider:
            self.emit("done", "No LLM configured — passthrough", meta={"fallback": True})
            return raw_text.strip()

        self.emit("active", "Cleaning transcript with LLM...")
        try:
            resp = await self._router.generate(
                prompt=f"Raw transcript snippet:\n{raw_text}\n\nCleaned sentence:",
                system=SYSTEM_PROMPT,
                max_tokens=200,
                temperature=0.3,
            )
            self.emit("done", f"Cleaned via {resp.provider.value}", meta={"provider": resp.provider.value})
            return resp.text
        except Exception as exc:
            self.emit("error", f"LLM failed: {exc} — passthrough")
            return raw_text.strip()
