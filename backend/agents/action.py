from __future__ import annotations

import json
import uuid

from agents.base import BaseAgent
from api.models import ActionItem, TranscriptSegment
from llm_router import get_router


SYSTEM_PROMPT = """You are a meeting assistant. Given the full transcript of a
meeting, extract concrete action items. For each item:
- text: what needs to be done (concise, imperative)
- owner: who is responsible (use exact speaker name from the transcript)
- deadline: when it's due (or null if not mentioned)
- priority: "low" | "medium" | "high" based on urgency cues

Return a JSON object with a single key "items" containing the list. If no actions
exist, return {"items": []}.

Example:
{"items": [{"text": "Refactor auth service", "owner": "Sarah", "deadline": "Friday", "priority": "high"}]}
"""


class ActionAgent(BaseAgent):
    name = "action"

    def __init__(self) -> None:
        self._router = get_router()

    async def run(self, *, transcript: list[TranscriptSegment]) -> list[ActionItem]:
        if not transcript:
            self.emit("done", "Empty transcript — no actions")
            return []

        if not self._router.has_any_provider:
            self.emit("done", "No LLM configured — skipping action extraction")
            return []

        self.emit("active", "Extracting action items...")
        formatted = "\n".join(f"{seg.speaker.name}: {seg.text}" for seg in transcript)

        try:
            data = await self._router.generate_json(
                prompt=f"Meeting transcript:\n{formatted}\n\nExtract action items:",
                system=SYSTEM_PROMPT,
                max_tokens=1024,
            )
            raw_items = data.get("items", []) if isinstance(data, dict) else []
            items = [
                ActionItem(
                    id=str(uuid.uuid4())[:8],
                    text=str(item.get("text", "")),
                    owner=str(item.get("owner", "Unassigned")),
                    deadline=item.get("deadline"),
                    priority=item.get("priority") if item.get("priority") in ("low", "medium", "high") else "medium",
                )
                for item in raw_items
                if item.get("text")
            ]
            self.emit("done", f"Extracted {len(items)} action items")
            return items
        except Exception as exc:
            self.emit("error", f"Action extraction failed: {exc}")
            return []
