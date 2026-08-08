"use client";

import { motion } from "motion/react";
import { Mic, FileText, Target, Code, Database, Shield, CheckCircle, XCircle, Loader2 } from "lucide-react";

export type PipelineStage = {
  id: string;
  label: string;
  icon: typeof Mic;
  status: "idle" | "active" | "pass" | "fail";
  detail?: string;
};

type Props = {
  stages: PipelineStage[];
};

const STATUS_STYLES = {
  idle: "border-border bg-card text-muted-foreground",
  active: "border-emerald-500/50 bg-emerald-500/5 text-foreground",
  pass: "border-emerald-500/30 bg-emerald-500/10 text-foreground",
  fail: "border-red-500/50 bg-red-500/10 text-foreground",
};

export function getDefaultStages(): PipelineStage[] {
  return [
    { id: "audio", label: "Audio", icon: Mic, status: "idle" },
    { id: "transcript", label: "Transcript", icon: FileText, status: "idle" },
    { id: "entities", label: "Entities", icon: Target, status: "idle" },
    { id: "tool", label: "Tool Call", icon: Code, status: "idle" },
    { id: "state", label: "Backend", icon: Database, status: "idle" },
    { id: "verdict", label: "Verdict", icon: Shield, status: "idle" },
  ];
}

export function LivePipeline({ stages }: Props) {
  return (
    <div className="flex flex-wrap justify-center gap-2">
      {stages.map((stage, i) => (
        <motion.div
          key={stage.id}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: i * 0.05 }}
          className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-xs transition-all ${STATUS_STYLES[stage.status]}`}
        >
          <stage.icon className="h-3.5 w-3.5" />
          <span className="font-medium">{stage.label}</span>
          {stage.status === "active" && <Loader2 className="h-3 w-3 animate-spin text-emerald-500" />}
          {stage.status === "pass" && <CheckCircle className="h-3 w-3 text-emerald-500" />}
          {stage.status === "fail" && <XCircle className="h-3 w-3 text-red-500" />}
          {stage.detail && (
            <span className="text-[10px] text-muted-foreground font-mono max-w-24 truncate">
              {stage.detail}
            </span>
          )}
        </motion.div>
      ))}
    </div>
  );
}
