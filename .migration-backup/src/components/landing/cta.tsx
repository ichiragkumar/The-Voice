"use client";

import Link from "next/link";
import { motion, useInView } from "motion/react";
import { useRef } from "react";
import { ArrowRight } from "lucide-react";

export function LandingCTA() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} className="py-32 px-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={inView ? { opacity: 1, scale: 1 } : {}}
        transition={{ duration: 0.8 }}
        className="max-w-3xl mx-auto text-center space-y-8"
      >
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight">
          Ship voice agents with{" "}
          <span className="bg-gradient-to-r from-emerald-500 to-cyan-500 bg-clip-text text-transparent">
            confidence
          </span>
        </h2>
        <p className="text-muted-foreground text-lg max-w-xl mx-auto">
          Small prompt changes cause big quality swings. The Voice catches
          regressions before your customers do.
        </p>
        <div className="flex items-center justify-center gap-4 pt-4">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-medium px-8 py-3.5 rounded-full text-sm transition-all hover:scale-105"
          >
            Start Free Audit
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <p className="text-xs text-muted-foreground">
          No credit card required &middot; First audit free &middot; Results in
          minutes
        </p>
      </motion.div>
    </section>
  );
}
