"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { ArrowRight, Mic, FileText, Target, Code, Database } from "lucide-react";

const layers = [
  { icon: Mic, label: "Audio" },
  { icon: FileText, label: "Transcript" },
  { icon: Target, label: "Intent" },
  { icon: Code, label: "Tool Call" },
  { icon: Database, label: "Backend" },
];

export function LandingHero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center px-6 pt-20">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(16,185,129,0.06)_0%,transparent_70%)]" />

      <div className="relative max-w-4xl mx-auto text-center space-y-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="space-y-6"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-muted/50 px-4 py-1.5 text-xs text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            India-specific voice agent verification
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1]">
            Your voice agent said{" "}
            <span className="bg-gradient-to-r from-emerald-500 to-emerald-400 bg-clip-text text-transparent">
              &ldquo;done.&rdquo;
            </span>
            <br />
            Did the backend agree?
          </h1>

          <p className="text-base sm:text-lg text-muted-foreground max-w-xl mx-auto">
            Transaction-integrity testing for Hindi &amp; Hinglish voice agents.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="flex items-center justify-center gap-4 flex-wrap"
        >
          <a
            href="#live-demo"
            className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-medium px-6 py-3 rounded-full text-sm transition-all hover:scale-105"
          >
            Try Live Demo
            <ArrowRight className="h-4 w-4" />
          </a>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 border border-border hover:border-foreground/20 text-muted-foreground hover:text-foreground px-6 py-3 rounded-full text-sm transition-all"
          >
            Sign In
          </Link>
        </motion.div>

        {/* Proof bullets */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 text-sm text-muted-foreground"
        >
          <span className="flex items-center gap-1.5">
            <span className="h-1 w-1 rounded-full bg-emerald-500" />
            Catch wrong amounts, dates &amp; order IDs
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-1 w-1 rounded-full bg-emerald-500" />
            Detect false confirmations
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-1 w-1 rounded-full bg-emerald-500" />
            Turn failures into release-gate tests
          </span>
        </motion.div>

        {/* 5-Layer visualization */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.7 }}
          className="pt-8"
        >
          <p className="text-[10px] text-muted-foreground uppercase tracking-[0.3em] mb-6">
            5-Layer Truth Verification
          </p>
          <div className="flex items-center justify-center gap-1 sm:gap-3">
            {layers.map((layer, i) => (
              <motion.div
                key={layer.label}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.9 + i * 0.1 }}
                className="flex items-center gap-1 sm:gap-3"
              >
                <div className="flex flex-col items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-3 sm:px-5 sm:py-4 hover:border-emerald-500/30 hover:bg-accent transition-all">
                  <layer.icon className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-500" />
                  <span className="text-[9px] sm:text-[10px] text-muted-foreground uppercase tracking-wider">
                    {layer.label}
                  </span>
                </div>
                {i < layers.length - 1 && (
                  <ArrowRight className="h-3 w-3 text-muted-foreground/40 hidden sm:block" />
                )}
              </motion.div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-4 italic">
            We fail the test at the first layer that diverges.
          </p>
        </motion.div>

      </div>
    </section>
  );
}
