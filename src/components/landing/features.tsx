"use client";

import { motion, useInView } from "motion/react";
import { useRef } from "react";
import {
  Languages,
  GitCompare,
  Webhook,
  ClipboardCheck,
  Shield,
  Package,
} from "lucide-react";

const features = [
  {
    icon: Languages,
    title: "Hindi & Hinglish native",
    desc: 'Resolves "saade chaar", "parson", "uske agle din", spoken order IDs, and code-switching — not just English with translation.',
  },
  {
    icon: Shield,
    title: "Backend truth verification",
    desc: "Checks what API was called, what arguments were sent, whether it succeeded, and what the database actually stored.",
  },
  {
    icon: GitCompare,
    title: "Regression comparison",
    desc: "Compare audit version A vs B side-by-side. See which failures are new, which are fixed, and how root causes shifted.",
  },
  {
    icon: ClipboardCheck,
    title: "Human review workflow",
    desc: "Flag low-confidence failures for native-speaker review. Confirmed cases become your proprietary evaluation dataset.",
  },
  {
    icon: Webhook,
    title: "Production ingestion",
    desc: "Ingest live production calls via API or webhook. Monitor real conversations alongside synthetic test suites.",
  },
  {
    icon: Package,
    title: "Ready-made industry packs",
    desc: "Pre-built test scenarios for e-commerce, appointments, collections, insurance, and address changes — plug and play.",
  },
];

export function LandingFeatures() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section
      id="features"
      ref={ref}
      className="py-24 px-6 bg-muted/30 border-y border-border"
    >
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-bold">
            Built for Indian voice agents
          </h2>
          <p className="text-muted-foreground mt-4 max-w-xl mx-auto">
            Generic platforms tell you if the conversation looked correct.
            Word AI verifies that the customer&rsquo;s exact request became
            the correct transaction.
          </p>
        </motion.div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.1 + i * 0.08 }}
              className="group rounded-xl border border-border bg-card p-6 hover:border-emerald-500/30 hover:shadow-sm transition-all"
            >
              <div className="h-10 w-10 rounded-lg bg-emerald-500/10 flex items-center justify-center mb-4 group-hover:bg-emerald-500/20 transition-colors">
                <feature.icon className="h-5 w-5 text-emerald-500" />
              </div>
              <h3 className="font-semibold mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {feature.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
