import { extractEntities } from "./extract";
import { normalizeEntities, type NormalizedEntity } from "./normalize";
import { compareEntities, type ComparisonResult } from "./compare";
import { classifyRootCause, type ClassificationResult } from "./classify";

export type PipelineComparison = ComparisonResult & {
  rootCause?: string;
  evidence?: string;
};

export type PipelineResult = {
  entities: NormalizedEntity[];
  comparisons: PipelineComparison[];
  summary: {
    totalEntities: number;
    mismatches: number;
    rootCauses: Record<string, number>;
  };
};

export async function runPipeline(
  transcript: string,
  language: string,
  toolCalls: Array<{ functionName: string; arguments: string; response?: string }>,
  callDate: Date
): Promise<PipelineResult> {
  const extracted = await extractEntities(transcript, language);
  const normalized = await normalizeEntities(extracted, callDate);

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
      const pipeComp: PipelineComparison = { ...comp };

      if (!comp.match) {
        try {
          const classification = await classifyRootCause(
            comp,
            transcript,
            tc.response || ""
          );
          pipeComp.rootCause = classification.rootCause;
          pipeComp.evidence = classification.evidence;
        } catch {
          pipeComp.rootCause = "reasoning_error";
          pipeComp.evidence = "Classification failed — defaulted to reasoning error.";
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
      rootCauses,
    },
  };
}
