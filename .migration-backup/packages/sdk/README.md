# Word AI SDK

Transaction-integrity testing for Hindi & Hinglish voice agents.

Verifies that what a customer said became the correct backend transaction — not just that the conversation looked correct.

## Install

```bash
npm install @imchiragkumar22/wordai-sdk
```

## Quick Start

```typescript
import { WordAI } from "@imchiragkumar22/wordai-sdk";

const wai = new WordAI({
  apiKey: process.env.WORDAI_API_KEY,
  endpoint: "https://your-instance.vercel.app",
});

// 1. Record the conversation
wai.captureTranscript("Mera order ORD-123 cancel kar do", "hinglish");

// 2. Assert what the customer said
wai.assertEntity({
  type: "amount",
  rawValue: "dedh hazaar",
  expectedValue: "1500",
});

// 3. Record the tool call
wai.traceTool("cancel_order", { order_id: "ORD-123" }, { status: "accepted" });

// 4. Check what ACTUALLY happened in the backend
wai.assertFinalState(async () => {
  const order = await db.getOrder("ORD-123");
  return { status: order.status, cancelled: order.cancelled };
});

// 5. Verify
const result = await wai.verify();
console.log(result.passed); // false if order is still active
```

## What it catches

| Failure | Example |
|---------|---------|
| False confirmation | Agent says "cancelled" but order is still active |
| Wrong amount | "dedh hazaar" (1500) but refund was 1349 |
| Wrong method | Customer said "UPI" but refund went to bank |
| Wrong date | "parson" (day after tomorrow) booked as tomorrow |
| Entity confusion | "teen hazaar" (3000) heard as 13000 |

## Environment Variables

```
WORDAI_API_KEY=your-api-key
WORDAI_ENDPOINT=https://your-instance.vercel.app
```

## License

MIT
