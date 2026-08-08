import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileCheck, FileX, Phone, Percent } from "lucide-react";

type Props = {
  totalCalls: number;
  passedCalls: number;
  failedCalls: number;
  failureRate: number | null;
};

export function AuditSummary({ totalCalls, passedCalls, failedCalls, failureRate }: Props) {
  const cards = [
    { title: "Total Calls", value: totalCalls, icon: Phone, color: "text-blue-500" },
    { title: "Passed", value: passedCalls, icon: FileCheck, color: "text-emerald-500" },
    { title: "Failed", value: failedCalls, icon: FileX, color: "text-red-500" },
    {
      title: "Failure Rate",
      value: failureRate !== null ? `${(failureRate * 100).toFixed(1)}%` : "N/A",
      icon: Percent,
      color: failureRate && failureRate > 0.2 ? "text-red-500" : "text-emerald-500",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.title}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {card.title}
            </CardTitle>
            <card.icon className={`h-4 w-4 ${card.color}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${card.color}`}>{card.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
