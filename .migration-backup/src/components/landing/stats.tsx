"use client";

import { motion, useInView } from "motion/react";
import { useRef } from "react";

const stats = [
  { value: "5", label: "verification layers" },
  { value: "10+", label: "Indian languages" },
  { value: "7", label: "industry packs" },
  { value: "< 2", label: "min to first audit" },
];

export function LandingStats() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} className="py-24 px-6 border-y border-border">
      <div className="max-w-5xl mx-auto">
        <div className="grid grid-cols-2 gap-8 lg:grid-cols-4">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              className="text-center"
            >
              <p className="text-4xl sm:text-5xl font-bold text-foreground">
                {stat.value}
              </p>
              <p className="text-sm text-muted-foreground mt-2">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
