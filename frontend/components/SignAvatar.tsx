"use client";

/**
 * SignAvatar — sign.mt-style continuous signing visualization.
 *
 * Embeds sign.mt's open-source spoken-to-signed translator
 * (Moryossef et al. — github.com/sign/translate) as an iframe.
 * sign.mt renders a 3D animated avatar that signs continuously
 * from English text — no separate video clips, one continuous flow.
 *
 * Falls back to a polished holding state if the iframe fails to load.
 */
import { motion, AnimatePresence } from "framer-motion";
import { ExternalLink, Loader2, RefreshCw, Sparkles } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { TranscriptSegment } from "@/lib/types";

const SIGN_MT_BASE = "https://sign.mt/";

function buildSignMtUrl(text: string, signLanguage = "ase", spokenLanguage = "en"): string {
  const params = new URLSearchParams({
    spl: spokenLanguage,
    sgl: signLanguage,
    text: text,
  });
  return `${SIGN_MT_BASE}?${params.toString()}`;
}

export function SignAvatar({ segment }: { segment: TranscriptSegment | null }) {
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const [iframeKey, setIframeKey] = useState(0); // bump to force re-render
  const [errored, setErrored] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Reset loading state when segment changes
  useEffect(() => {
    if (segment?.text) {
      setIframeLoaded(false);
      setErrored(false);
      setIframeKey((k) => k + 1);
    }
  }, [segment?.id]);

  if (!segment) {
    return (
      <div className="grid h-full place-items-center rounded-2xl border border-white/10 bg-white/[0.02] p-6 text-center min-h-[280px]">
        <div>
          <Sparkles className="mx-auto mb-3 h-8 w-8 text-ink-100/30" />
          <p className="text-sm text-ink-100/50">Sign-language avatar ready</p>
          <p className="mt-1 text-xs text-ink-100/30">
            Speak or type — a continuous signing avatar will appear here
          </p>
        </div>
      </div>
    );
  }

  const url = buildSignMtUrl(segment.text);

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
      {/* header */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div
            className="grid h-7 w-7 place-items-center rounded-lg"
            style={{
              background: `linear-gradient(135deg, ${segment.speaker.color}, ${segment.speaker.color}99)`,
            }}
          >
            <Sparkles className="h-3.5 w-3.5 text-white" />
          </div>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-ink-100/70">
            Signing for · {segment.speaker.name}
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] uppercase tracking-wider text-ink-100/40">
            sign.mt · 3D avatar
          </span>
          <button
            onClick={() => setIframeKey((k) => k + 1)}
            title="Reload signing avatar"
            className="grid h-7 w-7 place-items-center rounded-lg border border-white/10 bg-white/5 text-ink-100/60 transition hover:border-white/20 hover:text-ink-50"
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </button>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            title="Open in sign.mt"
            className="grid h-7 w-7 place-items-center rounded-lg border border-white/10 bg-white/5 text-ink-100/60 transition hover:border-white/20 hover:text-ink-50"
          >
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>
      </div>

      {/* the text being signed */}
      <div className="mb-4 rounded-xl border border-white/10 bg-white/[0.03] p-3 text-sm leading-relaxed text-ink-50/90">
        <span className="text-[10px] uppercase tracking-wider text-ink-100/40">Translating</span>
        <p className="mt-1 italic">"{segment.text}"</p>
      </div>

      {/* avatar iframe — sign.mt avatar is vertical, give it room */}
      <div className="relative h-[560px] overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br from-accent-violet/10 via-ink-950 to-accent-cyan/10">
        {/* loading shimmer */}
        <AnimatePresence>
          {!iframeLoaded && !errored && (
            <motion.div
              initial={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="absolute inset-0 z-10 grid place-items-center bg-ink-950/80 backdrop-blur"
            >
              <div className="text-center">
                <Loader2 className="mx-auto mb-2 h-6 w-6 animate-spin text-accent-violet" />
                <p className="text-xs text-ink-100/60">Loading signing avatar...</p>
                <p className="mt-1 text-[10px] uppercase tracking-wider text-ink-100/30">
                  Powered by sign.mt
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {!errored ? (
          <iframe
            ref={iframeRef}
            key={iframeKey}
            src={url}
            title={`ASL avatar signing: ${segment.text}`}
            className="absolute inset-0 h-full w-full border-0"
            allow="autoplay; encrypted-media; camera; microphone"
            referrerPolicy="strict-origin-when-cross-origin"
            onLoad={() => setIframeLoaded(true)}
            onError={() => setErrored(true)}
          />
        ) : (
          <div className="absolute inset-0 grid place-items-center p-6 text-center">
            <div>
              <Sparkles className="mx-auto mb-2 h-8 w-8 text-accent-violet/60" />
              <p className="text-sm text-ink-50/80">Avatar embed blocked by browser</p>
              <p className="mt-1 text-xs text-ink-100/50">
                Open in sign.mt to view the continuous signing avatar
              </p>
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-accent-violet to-accent-fuchsia px-4 py-1.5 text-xs font-semibold text-white"
              >
                Open sign.mt <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>
        )}
      </div>

      {/* attribution */}
      <p className="mt-3 text-center text-[10px] uppercase tracking-wider text-ink-100/30">
        Continuous signing via sign.mt — open-source spoken-to-signed translation by Moryossef et al.
      </p>
    </div>
  );
}
