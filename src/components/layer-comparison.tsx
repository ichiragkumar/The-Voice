"use client";

import { CheckCircle, XCircle, ArrowDown } from "lucide-react";
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

export function LayerComparison({ layers, entityType, entityLabel }: Props) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="mb-4 flex items-center gap-2">
        <Badge variant="outline" className="capitalize">
          {entityType}
        </Badge>
        <span className="text-sm font-medium">{entityLabel}</span>
      </div>
      <div className="space-y-0">
        {layers.map((layer, i) => (
          <div key={layer.name}>
            <div
              className={cn(
                "flex items-center justify-between rounded-md border-l-4 bg-muted/50 px-4 py-3",
                LAYER_COLORS[layer.name] || "border-l-gray-500",
                !layer.match && "bg-red-500/10 border-red-500 border-l-4"
              )}
            >
              <div className="flex-1">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  {layer.name}
                </p>
                <p className={cn("mt-1 font-mono text-sm", !layer.match && "text-red-400")}>
                  {layer.value}
                </p>
                {!layer.match && (
                  <div className="mt-1 flex items-center gap-2 text-xs">
                    <span className="text-emerald-400">Expected: {layer.expected}</span>
                    <span className="text-muted-foreground">|</span>
                    <span className="text-red-400">Got: {layer.value}</span>
                  </div>
                )}
              </div>
              <div className="ml-4">
                {layer.match ? (
                  <CheckCircle className="h-5 w-5 text-emerald-500" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-500" />
                )}
              </div>
            </div>
            {i < layers.length - 1 && (
              <div className="flex items-center justify-center py-1">
                <ArrowDown
                  className={cn(
                    "h-4 w-4",
                    !layers[i + 1].match ? "text-red-500" : "text-muted-foreground"
                  )}
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
