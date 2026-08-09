import type { BenchmarkScenario } from "./index";

export const HINDI_ECOMMERCE_SCENARIOS: BenchmarkScenario[] = [
  {
    id: "ecom-01", name: "Spoken order ID with double", difficulty: "hard",
    description: "Customer says order number using 'double' pattern",
    language: "hinglish", policyPack: "ecommerce",
    customerText: "Mera order cancel karna hai. Order number one four double nine hai.",
    expectedEntities: [
      { type: "identifier", rawValue: "one four double nine", expectedValue: "1499" },
      { type: "action", rawValue: "cancel karna hai", expectedValue: "cancel" },
    ],
    expectedToolCall: { functionName: "cancel_order", expectedArgs: { order_id: "1499" } },
    expectedFinalState: { order_status: "cancelled" },
  },
  {
    id: "ecom-02", name: "Partial cancellation", difficulty: "hard",
    description: "Cancel only one item from multi-item order",
    language: "hinglish", policyPack: "ecommerce",
    customerText: "Sirf shirt cancel karo, belt rehne do.",
    expectedEntities: [
      { type: "action", rawValue: "sirf shirt cancel", expectedValue: "partial_cancel" },
      { type: "amount", rawValue: "shirt price only", expectedValue: "899" },
    ],
    expectedToolCall: { functionName: "cancel_order_item", expectedArgs: { item: "shirt", refund_amount: "899" } },
    expectedFinalState: { shirt_status: "cancelled", belt_status: "active" },
  },
  {
    id: "ecom-03", name: "UPI refund preference", difficulty: "medium",
    description: "Customer explicitly wants refund on UPI not bank",
    language: "hinglish", policyPack: "ecommerce",
    customerText: "Refund UPI par chahiye, account mein nahi. PhonePe par bhejo.",
    expectedEntities: [
      { type: "action", rawValue: "refund UPI par chahiye", expectedValue: "refund_upi" },
    ],
    expectedToolCall: { functionName: "process_refund", expectedArgs: { method: "upi" } },
    expectedFinalState: { refund_method: "upi" },
  },
  {
    id: "ecom-04", name: "Delivery reschedule — parson", difficulty: "medium",
    description: "Customer wants delivery day after tomorrow not tomorrow",
    language: "hinglish", policyPack: "ecommerce",
    customerText: "Kal nahi, parson deliver karna mera order.",
    expectedEntities: [
      { type: "date", rawValue: "parson", expectedValue: "2026-08-10" },
    ],
    expectedToolCall: { functionName: "reschedule_delivery", expectedArgs: { new_date: "2026-08-10" } },
    expectedFinalState: { delivery_date: "2026-08-10" },
  },
  {
    id: "ecom-05", name: "COD to prepaid conversion", difficulty: "easy",
    description: "Change payment from COD to prepaid",
    language: "hinglish",
    customerText: "COD se prepaid mein change karna hai.",
    expectedEntities: [
      { type: "action", rawValue: "COD se prepaid", expectedValue: "convert_payment" },
    ],
    expectedToolCall: { functionName: "convert_payment", expectedArgs: { from: "cod", to: "prepaid" } },
    expectedFinalState: { payment_method: "prepaid" },
  },
  {
    id: "ecom-06", name: "Hindi amount — dedh hazaar", difficulty: "hard",
    description: "Refund amount spoken in Hindi",
    language: "hindi",
    customerText: "Refund dedh hazaar ka hona chahiye.",
    expectedEntities: [
      { type: "amount", rawValue: "dedh hazaar", expectedValue: "1500" },
    ],
    expectedToolCall: { functionName: "process_refund", expectedArgs: { amount: "1500" } },
    expectedFinalState: { refund_amount: 1500 },
  },
  {
    id: "ecom-07", name: "Address change with flat number", difficulty: "hard",
    description: "Alphanumeric flat number that gets confused",
    language: "hinglish",
    customerText: "Address change karo. Flat 3B, Nehru Nagar, Pune.",
    expectedEntities: [
      { type: "address", rawValue: "Flat 3B, Nehru Nagar, Pune", expectedValue: "Flat 3B, Nehru Nagar, Pune" },
    ],
    expectedToolCall: { functionName: "update_address", expectedArgs: { flat: "3B" } },
    expectedFinalState: { flat: "3B" },
  },
  {
    id: "ecom-08", name: "Angry customer with correction", difficulty: "hard",
    description: "Customer corrects the agent mid-conversation",
    language: "hinglish",
    customerText: "Nahi nahi, maine kal bola tha! Aaj nahi, KAL! K-A-L! Tomorrow!",
    expectedEntities: [
      { type: "date", rawValue: "kal", expectedValue: "2026-08-09" },
    ],
    expectedToolCall: { functionName: "reschedule_delivery", expectedArgs: { new_date: "2026-08-09" } },
    expectedFinalState: { delivery_date: "2026-08-09" },
  },
  {
    id: "ecom-09", name: "Return with defect description", difficulty: "easy",
    description: "Simple product return",
    language: "english",
    customerText: "I want to return the headphones from order 6623. They're defective.",
    expectedEntities: [
      { type: "identifier", rawValue: "6623", expectedValue: "6623" },
      { type: "action", rawValue: "return", expectedValue: "return" },
    ],
    expectedToolCall: { functionName: "initiate_return", expectedArgs: { order_id: "6623", reason: "defective" } },
    expectedFinalState: { return_status: "initiated" },
  },
  {
    id: "ecom-10", name: "Cancel with implicit intent", difficulty: "medium",
    description: "Customer uses indirect language for cancellation",
    language: "hinglish",
    customerText: "Mujhe nahi chahiye, hata do yeh order.",
    expectedEntities: [
      { type: "action", rawValue: "nahi chahiye, hata do", expectedValue: "cancel" },
    ],
    expectedToolCall: { functionName: "cancel_order", expectedArgs: {} },
    expectedFinalState: { order_status: "cancelled" },
  },
];
