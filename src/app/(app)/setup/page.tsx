import { CodeBlock } from "@/components/code-block";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FadeIn } from "@/components/motion-wrapper";
import { Terminal, Plug, Play, CheckCircle } from "lucide-react";

const INSTALL_CODE = `npm install @bhashaqa/sdk`;

const SDK_CODE = `import { BhashaQA } from "@bhashaqa/sdk";
import { ECOMMERCE_POLICY } from "@bhashaqa/sdk/policies";

const bq = new BhashaQA({
  apiKey: process.env.BHASHAQA_API_KEY,
  endpoint: "https://your-bhashaqa.vercel.app",
});

// After your voice agent handles a call:
bq.captureTranscript(transcript, "hinglish");

bq.assertEntity({
  type: "amount",
  rawValue: "dedh hazaar",
  expectedValue: "1500",
});

bq.traceTool("cancel_order", { order_id: "ORD-123" }, result);

bq.assertFinalState(async () => {
  const order = await db.getOrder("ORD-123");
  return { status: order.status, cancelled: order.cancelled };
});

bq.addPolicyPack(ECOMMERCE_POLICY);

const result = await bq.verify();
// result.passed → false if tool said success but order is still active`;

const WEBHOOK_CODE = `// Send production calls to BhashaQA
const res = await fetch("https://your-bhashaqa.vercel.app/api/ingest", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "x-api-key": process.env.BHASHAQA_API_KEY,
  },
  body: JSON.stringify({
    audit_name: "Production Monitoring",
    transcript: callTranscript,
    language: "hinglish",
    tool_calls: [{
      function_name: "cancel_order",
      arguments: { order_id: "ORD-123" },
      response: { success: true },
    }],
  }),
});`;

const steps = [
  { icon: Terminal, title: "Install the SDK", code: INSTALL_CODE, lang: "bash" },
  { icon: Plug, title: "Instrument your agent", code: SDK_CODE, lang: "typescript" },
  { icon: Play, title: "Or send via webhook", code: WEBHOOK_CODE, lang: "typescript" },
];

export default function SetupPage() {
  return (
    <div className="space-y-8 max-w-3xl">
      <FadeIn>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Quick Setup</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Integrate BhashaQA into your voice agent in under 5 minutes
          </p>
        </div>
      </FadeIn>

      <FadeIn delay={0.1}>
        <div className="flex gap-2 flex-wrap">
          <Badge variant="outline">Bolna</Badge>
          <Badge variant="outline">Vapi</Badge>
          <Badge variant="outline">Retell</Badge>
          <Badge variant="outline">LiveKit</Badge>
          <Badge variant="outline">Pipecat</Badge>
          <Badge variant="outline">Sarvam</Badge>
          <Badge variant="outline">Custom</Badge>
        </div>
      </FadeIn>

      {steps.map((step, i) => (
        <FadeIn key={step.title} delay={0.15 + i * 0.1}>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <div className="h-6 w-6 rounded bg-emerald-500/10 flex items-center justify-center">
                  <step.icon className="h-3.5 w-3.5 text-emerald-500" />
                </div>
                <span className="text-emerald-400 font-mono text-xs">0{i + 1}</span>
                {step.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CodeBlock code={step.code} language={step.lang} />
            </CardContent>
          </Card>
        </FadeIn>
      ))}

      <FadeIn delay={0.5}>
        <Card className="border-emerald-500/20 bg-emerald-500/5">
          <CardContent className="pt-6 flex items-start gap-3">
            <CheckCircle className="h-5 w-5 text-emerald-500 mt-0.5" />
            <div>
              <p className="font-semibold">What makes this different from Cekura</p>
              <p className="text-sm text-muted-foreground mt-1">
                Cekura checks tool-call events in transcripts. BhashaQA independently queries
                your backend AFTER the call to verify the transaction actually happened correctly.
                Tool said &ldquo;success&rdquo; but order is still active? BhashaQA catches it.
              </p>
            </div>
          </CardContent>
        </Card>
      </FadeIn>
    </div>
  );
}
