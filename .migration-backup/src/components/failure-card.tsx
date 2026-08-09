import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type Props = {
  expectedValue: string;
  actualValue: string;
  rootCause: string | null;
  evidence: string | null;
  severity: string;
  entityType: string;
};

const ROOT_CAUSE_CONFIG: Record<string, { label: string; color: string }> = {
  asr_error: { label: "ASR Error", color: "bg-orange-500/20 text-orange-400" },
  reasoning_error: { label: "Reasoning Error", color: "bg-red-500/20 text-red-400" },
  tool_argument_error: { label: "Tool Argument Error", color: "bg-purple-500/20 text-purple-400" },
  integration_error: { label: "Integration Error", color: "bg-blue-500/20 text-blue-400" },
  false_confirmation: { label: "False Confirmation", color: "bg-amber-500/20 text-amber-400" },
};

const SEVERITY_CONFIG: Record<string, string> = {
  critical: "bg-red-500/20 text-red-400",
  warning: "bg-amber-500/20 text-amber-400",
  info: "bg-blue-500/20 text-blue-400",
};

export function FailureCard({
  expectedValue,
  actualValue,
  rootCause,
  evidence,
  severity,
  entityType,
}: Props) {
  const causeConfig = rootCause ? ROOT_CAUSE_CONFIG[rootCause] : null;

  return (
    <Card className="border-red-500/30">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="outline" className="capitalize">
            {entityType}
          </Badge>
          <Badge variant="outline" className={SEVERITY_CONFIG[severity] || ""}>
            {severity}
          </Badge>
          {causeConfig && (
            <Badge variant="outline" className={causeConfig.color}>
              {causeConfig.label}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-md bg-emerald-500/10 p-3">
            <p className="text-xs font-medium text-emerald-400 mb-1">Expected</p>
            <p className="font-mono text-sm">{expectedValue}</p>
          </div>
          <div className="rounded-md bg-red-500/10 p-3">
            <p className="text-xs font-medium text-red-400 mb-1">Actual</p>
            <p className="font-mono text-sm">{actualValue}</p>
          </div>
        </div>
        {evidence && (
          <div className="rounded-md border border-border bg-muted/30 p-3">
            <p className="text-sm text-muted-foreground">{evidence}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
