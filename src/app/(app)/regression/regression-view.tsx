"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { ArrowRight, TrendingDown, TrendingUp, Minus, Loader2, GitCompare } from "lucide-react";
import { compareAudits, type RegressionResult } from "@/actions/regression-actions";

type Audit = {
  id: string;
  name: string;
  failureRate: number | null;
  totalCalls: number;
  createdAt: Date;
};

const ROOT_CAUSE_LABELS: Record<string, string> = {
  asr_error: "ASR Error",
  reasoning_error: "Reasoning Error",
  tool_argument_error: "Tool Arg Error",
  integration_error: "Integration Error",
  false_confirmation: "False Confirm",
};

export function RegressionView({ audits }: { audits: Audit[] }) {
  const [auditA, setAuditA] = useState<string | null>(null);
  const [auditB, setAuditB] = useState<string | null>(null);
  const [result, setResult] = useState<RegressionResult | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleCompare() {
    if (!auditA || !auditB) return;
    setLoading(true);
    const res = await compareAudits(auditA, auditB);
    setResult(res);
    setLoading(false);
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <GitCompare className="h-4 w-4" /> Select Audits to Compare
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-end gap-4 flex-wrap">
            <div className="flex-1 min-w-48">
              <Label className="mb-2 block">Version A (Before)</Label>
              <Select onValueChange={(v: string | null) => v && setAuditA(v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select baseline audit" />
                </SelectTrigger>
                <SelectContent>
                  {audits.map((a) => (
                    <SelectItem key={a.id} value={a.id}>
                      {a.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <ArrowRight className="h-5 w-5 text-muted-foreground mb-2" />
            <div className="flex-1 min-w-48">
              <Label className="mb-2 block">Version B (After)</Label>
              <Select onValueChange={(v: string | null) => v && setAuditB(v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select new audit" />
                </SelectTrigger>
                <SelectContent>
                  {audits.map((a) => (
                    <SelectItem key={a.id} value={a.id}>
                      {a.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button
              onClick={handleCompare}
              disabled={!auditA || !auditB || loading}
              className="bg-emerald-600 hover:bg-emerald-700 mb-0"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Compare"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {result && (
        <>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-sm text-muted-foreground mb-2">Overall Change</p>
                <div className="flex items-center justify-center gap-2">
                  {result.overallChange === "improved" && (
                    <>
                      <TrendingDown className="h-6 w-6 text-emerald-500" />
                      <span className="text-2xl font-bold text-emerald-500">Improved</span>
                    </>
                  )}
                  {result.overallChange === "regressed" && (
                    <>
                      <TrendingUp className="h-6 w-6 text-red-500" />
                      <span className="text-2xl font-bold text-red-500">Regressed</span>
                    </>
                  )}
                  {result.overallChange === "unchanged" && (
                    <>
                      <Minus className="h-6 w-6 text-muted-foreground" />
                      <span className="text-2xl font-bold">Unchanged</span>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-sm text-muted-foreground mb-2">New Failures</p>
                <span className="text-3xl font-bold text-red-500">
                  +{result.newFailures}
                </span>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-sm text-muted-foreground mb-2">Fixed Failures</p>
                <span className="text-3xl font-bold text-emerald-500">
                  -{result.fixedFailures}
                </span>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Version A — {result.auditA.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total Calls</span>
                  <span>{result.auditA.totalCalls}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Failed</span>
                  <span className="text-red-400">{result.auditA.failedCalls}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Failure Rate</span>
                  <span>
                    {result.auditA.failureRate !== null
                      ? `${(result.auditA.failureRate * 100).toFixed(1)}%`
                      : "N/A"}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Version B — {result.auditB.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total Calls</span>
                  <span>{result.auditB.totalCalls}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Failed</span>
                  <span className="text-red-400">{result.auditB.failedCalls}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Failure Rate</span>
                  <span>
                    {result.auditB.failureRate !== null
                      ? `${(result.auditB.failureRate * 100).toFixed(1)}%`
                      : "N/A"}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Root Cause Shift</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(result.rootCauseShift).map(([cause, counts]) => {
                  const diff = counts.after - counts.before;
                  return (
                    <div key={cause} className="flex items-center justify-between">
                      <span className="text-sm">
                        {ROOT_CAUSE_LABELS[cause] || cause}
                      </span>
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-muted-foreground">
                          {counts.before}
                        </span>
                        <ArrowRight className="h-3 w-3 text-muted-foreground" />
                        <span className="text-sm">{counts.after}</span>
                        {diff !== 0 && (
                          <Badge
                            variant={diff > 0 ? "destructive" : "default"}
                            className={
                              diff < 0
                                ? "bg-emerald-500/20 text-emerald-400"
                                : ""
                            }
                          >
                            {diff > 0 ? `+${diff}` : diff}
                          </Badge>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
