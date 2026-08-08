import { getCompletedAudits } from "@/actions/regression-actions";
import { RegressionView } from "./regression-view";

export default async function RegressionPage() {
  const audits = await getCompletedAudits();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Regression Comparison</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Compare two audit runs to identify new failures and improvements
        </p>
      </div>
      <RegressionView audits={audits} />
    </div>
  );
}
