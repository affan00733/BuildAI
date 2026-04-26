"use client";

import { motion } from "framer-motion";
import { Mic } from "lucide-react";
import type { Speaker } from "@/lib/types";

export function SpeakerCard({ speaker, isActive }: { speaker: Speaker; isActive: boolean }) {
  return (
    <motion.div
      layout
      animate={{ scale: isActive ? 1.05 : 1 }}
      transition={{ type: "spring", stiffness: 250, damping: 20 }}
      className={`relative rounded-2xl p-4 transition ${
        isActive
          ? "border-2 border-white/40 bg-white/[0.08] shadow-glow"
          : "border border-white/10 bg-white/[0.02]"
      }`}
      style={{ borderColor: isActive ? speaker.color : undefined }}
    >
      {isActive && (
        <motion.div
          className="absolute -inset-px rounded-2xl"
          style={{ boxShadow: `0 0 30px ${speaker.color}80` }}
          animate={{ opacity: [0.4, 0.8, 0.4] }}
          transition={{ duration: 1.6, repeat: Infinity }}
        />
      )}
      <div className="relative flex items-center gap-3">
        <div
          className="grid h-12 w-12 place-items-center rounded-full font-bold text-white"
          style={{ background: `linear-gradient(135deg, ${speaker.color}, ${speaker.color}aa)` }}
        >
          {speaker.name[0]?.toUpperCase()}
        </div>
        <div className="flex-1">
          <div className="font-semibold">{speaker.name}</div>
          <div className="flex items-center gap-1.5 text-xs text-ink-100/50">
            {isActive ? (
              <>
                <Mic className="h-3 w-3 animate-pulse-soft" style={{ color: speaker.color }} />
                <span style={{ color: speaker.color }}>Speaking</span>
              </>
            ) : (
              <span>Listening</span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
