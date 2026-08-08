import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { AudioPlayer } from "@/components/audio-player";
import { LayerComparison } from "@/components/layer-comparison";
import { EntityTable } from "@/components/entity-table";
import { FailureCard } from "@/components/failure-card";
import { AlertTriangle, CheckCircle, Code } from "lucide-react";
import { SpeakButton } from "@/components/speak-button";

export default async function CallDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const call = await prisma.call.findUnique({
    where: { id },
    include: {
      audit: true,
      entities: true,
      toolCalls: true,
      comparisons: { include: { entity: true, toolCall: true } },
    },
  });

  if (!call) return notFound();

  const failedComparisons = call.comparisons.filter((c) => !c.match);
  const passedComparisons = call.comparisons.filter((c) => c.match);

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/audits" className="hover:underline">
          Audits
        </Link>
        <span>/</span>
        <Link href={`/audits/${call.audit.id}`} className="hover:underline">
          {call.audit.name}
        </Link>
        <span>/</span>
        <span>Call Detail</span>
      </div>

      {/* Header */}
      <div className="flex items-center gap-3">
        <h1 className="text-xl font-bold">
          {call.summary || "Call Detail"}
        </h1>
        <Badge variant="outline" className="capitalize">
          {call.language}
        </Badge>
        <Badge
          variant={call.status === "passed" ? "default" : "destructive"}
          className={
            call.status === "passed"
              ? "bg-emerald-500/20 text-emerald-400"
              : ""
          }
        >
          {call.status}
        </Badge>
      </div>

      {/* Audio Player */}
      <AudioPlayer audioUrl={call.audioUrl} />

      {/* Transcript */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-sm">Transcript</CardTitle>
          <SpeakButton
            text={call.transcript.replace(/Agent:|Customer:/g, "").slice(0, 500)}
            voice="Ananya"
            label="Listen to call"
          />
        </CardHeader>
        <CardContent>
          <pre className="whitespace-pre-wrap text-sm text-muted-foreground font-mono leading-relaxed">
            {call.transcript}
          </pre>
        </CardContent>
      </Card>

      {/* Failures */}
      {failedComparisons.length > 0 && (
        <>
          <Separator />
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              <h2 className="text-lg font-semibold">Failures Found</h2>
              <Badge variant="destructive">{failedComparisons.length}</Badge>
            </div>
            {failedComparisons.map((comp) => (
              <FailureCard
                key={comp.id}
                expectedValue={comp.expectedValue}
                actualValue={comp.actualValue}
                rootCause={comp.rootCause}
                evidence={comp.evidence}
                severity={comp.severity}
                entityType={comp.entity?.type || "unknown"}
              />
            ))}
          </div>
        </>
      )}

      {/* Layer-by-Layer Verification */}
      {call.comparisons.length > 0 && (
        <>
          <Separator />
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-emerald-500" />
              <h2 className="text-lg font-semibold">
                Layer-by-Layer Verification
              </h2>
            </div>
            {call.comparisons
              .filter((c) => c.entity)
              .map((comp) => {
                const entity = comp.entity!;
                const layers = [
                  {
                    name: "Customer Audio",
                    value: entity.rawValue,
                    expected: entity.rawValue,
                    match: true,
                  },
                  {
                    name: "ASR Transcript",
                    value: entity.rawValue,
                    expected: entity.rawValue,
                    match: true,
                  },
                  {
                    name: "Agent Interpretation",
                    value: entity.normalizedValue,
                    expected: comp.expectedValue,
                    match:
                      entity.normalizedValue.toLowerCase() ===
                      comp.expectedValue.toLowerCase(),
                  },
                  {
                    name: "Tool Call",
                    value: comp.actualValue,
                    expected: comp.expectedValue,
                    match: comp.match,
                  },
                  {
                    name: "Backend State",
                    value: comp.actualValue,
                    expected: comp.expectedValue,
                    match: comp.match,
                  },
                ];

                return (
                  <LayerComparison
                    key={comp.id}
                    layers={layers}
                    entityType={entity.type}
                    entityLabel={`${entity.rawValue} → ${comp.expectedValue}`}
                  />
                );
              })}
          </div>
        </>
      )}

      {/* Entity Extraction */}
      {call.entities.length > 0 && (
        <>
          <Separator />
          <Card>
            <CardHeader>
              <CardTitle>Extracted Entities</CardTitle>
            </CardHeader>
            <CardContent>
              <EntityTable entities={call.entities} />
            </CardContent>
          </Card>
        </>
      )}

      {/* Tool Calls */}
      {call.toolCalls.length > 0 && (
        <>
          <Separator />
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Code className="h-5 w-5 text-muted-foreground" />
              <h2 className="text-lg font-semibold">Tool Calls</h2>
            </div>
            {call.toolCalls.map((tc) => (
              <Card key={tc.id}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-mono">
                    {tc.functionName}()
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">
                      Arguments
                    </p>
                    <pre className="rounded-md bg-muted p-3 text-xs font-mono overflow-x-auto">
                      {JSON.stringify(JSON.parse(tc.arguments), null, 2)}
                    </pre>
                  </div>
                  {tc.response && (
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">
                        Response
                      </p>
                      <pre className="rounded-md bg-muted p-3 text-xs font-mono overflow-x-auto">
                        {JSON.stringify(JSON.parse(tc.response), null, 2)}
                      </pre>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
