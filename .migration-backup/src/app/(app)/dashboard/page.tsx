import { getDashboardStats } from "@/actions/audit-actions";
import { AuditSummary } from "@/components/audit-summary";
import { RootCauseChart } from "@/components/root-cause-chart";
import { AIStatus } from "@/components/ai-status";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FadeIn } from "@/components/motion-wrapper";
import Link from "next/link";

export default async function DashboardPage() {
  const stats = await getDashboardStats();
  const aiConfigured = !!process.env.ANTHROPIC_API_KEY;

  return (
    <div className="space-y-8">
      <FadeIn>
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Overview of your voice agent verification results
            </p>
          </div>
          <AIStatus configured={aiConfigured} />
        </div>
      </FadeIn>

      <FadeIn delay={0.1}>
        <AuditSummary
          totalCalls={stats.totalCalls}
          passedCalls={stats.totalCalls - stats.totalFailures}
          failedCalls={stats.totalFailures}
          failureRate={stats.avgFailureRate}
        />
      </FadeIn>

      <div className="grid gap-6 lg:grid-cols-2">
        <FadeIn delay={0.2}>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Root Cause Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <RootCauseChart data={stats.rootCauseCounts} />
            </CardContent>
          </Card>
        </FadeIn>

        <FadeIn delay={0.3}>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Recent Audits</CardTitle>
            </CardHeader>
            <CardContent>
              {stats.recentAudits.length === 0 ? (
                <p className="text-sm text-muted-foreground py-8 text-center">No audits yet</p>
              ) : (
                <div className="space-y-2">
                  {stats.recentAudits.map((audit) => (
                    <Link
                      key={audit.id}
                      href={`/audits/${audit.id}`}
                      className="flex items-center justify-between rounded-lg border border-border p-3 hover:bg-accent/50 transition-all group"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium truncate group-hover:text-emerald-500 transition-colors">
                          {audit.name}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {audit.totalCalls} calls
                          {audit.failureRate !== null && (
                            <> &middot; {(audit.failureRate * 100).toFixed(0)}% failure rate</>
                          )}
                        </p>
                      </div>
                      <Badge
                        variant={
                          audit.status === "completed"
                            ? "default"
                            : audit.status === "processing"
                              ? "secondary"
                              : "outline"
                        }
                        className={
                          audit.status === "completed"
                            ? "bg-emerald-500/20 text-emerald-400 text-xs"
                            : "text-xs"
                        }
                      >
                        {audit.status}
                      </Badge>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </FadeIn>
      </div>
    </div>
  );
}
