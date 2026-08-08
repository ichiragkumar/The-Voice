import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type Call = {
  id: string;
  language: string;
  summary: string | null;
  status: string;
};

export function CallList({ calls }: { calls: Call[] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-12">#</TableHead>
          <TableHead>Language</TableHead>
          <TableHead>Summary</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="w-20">Action</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {calls.map((call, i) => (
          <TableRow key={call.id}>
            <TableCell className="text-muted-foreground">{i + 1}</TableCell>
            <TableCell>
              <Badge variant="outline" className="capitalize">
                {call.language}
              </Badge>
            </TableCell>
            <TableCell className="max-w-md truncate text-sm">
              {call.summary || "No summary"}
            </TableCell>
            <TableCell>
              <Badge
                variant={call.status === "passed" ? "default" : call.status === "failed" ? "destructive" : "secondary"}
                className={
                  call.status === "passed"
                    ? "bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30"
                    : ""
                }
              >
                {call.status}
              </Badge>
            </TableCell>
            <TableCell>
              <Link
                href={`/calls/${call.id}`}
                className="text-sm text-blue-400 hover:underline"
              >
                View
              </Link>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
