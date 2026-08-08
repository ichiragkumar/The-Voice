type EntityAssertion = {
    type: "date" | "time" | "amount" | "name" | "address" | "phone" | "action" | "identifier";
    rawValue: string;
    expectedValue: string;
};
type ToolTrace = {
    functionName: string;
    arguments: Record<string, unknown>;
    result: Record<string, unknown>;
    timestamp?: string;
};
type FinalStateCallback = () => Promise<Record<string, unknown>>;
type PolicyRule = {
    pack: string;
    rule: string;
    check: (ctx: VerificationContext) => boolean | Promise<boolean>;
    severity: "critical" | "warning" | "info";
};
type VerificationContext = {
    transcript: string;
    language: string;
    entities: EntityAssertion[];
    toolTraces: ToolTrace[];
    finalState: Record<string, unknown> | null;
};
type VerificationResult = {
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
type WordAIConfig = {
    apiKey?: string;
    endpoint?: string;
    auditId?: string;
};

declare class WordAI {
    private config;
    private transcript;
    private language;
    private entities;
    private toolTraces;
    private finalStateCallback;
    private policyRules;
    constructor(config?: WordAIConfig);
    captureTranscript(transcript: string, language?: string): this;
    assertEntity(assertion: EntityAssertion): this;
    traceTool(functionName: string, args: Record<string, unknown>, result: Record<string, unknown>): this;
    assertFinalState(callback: FinalStateCallback): this;
    assertPolicy(rule: PolicyRule): this;
    addPolicyPack(rules: PolicyRule[]): this;
    verify(): Promise<VerificationResult>;
    reset(): this;
}

export { type VerificationResult, WordAI, type WordAIConfig };
