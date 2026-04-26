"""LLM Router: Gemini primary, Claude fallback.

If GEMINI_API_KEY is set and the call succeeds, returns Gemini's response.
Otherwise falls back to Anthropic Claude. Raises RuntimeError if both fail
or neither is configured.
"""
from __future__ import annotations

import json
import logging
from dataclasses import dataclass
from enum import Enum
from typing import Any

from config import get_settings

logger = logging.getLogger(__name__)


class Provider(str, Enum):
    GEMINI = "gemini"
    CLAUDE = "claude"


@dataclass
class LLMResponse:
    text: str
    provider: Provider
    model: str
    raw: dict[str, Any] | None = None


class LLMRouter:
    def __init__(self) -> None:
        settings = get_settings()
        self.gemini_key = settings.gemini_api_key
        self.gemini_model = settings.gemini_model
        self.claude_key = settings.anthropic_api_key
        self.claude_model = settings.anthropic_model

        self._gemini_client = None
        self._claude_client = None

        if self.gemini_key:
            try:
                import google.generativeai as genai
                genai.configure(api_key=self.gemini_key)
                self._gemini_client = genai.GenerativeModel(self.gemini_model)
                logger.info("Gemini client initialized: %s", self.gemini_model)
            except Exception as exc:
                logger.error("Failed to init Gemini: %s", exc)

        if self.claude_key:
            try:
                from anthropic import AsyncAnthropic
                self._claude_client = AsyncAnthropic(api_key=self.claude_key)
                logger.info("Claude client initialized: %s", self.claude_model)
            except Exception as exc:
                logger.error("Failed to init Claude: %s", exc)

    @property
    def has_any_provider(self) -> bool:
        return self._gemini_client is not None or self._claude_client is not None

    async def generate(
        self,
        prompt: str,
        system: str | None = None,
        max_tokens: int = 1024,
        temperature: float = 0.4,
    ) -> LLMResponse:
        last_error: Exception | None = None

        if self._gemini_client is not None:
            try:
                return await self._gemini_generate(prompt, system, max_tokens, temperature)
            except Exception as exc:
                logger.warning("Gemini failed (%s) — falling back to Claude", exc)
                last_error = exc

        if self._claude_client is not None:
            try:
                return await self._claude_generate(prompt, system, max_tokens, temperature)
            except Exception as exc:
                logger.error("Claude also failed: %s", exc)
                last_error = exc

        raise RuntimeError(
            f"No LLM provider available. Configure GEMINI_API_KEY or ANTHROPIC_API_KEY. "
            f"Last error: {last_error}"
        )

    async def generate_json(
        self,
        prompt: str,
        system: str | None = None,
        max_tokens: int = 1024,
    ) -> dict[str, Any]:
        full_system = (system or "") + "\n\nRespond ONLY with valid JSON. No prose, no markdown fences."
        resp = await self.generate(prompt, system=full_system, max_tokens=max_tokens, temperature=0.2)
        text = resp.text.strip()
        if text.startswith("```"):
            text = text.strip("`")
            if text.startswith("json"):
                text = text[4:]
            text = text.strip()
        try:
            return json.loads(text)
        except json.JSONDecodeError as exc:
            logger.error("Failed to parse JSON from %s: %s", resp.provider, text[:200])
            raise ValueError(f"LLM returned non-JSON: {exc}") from exc

    async def _gemini_generate(
        self, prompt: str, system: str | None, max_tokens: int, temperature: float
    ) -> LLMResponse:
        import google.generativeai as genai
        full_prompt = (f"{system}\n\n{prompt}" if system else prompt)
        config = genai.types.GenerationConfig(
            max_output_tokens=max_tokens,
            temperature=temperature,
        )
        result = await self._gemini_client.generate_content_async(full_prompt, generation_config=config)
        text = (result.text or "").strip()
        return LLMResponse(text=text, provider=Provider.GEMINI, model=self.gemini_model)

    async def _claude_generate(
        self, prompt: str, system: str | None, max_tokens: int, temperature: float
    ) -> LLMResponse:
        message = await self._claude_client.messages.create(
            model=self.claude_model,
            max_tokens=max_tokens,
            temperature=temperature,
            system=system or "You are a helpful assistant.",
            messages=[{"role": "user", "content": prompt}],
        )
        text = "".join(block.text for block in message.content if block.type == "text").strip()
        return LLMResponse(text=text, provider=Provider.CLAUDE, model=self.claude_model)


_router_singleton: LLMRouter | None = None


def get_router() -> LLMRouter:
    global _router_singleton
    if _router_singleton is None:
        _router_singleton = LLMRouter()
    return _router_singleton
