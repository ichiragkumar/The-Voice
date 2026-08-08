"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FadeIn } from "@/components/motion-wrapper";
import { SpeakButton } from "@/components/speak-button";
import { Play, CheckCircle, XCircle, Loader2, Zap } from "lucide-react";
import { BENCHMARK_PACKS, type BenchmarkScenario } from "@/lib/benchmarks";

export default function RunnerPage() {
  const [selectedPack, setSelectedPack] = useState(BENCHMARK_PACKS[0].id);
  const [running, setRunning] = useState<string | null>(null);
  const [results, setResults] = useState<Record<string, "passed" | "failed">>({});

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
      setResults((r) => ({
        ...r,
        [scenario.id]: data.failedChecks === 0 ? "passed" : "failed",
      }));
    } catch {
      setResults((r) => ({ ...r, [scenario.id]: "failed" }));
    }
    setRunning(null);
  }

  async function runAll() {
    for (const scenario of pack.scenarios) {
      await runScenario(scenario);
    }
  }

  const passCount = Object.values(results).filter((r) => r === "passed").length;
  const failCount = Object.values(results).filter((r) => r === "failed").length;

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
        {pack.scenarios.map((scenario, i) => (
          <FadeIn key={scenario.id} delay={0.1 + i * 0.03}>
            <Card className={results[scenario.id] === "failed" ? "border-red-500/30" : results[scenario.id] === "passed" ? "border-emerald-500/30" : ""}>
              <CardContent className="py-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" className="text-xs capitalize">{scenario.language}</Badge>
                      <Badge variant="secondary" className="text-xs">{scenario.difficulty}</Badge>
                      <span className="text-sm font-medium">{scenario.name}</span>
                    </div>
                    <p className="text-sm italic text-muted-foreground mt-1">
                      &ldquo;{scenario.customerText}&rdquo;
                    </p>
                    <div className="flex gap-2 mt-2 flex-wrap">
                      {scenario.expectedEntities.map((e) => (
                        <Badge key={e.rawValue} variant="outline" className="text-[10px]">
                          {e.type}: {e.rawValue} → {e.expectedValue}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <SpeakButton text={scenario.customerText} size="icon" label="" />
                    {results[scenario.id] === "passed" && <CheckCircle className="h-5 w-5 text-emerald-500" />}
                    {results[scenario.id] === "failed" && <XCircle className="h-5 w-5 text-red-500" />}
                    {running === scenario.id && <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />}
                    {!results[scenario.id] && running !== scenario.id && (
                      <Button size="sm" variant="outline" onClick={() => runScenario(scenario)}>
                        <Play className="h-3 w-3 mr-1" /> Run
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </FadeIn>
        ))}
      </div>
    </div>
  );
}
