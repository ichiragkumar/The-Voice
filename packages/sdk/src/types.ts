export type EntityAssertion = {
  type: "date" | "time" | "amount" | "name" | "address" | "phone" | "action" | "identifier";
  rawValue: string;
  expectedValue: string;
};

export type ToolTrace = {
  functionName: string;
  arguments: Record<string, unknown>;
  result: Record<string, unknown>;
  timestamp?: string;
};

export type FinalStateCallback = () => Promise<Record<string, unknown>>;

export type PolicyRule = {
  pack: string;
  rule: string;
  check: (ctx: VerificationContext) => boolean | Promise<boolean>;
  severity: "critical" | "warning" | "info";
};

export type VerificationContext = {
  transcript: string;
  language: string;
  entities: EntityAssertion[];
  toolTraces: ToolTrace[];
  finalState: Record<string, unknown> | null;
};

export type VerificationResult = {
  passed: boolean;
  entityResults: Array<{
    type: string;
    rawValue: string;
    expected: string;
    actual: string;
    match: boolean;
  }>;
  toolResults: Array<{
    functionName: string;
    argumentsCorrect: boolean;
    resultCorrect: boolean;
    details: string;
  }>;
  finalStateResult: {
    checked: boolean;
    passed: boolean;
    expected: Record<string, unknown>;
    actual: Record<string, unknown>;
    mismatches: string[];
  } | null;
  policyResults: Array<{
    pack: string;
    rule: string;
    passed: boolean;
    evidence: string;
    severity: string;
  }>;
  summary: {
    totalChecks: number;
    passed: number;
    failed: number;
    critical: number;
  };
};

export type WordAIConfig = {
  apiKey?: string;
  endpoint?: string;
  auditId?: string;
};
