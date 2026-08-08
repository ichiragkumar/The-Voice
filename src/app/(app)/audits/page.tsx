import Link from "next/link";
import { getAudits } from "@/actions/audit-actions";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus } from "lucide-react";

export default async function AuditsPage() {
  const audits = await getAudits();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Audits</h1>
        <Link href="/audits/new">
          <Button className="bg-emerald-600 hover:bg-emerald-700">
            <Plus className="mr-2 h-4 w-4" /> New Audit
          </Button>
        </Link>
      </div>

      {audits.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <p className="text-muted-foreground">No audits yet</p>
          <Link href="/audits/new">
            <Button variant="outline" className="mt-4">Create your first audit</Button>
          </Link>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Calls</TableHead>
              <TableHead>Failure Rate</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="w-20">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {audits.map((audit) => (
              <TableRow key={audit.id}>
                <TableCell className="font-medium">{audit.name}</TableCell>
                <TableCell>
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
                </TableCell>
                <TableCell>{audit.totalCalls}</TableCell>
                <TableCell>
                  {audit.failureRate !== null
                    ? `${(audit.failureRate * 100).toFixed(1)}%`
                    : "—"}
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {new Date(audit.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <Link
                    href={`/audits/${audit.id}`}
                    className="text-sm text-blue-400 hover:underline"
                  >
                    View
                  </Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
