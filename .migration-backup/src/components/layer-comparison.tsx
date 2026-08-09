"use client";

import { useEffect, useState } from "react";
import { CheckCircle, XCircle, ArrowDown, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

type LayerData = {
  name: string;
  value: string;
  expected: string;
  match: boolean;
};

type Props = {
  layers: LayerData[];
  entityType: string;
  entityLabel: string;
};

const LAYER_COLORS: Record<string, string> = {
  "Customer Audio": "border-l-blue-500",
  "ASR Transcript": "border-l-cyan-500",
  "Agent Interpretation": "border-l-violet-500",
  "Tool Call": "border-l-amber-500",
  "Backend State": "border-l-emerald-500",
};

const LAYER_GLOW: Record<string, string> = {
  "Customer Audio": "shadow-blue-500/20",
  "ASR Transcript": "shadow-cyan-500/20",
  "Agent Interpretation": "shadow-violet-500/20",
  "Tool Call": "shadow-amber-500/20",
  "Backend State": "shadow-emerald-500/20",
};

export function LayerComparison({ layers, entityType, entityLabel }: Props) {
  const [visibleCount, setVisibleCount] = useState(0);
  const breakIndex = layers.findIndex((l) => !l.match);

  useEffect(() => {
    if (visibleCount < layers.length) {
      const timer = setTimeout(() => setVisibleCount((c) => c + 1), 180);
      return () => clearTimeout(timer);
    }
  }, [visibleCount, layers.length]);

  return (
    <div className="rounded-lg border border-border bg-card p-4 overflow-hidden">
      <div className="mb-4 flex items-center gap-2">
        <Badge variant="outline" className="capitalize">
          {entityType}
        </Badge>
        <span className="text-sm font-medium">{entityLabel}</span>
        {breakIndex !== -1 && (
          <Badge variant="destructive" className="ml-auto gap-1">
            <Zap className="h-3 w-3" /> Break at Layer {breakIndex + 1}
          </Badge>
        )}
      </div>
      <div className="space-y-0">
        {layers.map((layer, i) => (
          <div
            key={layer.name}
            className={cn(
              "transition-all duration-500 ease-out",
              i < visibleCount
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-4"
            )}
          >
            <div
              className={cn(
                "flex items-center justify-between rounded-md border-l-4 px-4 py-3 transition-all duration-300",
                "bg-muted/50",
                LAYER_COLORS[layer.name] || "border-l-gray-500",
                !layer.match && "bg-red-500/10 border-red-500 shadow-md shadow-red-500/10",
                layer.match && i < visibleCount && `shadow-sm ${LAYER_GLOW[layer.name] || ""}`
              )}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-muted text-[10px] font-bold text-muted-foreground">
                    {i + 1}
                  </span>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    {layer.name}
                  </p>
                </div>
                <p
                  className={cn(
                    "mt-1.5 font-mono text-sm pl-7",
                    !layer.match && "text-red-400 font-semibold"
                  )}
                >
                  {layer.value}
                </p>
                {!layer.match && (
                  <div className="mt-1.5 pl-7 flex items-center gap-3 text-xs">
                    <span className="inline-flex items-center gap-1 rounded bg-emerald-500/10 px-2 py-0.5 text-emerald-400">
                      Expected: {layer.expected}
                    </span>
                    <span className="inline-flex items-center gap-1 rounded bg-red-500/10 px-2 py-0.5 text-red-400">
                      Got: {layer.value}
                    </span>
                  </div>
                )}
              </div>
              <div className="ml-4 flex-shrink-0">
                {layer.match ? (
                  <CheckCircle className="h-5 w-5 text-emerald-500" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-500 animate-pulse" />
                )}
              </div>
            </div>
            {i < layers.length - 1 && (
              <div className="flex items-center justify-center py-1">
                <div
                  className={cn(
                    "flex flex-col items-center",
                    i + 1 === breakIndex && "relative"
                  )}
                >
                  <ArrowDown
                    className={cn(
                      "h-4 w-4 transition-colors duration-300",
                      !layers[i + 1].match
                        ? "text-red-500"
                        : "text-muted-foreground"
                    )}
                  />
                  {i + 1 === breakIndex && (
                    <span className="absolute -right-16 text-[10px] font-medium text-red-400 animate-pulse">
                      BREAK
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
