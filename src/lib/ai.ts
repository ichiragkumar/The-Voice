import { anthropic } from "@ai-sdk/anthropic";

export const MODEL_ID = "claude-sonnet-4-20250514";

export function getModel() {
  return anthropic(MODEL_ID);
}

export function isAIConfigured(): boolean {
  return !!process.env.ANTHROPIC_API_KEY;
}
