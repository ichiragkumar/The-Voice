import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { FadeIn } from "@/components/motion-wrapper";
import { SpeakButton } from "@/components/speak-button";
import { CheckCircle, XCircle, Shield, Code } from "lucide-react";
import Link from "next/link";

export default async function RunDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const run = await prisma.testRun.findUnique({
    where: { id },
    include: { policyChecks: true, audit: true },
  });

  if (!run) return notFound();

  const toolCalls = run.toolCalls ? JSON.parse(run.toolCalls) : null;
  const finalState = run.finalState ? JSON.parse(run.finalState) : null;

  return (
    <div className="space-y-6 max-w-4xl">
      <FadeIn>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Link href="/runs" className="hover:underline">Test Runs</Link>
          <span>/</span>
          <span>{run.scenarioName}</span>
        </div>
        <div className="flex items-center gap-3 mt-2">
          <h1 className="text-xl font-bold">{run.scenarioName}</h1>
          <Badge
            variant={run.status === "passed" ? "default" : "destructive"}
            className={run.status === "passed" ? "bg-emerald-500/20 text-emerald-400" : ""}
          >
            {run.status}
          </Badge>
          <Badge variant="outline">{run.scenarioPack}</Badge>
        </div>
      </FadeIn>

      <FadeIn delay={0.1}>
        <div className="grid grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-4 text-center">
              <p className="text-2xl font-bold text-emerald-500">{run.passedChecks}</p>
              <p className="text-xs text-muted-foreground">Passed</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 text-center">
              <p className="text-2xl font-bold text-red-500">{run.failedChecks}</p>
              <p className="text-xs text-muted-foreground">Failed</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 text-center">
              <p className="text-2xl font-bold">{run.totalChecks}</p>
              <p className="text-xs text-muted-foreground">Total Checks</p>
            </CardContent>
          </Card>
        </div>
      </FadeIn>

      {run.transcript && (
        <FadeIn delay={0.2}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-sm">Customer Speech</CardTitle>
              <SpeakButton text={run.transcript} label="Listen" />
            </CardHeader>
            <CardContent>
              <p className="text-sm italic text-muted-foreground">&ldquo;{run.transcript}&rdquo;</p>
            </CardContent>
          </Card>
        </FadeIn>
      )}

      {toolCalls && (
        <FadeIn delay={0.25}>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Code className="h-4 w-4" /> Expected Tool Call
              </CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="text-xs font-mono bg-muted/50 p-3 rounded overflow-x-auto">
                {JSON.stringify(toolCalls, null, 2)}
              </pre>
            </CardContent>
          </Card>
        </FadeIn>
      )}

      {finalState && (
        <FadeIn delay={0.3}>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Expected Final State</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="text-xs font-mono bg-muted/50 p-3 rounded overflow-x-auto">
                {JSON.stringify(finalState, null, 2)}
              </pre>
            </CardContent>
          </Card>
        </FadeIn>
      )}

      {run.policyChecks.length > 0 && (
        <>
          <Separator />
          <FadeIn delay={0.35}>
            <div className="space-y-3">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Shield className="h-5 w-5" /> Policy Checks
              </h2>
              {run.policyChecks.map((pc) => (
                <Card key={pc.id} className={pc.passed ? "border-emerald-500/20" : "border-red-500/30"}>
                  <CardContent className="py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {pc.passed ? (
                        <CheckCircle className="h-4 w-4 text-emerald-500" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-500" />
                      )}
                      <div>
                        <p className="text-sm font-medium">{pc.rule}</p>
                        <p className="text-xs text-muted-foreground">{pc.policyPack}</p>
                      </div>
                    </div>
                    <Badge variant={pc.passed ? "default" : "destructive"} className={pc.passed ? "bg-emerald-500/20 text-emerald-400" : ""}>
                      {pc.severity}
                    </Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          </FadeIn>
        </>
      )}
    </div>
  );
}
