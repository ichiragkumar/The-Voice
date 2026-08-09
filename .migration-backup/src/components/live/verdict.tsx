"use client";

import { motion } from "motion/react";
import { CheckCircle, XCircle, Clock, AlertTriangle } from "lucide-react";

type Props = {
  status: "pass" | "fail" | "pending" | "needs_review" | null;
  divergence?: string;
  expected?: string;
  actual?: string;
  fix?: string;
};

const CONFIG = {
  pass: { icon: CheckCircle, label: "PASS", color: "text-emerald-500", bg: "bg-emerald-500/10 border-emerald-500/30" },
  fail: { icon: XCircle, label: "FAIL", color: "text-red-500", bg: "bg-red-500/10 border-red-500/30" },
  pending: { icon: Clock, label: "PENDING", color: "text-amber-500", bg: "bg-amber-500/10 border-amber-500/30" },
  needs_review: { icon: AlertTriangle, label: "NEEDS REVIEW", color: "text-amber-500", bg: "bg-amber-500/10 border-amber-500/30" },
};

export function LiveVerdict({ status, divergence, expected, actual, fix }: Props) {
  if (!status) return null;

  const cfg = CONFIG[status];
  const Icon = cfg.icon;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", duration: 0.5 }}
      className={`rounded-xl border p-4 ${cfg.bg}`}
    >
      <div className="flex items-center gap-2 mb-2">
        <Icon className={`h-5 w-5 ${cfg.color}`} />
        <span className={`text-sm font-bold tracking-wider ${cfg.color}`}>{cfg.label}</span>
      </div>

      {divergence && (
        <p className="text-xs text-muted-foreground">
          First divergence: <span className="font-mono text-foreground">{divergence}</span>
        </p>
      )}

      {expected && actual && status === "fail" && (
        <div className="grid grid-cols-2 gap-2 mt-2">
          <div className="rounded bg-emerald-500/10 px-2 py-1">
            <p className="text-[10px] text-emerald-400">Expected</p>
            <p className="text-xs font-mono">{expected}</p>
          </div>
          <div className="rounded bg-red-500/10 px-2 py-1">
            <p className="text-[10px] text-red-400">Actual</p>
            <p className="text-xs font-mono">{actual}</p>
          </div>
        </div>
      )}

      {fix && (
        <p className="text-[10px] text-amber-400 mt-2">
          Fix: {fix}
        </p>
      )}
    </motion.div>
  );
}
