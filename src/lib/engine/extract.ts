import { anthropic } from "@ai-sdk/anthropic";
import { generateObject } from "ai";
import { z } from "zod/v4";
import { getExtractionPrompt } from "../prompts/extraction";

const ExtractedEntitySchema = z.object({
  type: z.enum(["name", "date", "time", "phone", "amount", "address", "action"]),
  rawValue: z.string(),
  context: z.string().optional(),
});

const ExtractionResultSchema = z.object({
  entities: z.array(ExtractedEntitySchema),
});

export type ExtractedEntity = z.infer<typeof ExtractedEntitySchema>;

export async function extractEntities(
  transcript: string,
  language: string
): Promise<ExtractedEntity[]> {
  const { object } = await generateObject({
    model: anthropic("claude-sonnet-4-20250514"),
    schema: ExtractionResultSchema,
    prompt: getExtractionPrompt(transcript, language),
  });

  return object.entities;
}
