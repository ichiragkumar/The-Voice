import { getAudit } from "@/actions/audit-actions";
import { AuditSummary } from "@/components/audit-summary";
import { CallList } from "@/components/call-list";
import { RootCauseChart } from "@/components/root-cause-chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ProcessButton } from "./process-button";

export default async function AuditDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const audit = await getAudit(id);

  if (!audit) return notFound();

  const passedCalls = audit.calls.filter((c) => c.status === "passed").length;
  const failedCalls = audit.calls.filter((c) => c.status === "failed").length;

  const rootCauseCounts: Record<string, number> = {};
  for (const call of audit.calls) {
    for (const comp of call.comparisons) {
      if (!comp.match && comp.rootCause) {
        rootCauseCounts[comp.rootCause] =
          (rootCauseCounts[comp.rootCause] || 0) + 1;
      }
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
            <Link href="/audits" className="hover:underline">
              Audits
            </Link>
            <span>/</span>
            <span>{audit.name}</span>
          </div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">{audit.name}</h1>
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
          </div>
        </div>
        {(audit.status === "pending" || audit.status === "processing") && (
          <ProcessButton auditId={audit.id} status={audit.status} />
        )}
      </div>

      <AuditSummary
        totalCalls={audit.totalCalls}
        passedCalls={passedCalls}
        failedCalls={failedCalls}
        failureRate={audit.failureRate}
      />

      <Tabs defaultValue="calls">
        <TabsList>
          <TabsTrigger value="calls">Calls</TabsTrigger>
          <TabsTrigger value="analysis">Analysis</TabsTrigger>
        </TabsList>
        <TabsContent value="calls" className="mt-4">
          <Card>
            <CardContent className="pt-6">
              <CallList calls={audit.calls} />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="analysis" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Root Cause Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <RootCauseChart data={rootCauseCounts} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
