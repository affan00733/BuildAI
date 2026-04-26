"use client";

import { motion } from "framer-motion";
import { CheckSquare, Clock, User } from "lucide-react";
import type { ActionItem } from "@/lib/types";

const PRIORITY_COLORS = {
  high: "border-red-500/40 bg-red-500/10 text-red-300",
  medium: "border-yellow-500/40 bg-yellow-500/10 text-yellow-300",
  low: "border-green-500/40 bg-green-500/10 text-green-300",
};

export function ActionItemsList({ items }: { items: ActionItem[] }) {
  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 text-center">
        <p className="text-sm text-ink-100/50">No action items extracted yet.</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
      <div className="mb-4 flex items-center gap-2">
        <CheckSquare className="h-4 w-4 text-accent-lime" />
        <h3 className="text-sm font-semibold uppercase tracking-wider text-ink-100/70">
          Action items · {items.length}
        </h3>
      </div>
      <div className="space-y-3">
        {items.map((item, i) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="rounded-xl border border-white/5 bg-white/[0.02] p-4"
          >
            <div className="mb-2 flex items-start justify-between gap-3">
              <p className="text-sm font-medium leading-snug">{item.text}</p>
              <span
                className={`flex-shrink-0 rounded-full border px-2 py-0.5 text-xs font-semibold uppercase ${
                  PRIORITY_COLORS[item.priority]
                }`}
              >
                {item.priority}
              </span>
            </div>
            <div className="flex items-center gap-4 text-xs text-ink-100/60">
              <span className="flex items-center gap-1">
                <User className="h-3 w-3" />
                {item.owner}
              </span>
              {item.deadline && (
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {item.deadline}
                </span>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
