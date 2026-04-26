"use client";

import { motion } from "framer-motion";
import { Hand } from "lucide-react";
import type { TranscriptSegment } from "@/lib/types";

export function SignClipPlayer({ segment }: { segment: TranscriptSegment | null }) {
  if (!segment || segment.sign_clip_ids.length === 0) {
    return (
      <div className="grid h-full place-items-center rounded-2xl border border-white/10 bg-white/[0.02] p-6 text-center">
        <div>
          <Hand className="mx-auto mb-3 h-8 w-8 text-ink-100/30" />
          <p className="text-sm text-ink-100/50">Sign clips will appear here</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
      <div className="mb-4 flex items-center gap-2">
        <Hand className="h-4 w-4 text-accent-cyan" />
        <h3 className="text-sm font-semibold uppercase tracking-wider text-ink-100/70">
          Live signs · {segment.speaker.name}
        </h3>
      </div>
      <div className="grid grid-cols-3 gap-3">
        {segment.sign_clip_ids.map((id, i) => (
          <motion.div
            key={id}
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.08 }}
            className="group relative aspect-square overflow-hidden rounded-xl border border-accent-cyan/20 bg-gradient-to-br from-accent-cyan/10 to-accent-violet/10"
          >
            <div className="absolute inset-0 grid place-items-center">
              <motion.div
                animate={{ y: [0, -4, 0] }}
                transition={{ duration: 1.6, repeat: Infinity, delay: i * 0.2 }}
                className="text-4xl"
              >
                ✋
              </motion.div>
            </div>
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-2 text-center text-xs font-semibold text-white">
              {id.replace("wlasl-", "")}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
