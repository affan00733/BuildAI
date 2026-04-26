# SignBridge

Agentic AI for real-time multi-speaker meeting accessibility.
Built for Build with AI · GDG on Campus, University of Maryland.

## What it does

Six specialized AI agents — Listening, Speaker ID, Translate, Sign-Out, Action, and an Orchestrator —
coordinate to make any multi-speaker meeting fully accessible to deaf participants in real time.
Speaker labels, live captions, sign-language clips, and an end-of-meeting summary with action items.

LLM Router runs **Gemini 2.5 Flash** as the primary provider, with **Claude Sonnet 4.6** as automatic fallback.

## Project layout

```
backend/        Python · FastAPI · agents + LLM router
frontend/       Next.js 15 · Tailwind · Framer Motion
```

## Setup

### 1. API keys (do this FIRST)

```bash
cp backend/.env.example backend/.env
# Edit backend/.env and paste your keys:
#   GEMINI_API_KEY  (https://aistudio.google.com/app/apikey)
#   ANTHROPIC_API_KEY  (https://console.anthropic.com/settings/keys)
```

You can run with **only one** key set — the router falls back automatically.

### 2. Backend

```bash
cd backend
python -m venv ../.venv      # if you don't already have one
source ../.venv/bin/activate
pip install -r requirements.txt
python -m pytest             # run tests
python main.py               # start server on http://localhost:8000
```

API docs: http://localhost:8000/docs

### 3. Frontend

```bash
cd frontend
cp .env.example .env.local
npm install
npm run dev                  # http://localhost:3000
```

## How to demo

1. Open http://localhost:3000 — landing page
2. Click **Try the live demo** → meeting view
3. Click **Start the meeting** → seeds three speakers (Sarah, Raj, Priya)
4. Click **Next demo line** repeatedly → watch agents fire in the right panel,
   captions stream, sign clips animate
5. Click **End & summarize** → LLM extracts action items and key topics

## Architecture

```
Frontend (Next.js)
    │
    ▼  REST/JSON
Backend (FastAPI)
    │
    ▼
Orchestrator (Gemini 2.5 Flash)
    │
    ├── Listening Agent     (Web Audio capture / text passthrough)
    ├── Speaker ID Agent    (pyannote.audio — currently mocked)
    ├── Translate Agent     (LLM cleanup + translation)
    ├── Sign-Out Agent      (WLASL sign clip lookup — currently mocked)
    └── Action Agent        (LLM action item extraction)
            │
            ▼
        LLM Router  (Gemini → Claude fallback)
```

## What's mocked vs real

| Component | Status |
|---|---|
| LLM Router (Gemini + Claude fallback) | ✅ Real |
| Agent orchestration | ✅ Real |
| FastAPI endpoints | ✅ Real |
| Frontend animations + UX | ✅ Real |
| Action item extraction (uses LLM) | ✅ Real (when key set) |
| Meeting summarization (uses LLM) | ✅ Real (when key set) |
| Speaker diarization | 🔧 Mocked — wire `pyannote.audio` next |
| Sign clip recognition | 🔧 Mocked — wire WLASL pretrained next |
| Audio streaming (WebRTC) | 🔧 Text input for now |

## Tests

```bash
cd backend
python -m pytest -v
```

Covers LLM Router fallback logic, all REST endpoints, and the full meeting lifecycle.

## Security

Never commit `.env`. Never paste API keys in chat or PR descriptions. If a key is exposed, rotate it
immediately at the provider console.
