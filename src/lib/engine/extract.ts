import { generateObject } from "ai";
import { z } from "zod/v4";
import { getModel, isAIConfigured } from "../ai";
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
  if (!isAIConfigured()) {
    throw new Error("ANTHROPIC_API_KEY not set — add it to .env to enable Claude-powered extraction");
  }

  const { object } = await generateObject({
    model: getModel(),
    schema: ExtractionResultSchema,
    prompt: getExtractionPrompt(transcript, language),
  });

  return object.entities;
}
