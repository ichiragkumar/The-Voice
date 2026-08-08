"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { ArrowRight, Mic, FileText, Brain, Code, Database } from "lucide-react";

const layers = [
  { icon: Mic, label: "Audio", color: "text-blue-400" },
  { icon: FileText, label: "Transcript", color: "text-cyan-400" },
  { icon: Brain, label: "Intent", color: "text-violet-400" },
  { icon: Code, label: "Tool Call", color: "text-amber-400" },
  { icon: Database, label: "Backend", color: "text-emerald-400" },
];

export function LandingHero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center px-6 pt-20">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(16,185,129,0.05)_0%,transparent_70%)]" />

      <div className="relative max-w-4xl mx-auto text-center space-y-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="space-y-6"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs text-white/60">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            India-specific voice agent verification
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1]">
            Certify every{" "}
            <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
              voice transaction
            </span>
          </h1>

          <p className="text-base sm:text-lg text-white/50 max-w-2xl mx-auto leading-relaxed">
            Your voice agent sounds perfect. But did it book the right date?
            Refund the right amount? Store the correct address? BhashaQA
            verifies the{" "}
            <span className="text-white/80">complete business outcome</span> —
            not just the conversation.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="flex items-center justify-center gap-4"
        >
          <Link
            href="/login"
            className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-black font-medium px-6 py-3 rounded-full text-sm transition-all hover:scale-105"
          >
            Start Testing
            <ArrowRight className="h-4 w-4" />
          </Link>
          <a
            href="#how-it-works"
            className="inline-flex items-center gap-2 border border-white/10 hover:border-white/20 text-white/70 hover:text-white px-6 py-3 rounded-full text-sm transition-all"
          >
            See How It Works
          </a>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.6 }}
          className="pt-8"
        >
          <p className="text-[10px] text-white/30 uppercase tracking-[0.3em] mb-6">
            5-Layer Truth Verification
          </p>
          <div className="flex items-center justify-center gap-1 sm:gap-3">
            {layers.map((layer, i) => (
              <motion.div
                key={layer.label}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.8 + i * 0.1 }}
                className="flex items-center gap-1 sm:gap-3"
              >
                <div className="flex flex-col items-center gap-1.5 rounded-lg border border-white/5 bg-white/[0.02] px-3 py-3 sm:px-5 sm:py-4 hover:border-white/10 hover:bg-white/[0.04] transition-all">
                  <layer.icon className={`h-4 w-4 sm:h-5 sm:w-5 ${layer.color}`} />
                  <span className="text-[9px] sm:text-[10px] text-white/40 uppercase tracking-wider">
                    {layer.label}
                  </span>
                </div>
                {i < layers.length - 1 && (
                  <ArrowRight className="h-3 w-3 text-white/10 hidden sm:block" />
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
