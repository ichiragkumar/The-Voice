var __defProp = Object.defineProperty;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __propIsEnum = Object.prototype.propertyIsEnumerable;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp.call(b, prop))
      __defNormalProp(a, prop, b[prop]);
  if (__getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(b)) {
      if (__propIsEnum.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    }
  return a;
};

// src/index.ts
var WordAI = class {
  constructor(config = {}) {
    this.transcript = "";
    this.language = "hinglish";
    this.entities = [];
    this.toolTraces = [];
    this.finalStateCallback = null;
    this.policyRules = [];
    this.config = __spreadValues({
      endpoint: config.endpoint || "http://localhost:3000"
    }, config);
  }
  captureTranscript(transcript, language = "hinglish") {
    this.transcript = transcript;
    this.language = language;
    return this;
  }
  assertEntity(assertion) {
    this.entities.push(assertion);
    return this;
  }
  traceTool(functionName, args, result) {
    this.toolTraces.push({ functionName, arguments: args, result });
    return this;
  }
  assertFinalState(callback) {
    this.finalStateCallback = callback;
    return this;
  }
  assertPolicy(rule) {
    this.policyRules.push(rule);
    return this;
  }
  addPolicyPack(rules) {
    this.policyRules.push(...rules);
    return this;
  }
  async verify() {
    let finalState = null;
    if (this.finalStateCallback) {
      finalState = await this.finalStateCallback();
    }
    const ctx = {
      transcript: this.transcript,
      language: this.language,
      entities: this.entities,
      toolTraces: this.toolTraces,
      finalState
    };
    const entityResults = this.entities.map((e) => {
      const toolArgs = this.toolTraces.flatMap(
        (t) => Object.entries(t.arguments)
      );
      const matchingArg = toolArgs.find(
        ([, v]) => String(v).toLowerCase().trim() === e.expectedValue.toLowerCase().trim()
      );
      const actualInTool = toolArgs.find(
        ([k]) => k.toLowerCase().includes(e.type)
      );
      const actual = actualInTool ? String(actualInTool[1]) : "not found";
      const match = actual.toLowerCase().trim() === e.expectedValue.toLowerCase().trim();
      return {
        type: e.type,
        rawValue: e.rawValue,
        expected: e.expectedValue,
        actual,
        match
      };
    });
    const toolResults = this.toolTraces.map((t) => {
      const resultSuccess = t.result && (t.result.success === true || t.result.status === "ok");
      return {
        functionName: t.functionName,
        argumentsCorrect: true,
        resultCorrect: !!resultSuccess,
        details: resultSuccess ? "Tool returned success" : `Tool returned: ${JSON.stringify(t.result)}`
      };
    });
    let finalStateResult = null;
    if (finalState) {
      const mismatches = [];
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
      const lastToolArgs = this.toolTraces.length > 0 ? this.toolTraces[this.toolTraces.length - 1].arguments : {};
      finalStateResult = {
        checked: true,
        passed: mismatches.length === 0,
        expected: lastToolArgs,
        actual: finalState,
        mismatches
      };
    }
    const policyResults = [];
    for (const rule of this.policyRules) {
      let passed2;
      try {
        passed2 = await rule.check(ctx);
      } catch (e) {
        passed2 = false;
      }
      policyResults.push({
        pack: rule.pack,
        rule: rule.rule,
        passed: passed2,
        evidence: passed2 ? "Rule satisfied" : `Policy violation: ${rule.rule}`,
        severity: rule.severity
      });
    }
    const allChecks = [
      ...entityResults.map((r) => r.match),
      ...toolResults.map((r) => r.resultCorrect),
      ...finalStateResult ? [finalStateResult.passed] : [],
      ...policyResults.map((r) => r.passed)
    ];
    const totalChecks = allChecks.length;
    const passed = allChecks.filter(Boolean).length;
    const failed = totalChecks - passed;
    const critical = policyResults.filter(
      (r) => !r.passed && r.severity === "critical"
    ).length;
    const result = {
      passed: failed === 0,
      entityResults,
      toolResults,
      finalStateResult,
      policyResults,
      summary: { totalChecks, passed, failed, critical }
    };
    if (this.config.apiKey && this.config.endpoint) {
      try {
        await fetch(`${this.config.endpoint}/api/sdk/verify`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": this.config.apiKey
          },
          body: JSON.stringify({
            auditId: this.config.auditId,
            transcript: this.transcript,
            language: this.language,
            result
          })
        });
      } catch (e) {
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
};
export {
  WordAI
};
