from __future__ import annotations

import logging
from abc import ABC, abstractmethod
from datetime import datetime, timezone
from typing import Any

from api.models import AgentEvent

logger = logging.getLogger(__name__)


def utcnow() -> datetime:
    return datetime.now(timezone.utc)


class BaseAgent(ABC):
    """All agents emit AgentEvents so the frontend can show their activity."""

    name: str = "base"

    def emit(self, status: str, message: str, meta: dict | None = None) -> AgentEvent:
        event = AgentEvent(
            agent=self.name,  # type: ignore[arg-type]
            status=status,  # type: ignore[arg-type]
            message=message,
            timestamp=utcnow(),
            meta=meta,
        )
        logger.debug("[agent:%s] %s — %s", self.name, status, message)
        return event

    @abstractmethod
    async def run(self, **kwargs: Any) -> Any:
        ...
