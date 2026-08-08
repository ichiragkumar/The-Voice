import { extractEntities } from "./extract";
import { normalizeEntities, type NormalizedEntity } from "./normalize";
import { compareEntities, type ComparisonResult } from "./compare";
import { classifyRootCause } from "./classify";
import { isAIConfigured } from "../ai";
import {
  normalizeHindiNumber,
  normalizeHindiTime,
  normalizeHindiDate,
  normalizeSpokenDigits,
} from "./entity-truth";

export type PipelineComparison = ComparisonResult & {
  rootCause?: string;
  evidence?: string;
  deterministic: boolean;
  confidence: number;
  status: "pass" | "fail" | "needs_review";
};

export type PipelineResult = {
  entities: NormalizedEntity[];
  comparisons: PipelineComparison[];
  summary: {
    totalEntities: number;
    mismatches: number;
    deterministicFailures: number;
    needsReview: number;
    rootCauses: Record<string, number>;
  };
};

export async function runPipeline(
  transcript: string,
  language: string,
  toolCalls: Array<{ functionName: string; arguments: string; response?: string }>,
  callDate: Date
): Promise<PipelineResult> {
  let normalized: NormalizedEntity[];

  if (isAIConfigured()) {
    const extracted = await extractEntities(transcript, language);
    normalized = await normalizeEntities(extracted, callDate);
  } else {
    normalized = extractEntitiesDeterministic(transcript, callDate);
  }

  const allComparisons: PipelineComparison[] = [];

  for (const tc of toolCalls) {
    let args: Record<string, unknown>;
    try {
      args = JSON.parse(tc.arguments);
    } catch {
      continue;
    }

    const comparisons = compareEntities(normalized, args);

    for (const comp of comparisons) {
      const pipeComp: PipelineComparison = {
        ...comp,
        deterministic: true,
        confidence: 1.0,
        status: comp.match ? "pass" : "fail",
      };

      if (!comp.match) {
        if (isAIConfigured()) {
          try {
            const classification = await classifyRootCause(
              comp,
              transcript,
              tc.response || ""
            );
            pipeComp.rootCause = classification.rootCause;
            pipeComp.evidence = classification.evidence;
            pipeComp.deterministic = false;
            pipeComp.confidence = 0.85;
          } catch {
            pipeComp.rootCause = "unknown";
            pipeComp.evidence = "Classification unavailable.";
            pipeComp.status = "needs_review";
            pipeComp.confidence = 0.5;
          }
        } else {
          pipeComp.rootCause = inferRootCauseDeterministic(comp);
          pipeComp.evidence = `Deterministic: expected "${comp.expectedValue}" but got "${comp.actualValue}"`;
          pipeComp.confidence = 1.0;
        }
      }

      allComparisons.push(pipeComp);
    }
  }

  const mismatches = allComparisons.filter((c) => !c.match);
  const rootCauses: Record<string, number> = {};
  for (const m of mismatches) {
    if (m.rootCause) {
      rootCauses[m.rootCause] = (rootCauses[m.rootCause] || 0) + 1;
    }
  }

  return {
    entities: normalized,
    comparisons: allComparisons,
    summary: {
      totalEntities: normalized.length,
      mismatches: mismatches.length,
      deterministicFailures: mismatches.filter((m) => m.deterministic).length,
      needsReview: allComparisons.filter((c) => c.status === "needs_review").length,
      rootCauses,
    },
  };
}

function extractEntitiesDeterministic(
  transcript: string,
  callDate: Date
): NormalizedEntity[] {
  const entities: NormalizedEntity[] = [];
  const lower = transcript.toLowerCase();

  const timeResult = normalizeHindiTime(lower);
  if (timeResult) {
    entities.push({
      type: "time",
      rawValue: extractMatchingPhrase(lower, ["saade", "paune", "sawa", "baje"]),
      normalizedValue: timeResult,
      confidence: 0.9,
    });
  }

  const dateResult = normalizeHindiDate(lower, callDate);
  if (dateResult) {
    entities.push({
      type: "date",
      rawValue: extractMatchingPhrase(lower, ["aaj", "kal", "parson", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]),
      normalizedValue: dateResult,
      confidence: 0.85,
    });
  }

  const amountPatterns = lower.match(
    /(dedh|dhai|ek|do|teen|chaar|paanch|chhah|saat|aath|nau|das)\s+(hazaar|lakh|sau|crore)/
  );
  if (amountPatterns) {
    const num = normalizeHindiNumber(amountPatterns[0]);
    if (num) {
      entities.push({
        type: "amount",
        rawValue: amountPatterns[0],
        normalizedValue: String(num),
        confidence: 0.9,
      });
    }
  }

  return entities;
}

function extractMatchingPhrase(text: string, keywords: string[]): string {
  for (const kw of keywords) {
    const idx = text.indexOf(kw);
    if (idx !== -1) {
      const start = Math.max(0, idx - 10);
      const end = Math.min(text.length, idx + kw.length + 15);
      return text.slice(start, end).trim();
    }
  }
  return "";
}

function inferRootCauseDeterministic(comp: ComparisonResult): string {
  if (comp.entityType === "amount" || comp.entityType === "time" || comp.entityType === "date") {
    return "reasoning_error";
  }
  if (comp.entityType === "name") {
    return "asr_error";
  }
  return "tool_argument_error";
}
