import { Badge } from "@/components/ui/badge";
import { Brain, AlertTriangle } from "lucide-react";

export function AIStatus({ configured }: { configured: boolean }) {
  if (configured) {
    return (
      <Badge variant="outline" className="gap-1.5 bg-emerald-500/10 text-emerald-500 border-emerald-500/20">
        <Brain className="h-3 w-3" />
        Claude Connected
      </Badge>
    );
  }

  return (
    <Badge variant="outline" className="gap-1.5 bg-amber-500/10 text-amber-500 border-amber-500/20">
      <AlertTriangle className="h-3 w-3" />
      Claude Not Configured — add ANTHROPIC_API_KEY to .env
    </Badge>
  );
}
