export type AgentName =
  | "orchestrator"
  | "listening"
  | "speaker_id"
  | "translate"
  | "sign_out"
  | "action";

export type AgentStatus = "thinking" | "active" | "done" | "error";

export interface AgentEvent {
  agent: AgentName;
  status: AgentStatus;
  message: string;
  timestamp: string;
  meta?: Record<string, unknown>;
}

export interface Speaker {
  id: string;
  name: string;
  color: string;
}

export interface SignClip {
  id: string;
  word: string;
  video_url: string;
  duration_ms: number;
  description: string;
}

export interface TranscriptSegment {
  id: string;
  meeting_id: string;
  speaker: Speaker;
  text: string;
  timestamp: string;
  sign_clip_ids: string[];
  confidence: number;
}

export interface ActionItem {
  id: string;
  text: string;
  owner: string;
  deadline: string | null;
  priority: "low" | "medium" | "high";
}

export interface MeetingSummary {
  meeting_id: string;
  title: string;
  duration_seconds: number;
  speakers: Speaker[];
  summary: string;
  key_topics: string[];
  action_items: ActionItem[];
  transcript: TranscriptSegment[];
  generated_at: string;
}

export interface CreateMeetingResponse {
  meeting_id: string;
  title: string;
  mode: string;
  started_at: string;
}

export interface TranscribeResponse {
  segment: TranscriptSegment;
  events: AgentEvent[];
}
