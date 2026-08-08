export type EntityExpectation = {
  type: "name" | "date" | "time" | "amount" | "address" | "phone" | "action" | "identifier";
  raw: string;
  expected: string;
  match: "exact" | "fuzzy" | "contains";
  tolerance?: number;
};

export type ToolExpectation = {
  name: string;
  args: Record<string, string | number | boolean>;
  argMatch?: "exact" | "subset";
};

export type FinalStateExpectation = {
  fields: Record<string, string | number | boolean>;
  match: "exact" | "subset";
};

export type SettlementConfig = {
  timeoutMs: number;
  pollMs: number;
  retries?: number;
};

export type SpeechRule = {
  id: string;
  rule: string;
  type: "must_say" | "must_not_say" | "conditional";
  condition?: string;
};

export type TransactionContract = {
  id: string;
  version: string;
  workflow: string;
  description: string;
  input: {
    utterance: string;
    locale: string;
    timezone?: string;
    callDate?: string;
  };
  expected: {
    intent: string;
    entities: EntityExpectation[];
    tool: ToolExpectation;
    finalState: FinalStateExpectation;
    speechRules?: SpeechRule[];
  };
  settlement?: SettlementConfig;
  metadata?: {
    difficulty: "easy" | "medium" | "hard";
    pack: string;
    tags?: string[];
  };
};

export type ContractResult = {
  contractId: string;
  contractVersion: string;
  passed: boolean;
  timestamp: string;
  duration: number;
  provenance: {
    modelId: string;
    sdkVersion: string;
    promptHash: string;
    policyPackVersion: string;
    testDataVersion: string;
  };
  checks: ContractCheck[];
  firstDivergence: string | null;
  severity: "critical" | "high" | "medium" | "low";
  owner: "asr" | "normalizer" | "agent_policy" | "integration" | "backend" | "unknown";
  suggestedAction: string | null;
};

export type ContractCheck = {
  layer: "entity" | "tool_name" | "tool_args" | "tool_result" | "final_state" | "speech_rule";
  field: string;
  expected: string;
  actual: string;
  passed: boolean;
  deterministic: boolean;
  confidence: number;
};
