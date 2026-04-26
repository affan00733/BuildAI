"""Sign clip lookup service.

For each English word, returns a sign-language video clip reference.
Mocked with a curated dictionary; replace with WLASL pretrained model
+ real clip library for production.
"""
from __future__ import annotations

from api.models import SignClip


# Curated mock library — 40 high-frequency signs across general, medical, business
MOCK_SIGN_LIBRARY: dict[str, SignClip] = {
    word: SignClip(
        id=f"wlasl-{word.lower()}",
        word=word,
        video_url=f"https://signdict.org/video/{word.lower()}.mp4",
        duration_ms=1200,
        description=f"ASL sign for '{word}'",
    )
    for word in [
        # Greetings / basics
        "hello", "thank you", "yes", "no", "please", "sorry", "help", "stop",
        # Meeting vocabulary
        "meeting", "agenda", "deadline", "blocker", "deploy", "review",
        "question", "answer", "team", "project", "today", "tomorrow",
        # Medical
        "doctor", "pain", "water", "medicine", "emergency", "hospital",
        # Business
        "money", "budget", "client", "report", "approve", "decision",
        # Common verbs
        "need", "want", "see", "understand", "think", "work", "talk", "listen",
    ]
}


class SignLookup:
    def __init__(self, library: dict[str, SignClip] | None = None) -> None:
        self._library = library or MOCK_SIGN_LIBRARY

    def find_signs(self, text: str, max_clips: int = 5) -> list[SignClip]:
        words = [w.strip(".,!?;:'\"").lower() for w in text.split()]
        matched: list[SignClip] = []
        seen: set[str] = set()
        for word in words:
            if word in self._library and word not in seen:
                matched.append(self._library[word])
                seen.add(word)
                if len(matched) >= max_clips:
                    break
        return matched

    def vocabulary(self) -> list[str]:
        return sorted(self._library.keys())


_lookup_singleton: SignLookup | None = None


def get_sign_lookup() -> SignLookup:
    global _lookup_singleton
    if _lookup_singleton is None:
        _lookup_singleton = SignLookup()
    return _lookup_singleton
