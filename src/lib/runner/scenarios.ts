import type { BenchmarkScenario } from "../benchmarks";

export type RunResult = {
  scenarioId: string;
  scenarioName: string;
  passed: boolean;
  entityResults: Array<{ type: string; expected: string; actual: string; match: boolean }>;
  toolCallCorrect: boolean;
  finalStateCorrect: boolean;
  policyViolations: string[];
  audioGenerated: boolean;
  duration: number;
};

export function buildRunPayload(scenario: BenchmarkScenario) {
  return {
    scenarioName: scenario.name,
    scenarioPack: scenario.id.split("-")[0],
    transcript: scenario.customerText,
    language: scenario.language,
    expectedEntities: scenario.expectedEntities,
    expectedToolCall: scenario.expectedToolCall,
    expectedFinalState: scenario.expectedFinalState,
    policyPack: scenario.policyPack,
  };
}
