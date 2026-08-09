"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle, XCircle, RotateCcw, ChevronDown, ChevronUp } from "lucide-react";
import { reviewComparison } from "@/actions/review-actions";

type Review = {
  id: string;
  expectedValue: string;
  actualValue: string;
  rootCause: string | null;
  evidence: string | null;
  severity: string;
  entity: { type: string; rawValue: string; normalizedValue: string } | null;
  call: {
    transcript: string;
    language: string;
    audit: { name: string };
  };
};

const ROOT_CAUSE_LABELS: Record<string, string> = {
  asr_error: "ASR Error",
  reasoning_error: "Reasoning Error",
  tool_argument_error: "Tool Arg Error",
  integration_error: "Integration Error",
  false_confirmation: "False Confirm",
};

export function ReviewQueue({ reviews }: { reviews: Review[] }) {
  const router = useRouter();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [processing, setProcessing] = useState<string | null>(null);

  async function handleAction(id: string, action: "confirmed" | "dismissed" | "overridden") {
    setProcessing(id);
    await reviewComparison(id, action, notes[id]);
    setProcessing(null);
    router.refresh();
  }

  if (reviews.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <CheckCircle className="h-8 w-8 text-emerald-500 mx-auto mb-3" />
          <p className="text-muted-foreground">All failures have been reviewed</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {reviews.map((review) => {
        const expanded = expandedId === review.id;
        return (
          <Card key={review.id} className="overflow-hidden">
            <CardHeader
              className="pb-3 cursor-pointer"
              onClick={() => setExpandedId(expanded ? null : review.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="outline" className="capitalize">
                    {review.entity?.type || "unknown"}
                  </Badge>
                  <Badge
                    variant="destructive"
                    className={
                      review.severity === "critical"
                        ? ""
                        : "bg-amber-500/20 text-amber-400"
                    }
                  >
                    {review.severity}
                  </Badge>
                  {review.rootCause && (
                    <Badge variant="secondary">
                      {ROOT_CAUSE_LABELS[review.rootCause] || review.rootCause}
                    </Badge>
                  )}
                  <span className="text-xs text-muted-foreground">
                    {review.call.audit.name}
                  </span>
                </div>
                {expanded ? (
                  <ChevronUp className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                )}
              </div>
              <div className="grid grid-cols-2 gap-3 mt-2">
                <div className="rounded bg-emerald-500/10 p-2">
                  <p className="text-[10px] text-emerald-400 uppercase">Expected</p>
                  <p className="text-sm font-mono">{review.expectedValue}</p>
                </div>
                <div className="rounded bg-red-500/10 p-2">
                  <p className="text-[10px] text-red-400 uppercase">Actual</p>
                  <p className="text-sm font-mono">{review.actualValue}</p>
                </div>
              </div>
            </CardHeader>

            {expanded && (
              <CardContent className="space-y-4 border-t border-border pt-4">
                {review.evidence && (
                  <div className="rounded bg-muted/50 p-3">
                    <p className="text-xs text-muted-foreground mb-1">AI Evidence</p>
                    <p className="text-sm">{review.evidence}</p>
                  </div>
                )}

                {review.entity && (
                  <div className="text-sm">
                    <span className="text-muted-foreground">Raw speech: </span>
                    <span className="italic">{review.entity.rawValue}</span>
                    <span className="text-muted-foreground"> → </span>
                    <span className="font-mono">{review.entity.normalizedValue}</span>
                  </div>
                )}

                <div>
                  <p className="text-xs text-muted-foreground mb-1">Transcript excerpt</p>
                  <pre className="text-xs font-mono bg-muted/30 p-2 rounded max-h-32 overflow-y-auto whitespace-pre-wrap">
                    {review.call.transcript.slice(0, 300)}
                    {review.call.transcript.length > 300 && "..."}
                  </pre>
                </div>

                <Textarea
                  placeholder="Add a review note (optional)..."
                  value={notes[review.id] || ""}
                  onChange={(e) =>
                    setNotes({ ...notes, [review.id]: e.target.value })
                  }
                  rows={2}
                />

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    className="bg-emerald-600 hover:bg-emerald-700"
                    disabled={processing === review.id}
                    onClick={() => handleAction(review.id, "confirmed")}
                  >
                    <CheckCircle className="h-3 w-3 mr-1" /> Confirm
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={processing === review.id}
                    onClick={() => handleAction(review.id, "dismissed")}
                  >
                    <XCircle className="h-3 w-3 mr-1" /> Dismiss
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    disabled={processing === review.id}
                    onClick={() => handleAction(review.id, "overridden")}
                  >
                    <RotateCcw className="h-3 w-3 mr-1" /> Override
                  </Button>
                </div>
              </CardContent>
            )}
          </Card>
        );
      })}
    </div>
  );
}
