import type { BenchmarkScenario } from "./index";

export const HINDI_APPOINTMENT_SCENARIOS: BenchmarkScenario[] = [
  {
    id: "appt-01", name: "Relative date — uske agle din", difficulty: "hard",
    description: "Day after tomorrow via relative reference",
    language: "hinglish",
    customerText: "Kal nahi, uske agle din shaam ko saade chaar baje kar do.",
    expectedEntities: [
      { type: "date", rawValue: "uske agle din", expectedValue: "2026-08-12" },
      { type: "time", rawValue: "saade chaar baje", expectedValue: "16:30" },
    ],
    expectedToolCall: { functionName: "reschedule_appointment", expectedArgs: { date: "2026-08-12", time: "16:30" } },
    expectedFinalState: { appointment_date: "2026-08-12", appointment_time: "16:30" },
  },
  {
    id: "appt-02", name: "Two names — cancel one book other", difficulty: "hard",
    description: "Multi-instruction with similar-sounding names",
    language: "hinglish",
    customerText: "Sharma ji ka appointment cancel kar do. Aur Verma ji ka next week Monday rakh do.",
    expectedEntities: [
      { type: "name", rawValue: "Sharma ji", expectedValue: "Sharma" },
      { type: "name", rawValue: "Verma ji", expectedValue: "Verma" },
      { type: "date", rawValue: "next week Monday", expectedValue: "2026-08-17" },
    ],
    expectedToolCall: { functionName: "cancel_appointment", expectedArgs: { patient_name: "Sharma" } },
    expectedFinalState: { sharma_status: "cancelled", verma_status: "booked" },
  },
  {
    id: "appt-03", name: "Paune paanch — quarter to five", difficulty: "medium",
    description: "Hindi time expression for 4:45",
    language: "hindi",
    customerText: "Mujhe paune paanch baje ka appointment chahiye Dr. Gupta ke saath.",
    expectedEntities: [
      { type: "time", rawValue: "paune paanch baje", expectedValue: "16:45" },
      { type: "name", rawValue: "Dr. Gupta", expectedValue: "Dr. Gupta" },
    ],
    expectedToolCall: { functionName: "book_appointment", expectedArgs: { time: "16:45", doctor: "Dr. Gupta" } },
    expectedFinalState: { appointment_time: "16:45" },
  },
  {
    id: "appt-04", name: "Parson subah — day after tomorrow morning", difficulty: "medium",
    description: "Parson + time of day context",
    language: "hindi",
    customerText: "Parson subah gyaarah baje Dr. Sharma se milna hai.",
    expectedEntities: [
      { type: "date", rawValue: "parson", expectedValue: "2026-08-10" },
      { type: "time", rawValue: "subah gyaarah baje", expectedValue: "11:00" },
    ],
    expectedToolCall: { functionName: "book_appointment", expectedArgs: { date: "2026-08-10", time: "11:00" } },
    expectedFinalState: { appointment_date: "2026-08-10" },
  },
  {
    id: "appt-05", name: "False confirmation check", difficulty: "hard",
    description: "Agent says Wednesday but books Tuesday",
    language: "hinglish",
    customerText: "Mera appointment confirm kar dijiye Wednesday ko shaam 4:30 baje.",
    expectedEntities: [
      { type: "date", rawValue: "Wednesday", expectedValue: "2026-08-12" },
      { type: "time", rawValue: "shaam 4:30 baje", expectedValue: "16:30" },
    ],
    expectedToolCall: { functionName: "confirm_appointment", expectedArgs: { date: "2026-08-12", time: "16:30" } },
    expectedFinalState: { appointment_date: "2026-08-12", appointment_time: "16:30" },
  },
];
