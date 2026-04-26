"use client";

import { motion } from "framer-motion";
import { ArrowRight, Sparkles, Users, Activity, Zap, Shield } from "lucide-react";
import Link from "next/link";

const FEATURES = [
  { icon: Users, title: "Multi-speaker", desc: "Identify every voice with name labels" },
  { icon: Activity, title: "Real-time", desc: "Live transcription + sign clips" },
  { icon: Sparkles, title: "Agentic", desc: "6 specialized AI agents coordinated by Gemini" },
  { icon: Shield, title: "Inclusive", desc: "Meeting accessibility, by default" },
];

const AGENTS = ["Orchestrator", "Listening", "Speaker ID", "Translate", "Sign-Out", "Action"];

export function HeroLanding() {
  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Animated gradient backdrop */}
      <div className="absolute inset-0 grid-bg opacity-40" />
      <motion.div
        className="absolute -top-40 -left-40 h-[500px] w-[500px] rounded-full bg-accent-violet/30 blur-3xl"
        animate={{ x: [0, 80, 0], y: [0, 60, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute top-1/3 -right-40 h-[600px] w-[600px] rounded-full bg-accent-fuchsia/20 blur-3xl"
        animate={{ x: [0, -100, 0], y: [0, 80, 0] }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-0 left-1/3 h-[500px] w-[500px] rounded-full bg-accent-cyan/20 blur-3xl"
        animate={{ x: [0, 60, 0], y: [0, -50, 0] }}
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="relative z-10 mx-auto max-w-6xl px-6 pt-10 pb-24">
        {/* Nav */}
        <nav className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-accent-violet to-accent-fuchsia">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight">SignBridge</span>
          </div>
          <div className="flex items-center gap-4 text-sm text-ink-100/70">
            <span className="hidden md:inline">Build with AI · GDG UMD</span>
            <Link
              href="/meeting"
              className="rounded-full border border-white/10 px-4 py-2 hover:border-accent-violet/50 transition"
            >
              Launch demo
            </Link>
          </div>
        </nav>

        {/* Hero */}
        <div className="mx-auto mt-24 max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-accent-violet/30 bg-accent-violet/10 px-4 py-1.5 text-sm text-accent-violet"
          >
            <Zap className="h-4 w-4" />
            Agentic AI · Gemini 2.5 + Claude fallback
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-5xl font-extrabold leading-tight md:text-7xl"
          >
            Every meeting.
            <br />
            <span className="text-gradient">Every voice. Heard.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.25 }}
            className="mx-auto mt-6 max-w-2xl text-lg text-ink-100/70 md:text-xl"
          >
            70 million deaf people are systematically excluded from meetings,
            classrooms, and courtrooms. SignBridge is the agentic AI that ends that.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
          >
            <Link
              href="/meeting"
              className="group inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-accent-violet to-accent-fuchsia px-7 py-3.5 font-semibold text-white shadow-glow transition hover:scale-[1.03]"
            >
              Try the live demo
              <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
            </Link>
            <a
              href="#how-it-works"
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-7 py-3.5 font-semibold text-ink-50/90 backdrop-blur transition hover:border-white/20"
            >
              How it works
            </a>
          </motion.div>
        </div>

        {/* Agent constellation */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.6 }}
          className="mx-auto mt-24 max-w-3xl"
        >
          <p className="mb-6 text-center text-xs uppercase tracking-widest text-ink-100/40">
            Six specialized agents, one orchestrator
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            {AGENTS.map((agent, i) => (
              <motion.div
                key={agent}
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.7 + i * 0.08 }}
                className="glass rounded-full px-4 py-2 text-sm text-ink-50/90"
              >
                <span className="mr-2 inline-block h-1.5 w-1.5 animate-pulse-soft rounded-full bg-accent-cyan" />
                {agent}
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Feature grid */}
        <div id="how-it-works" className="mt-32 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="glass group rounded-2xl p-6 transition hover:border-accent-violet/40"
            >
              <div className="mb-4 grid h-10 w-10 place-items-center rounded-lg bg-gradient-to-br from-accent-violet/20 to-accent-fuchsia/20">
                <f.icon className="h-5 w-5 text-accent-violet" />
              </div>
              <h3 className="mb-1 font-semibold">{f.title}</h3>
              <p className="text-sm text-ink-100/60">{f.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* Impact stats */}
        <div className="mt-24 grid gap-8 rounded-3xl border border-white/10 bg-white/[0.02] p-10 md:grid-cols-3">
          {[
            { stat: "70M+", label: "deaf people worldwide" },
            { stat: "95%", label: "of hearing people don't sign" },
            { stat: "70%", label: "higher medical errors for deaf patients" },
          ].map((s, i) => (
            <motion.div
              key={s.stat}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.15 }}
              className="text-center"
            >
              <div className="text-gradient text-5xl font-extrabold">{s.stat}</div>
              <div className="mt-2 text-sm text-ink-100/60">{s.label}</div>
            </motion.div>
          ))}
        </div>

        <footer className="mt-20 text-center text-xs text-ink-100/40">
          Built for Build with AI · GDG on Campus, University of Maryland
        </footer>
      </div>
    </div>
  );
}
