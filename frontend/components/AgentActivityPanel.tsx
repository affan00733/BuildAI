"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Activity, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import type { AgentEvent } from "@/lib/types";

const AGENT_ORDER = ["orchestrator", "listening", "speaker_id", "translate", "sign_out", "action"] as const;

const AGENT_LABELS: Record<string, string> = {
  orchestrator: "Orchestrator",
  listening: "Listening",
  speaker_id: "Speaker ID",
  translate: "Translate",
  sign_out: "Sign-Out",
  action: "Action",
};

const AGENT_COLORS: Record<string, string> = {
  orchestrator: "#8b5cf6",
  listening: "#06b6d4",
  speaker_id: "#ec4899",
  translate: "#84cc16",
  sign_out: "#f59e0b",
  action: "#22c55e",
};

function StatusIcon({ status }: { status: string }) {
  switch (status) {
    case "active":
    case "thinking":
      return <Loader2 className="h-3.5 w-3.5 animate-spin text-accent-violet" />;
    case "done":
      return <CheckCircle2 className="h-3.5 w-3.5 text-accent-lime" />;
    case "error":
      return <AlertCircle className="h-3.5 w-3.5 text-red-400" />;
    default:
      return <div className="h-3.5 w-3.5 rounded-full bg-white/20" />;
  }
}

export function AgentActivityPanel({ events }: { events: AgentEvent[] }) {
  const recent = events.slice(-12).reverse();

  const lastByAgent = AGENT_ORDER.reduce<Record<string, AgentEvent | undefined>>((acc, name) => {
    acc[name] = [...events].reverse().find((e) => e.agent === name);
    return acc;
  }, {});

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Activity className="h-4 w-4 text-accent-violet" />
        <h3 className="text-sm font-semibold uppercase tracking-wider text-ink-100/70">Agent network</h3>
      </div>

      {/* Agent grid */}
      <div className="grid grid-cols-2 gap-2">
        {AGENT_ORDER.map((agent) => {
          const event = lastByAgent[agent];
          const isWorking = event?.status === "active" || event?.status === "thinking";
          return (
            <motion.div
              key={agent}
              animate={{
                borderColor: isWorking ? AGENT_COLORS[agent] : "rgba(255,255,255,0.08)",
              }}
              className="rounded-xl border bg-white/[0.02] p-3"
            >
              <div className="mb-1 flex items-center justify-between">
                <span className="text-xs font-semibold" style={{ color: AGENT_COLORS[agent] }}>
                  {AGENT_LABELS[agent]}
                </span>
                <StatusIcon status={event?.status || "idle"} />
              </div>
              <p className="truncate text-xs text-ink-100/50">
                {event?.message || "Idle"}
              </p>
            </motion.div>
          );
        })}
      </div>

      {/* Activity log */}
      <div className="space-y-2">
        <h4 className="text-xs uppercase tracking-wider text-ink-100/40">Recent activity</h4>
        <div className="scrollbar-hide max-h-[200px] space-y-1 overflow-y-auto">
          <AnimatePresence initial={false}>
            {recent.map((e, i) => (
              <motion.div
                key={`${e.timestamp}-${i}`}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-2 rounded-lg bg-white/[0.02] px-2 py-1.5 text-xs"
              >
                <StatusIcon status={e.status} />
                <span className="font-semibold" style={{ color: AGENT_COLORS[e.agent] }}>
                  {AGENT_LABELS[e.agent]}
                </span>
                <span className="truncate text-ink-100/60">{e.message}</span>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
