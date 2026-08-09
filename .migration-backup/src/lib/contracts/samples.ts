import type { TransactionContract } from "./types";

export const SAMPLE_CONTRACTS: TransactionContract[] = [
  {
    id: "cancel-undispatched-hinglish-v1",
    version: "1.0.0",
    workflow: "ecommerce-cancellation",
    description: "Customer cancels undispatched order in Hinglish. Tool returns accepted but backend stays active — false confirmation.",
    input: {
      utterance: "ORD-123 cancel kar do. Abhi dispatch nahi hua.",
      locale: "hi-IN",
      timezone: "Asia/Kolkata",
      callDate: "2026-08-08",
    },
    expected: {
      intent: "cancel_order",
      entities: [
        { type: "identifier", raw: "ORD-123", expected: "ORD-123", match: "exact" },
        { type: "action", raw: "cancel kar do", expected: "cancel", match: "contains" },
      ],
      tool: {
        name: "cancel_order",
        args: { order_id: "ORD-123" },
        argMatch: "subset",
      },
      finalState: {
        fields: { status: "cancelled" },
        match: "exact",
      },
      speechRules: [
        {
          id: "no-premature-completion",
          rule: "cancelled",
          type: "conditional",
          condition: "status=active",
        },
      ],
    },
    settlement: { timeoutMs: 5000, pollMs: 500 },
    metadata: { difficulty: "hard", pack: "ecommerce", tags: ["false-confirmation", "async"] },
  },
  {
    id: "refund-upi-hinglish-v1",
    version: "1.0.0",
    workflow: "ecommerce-refund",
    description: "Customer requests UPI refund explicitly. Agent must use UPI method, not bank account.",
    input: {
      utterance: "Refund UPI par chahiye, account mein nahi. PhonePe par bhejo.",
      locale: "hi-IN",
      timezone: "Asia/Kolkata",
    },
    expected: {
      intent: "process_refund",
      entities: [
        { type: "action", raw: "refund UPI par chahiye", expected: "refund", match: "contains" },
      ],
      tool: {
        name: "process_refund",
        args: { method: "upi" },
        argMatch: "subset",
      },
      finalState: {
        fields: { refund_method: "upi" },
        match: "exact",
      },
    },
    metadata: { difficulty: "medium", pack: "ecommerce", tags: ["refund-method"] },
  },
  {
    id: "reschedule-saade-chaar-v1",
    version: "1.0.0",
    workflow: "appointment-reschedule",
    description: "Customer says 'shaam saade chaar'. Agent must book 16:30 not 04:30 or 16:00.",
    input: {
      utterance: "Kal nahi, uske agle din shaam ko saade chaar baje kar do.",
      locale: "hi-IN",
      timezone: "Asia/Kolkata",
      callDate: "2026-08-08",
    },
    expected: {
      intent: "reschedule_appointment",
      entities: [
        { type: "date", raw: "uske agle din", expected: "2026-08-10", match: "exact" },
        { type: "time", raw: "shaam saade chaar", expected: "16:30", match: "exact" },
      ],
      tool: {
        name: "reschedule_appointment",
        args: { date: "2026-08-10", time: "16:30" },
      },
      finalState: {
        fields: { appointment_date: "2026-08-10", appointment_time: "16:30" },
        match: "exact",
      },
    },
    metadata: { difficulty: "hard", pack: "appointments", tags: ["entity-normalization", "relative-date"] },
  },
  {
    id: "ptp-teen-hazaar-v1",
    version: "1.0.0",
    workflow: "collections-ptp",
    description: "Customer says 'teen hazaar' (3000). ASR may confuse with 'tera hazaar' (13000).",
    input: {
      utterance: "Teen hazaar abhi de dunga, baaki parson.",
      locale: "hi-IN",
      timezone: "Asia/Kolkata",
      callDate: "2026-08-08",
    },
    expected: {
      intent: "log_promise_to_pay",
      entities: [
        { type: "amount", raw: "teen hazaar", expected: "3000", match: "exact" },
        { type: "date", raw: "parson", expected: "2026-08-10", match: "exact" },
      ],
      tool: {
        name: "log_promise_to_pay",
        args: { amount_today: "3000" },
        argMatch: "subset",
      },
      finalState: {
        fields: { ptp_amount: "3000" },
        match: "exact",
      },
    },
    metadata: { difficulty: "hard", pack: "collections", tags: ["asr-confusion", "hindi-number"] },
  },
];
