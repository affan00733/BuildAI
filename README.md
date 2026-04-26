# SignBridge

> **Agentic AI for inclusive meetings.** Real-time transcription, speaker identification, multilingual captions, and a continuous sign-language avatar — for the 70 million deaf people excluded from meetings every day.

Built for **Build with AI** · GDG on Campus, University of Maryland — April 2026.

---

## What it does

SignBridge turns any multi-speaker meeting into a fully accessible experience for deaf participants. Six specialized AI agents — coordinated by Gemini — handle:

- 🎤 **Live mic capture** (browser MediaRecorder, no Google dependency)
- 🗣️ **Speech-to-text** via OpenAI Whisper (HuggingFace Inference)
- 👥 **Speaker diarization** via pyannote.audio (real ML, runs on your laptop)
- ✍️ **Transcript cleanup + translation** (Gemini → Claude fallback) into 10+ languages
- 🤟 **Continuous sign-language avatar** via [sign.mt](https://sign.mt) (Moryossef et al., open-source spoken-to-signed translation)
- 📋 **End-of-meeting summary + action items** with owners, deadlines, priorities
- 📊 **Live LLM stats** — calls, latency, tokens, fallback rate

Every component is real. **Zero mocks.** The `/api/health` endpoint reports `mock_mode: false`.

---

## Architecture

```
Frontend (Next.js 15 + Framer Motion)
   │   MediaRecorder → WAV → POST /api/transcribe-audio
   ▼
FastAPI backend (Python 3.13)
   │
   ▼
ORCHESTRATOR  (Gemini 2.5 Flash)
   │
   ├── Listening Agent    → Whisper-large-v3 (HF Inference)
   ├── Speaker ID Agent   → pyannote.audio 4.0.4 (local)
   ├── Translate Agent    → Gemini / Claude (with auto-fallback)
   ├── Sign-Out Agent     → WLASL dataset (1959 ASL signs)
   └── Action Agent       → Gemini / Claude (JSON action extraction)
            │
            ▼
        LLM ROUTER  (Gemini → Claude fallback)
```

---

## ⚡ Quick start for judges (5 minutes)

### Prerequisites
- **Python 3.13** (works on 3.11+, but tested on 3.13)
- **Node.js 18+** and **npm**
- A Gemini API key (free, 30 seconds — see below)
- A HuggingFace token (free, 1 minute — see below)

### Step 1 — Clone

```bash
git clone https://github.com/<your-username>/signbridge.git
cd signbridge
```

### Step 2 — Get your free API keys

| Provider | Where | Time | Notes |
|---|---|---|---|
| **Gemini** | https://aistudio.google.com/app/apikey | 30 sec | Free tier, just sign in with Google → "Create API key" |
| **HuggingFace** | https://huggingface.co/settings/tokens | 1 min | Free, "New token" → "Read" access |
| **Claude** *(optional)* | https://console.anthropic.com/settings/keys | 30 sec | Skip if you don't want fallback — system runs on Gemini alone |

After getting your HF token, **accept terms on these 3 gated model pages** (one click each):
1. https://huggingface.co/pyannote/speaker-diarization-3.1
2. https://huggingface.co/pyannote/segmentation-3.0
3. https://huggingface.co/pyannote/speaker-diarization-community-1

### Step 3 — Configure backend

```bash
cd backend
cp .env.example .env
# Open .env in your editor, paste your Gemini key + HF token. Save.

python3.13 -m venv ../.venv
source ../.venv/bin/activate
pip install -r requirements.txt
```

### Step 4 — Configure frontend

```bash
cd ../frontend
cp .env.example .env.local
npm install
```

### Step 5 — Run

Open two terminals.

**Terminal 1 — backend:**
```bash
cd backend
source ../.venv/bin/activate
python main.py
# → http://localhost:8000  ·  API docs at /docs
```

**Terminal 2 — frontend:**
```bash
cd frontend
npm run dev
# → http://localhost:3000
```

### Step 6 — Test it

Open **http://localhost:3000** in **Chrome or Edge** (sign.mt avatar + Web Speech API work best there).

1. Click **"Try the live demo"** → **"Start the meeting"** — three speakers appear (Sarah, Raj, Priya).
2. Click **"Scripted demo line"** a few times → captions stream in with `via Gemini ✓` badges, sign avatar signs each sentence.
3. Click 🎤 **Start recording**, say *"I have a blocker, need help today"*, click **Stop & transcribe** — Whisper transcribes, pyannote identifies the speaker, avatar signs.
4. Switch the language picker top-right to 🇪🇸 Spanish, click another scripted line — caption appears in Spanish.
5. Click **End & summarize** — modal shows LLM-generated summary + action items.

**That's the full demo.** Everything you see is real ML running through real APIs.

---

## 🧪 Testing

### Automated tests

```bash
cd backend
source ../.venv/bin/activate
python -m pytest -v
```

Expected output: **17 passed** — covers LLM Router fallback logic, all REST endpoints, the full meeting lifecycle, SSE streaming, multi-language, and audio upload.

### Manual API testing

The backend exposes an OpenAPI/Swagger UI at **http://localhost:8000/docs** — click any endpoint, "Try it out", "Execute".

Key endpoints to test:
| Endpoint | What it does |
|---|---|
| `GET /api/health` | Verify all providers loaded — should show `"mock_mode": false` |
| `GET /api/stats` | Live LLM call counts, latency, tokens, fallback rate |
| `POST /api/meetings` | Create a meeting |
| `POST /api/transcribe` | Process a text segment through full agent pipeline |
| `POST /api/transcribe-stream` | Same but with SSE streaming of agent events |
| `POST /api/transcribe-audio` | Upload WAV — full Whisper + pyannote pipeline |
| `POST /api/meetings/{id}/end` | LLM summary + action items |
| `GET /api/signs/lookup?text=...` | Look up WLASL signs for arbitrary text |
| `GET /api/signs/vocabulary` | Returns ~1959 WLASL signs |

### One-shot E2E shell test

```bash
MID=$(curl -s -X POST http://localhost:8000/api/meetings \
  -H "Content-Type: application/json" \
  -d '{"title":"Test","expected_speakers":["Sarah","Raj","Priya"]}' \
  | python3 -c "import json,sys; print(json.load(sys.stdin)['meeting_id'])")

for line in "I need help today" "Sarah will deploy tomorrow"; do
  curl -s -X POST http://localhost:8000/api/transcribe \
    -H "Content-Type: application/json" \
    -d "{\"meeting_id\":\"$MID\",\"text\":\"$line\"}" > /dev/null
done

curl -s -X POST "http://localhost:8000/api/meetings/$MID/end" | python3 -m json.tool
```

---

## 🛠️ Tech stack

| Layer | Technology | Role |
|---|---|---|
| Frontend | Next.js 15 + React 19 + TypeScript | UI framework |
| Animations | Framer Motion 11 | Live agent transitions, gradients |
| Styling | Tailwind CSS 3.4 | Design system |
| Audio capture | Web Audio API + MediaRecorder | Browser mic → 16 kHz PCM WAV |
| Backend | FastAPI + Pydantic 2 | Type-safe REST + SSE |
| Async runtime | Uvicorn | ASGI server |
| LLM | Gemini 2.5 Flash + Claude Sonnet 4.6 | Cleanup, translation, summary, actions |
| LLM Router | Custom (`backend/llm_router.py`) | Auto-fallback Gemini → Claude |
| ASR | `openai/whisper-large-v3` via HF Inference | Speech recognition |
| Diarization | `pyannote/speaker-diarization-3.1` (pyannote 4.0.4) | Speaker ID — runs locally |
| Sign output | [sign.mt](https://sign.mt) (Moryossef et al.) | Continuous 3D signing avatar |
| Sign vocabulary | WLASL dataset (Li et al. 2020) | 1959 American Sign Language glosses |
| Streaming | sse-starlette | Server-Sent Events for live agent updates |
| Tests | pytest 8 + pytest-asyncio | 17 tests covering router + API + streaming |

---

## 📚 Datasets

### WLASL — Word-Level American Sign Language
- **Citation:** Li et al., "Word-Level Deep Sign Language Recognition From Video" (WACV 2020)
- **Source:** https://github.com/dxli94/WLASL
- **Size:** 2000 ASL glosses × ~10 video instances per word (21,083 total clips)
- **What we use:** the JSON metadata to drive our 1959-sign vocabulary lookup
- **Build:** `python scripts/build_wlasl_library.py` regenerates `data/wlasl_library.json` from raw WLASL JSON

### Whisper-large-v3
- **Source:** OpenAI, hosted on HuggingFace Inference
- **What we use:** speech-to-text in the Listening agent

### pyannote/speaker-diarization-3.1
- **Source:** pyannote.audio (Bredin et al.)
- **What we use:** real speaker diarization on uploaded audio

### sign.mt translation
- **Source:** Moryossef et al., https://github.com/sign/translate
- **What we use:** the open-source spoken-to-signed translator embedded in the SignAvatar component

---

## 📊 What's mock vs real

```json
{
  "mock_mode": false,
  "mock_diarization": false,
  "mock_sign_lookup": false
}
```

| Component | State |
|---|---|
| LLM (Gemini → Claude fallback) | ✅ Real |
| Whisper ASR | ✅ Real (HF Inference) |
| pyannote diarization | ✅ Real (local model, ~6s init, ~2s inference) |
| Sign vocabulary | ✅ Real (1959-sign WLASL library) |
| Sign avatar | ✅ Real (sign.mt embedded iframe) |
| Browser microphone | ✅ Real (MediaRecorder, no Google dependency) |
| Multi-language captions | ✅ Real (10 languages) |
| 6-agent orchestration | ✅ Real Python classes |
| LLM stats + provider routing | ✅ Real, live-polled |

**Demo scaffolding** (hardcoded for video recording convenience, not mocks):
- Default speakers (Sarah, Raj, Priya) — change them when starting a meeting via API
- 5 scripted demo prompts in the UI button — same pipeline as mic input

---

## 🚀 Deploy publicly (optional)

If you want a "click and play" URL judges can use without setup:

| Component | Recommended host | Notes |
|---|---|---|
| Backend | [Render](https://render.com) (free) or [Railway](https://railway.app) | Set env vars privately, expose port 8000 |
| Frontend | [Vercel](https://vercel.com) (free) | Set `NEXT_PUBLIC_API_URL` to your backend URL |

Your API keys go in the host's **environment variables** UI — never in the repo.

---

## 🗺️ Roadmap

- **Q3 2026** — Medical Mode, Legal Mode, Education Mode (preset vocabularies)
- **Q4 2026** — WLASL camera input (deaf user signs at webcam → text out)
- **Q1 2027** — RAG over past meetings, user accounts, persistent storage
- **Vision** — Every meeting accessible. Every language. Every room where information matters.

---

## 🙏 Credits

- **WLASL dataset** — Dongxu Li, Cristian Rodriguez Opazo, Xin Yu, Hongdong Li (ANU + Microsoft)
- **pyannote.audio** — Hervé Bredin et al.
- **sign.mt** — Amit Moryossef et al.
- **OpenAI Whisper** — Alec Radford et al.
- **Google Gemini** + **Anthropic Claude** for LLM reasoning

Built by [your name] for **Build with AI** at GDG on Campus, University of Maryland.

---

## 📜 License

MIT — see [LICENSE](LICENSE).

---

## 🆘 Troubleshooting

**`Gemini failed (API_KEY_INVALID)` in logs**
→ Your `GEMINI_API_KEY` in `.env` is still the placeholder. Get one at https://aistudio.google.com/app/apikey.

**`GatedRepoError: 403` when starting backend**
→ You need to accept terms on all 3 pyannote model pages (linked above in Step 2 of Quick Start).

**Web Speech API "network" error in mic**
→ This is a Chrome/macOS issue with Google's Web Speech servers. Use the new **MediaRecorder + Whisper** mic instead — it's the default.

**`Whisper transcribing...` button stuck**
→ HF Whisper cold-start can take 20–30s on first call. After 60s, the request auto-aborts with an error.

**Sign avatar iframe shows blank**
→ sign.mt requires `cross-origin-embedder-policy: require-corp` headers — usually fine in Chrome/Edge but some browsers block. Click the ↗ button in the avatar header to open sign.mt in a new tab.

**Next.js "Cannot find module" / "missing bootstrap script"**
→ Stale build cache. Run: `rm -rf frontend/.next frontend/node_modules/.cache && npm run dev`

---

For the full demo voice-over script, see [DEMO_SCRIPT.md](DEMO_SCRIPT.md).
For Git push instructions, see [GIT_PUSH.md](GIT_PUSH.md).
