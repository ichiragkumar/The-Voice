import { HINDI_ECOMMERCE_SCENARIOS } from "./hindi-ecommerce";
import { HINDI_APPOINTMENT_SCENARIOS } from "./hindi-appointments";
import { HINDI_COLLECTIONS_SCENARIOS } from "./hindi-collections";

export type BenchmarkScenario = {
  id: string;
  name: string;
  description: string;
  language: "hindi" | "hinglish" | "english";
  customerText: string;
  expectedEntities: Array<{
    type: string;
    rawValue: string;
    expectedValue: string;
  }>;
  expectedToolCall: {
    functionName: string;
    expectedArgs: Record<string, string>;
  };
  expectedFinalState: Record<string, unknown>;
  policyPack?: string;
  difficulty: "easy" | "medium" | "hard";
};

export type BenchmarkPack = {
  id: string;
  name: string;
  icon: string;
  description: string;
  scenarios: BenchmarkScenario[];
};

export const BENCHMARK_PACKS: BenchmarkPack[] = [
  {
    id: "hindi-ecommerce",
    name: "Hindi E-commerce",
    icon: "🛒",
    description: "Order cancellations, refunds, and delivery changes in Hindi/Hinglish",
    scenarios: HINDI_ECOMMERCE_SCENARIOS,
  },
  {
    id: "hindi-appointments",
    name: "Hindi Appointments",
    icon: "📅",
    description: "Booking, rescheduling with relative dates and Hindi time expressions",
    scenarios: HINDI_APPOINTMENT_SCENARIOS,
  },
  {
    id: "hindi-collections",
    name: "Hindi Collections",
    icon: "💰",
    description: "Promise-to-pay with Hindi amounts and salary-relative dates",
    scenarios: HINDI_COLLECTIONS_SCENARIOS,
  },
];
