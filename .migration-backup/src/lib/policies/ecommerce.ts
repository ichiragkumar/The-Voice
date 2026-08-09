import type { PolicyRule } from "../sdk/types";

export const ECOMMERCE_POLICY: PolicyRule[] = [
  {
    pack: "ecommerce",
    rule: "Verify order ID before any mutation",
    severity: "critical",
    check: (ctx) => {
      const hasMutation = ctx.toolTraces.some((t) =>
        /cancel|refund|return|modify|update|reschedule/.test(t.functionName)
      );
      if (!hasMutation) return true;

      const hasOrderEntity = ctx.entities.some(
        (e) => e.type === "identifier" || e.type === "name"
      );
      return hasOrderEntity;
    },
  },
  {
    pack: "ecommerce",
    rule: "Refund amount must not exceed item/order value",
    severity: "critical",
    check: (ctx) => {
      for (const t of ctx.toolTraces) {
        if (/refund/.test(t.functionName)) {
          const amount = t.arguments.amount || t.arguments.refund_amount;
          if (typeof amount === "number" && amount < 0) return false;
        }
      }
      return true;
    },
  },
  {
    pack: "ecommerce",
    rule: "Refund method must match customer preference",
    severity: "critical",
    check: (ctx) => {
      const lower = ctx.transcript.toLowerCase();
      const wantsUPI = /upi|phonepe|gpay|paytm/.test(lower) && /chahiye|karo|par/.test(lower);
      const wantsBank = /bank|account|neft|imps/.test(lower) && /chahiye|mein/.test(lower);

      if (!wantsUPI && !wantsBank) return true;

      for (const t of ctx.toolTraces) {
        if (/refund/.test(t.functionName)) {
          const method = String(t.arguments.method || t.arguments.refund_method || "").toLowerCase();
          if (wantsUPI && method.includes("bank")) return false;
          if (wantsBank && method.includes("upi")) return false;
        }
      }
      return true;
    },
  },
  {
    pack: "ecommerce",
    rule: "Agent confirmation must match actual action taken",
    severity: "critical",
    check: (ctx) => {
      if (!ctx.finalState) return true;

      for (const t of ctx.toolTraces) {
        if (t.result.success === true) {
          for (const [key, val] of Object.entries(t.arguments)) {
            if (key in ctx.finalState && String(ctx.finalState[key]) !== String(val)) {
              return false;
            }
          }
        }
      }
      return true;
    },
  },
];
