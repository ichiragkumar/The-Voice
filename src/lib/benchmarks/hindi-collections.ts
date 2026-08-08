import type { BenchmarkScenario } from "./index";

export const HINDI_COLLECTIONS_SCENARIOS: BenchmarkScenario[] = [
  {
    id: "col-01", name: "Teen vs tera hazaar — ASR confusion", difficulty: "hard",
    description: "3000 vs 13000 phonetic confusion",
    language: "hinglish", policyPack: "rbi-collections",
    customerText: "Teen hazaar abhi de dunga, baaki parson.",
    expectedEntities: [
      { type: "amount", rawValue: "teen hazaar", expectedValue: "3000" },
      { type: "date", rawValue: "parson", expectedValue: "2026-08-10" },
    ],
    expectedToolCall: { functionName: "log_promise_to_pay", expectedArgs: { amount_today: "3000" } },
    expectedFinalState: { ptp_amount: 3000 },
  },
  {
    id: "col-02", name: "Salary-relative PTP date", difficulty: "hard",
    description: "Payment date relative to salary, not call date",
    language: "hinglish", policyPack: "rbi-collections",
    customerText: "Salary 15 ko aati hai, uske agle din de dunga.",
    expectedEntities: [
      { type: "date", rawValue: "uske agle din (after 15th)", expectedValue: "2026-08-16" },
    ],
    expectedToolCall: { functionName: "log_promise_to_pay", expectedArgs: { promise_date: "2026-08-16" } },
    expectedFinalState: { ptp_date: "2026-08-16" },
  },
  {
    id: "col-03", name: "Dedh lakh payment", difficulty: "hard",
    description: "150,000 spoken as 'dedh lakh'",
    language: "hindi", policyPack: "rbi-collections",
    customerText: "Poora dedh lakh ek saath de dunga next Monday.",
    expectedEntities: [
      { type: "amount", rawValue: "dedh lakh", expectedValue: "150000" },
      { type: "date", rawValue: "next Monday", expectedValue: "2026-08-10" },
    ],
    expectedToolCall: { functionName: "log_promise_to_pay", expectedArgs: { amount: "150000" } },
    expectedFinalState: { ptp_amount: 150000 },
  },
  {
    id: "col-04", name: "Customer disputes amount", difficulty: "medium",
    description: "Customer says amount is wrong — hardship signal",
    language: "hinglish", policyPack: "rbi-collections",
    customerText: "Yeh amount galat hai! Maine already 5000 bhej diya tha NEFT se.",
    expectedEntities: [
      { type: "amount", rawValue: "5000", expectedValue: "5000" },
      { type: "action", rawValue: "galat hai", expectedValue: "dispute" },
    ],
    expectedToolCall: { functionName: "escalate_dispute", expectedArgs: {} },
    expectedFinalState: { dispute_status: "escalated" },
  },
  {
    id: "col-05", name: "Simple PTP — tomorrow", difficulty: "easy",
    description: "Straightforward promise to pay tomorrow",
    language: "hinglish", policyPack: "rbi-collections",
    customerText: "Haan, 5000 kal de dunga pakka.",
    expectedEntities: [
      { type: "amount", rawValue: "5000", expectedValue: "5000" },
      { type: "date", rawValue: "kal", expectedValue: "2026-08-09" },
    ],
    expectedToolCall: { functionName: "log_promise_to_pay", expectedArgs: { amount: "5000", promise_date: "2026-08-09" } },
    expectedFinalState: { ptp_amount: 5000, ptp_date: "2026-08-09" },
  },
];
