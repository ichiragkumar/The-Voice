import { getDashboardStats } from "@/actions/audit-actions";
import { AuditSummary } from "@/components/audit-summary";
import { RootCauseChart } from "@/components/root-cause-chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

export default async function DashboardPage() {
  const stats = await getDashboardStats();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      <AuditSummary
        totalCalls={stats.totalCalls}
        passedCalls={stats.totalCalls - stats.totalFailures}
        failedCalls={stats.totalFailures}
        failureRate={stats.avgFailureRate}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Root Cause Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <RootCauseChart data={stats.rootCauseCounts} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Audits</CardTitle>
          </CardHeader>
          <CardContent>
            {stats.recentAudits.length === 0 ? (
              <p className="text-sm text-muted-foreground">No audits yet</p>
            ) : (
              <div className="space-y-3">
                {stats.recentAudits.map((audit) => (
                  <Link
                    key={audit.id}
                    href={`/audits/${audit.id}`}
                    className="flex items-center justify-between rounded-md border border-border p-3 hover:bg-accent transition-colors"
                  >
                    <div>
                      <p className="text-sm font-medium">{audit.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {audit.totalCalls} calls &middot;{" "}
                        {audit.failureRate !== null
                          ? `${(audit.failureRate * 100).toFixed(0)}% failure rate`
                          : "Not processed"}
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
                          ? "bg-emerald-500/20 text-emerald-400"
                          : ""
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
      </div>
    </div>
  );
}
