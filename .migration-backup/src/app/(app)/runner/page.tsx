"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FadeIn } from "@/components/motion-wrapper";
import { SpeakButton } from "@/components/speak-button";
import { Play, CheckCircle, XCircle, Loader2, Zap, ArrowRight, AlertTriangle } from "lucide-react";
import { BENCHMARK_PACKS, type BenchmarkScenario } from "@/lib/benchmarks";

type RunResult = {
  passed: boolean;
  expectedTool: string;
  expectedArgs: Record<string, string>;
  issue?: string;
  fix?: string;
};

export default function RunnerPage() {
  const [selectedPack, setSelectedPack] = useState(BENCHMARK_PACKS[0].id);
  const [running, setRunning] = useState<string | null>(null);
  const [results, setResults] = useState<Record<string, RunResult>>({});

  const pack = BENCHMARK_PACKS.find((p) => p.id === selectedPack)!;

  async function runScenario(scenario: BenchmarkScenario) {
    setRunning(scenario.id);
    try {
      const res = await fetch("/api/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scenarioName: scenario.name,
          scenarioPack: selectedPack,
          transcript: scenario.customerText,
          language: scenario.language,
          expectedEntities: scenario.expectedEntities,
          expectedToolCall: scenario.expectedToolCall,
          expectedFinalState: scenario.expectedFinalState,
        }),
      });
      const data = await res.json();

      const toolName = scenario.expectedToolCall.functionName;
      const toolArgs = scenario.expectedToolCall.expectedArgs;
      const passed = data.failedChecks === 0;

      let issue: string | undefined;
      let fix: string | undefined;

      if (!passed) {
        const entityMismatches = scenario.expectedEntities
          .filter((e) => e.type === "amount" || e.type === "date" || e.type === "time")
          .map((e) => `${e.type}: "${e.rawValue}" should be ${e.expectedValue}`);

        if (entityMismatches.length > 0) {
          issue = `Entity mismatch: ${entityMismatches[0]}`;
          fix = `Fix normalizer for ${scenario.expectedEntities[0].type} expressions`;
        } else {
          issue = `Tool args may not match expected values`;
          fix = `Verify ${toolName}() receives correct arguments`;
        }
      }

      setResults((r) => ({
        ...r,
        [scenario.id]: { passed, expectedTool: toolName, expectedArgs: toolArgs, issue, fix },
      }));
    } catch {
      setResults((r) => ({
        ...r,
        [scenario.id]: {
          passed: false,
          expectedTool: scenario.expectedToolCall.functionName,
          expectedArgs: scenario.expectedToolCall.expectedArgs,
          issue: "Run failed — network or server error",
          fix: "Check server logs",
        },
      }));
    }
    setRunning(null);
  }

  async function runAll() {
    for (const scenario of pack.scenarios) {
      await runScenario(scenario);
    }
  }

  const passCount = Object.values(results).filter((r) => r.passed).length;
  const failCount = Object.values(results).filter((r) => !r.passed).length;

  return (
    <div className="space-y-6 max-w-4xl">
      <FadeIn>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              <Zap className="h-5 w-5 text-emerald-500" /> Test Runner
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Run benchmark scenarios and verify entity extraction, tool calls, and backend state
            </p>
          </div>
          <Button onClick={runAll} className="bg-emerald-600 hover:bg-emerald-700">
            <Play className="h-4 w-4 mr-2" /> Run All
          </Button>
        </div>
      </FadeIn>

      <FadeIn delay={0.1}>
        <div className="flex gap-2">
          {BENCHMARK_PACKS.map((p) => (
            <Button
              key={p.id}
              variant={selectedPack === p.id ? "default" : "outline"}
              size="sm"
              onClick={() => { setSelectedPack(p.id); setResults({}); }}
            >
              {p.icon} {p.name}
            </Button>
          ))}
        </div>
      </FadeIn>

      {Object.keys(results).length > 0 && (
        <FadeIn delay={0.15}>
          <div className="flex gap-4 text-sm">
            <span className="text-emerald-400">{passCount} passed</span>
            <span className="text-red-400">{failCount} failed</span>
            <span className="text-muted-foreground">
              {pack.scenarios.length - passCount - failCount} remaining
            </span>
          </div>
        </FadeIn>
      )}

      <div className="space-y-3">
        {pack.scenarios.map((scenario, i) => {
          const result = results[scenario.id];
          const isFailed = result && !result.passed;
          const isPassed = result && result.passed;

          return (
            <FadeIn key={scenario.id} delay={0.1 + i * 0.03}>
              <Card className={isFailed ? "border-red-500/30" : isPassed ? "border-emerald-500/20" : ""}>
                <CardContent className="py-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5">
                        <Badge variant="outline" className="text-[10px] capitalize">{scenario.language}</Badge>
                        <Badge variant="secondary" className="text-[10px]">{scenario.difficulty}</Badge>
                        <span className="text-sm font-medium">{scenario.name}</span>
                      </div>
                      <p className="text-xs italic text-muted-foreground">
                        &ldquo;{scenario.customerText}&rdquo;
                      </p>
                      <div className="flex gap-1.5 mt-2 flex-wrap">
                        {scenario.expectedEntities.map((e) => (
                          <Badge key={e.rawValue} variant="outline" className="text-[10px] font-mono">
                            {e.type}: {e.rawValue} → {e.expectedValue}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <SpeakButton text={scenario.customerText} size="icon" label="" />
                      {isPassed && <CheckCircle className="h-5 w-5 text-emerald-500" />}
                      {isFailed && <XCircle className="h-5 w-5 text-red-500" />}
                      {running === scenario.id && <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />}
                      {!result && running !== scenario.id && (
                        <Button size="sm" variant="outline" onClick={() => runScenario(scenario)}>
                          <Play className="h-3 w-3 mr-1" /> Run
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Result details */}
                  {result && (
                    <div className="mt-3 pt-3 border-t border-border space-y-2">
                      {/* Tool call info */}
                      <div className="flex items-center gap-2 text-xs">
                        <span className="text-muted-foreground">Expected call:</span>
                        <code className="font-mono bg-muted px-1.5 py-0.5 rounded text-emerald-500">
                          {result.expectedTool}({Object.entries(result.expectedArgs).map(([k, v]) => `${k}: "${v}"`).join(", ")})
                        </code>
                      </div>

                      {/* Failure details */}
                      {isFailed && result.issue && (
                        <div className="rounded-md bg-red-500/10 border border-red-500/20 px-3 py-2">
                          <div className="flex items-start gap-2">
                            <AlertTriangle className="h-3.5 w-3.5 text-red-400 mt-0.5 flex-shrink-0" />
                            <div className="text-xs space-y-1">
                              <p className="text-red-400">{result.issue}</p>
                              {result.fix && (
                                <p className="text-muted-foreground">
                                  <span className="text-amber-400">Fix:</span> {result.fix}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Pass confirmation */}
                      {isPassed && (
                        <div className="rounded-md bg-emerald-500/10 border border-emerald-500/20 px-3 py-2">
                          <p className="text-xs text-emerald-400 flex items-center gap-1.5">
                            <CheckCircle className="h-3 w-3" />
                            All checks passed — entity, tool call, and expected state match
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </FadeIn>
          );
        })}
      </div>
    </div>
  );
}
