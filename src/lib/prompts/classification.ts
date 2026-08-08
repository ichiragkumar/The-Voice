export function getClassificationPrompt(
  expectedValue: string,
  actualValue: string,
  entityType: string,
  transcriptExcerpt: string,
  agentResponse: string
): string {
  return `You are an expert at diagnosing voice agent failures. A mismatch was found between what the customer said and what the system recorded.

Entity type: ${entityType}
Expected value (from customer speech): ${expectedValue}
Actual value (in tool call/backend): ${actualValue}

Transcript excerpt:
${transcriptExcerpt}

Agent's response to customer:
${agentResponse}

Classify the root cause as exactly one of:
- "asr_error": The speech-to-text system misheard or mistranscribed the customer
- "reasoning_error": The transcript was correct but the agent interpreted it wrong (e.g., wrong date resolution, wrong math)
- "tool_argument_error": The agent understood correctly but passed the wrong value to the API/tool call
- "integration_error": The tool call had correct arguments but the backend stored a different value
- "false_confirmation": The agent told the customer one thing but the system recorded something different

Provide a brief evidence explanation of why this root cause applies.`;
}
