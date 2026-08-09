import type { PolicyRule } from "../sdk/types";

export const INSURANCE_POLICY: PolicyRule[] = [
  {
    pack: "insurance-irdai",
    rule: "Verify policy number before making any changes",
    severity: "critical",
    check: (ctx) => {
      const hasMutation = ctx.toolTraces.some((t) =>
        /update|change|modify|cancel|surrender/.test(t.functionName)
      );
      if (!hasMutation) return true;

      const lower = ctx.transcript.toLowerCase();
      return /policy.*number|policy.*id|SL-|POL-|LIC-/.test(lower);
    },
  },
  {
    pack: "insurance-irdai",
    rule: "Do not confirm action when API returns error",
    severity: "critical",
    check: (ctx) => {
      for (const t of ctx.toolTraces) {
        const failed = t.result.success === false || t.result.error;
        if (failed) {
          const agentLines = ctx.transcript
            .split("\n")
            .filter((l) => /^agent:/i.test(l))
            .join(" ")
            .toLowerCase();

          const confirmedSuccess = /ho gaya|done|updated|changed|kar diya|confirmed/.test(agentLines);
          if (confirmedSuccess) return false;
        }
      }
      return true;
    },
  },
  {
    pack: "insurance-irdai",
    rule: "Nominee changes require relationship and DOB",
    severity: "warning",
    check: (ctx) => {
      const hasNomineeChange = ctx.toolTraces.some((t) =>
        /nominee/.test(t.functionName)
      );
      if (!hasNomineeChange) return true;

      const hasRelationship = ctx.toolTraces.some(
        (t) => t.arguments.relationship || t.arguments.relation
      );
      const hasDOB = ctx.toolTraces.some(
        (t) => t.arguments.nominee_dob || t.arguments.dob || t.arguments.date_of_birth
      );

      return hasRelationship && hasDOB;
    },
  },
];
