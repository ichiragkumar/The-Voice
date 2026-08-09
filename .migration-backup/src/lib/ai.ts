import { anthropic } from "@ai-sdk/anthropic";

export const MODEL_ID = "claude-sonnet-4-6";

export function getModel() {
  return anthropic(MODEL_ID);
}

export function isAIConfigured(): boolean {
  return !!process.env.ANTHROPIC_API_KEY;
}
