import { anthropic } from "@ai-sdk/anthropic";
import { generateObject } from "ai";
import { z } from "zod/v4";
import { getNormalizationPrompt } from "../prompts/normalization";
import type { ExtractedEntity } from "./extract";

const NormalizedEntitySchema = z.object({
  type: z.enum(["name", "date", "time", "phone", "amount", "address", "action"]),
  rawValue: z.string(),
  normalizedValue: z.string(),
  confidence: z.number(),
});

const NormalizationResultSchema = z.object({
  entities: z.array(NormalizedEntitySchema),
});

export type NormalizedEntity = z.infer<typeof NormalizedEntitySchema>;

export async function normalizeEntities(
  entities: ExtractedEntity[],
  callDate: Date
): Promise<NormalizedEntity[]> {
  const dateStr = callDate.toISOString().split("T")[0];

  const { object } = await generateObject({
    model: anthropic("claude-sonnet-4-20250514"),
    schema: NormalizationResultSchema,
    prompt: getNormalizationPrompt(
      entities.map((e) => ({ type: e.type, rawValue: e.rawValue, context: e.context })),
      dateStr
    ),
  });

  return object.entities;
}
