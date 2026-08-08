# Build a Voice AI Agent App with Word AI SDK Integration

Use this prompt with Claude Code, Cursor, ChatGPT, or any AI coding agent to scaffold a React app with a voice AI agent that uses Word AI for transaction verification.

---

## Prompt

```
Build a React + Vite + TypeScript app for an Indian e-commerce voice customer support agent.

## What the app does

A customer speaks in Hindi/Hinglish/English to an AI voice agent. The agent can:
- Cancel orders
- Process refunds (UPI, bank account, or original payment method)
- Reschedule deliveries
- Check order status

The app uses browser microphone for input, Claude API for the agent brain, and Maya TTS for the agent's voice response.

## Tech stack

- React 19 + Vite + TypeScript
- Tailwind CSS v4
- Claude API via @ai-sdk/anthropic (Vercel AI SDK)
- @wordai/sdk for transaction verification
- Browser SpeechRecognition API for Hindi STT
- Maya TTS API for Indian-language speech output

## Required environment variables

Create a .env file:
```
VITE_ANTHROPIC_API_KEY=""
VITE_MAYA_API_KEY=""
VITE_WORDAI_API_KEY=""
VITE_WORDAI_ENDPOINT="https://your-wordai-instance.vercel.app"
```

## Project structure

```
src/
├── App.tsx                 — Main app with mic button, transcript, agent response
├── components/
│   ├── VoiceInput.tsx      — Microphone + browser SpeechRecognition (hi-IN)
│   ├── AgentChat.tsx       — Customer/Agent conversation bubbles
│   ├── OrderPanel.tsx      — Fake order database panel (shows current order state)
│   └── VerificationPanel.tsx — Word AI verification results
├── lib/
│   ├── agent.ts            — Claude agent with tool definitions
│   ├── tools.ts            — Mock tool implementations (cancel_order, process_refund, etc.)
│   ├── orders.ts           — In-memory fake order database
│   ├── tts.ts              — Maya TTS integration
│   └── verify.ts           — Word AI SDK integration
├── server/
│   └── api.ts              — Express backend proxy for Claude + Maya (keeps keys server-side)
```

## App layout

Two-column layout:
- LEFT: Voice interaction (mic button, waveform, transcript, agent chat)
- RIGHT: Verification dashboard (order state panel, Word AI pipeline results)

## Voice input component (VoiceInput.tsx)

Use browser SpeechRecognition API:
```tsx
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();
recognition.continuous = true;
recognition.interimResults = true;
recognition.lang = "hi-IN"; // Hindi
```

Show:
- Animated waveform bars (use Web Audio AnalyserNode)
- Interim text (gray, italic) while user is speaking
- Final text (white) when speech segment is complete
- Start/Stop mic button

## Claude agent (agent.ts)

System prompt:
```
You are a concise Indian e-commerce voice agent for ShopEasy.

Understand Hindi, Hinglish, and English. Preserve exact order IDs,
amounts, dates, times, addresses, and payment methods.

Available tools:
- cancel_order({ order_id: string })
- process_refund({ order_id: string, amount: number, method: "upi" | "bank_account" | "original" })
- reschedule_delivery({ order_id: string, new_date: string })
- check_order_status({ order_id: string })

Rules:
1. Ask for confirmation when a critical value is ambiguous.
2. "saade chaar" means 4:30. Do not remove time-of-day context.
3. An accepted or pending result is NOT completed.
4. Never tell the customer an action is complete until the backend confirms it.
5. If a tool fails, say the action did not complete.
6. Keep replies short, respectful, and easy to understand.
```

Use Vercel AI SDK:
```ts
import { anthropic } from "@ai-sdk/anthropic";
import { generateText } from "ai";
```

## Mock order database (orders.ts)

Start with 3 fake orders:
```ts
const orders = {
  "ORD-123": { status: "not_dispatched", amount: 1499, items: ["Wireless Earbuds"] },
  "ORD-456": { status: "shipped", amount: 2999, items: ["Running Shoes"], tracking: "DL123456" },
  "ORD-789": { status: "delivered", amount: 899, items: ["Phone Case"], delivered_date: "2026-08-05" },
};
```

Tools modify this in-memory state. The OrderPanel component shows the current state.

## Word AI verification (verify.ts)

After every agent interaction, verify the transaction:

```ts
import { WordAI } from "@wordai/sdk";

