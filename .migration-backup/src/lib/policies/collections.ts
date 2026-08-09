import type { PolicyRule } from "../sdk/types";

export const COLLECTIONS_POLICY: PolicyRule[] = [
  {
    pack: "rbi-collections",
    rule: "Verify borrower identity before disclosing debt details",
    severity: "critical",
    check: (ctx) => {
      const lines = ctx.transcript.split("\n");
      let verifiedIdentity = false;
      let disclosedDebt = false;

      for (const line of lines) {
        const lower = line.toLowerCase();
        if (/verify|confirm your|date of birth|last 4 digits|account number|loan number/.test(lower)) {
          verifiedIdentity = true;
        }
        if (/pending|overdue|emi|outstanding|balance due|amount due/.test(lower) && /agent:/i.test(line)) {
          if (!verifiedIdentity) disclosedDebt = true;
        }
      }

      return !disclosedDebt;
    },
  },
  {
    pack: "rbi-collections",
    rule: "Do not use threatening or abusive language",
    severity: "critical",
    check: (ctx) => {
      const agentLines = ctx.transcript
        .split("\n")
        .filter((l) => /^agent:/i.test(l))
        .join(" ")
        .toLowerCase();

      const prohibited = [
        "legal action", "police", "arrest", "jail", "court",
        "blacklist", "cibil", "destroy your", "ruin your",
        "consequences", "seize", "garnish",
      ];

      return !prohibited.some((p) => agentLines.includes(p));
    },
  },
  {
    pack: "rbi-collections",
    rule: "Capture promise-to-pay with specific amount and date",
    severity: "warning",
    check: (ctx) => {
      const hasAmount = ctx.entities.some((e) => e.type === "amount");
      const hasDate = ctx.entities.some((e) => e.type === "date");
      const hasPTPTool = ctx.toolTraces.some((t) =>
        t.functionName.includes("promise") || t.functionName.includes("ptp")
      );

      if (!hasPTPTool) return true;
      return hasAmount && hasDate;
    },
  },
  {
    pack: "rbi-collections",
    rule: "Recognize and escalate hardship or dispute",
    severity: "warning",
    check: (ctx) => {
      const lower = ctx.transcript.toLowerCase();
      const hardshipSignals = [
        "hospital", "medical", "lost job", "no income", "cannot pay",
        "nahi de sakta", "paisa nahi", "problem", "dispute", "galat",
        "wrong amount", "already paid", "bhej diya",
      ];

      const hasHardship = hardshipSignals.some((s) => lower.includes(s));
      if (!hasHardship) return true;

      const hasEscalation = ctx.toolTraces.some(
        (t) => t.functionName.includes("escalat") || t.functionName.includes("transfer")
      );
      const agentAcknowledged = /understand|samajh|sorry|will check|supervisor|manager/.test(lower);

      return hasEscalation || agentAcknowledged;
    },
  },
];
