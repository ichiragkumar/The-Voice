export type DemoScenario = {
  id: string;
  label: string;
  transcript: string;
  language: string;
  locale: string;
};

export const DEMO_SCENARIOS: DemoScenario[] = [
  {
    id: "cancel-order",
    label: "Cancel Order (Hinglish)",
    transcript: "Mera order ORD-123 cancel kar do. Abhi dispatch nahi hua.",
    language: "hinglish",
    locale: "hi-IN",
  },
  {
    id: "refund-upi",
    label: "UPI Refund (Hinglish)",
    transcript: "Refund UPI par chahiye, account mein nahi. Pandrah sau rupaye.",
    language: "hinglish",
    locale: "hi-IN",
  },
  {
    id: "reschedule",
    label: "Reschedule (Hindi)",
    transcript: "Appointment shaam saade chaar baje kar do, parson.",
    language: "hindi",
    locale: "hi-IN",
  },
];

export type MockToolResult = {
  name: string;
  args: Record<string, unknown>;
  result: Record<string, unknown>;
};

export type MockFinalState = Record<string, unknown>;

export function executeMockTool(
  toolName: string,
  args: Record<string, unknown>,
  injectFailure: boolean
): { result: Record<string, unknown>; finalState: MockFinalState } {
  if (toolName === "cancel_order") {
    const result = { status: "accepted", operation_id: `op_${Date.now()}` };
    const finalState = injectFailure
      ? { order_id: args.order_id, status: "active", source: "orders_db" }
      : { order_id: args.order_id, status: "cancelled", source: "orders_db" };
    return { result, finalState };
  }

  if (toolName === "create_refund") {
    const result = { status: "processed", refund_id: `rf_${Date.now()}` };
    const finalState = injectFailure
      ? { amount: args.amount, method: "bank_account", status: "processed", source: "payments_db" }
      : { amount: args.amount, method: args.method || "upi", status: "processed", source: "payments_db" };
    return { result, finalState };
  }

  if (toolName === "reschedule_appointment") {
    const result = { status: "confirmed", appointment_id: `apt_${Date.now()}` };
    const finalState = injectFailure
      ? { date: "2026-08-09", time: "04:30", status: "confirmed", source: "calendar_db" }
      : { date: args.date || "2026-08-10", time: args.time || "16:30", status: "confirmed", source: "calendar_db" };
    return { result, finalState };
  }

  return {
    result: { status: "unknown_tool" },
    finalState: { error: "no adapter" },
  };
}
