import type { PolicyRule, VerificationContext } from "../sdk/types";

export type PolicyCheckResult = {
  pack: string;
  rule: string;
  passed: boolean;
  evidence: string;
  severity: "critical" | "warning" | "info";
};

export async function runPolicyChecks(
  ctx: VerificationContext,
  rules: PolicyRule[]
): Promise<PolicyCheckResult[]> {
  const results: PolicyCheckResult[] = [];

  for (const rule of rules) {
    let passed: boolean;
    try {
      passed = await rule.check(ctx);
    } catch {
      passed = false;
    }

    results.push({
      pack: rule.pack,
      rule: rule.rule,
      passed,
      evidence: passed ? "Rule satisfied" : `Policy violation: ${rule.rule}`,
      severity: rule.severity,
    });
  }

  return results;
}
