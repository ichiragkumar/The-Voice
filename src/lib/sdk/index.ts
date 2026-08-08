import type {
  WordAIConfig,
  EntityAssertion,
  ToolTrace,
  FinalStateCallback,
  PolicyRule,
  VerificationContext,
  VerificationResult,
} from "./types";

export class WordAI {
  private config: WordAIConfig;
  private transcript = "";
  private language = "hinglish";
  private entities: EntityAssertion[] = [];
  private toolTraces: ToolTrace[] = [];
  private finalStateCallback: FinalStateCallback | null = null;
  private policyRules: PolicyRule[] = [];

  constructor(config: WordAIConfig = {}) {
    this.config = {
      endpoint: config.endpoint || "http://localhost:3000",
      ...config,
    };
  }

  captureTranscript(transcript: string, language = "hinglish") {
    this.transcript = transcript;
    this.language = language;
    return this;
  }

  assertEntity(assertion: EntityAssertion) {
    this.entities.push(assertion);
    return this;
  }

  traceTool(
    functionName: string,
    args: Record<string, unknown>,
    result: Record<string, unknown>
  ) {
    this.toolTraces.push({ functionName, arguments: args, result });
    return this;
  }

  assertFinalState(callback: FinalStateCallback) {
    this.finalStateCallback = callback;
    return this;
  }

  assertPolicy(rule: PolicyRule) {
    this.policyRules.push(rule);
    return this;
  }

  addPolicyPack(rules: PolicyRule[]) {
    this.policyRules.push(...rules);
    return this;
  }

  async verify(): Promise<VerificationResult> {
    let finalState: Record<string, unknown> | null = null;
    if (this.finalStateCallback) {
      finalState = await this.finalStateCallback();
    }

    const ctx: VerificationContext = {
      transcript: this.transcript,
      language: this.language,
      entities: this.entities,
      toolTraces: this.toolTraces,
      finalState,
    };

    const entityResults = this.entities.map((e) => {
      const toolArgs = this.toolTraces.flatMap((t) =>
        Object.entries(t.arguments)
      );
      const matchingArg = toolArgs.find(
        ([, v]) =>
          String(v).toLowerCase().trim() ===
          e.expectedValue.toLowerCase().trim()
      );
      const actualInTool = toolArgs.find(([k]) =>
        k.toLowerCase().includes(e.type)
      );
      const actual = actualInTool ? String(actualInTool[1]) : "not found";
      const match =
        actual.toLowerCase().trim() === e.expectedValue.toLowerCase().trim();

      return {
        type: e.type,
        rawValue: e.rawValue,
        expected: e.expectedValue,
        actual,
        match,
      };
    });

    const toolResults = this.toolTraces.map((t) => {
      const resultSuccess =
        t.result &&
        (t.result.success === true || t.result.status === "ok");
      return {
        functionName: t.functionName,
        argumentsCorrect: true,
        resultCorrect: !!resultSuccess,
        details: resultSuccess
          ? "Tool returned success"
          : `Tool returned: ${JSON.stringify(t.result)}`,
      };
    });

    let finalStateResult: VerificationResult["finalStateResult"] = null;
    if (finalState) {
      const mismatches: string[] = [];
      for (const t of this.toolTraces) {
        if (t.result.success === true) {
          for (const [key, expectedVal] of Object.entries(t.arguments)) {
            if (key in finalState) {
              const actualVal = finalState[key];
              if (String(actualVal) !== String(expectedVal)) {
                mismatches.push(
                  `${key}: tool sent "${expectedVal}", backend has "${actualVal}"`
                );
              }
            }
          }
        }
      }
      const lastToolArgs =
        this.toolTraces.length > 0
          ? this.toolTraces[this.toolTraces.length - 1].arguments
          : {};
      finalStateResult = {
        checked: true,
        passed: mismatches.length === 0,
        expected: lastToolArgs,
        actual: finalState,
        mismatches,
      };
    }

    const policyResults: VerificationResult["policyResults"] = [];
    for (const rule of this.policyRules) {
      let passed: boolean;
      try {
        passed = await rule.check(ctx);
      } catch {
        passed = false;
      }
      policyResults.push({
        pack: rule.pack,
        rule: rule.rule,
        passed,
        evidence: passed
          ? "Rule satisfied"
          : `Policy violation: ${rule.rule}`,
        severity: rule.severity,
      });
    }

    const allChecks = [
      ...entityResults.map((r) => r.match),
      ...toolResults.map((r) => r.resultCorrect),
      ...(finalStateResult ? [finalStateResult.passed] : []),
      ...policyResults.map((r) => r.passed),
    ];

    const totalChecks = allChecks.length;
    const passed = allChecks.filter(Boolean).length;
    const failed = totalChecks - passed;
    const critical = policyResults.filter(
      (r) => !r.passed && r.severity === "critical"
    ).length;

    const result: VerificationResult = {
      passed: failed === 0,
      entityResults,
      toolResults,
      finalStateResult,
      policyResults,
      summary: { totalChecks, passed, failed, critical },
    };

    if (this.config.apiKey && this.config.endpoint) {
      try {
        await fetch(`${this.config.endpoint}/api/sdk/verify`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": this.config.apiKey,
          },
          body: JSON.stringify({
            auditId: this.config.auditId,
            transcript: this.transcript,
            language: this.language,
            result,
          }),
        });
      } catch {
        // fire and forget
      }
    }

    return result;
  }

  reset() {
    this.transcript = "";
    this.language = "hinglish";
    this.entities = [];
    this.toolTraces = [];
    this.finalStateCallback = null;
    this.policyRules = [];
    return this;
  }
}

export type { VerificationResult, WordAIConfig } from "./types";
