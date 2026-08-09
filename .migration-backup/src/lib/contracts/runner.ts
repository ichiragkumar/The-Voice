import type {
  TransactionContract,
  ContractResult,
  ContractCheck,
} from "./types";
import {
  normalizeHindiNumber,
  normalizeHindiTime,
  normalizeHindiDate,
  normalizeSpokenDigits,
  fuzzyAmountMatch,
  fuzzyDateMatch,
} from "../engine/entity-truth";

const SDK_VERSION = "0.1.0";

export async function executeContract(
  contract: TransactionContract,
  actual: {
    entities: Record<string, string>;
    toolName: string;
    toolArgs: Record<string, string | number | boolean>;
    toolResult: Record<string, unknown>;
    finalState: Record<string, unknown> | null;
    agentResponse: string;
  },
  promptHash = "unknown"
): Promise<ContractResult> {
  const start = Date.now();
  const checks: ContractCheck[] = [];

  for (const ent of contract.expected.entities) {
    const actualVal = actual.entities[ent.type] || "";
    let passed = false;

    if (ent.match === "exact") {
      passed = actualVal.toLowerCase().trim() === ent.expected.toLowerCase().trim();
    } else if (ent.match === "fuzzy") {
      if (ent.type === "amount") {
        const expectedNum = parseFloat(ent.expected) || normalizeHindiNumber(ent.expected);
        const actualNum = parseFloat(actualVal) || normalizeHindiNumber(actualVal);
        passed = expectedNum !== null && actualNum !== null && fuzzyAmountMatch(expectedNum, actualNum);
      } else if (ent.type === "date") {
        passed = fuzzyDateMatch(ent.expected, actualVal);
      } else {
        passed = actualVal.toLowerCase().includes(ent.expected.toLowerCase());
      }
    } else if (ent.match === "contains") {
      passed = actualVal.toLowerCase().includes(ent.expected.toLowerCase());
    }

    checks.push({
      layer: "entity",
      field: ent.type,
      expected: ent.expected,
      actual: actualVal,
      passed,
      deterministic: true,
      confidence: 1.0,
    });
  }

  checks.push({
    layer: "tool_name",
    field: "functionName",
    expected: contract.expected.tool.name,
    actual: actual.toolName,
    passed: actual.toolName === contract.expected.tool.name,
    deterministic: true,
    confidence: 1.0,
  });

  const argMatch = contract.expected.tool.argMatch || "subset";
  for (const [key, expectedVal] of Object.entries(contract.expected.tool.args)) {
    const actualVal = actual.toolArgs[key];
    const passed = String(actualVal) === String(expectedVal);

    checks.push({
      layer: "tool_args",
      field: key,
      expected: String(expectedVal),
      actual: String(actualVal ?? "missing"),
      passed,
      deterministic: true,
      confidence: 1.0,
    });
  }

  if (actual.finalState && contract.expected.finalState) {
    for (const [key, expectedVal] of Object.entries(contract.expected.finalState.fields)) {
      const actualVal = actual.finalState[key];
      const passed = String(actualVal) === String(expectedVal);

      checks.push({
        layer: "final_state",
        field: key,
        expected: String(expectedVal),
        actual: String(actualVal ?? "missing"),
        passed,
        deterministic: true,
        confidence: 1.0,
      });
    }
  }

  if (contract.expected.speechRules) {
    for (const rule of contract.expected.speechRules) {
      const lower = actual.agentResponse.toLowerCase();
      let passed = true;

      if (rule.type === "must_say") {
        passed = lower.includes(rule.rule.toLowerCase());
      } else if (rule.type === "must_not_say") {
        passed = !lower.includes(rule.rule.toLowerCase());
      } else if (rule.type === "conditional" && rule.condition) {
        const stateKey = rule.condition.split("=")[0]?.trim();
        const stateVal = rule.condition.split("=")[1]?.trim();
        if (actual.finalState && String(actual.finalState[stateKey]) !== stateVal) {
          passed = !lower.includes(rule.rule.toLowerCase());
        }
      }

      checks.push({
        layer: "speech_rule",
        field: rule.id,
        expected: rule.rule,
        actual: passed ? "satisfied" : "violated",
        passed,
        deterministic: rule.type !== "conditional",
        confidence: rule.type === "conditional" ? 0.9 : 1.0,
      });
    }
  }

  const failed = checks.filter((c) => !c.passed);
  const firstFail = failed[0] || null;

  let owner: ContractResult["owner"] = "unknown";
  if (firstFail) {
    if (firstFail.layer === "entity") owner = "normalizer";
    else if (firstFail.layer === "tool_name") owner = "agent_policy";
    else if (firstFail.layer === "tool_args") owner = "agent_policy";
    else if (firstFail.layer === "final_state") owner = "backend";
    else if (firstFail.layer === "speech_rule") owner = "agent_policy";
  }

  return {
    contractId: contract.id,
    contractVersion: contract.version,
    passed: failed.length === 0,
    timestamp: new Date().toISOString(),
    duration: Date.now() - start,
    provenance: {
      modelId: "claude-sonnet-4-20250514",
      sdkVersion: SDK_VERSION,
      promptHash,
      policyPackVersion: contract.metadata?.pack || "custom",
      testDataVersion: contract.version,
    },
    checks,
    firstDivergence: firstFail ? `${firstFail.layer}.${firstFail.field}` : null,
    severity: failed.some((f) => f.layer === "final_state") ? "critical" : failed.length > 0 ? "high" : "low",
    owner,
    suggestedAction: firstFail
      ? `Check ${owner}: ${firstFail.field} expected "${firstFail.expected}" but got "${firstFail.actual}"`
      : null,
  };
}
