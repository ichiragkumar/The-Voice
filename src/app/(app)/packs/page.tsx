import { INDUSTRY_PACKS } from "@/lib/industry-packs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Clock } from "lucide-react";

export default function PacksPage() {
  const available = INDUSTRY_PACKS.filter((p) => p.status === "available");
  const coming = INDUSTRY_PACKS.filter((p) => p.status === "coming_soon");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Industry Packs</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Pre-built verification suites for common Indian voice agent workflows
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {available.map((pack) => (
          <Card key={pack.id} className="relative overflow-hidden">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="text-3xl mb-2">{pack.icon}</div>
                <Badge className="bg-emerald-500/20 text-emerald-400">
                  <CheckCircle className="h-3 w-3 mr-1" /> Available
                </Badge>
              </div>
              <CardTitle className="text-base">{pack.name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">{pack.description}</p>

              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase mb-2">
                  Verifications
                </p>
                <ul className="space-y-1">
                  {pack.verifications.slice(0, 4).map((v) => (
                    <li
                      key={v}
                      className="flex items-start gap-2 text-xs text-muted-foreground"
                    >
                      <CheckCircle className="h-3 w-3 text-emerald-500 mt-0.5 flex-shrink-0" />
                      {v}
                    </li>
                  ))}
                  {pack.verifications.length > 4 && (
                    <li className="text-xs text-muted-foreground">
                      +{pack.verifications.length - 4} more
                    </li>
                  )}
                </ul>
              </div>

              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase mb-2">
                  Sample Scenarios
                </p>
                <div className="space-y-1">
                  {pack.sampleScenarios.slice(0, 3).map((s) => (
                    <p
                      key={s}
                      className="text-xs italic text-muted-foreground bg-muted/50 rounded px-2 py-1"
                    >
                      &ldquo;{s.split(" — ")[0]}&rdquo;
                    </p>
                  ))}
                </div>
              </div>

              <div className="flex gap-1 flex-wrap">
                {pack.languages.map((l) => (
                  <Badge key={l} variant="outline" className="text-xs">
                    {l}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}

        {coming.map((pack) => (
          <Card key={pack.id} className="relative overflow-hidden opacity-60">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="text-3xl mb-2">{pack.icon}</div>
                <Badge variant="secondary">
                  <Clock className="h-3 w-3 mr-1" /> Coming Soon
                </Badge>
              </div>
              <CardTitle className="text-base">{pack.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{pack.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
