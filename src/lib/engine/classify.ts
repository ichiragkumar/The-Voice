import { anthropic } from "@ai-sdk/anthropic";
import { generateObject } from "ai";
import { z } from "zod/v4";
import { getClassificationPrompt } from "../prompts/classification";
import type { ComparisonResult } from "./compare";

const ClassificationSchema = z.object({
  rootCause: z.enum([
    "asr_error",
    "reasoning_error",
    "tool_argument_error",
    "integration_error",
    "false_confirmation",
  ]),
  evidence: z.string(),
});

export type ClassificationResult = z.infer<typeof ClassificationSchema>;

export async function classifyRootCause(
  comparison: ComparisonResult,
  transcriptExcerpt: string,
  agentResponse: string = ""
): Promise<ClassificationResult> {
  const { object } = await generateObject({
    model: anthropic("claude-sonnet-4-20250514"),
    schema: ClassificationSchema,
    prompt: getClassificationPrompt(
      comparison.expectedValue,
      comparison.actualValue,
      comparison.entityType,
      transcriptExcerpt,
      agentResponse
    ),
  });

  return object;
}
