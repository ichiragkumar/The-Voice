import { prisma } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FadeIn } from "@/components/motion-wrapper";
import Link from "next/link";
import { Activity } from "lucide-react";

export default async function RunsPage() {
  const runs = await prisma.testRun.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
    include: { policyChecks: true },
  });

  return (
    <div className="space-y-6">
      <FadeIn>
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Activity className="h-5 w-5" /> Test Runs
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            History of all verification runs
          </p>
        </div>
      </FadeIn>

      {runs.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            No test runs yet. Go to the Runner to execute benchmark scenarios.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {runs.map((run, i) => (
            <FadeIn key={run.id} delay={i * 0.03}>
              <Link href={`/runs/${run.id}`}>
                <Card className="hover:border-emerald-500/20 transition-colors cursor-pointer">
                  <CardContent className="py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Badge
                          variant={run.status === "passed" ? "default" : run.status === "failed" ? "destructive" : "secondary"}
                          className={run.status === "passed" ? "bg-emerald-500/20 text-emerald-400" : ""}
                        >
                          {run.status}
                        </Badge>
                        <div>
                          <p className="text-sm font-medium">{run.scenarioName}</p>
                          <p className="text-xs text-muted-foreground">
                            {run.scenarioPack} &middot; {new Date(run.createdAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="text-emerald-400">{run.passedChecks} passed</span>
                        <span className="text-red-400">{run.failedChecks} failed</span>
                        {run.policyChecks.length > 0 && (
                          <Badge variant="outline" className="text-xs">
                            {run.policyChecks.filter((p) => !p.passed).length} policy violations
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </FadeIn>
          ))}
        </div>
      )}
    </div>
  );
}
