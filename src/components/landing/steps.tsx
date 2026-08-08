"use client";

import { motion, useInView } from "motion/react";
import { useRef } from "react";

const steps = [
  {
    num: "01",
    title: "Connect your agent",
    desc: "Import from Bolna, Vapi, Retell, LiveKit, Sarvam, or any custom agent. Paste your prompt and tool definitions. Takes under 2 minutes.",
  },
  {
    num: "02",
    title: "Upload call data",
    desc: "Upload transcripts, tool-call logs, and backend state. The Voice handles Hindi, Hinglish, and English — including code-switching mid-sentence.",
  },
  {
    num: "03",
    title: "Verify every layer",
    desc: "The Voice extracts entities, normalizes Indian expressions (saade chaar → 4:30, parson → day after tomorrow), and compares against your backend.",
  },
  {
    num: "04",
    title: "Get actionable failures",
    desc: "Every failure comes with the exact root cause: ASR error, reasoning error, wrong tool argument, or false confirmation. No guessing.",
  },
];

export function LandingSteps() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="how-it-works" ref={ref} className="py-24 px-6">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-bold">
            Plug in. Run. Ship with confidence.
          </h2>
          <p className="text-muted-foreground mt-4 max-w-xl mx-auto">
            Connect your agent, upload calls, get verification results —
            fastest path from broken to production-ready.
          </p>
        </motion.div>

        <div className="space-y-0">
          {steps.map((step, i) => (
            <motion.div
              key={step.num}
              initial={{ opacity: 0, x: -30 }}
              animate={inView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.2 + i * 0.15 }}
              className="flex gap-6 py-8 border-b border-border last:border-0 group"
            >
              <div className="flex-shrink-0">
                <span className="text-2xl font-bold text-emerald-500/60 group-hover:text-emerald-500 transition-colors">
                  {step.num}
                </span>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold group-hover:text-emerald-500 transition-colors">
                  {step.title}
                </h3>
                <p className="text-sm text-muted-foreground mt-2 leading-relaxed max-w-lg">
                  {step.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
