"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef } from "react";
import type { TranscriptSegment } from "@/lib/types";

export function CaptionStream({ segments }: { segments: TranscriptSegment[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [segments.length]);

  return (
    <div
      ref={scrollRef}
      className="scrollbar-hide h-[420px] overflow-y-auto rounded-2xl border border-white/10 bg-white/[0.02] p-6"
    >
      {segments.length === 0 && (
        <div className="grid h-full place-items-center text-center text-ink-100/40">
          <div>
            <div className="mx-auto mb-3 h-2 w-2 animate-pulse rounded-full bg-accent-violet" />
            <p className="text-sm">Waiting for the first speaker...</p>
          </div>
        </div>
      )}
      <AnimatePresence initial={false}>
        {segments.map((seg) => (
          <motion.div
            key={seg.id}
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="mb-4 flex gap-3"
          >
            <div
              className="mt-1 h-8 w-8 flex-shrink-0 rounded-full font-bold text-white grid place-items-center text-xs"
              style={{ background: `linear-gradient(135deg, ${seg.speaker.color}, ${seg.speaker.color}aa)` }}
            >
              {seg.speaker.name[0]?.toUpperCase()}
            </div>
            <div className="flex-1">
              <div className="mb-1 flex items-center gap-2">
                <span className="text-sm font-semibold" style={{ color: seg.speaker.color }}>
                  {seg.speaker.name}
                </span>
                <span className="text-xs text-ink-100/40">
                  {new Date(seg.timestamp).toLocaleTimeString()}
                </span>
              </div>
              <p className="leading-relaxed text-ink-50/90">{seg.text}</p>
              {seg.sign_clip_ids.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {seg.sign_clip_ids.map((id) => (
                    <span
                      key={id}
                      className="rounded-full border border-accent-cyan/30 bg-accent-cyan/10 px-2 py-0.5 text-xs text-accent-cyan"
                    >
                      ✋ {id.replace("wlasl-", "")}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
