import type {
  CreateMeetingResponse,
  MeetingSummary,
  SignClip,
  TranscribeResponse,
} from "./types";

const BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers || {}) },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API ${res.status}: ${text}`);
  }
  return (await res.json()) as T;
}

export const api = {
  health: () => request<{ status: string; llm_provider_active: string | null; has_gemini: boolean; has_claude: boolean; mock_mode: boolean }>("/health"),

  createMeeting: (title: string, expectedSpeakers: string[], mode = "general") =>
    request<CreateMeetingResponse>("/meetings", {
      method: "POST",
      body: JSON.stringify({ title, expected_speakers: expectedSpeakers, mode }),
    }),

  transcribe: (meetingId: string, text: string) =>
    request<TranscribeResponse>("/transcribe", {
      method: "POST",
      body: JSON.stringify({ meeting_id: meetingId, text }),
    }),

  endMeeting: (meetingId: string) =>
    request<MeetingSummary>(`/meetings/${meetingId}/end`, { method: "POST" }),

  lookupSigns: (text: string) =>
    request<SignClip[]>(`/signs/lookup?text=${encodeURIComponent(text)}`),

  vocabulary: () => request<string[]>("/signs/vocabulary"),
};
