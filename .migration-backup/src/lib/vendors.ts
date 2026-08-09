export type VendorConfig = {
  id: string;
  name: string;
  logo: string;
  description: string;
  toolCallFormat: "openai" | "anthropic" | "custom";
  transcriptFormat: "plain" | "speaker_labeled" | "json";
  webhookSupport: boolean;
  samplePayload: Record<string, unknown>;
};

export const VENDORS: VendorConfig[] = [
  {
    id: "bolna",
    name: "Bolna",
    logo: "🔊",
    description: "Build and operate multilingual voice agents",
    toolCallFormat: "openai",
    transcriptFormat: "speaker_labeled",
    webhookSupport: true,
    samplePayload: {
      transcript: "Agent: ...\nUser: ...",
      tool_calls: [{ function_name: "book_appointment", arguments: {} }],
    },
  },
  {
    id: "vapi",
    name: "Vapi",
    logo: "📞",
    description: "Voice AI platform for developers",
    toolCallFormat: "openai",
    transcriptFormat: "json",
    webhookSupport: true,
    samplePayload: {
      transcript: [{ role: "assistant", content: "..." }],
      tool_calls: [{ function: { name: "...", arguments: "{}" } }],
    },
  },
  {
    id: "retell",
    name: "Retell AI",
    logo: "🎙️",
    description: "Conversational voice AI for enterprises",
    toolCallFormat: "openai",
    transcriptFormat: "json",
    webhookSupport: true,
    samplePayload: {
      transcript_object: [{ role: "agent", content: "..." }],
      function_call: [{ name: "...", arguments: {} }],
    },
  },
  {
    id: "livekit",
    name: "LiveKit Agents",
    logo: "🔴",
    description: "Open-source real-time communication",
    toolCallFormat: "custom",
    transcriptFormat: "speaker_labeled",
    webhookSupport: false,
    samplePayload: {
      transcript: "Agent: ...\nUser: ...",
      function_calls: [{ name: "...", args: {} }],
    },
  },
  {
    id: "pipecat",
    name: "Pipecat",
    logo: "🐱",
    description: "Open-source voice and multimodal AI framework",
    toolCallFormat: "custom",
    transcriptFormat: "plain",
    webhookSupport: false,
    samplePayload: {
      transcript: "...",
      tool_results: [{ tool: "...", input: {}, output: {} }],
    },
  },
  {
    id: "sarvam",
    name: "Sarvam AI",
    logo: "🇮🇳",
    description: "Indian-language speech and AI models",
    toolCallFormat: "custom",
    transcriptFormat: "speaker_labeled",
    webhookSupport: true,
    samplePayload: {
      transcript: "Agent: ...\nCustomer: ...",
      actions: [{ type: "...", params: {} }],
    },
  },
  {
    id: "custom",
    name: "Custom / FastAPI",
    logo: "⚡",
    description: "WebSocket or REST-based custom agents",
    toolCallFormat: "custom",
    transcriptFormat: "plain",
    webhookSupport: true,
    samplePayload: {
      transcript: "...",
      tool_calls: [{ function_name: "...", arguments: "{}" }],
    },
  },
];

export function normalizeToolCalls(
  vendor: string,
  rawToolCalls: unknown[]
): Array<{ functionName: string; arguments: string; response?: string }> {
  return rawToolCalls.map((tc: any) => {
    switch (vendor) {
      case "vapi":
        return {
          functionName: tc.function?.name || tc.name || "unknown",
          arguments:
            typeof tc.function?.arguments === "string"
              ? tc.function.arguments
              : JSON.stringify(tc.function?.arguments || tc.arguments || {}),
          response: tc.result ? JSON.stringify(tc.result) : undefined,
        };
      case "retell":
        return {
          functionName: tc.name || "unknown",
          arguments: JSON.stringify(tc.arguments || {}),
          response: tc.response ? JSON.stringify(tc.response) : undefined,
        };
      case "livekit":
      case "pipecat":
        return {
          functionName: tc.name || tc.tool || "unknown",
          arguments: JSON.stringify(tc.args || tc.input || {}),
          response: tc.output ? JSON.stringify(tc.output) : undefined,
        };
      default:
        return {
          functionName: tc.function_name || tc.functionName || tc.name || "unknown",
          arguments:
            typeof tc.arguments === "string"
              ? tc.arguments
              : JSON.stringify(tc.arguments || {}),
          response: tc.response
            ? typeof tc.response === "string"
              ? tc.response
              : JSON.stringify(tc.response)
            : undefined,
        };
    }
  });
}

export function normalizeTranscript(vendor: string, raw: unknown): string {
  if (typeof raw === "string") return raw;
  if (Array.isArray(raw)) {
    return raw
      .map((msg: any) => `${msg.role || "unknown"}: ${msg.content || ""}`)
      .join("\n");
  }
  return JSON.stringify(raw);
}