const wordai = new WordAI({
  apiKey: import.meta.env.VITE_WORDAI_API_KEY,
  endpoint: import.meta.env.VITE_WORDAI_ENDPOINT,
});

export async function verifyTransaction(
  transcript: string,
  toolName: string,
  toolArgs: Record<string, unknown>,
  toolResult: Record<string, unknown>,
  getOrderState: () => Promise<Record<string, unknown>>
) {
  wordai.captureTranscript(transcript, "hinglish");

  wordai.traceTool(toolName, toolArgs, toolResult);

  wordai.assertFinalState(getOrderState);

  const result = await wordai.verify();
  return result;
}
```

Show the verification result in the VerificationPanel:
- Entity extraction results
- Tool call: expected vs actual
- Final state: expected vs actual
- PASS / FAIL verdict with first divergence point

## Maya TTS (tts.ts)

After Claude responds, speak the response aloud:

```ts
const res = await fetch("https://tts.mayaresearch.ai/v1/tts", {
  method: "POST",
  headers: {
    Authorization: `Bearer ${MAYA_API_KEY}`,
    "content-type": "application/json",
    "user-agent": "sample-app/1.0",
  },
  body: JSON.stringify({
    text: agentReply,
    voice: "Ananya",
    language: "hi",
  }),
});
// Response is raw PCM 16-bit LE, 24kHz, mono — convert to WAV to play
```

## Demo flow

1. User clicks mic, says: "Mera order ORD-123 cancel kar do"
2. Transcript appears in real-time
3. Claude identifies intent: cancel_order, order_id: ORD-123
4. Tool executes: order status changes to "cancelled"
5. Claude responds: "Order ORD-123 ki cancellation ho gayi hai"
6. Maya speaks the response
7. Word AI verifies: entity ✓, tool call ✓, backend state ✓ → PASS
8. OrderPanel shows updated state

For the FAIL demo:
- Same transcript, but make the tool return "accepted" while keeping order status as "not_dispatched"
- Claude says "cancelled" but order is still active
- Word AI catches: backend state FAIL, verdict FAIL

## Important

- NEVER put API keys in frontend code. Use a backend proxy.
- The server/api.ts should be a simple Express server that proxies Claude and Maya requests.
- Install command: `npm install @wordai/sdk @ai-sdk/anthropic ai`
- The app should work with fake data even without API keys (demo mode).

## Acceptance criteria

- Mic works with Hindi/Hinglish speech recognition
- Agent responds correctly in Hinglish
- Maya speaks the response
- Word AI verification shows PASS/FAIL with pipeline stages
- OrderPanel reflects actual backend state
- Toggle between working and broken agent mode
- Mobile responsive
```

---

## Quick start after the app is generated

```bash
# Install dependencies
npm install

# Add your keys
cp .env.example .env
# Edit .env with your keys

# Start dev server
npm run dev
```

## Required API keys

| Key | Where to get it | Required for |
|-----|----------------|-------------|
| `VITE_ANTHROPIC_API_KEY` | [console.anthropic.com](https://console.anthropic.com) | Claude agent brain |
| `VITE_MAYA_API_KEY` | Email charan@mayaresearch.ai | Hindi/Hinglish voice output |
| `VITE_WORDAI_API_KEY` | Your Word AI dashboard → Developer → Create Key | Transaction verification |
| `VITE_WORDAI_ENDPOINT` | Your deployed Word AI instance URL | SDK endpoint |

## What Word AI SDK does in this app

```
Customer speaks → Agent responds → Tool executes → Word AI verifies

                                                    ┌─ Entity match?
                                                    ├─ Tool call correct?
Customer: "ORD-123 cancel kar do" ──────────────────├─ Backend state changed?
                                                    ├─ Agent told the truth?
                                                    └─ PASS or FAIL
```

The SDK catches cases where:
- Agent says "cancelled" but order is still active
- Refund amount is wrong (full order vs single item)
- Refund method doesn't match customer preference (UPI vs bank)
- Date/time was normalized incorrectly ("saade chaar" → 04:30 instead of 16:30)
