import { getPendingReviews, getReviewStats } from "@/actions/review-actions";
import { ReviewQueue } from "./review-queue";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ClipboardCheck, Clock, CheckCircle, XCircle, RotateCcw } from "lucide-react";

export default async function ReviewPage() {
  const [reviews, stats] = await Promise.all([
    getPendingReviews(),
    getReviewStats(),
  ]);

  const statCards = [
    { title: "Pending Review", value: stats.pending, icon: Clock, color: "text-amber-500" },
    { title: "Confirmed", value: stats.confirmed, icon: CheckCircle, color: "text-emerald-500" },
    { title: "Dismissed", value: stats.dismissed, icon: XCircle, color: "text-muted-foreground" },
    { title: "Overridden", value: stats.overridden, icon: RotateCcw, color: "text-blue-500" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <ClipboardCheck className="h-6 w-6" /> Human Review Queue
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Review AI-detected failures and confirm, dismiss, or override the classification
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {statCards.map((card) => (
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

      <ReviewQueue reviews={reviews} />
    </div>
  );
}
