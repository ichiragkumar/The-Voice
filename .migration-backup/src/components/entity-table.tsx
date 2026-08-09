import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { SpeakButton } from "@/components/speak-button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type Entity = {
  id: string;
  type: string;
  rawValue: string;
  normalizedValue: string;
  confidence: number;
  sourceLayer: string;
};

const TYPE_COLORS: Record<string, string> = {
  date: "bg-blue-500/20 text-blue-400",
  time: "bg-purple-500/20 text-purple-400",
  name: "bg-emerald-500/20 text-emerald-400",
  phone: "bg-amber-500/20 text-amber-400",
  amount: "bg-teal-500/20 text-teal-400",
  address: "bg-rose-500/20 text-rose-400",
  action: "bg-violet-500/20 text-violet-400",
};

export function EntityTable({ entities }: { entities: Entity[] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Type</TableHead>
          <TableHead>Raw Value</TableHead>
          <TableHead>Normalized</TableHead>
          <TableHead>Confidence</TableHead>
          <TableHead>Source</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {entities.map((entity) => (
          <TableRow key={entity.id}>
            <TableCell>
              <Badge
                variant="outline"
                className={TYPE_COLORS[entity.type] || ""}
              >
                {entity.type}
              </Badge>
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-2">
                <span className="italic text-muted-foreground">{entity.rawValue}</span>
                <SpeakButton text={entity.rawValue} size="icon" label="" />
              </div>
            </TableCell>
            <TableCell className="font-mono text-sm">
              {entity.normalizedValue}
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-2">
                <Progress
                  value={entity.confidence * 100}
                  className="h-2 w-16"
                />
                <span className="text-xs text-muted-foreground">
                  {(entity.confidence * 100).toFixed(0)}%
                </span>
              </div>
            </TableCell>
            <TableCell className="text-xs text-muted-foreground">
              {entity.sourceLayer.replace(/_/g, " ")}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
