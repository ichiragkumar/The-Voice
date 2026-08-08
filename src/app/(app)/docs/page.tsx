"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CodeBlock } from "@/components/code-block";
import { FadeIn } from "@/components/motion-wrapper";
import {
  Book,
  Plug,
  Shield,
  Code,
  Database,
  Webhook,
  Languages,
  Package,
  Terminal,
  Play,
  ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

const sections = [
  { id: "overview", label: "Overview", icon: Book },
  { id: "quickstart", label: "Quick Start", icon: Play },
  { id: "sdk", label: "SDK Reference", icon: Code },
  { id: "api", label: "API Reference", icon: Webhook },
  { id: "entities", label: "Entity Truth", icon: Languages },
  { id: "policies", label: "Policy Packs", icon: Shield },
  { id: "vendors", label: "Vendor Setup", icon: Plug },
  { id: "benchmarks", label: "Benchmarks", icon: Package },
  { id: "cli", label: "CLI & CI/CD", icon: Terminal },
  { id: "final-state", label: "Final State", icon: Database },
];

export default function DocsPage() {
  const [active, setActive] = useState("overview");

  return (
    <div className="flex gap-8 max-w-6xl">
      {/* Sidebar nav */}
      <nav className="hidden lg:block w-48 flex-shrink-0 sticky top-6 self-start space-y-1">
        {sections.map((s) => (
          <a
            key={s.id}
            href={`#${s.id}`}
            onClick={() => setActive(s.id)}
            className={cn(
              "flex items-center gap-2 rounded-md px-3 py-1.5 text-sm transition-colors",
              active === s.id
                ? "bg-accent text-accent-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <s.icon className="h-3.5 w-3.5" />
            {s.label}
          </a>
        ))}
      </nav>

      {/* Content */}
      <div className="flex-1 space-y-12 min-w-0">
        <FadeIn>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Documentation</h1>
            <p className="text-muted-foreground mt-2">
              Everything you need to integrate BhashaQA into your voice agent pipeline.
            </p>
          </div>
        </FadeIn>

        {/* Overview */}
        <section id="overview" className="scroll-mt-6 space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Book className="h-5 w-5 text-emerald-500" /> Overview
          </h2>
          <Card>
            <CardContent className="pt-6 space-y-4">
              <p className="text-sm text-muted-foreground leading-relaxed">
                BhashaQA is a <strong>transaction assurance layer</strong> for Indian-language
                voice agents. Unlike generic testing platforms that check if conversations look
                correct, BhashaQA verifies that the caller&rsquo;s exact request became the correct
                business transaction in your backend.
              </p>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {[
                  { label: "Speech Truth", desc: "What did the customer say?" },
                  { label: "Entity Truth", desc: "What amount/date/address did they mean?" },
                  { label: "Transaction Truth", desc: "What changed in the backend?" },
                  { label: "Policy Truth", desc: "Was it compliant?" },
                ].map((layer) => (
                  <div key={layer.label} className="rounded-lg border border-border bg-muted/30 p-3">
                    <p className="text-xs font-medium text-emerald-400">{layer.label}</p>
                    <p className="text-xs text-muted-foreground mt-1">{layer.desc}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Quick Start */}
        <section id="quickstart" className="scroll-mt-6 space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Play className="h-5 w-5 text-emerald-500" /> Quick Start
          </h2>
          <div className="space-y-3">
            <CodeBlock language="bash" code={`npm install @bhashaqa/sdk`} />
            <CodeBlock language="typescript" code={`import { BhashaQA } from "@bhashaqa/sdk";

const bq = new BhashaQA({
  apiKey: "your-api-key",
  endpoint: "https://your-bhashaqa.vercel.app",
});

// 1. Capture the conversation
bq.captureTranscript(transcript, "hinglish");

// 2. Assert what the customer said
bq.assertEntity({
  type: "amount",
  rawValue: "dedh hazaar",
  expectedValue: "1500",
});

// 3. Record what tool was called
bq.traceTool("process_refund", { amount: 1500, method: "upi" }, { success: true });

// 4. Check what ACTUALLY happened in the backend
bq.assertFinalState(async () => {
  const refund = await db.getRefund(refundId);
  return { amount: refund.amount, method: refund.method, status: refund.status };
});

// 5. Verify everything matches
const result = await bq.verify();
console.log(result.passed); // false if tool said success but refund didn't happen`} />
          </div>
        </section>

        {/* SDK Reference */}
        <section id="sdk" className="scroll-mt-6 space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Code className="h-5 w-5 text-emerald-500" /> SDK Reference
          </h2>
          {[
            { method: "captureTranscript(text, language?)", desc: "Record the call transcript. Language: 'hindi' | 'hinglish' | 'english'" },
            { method: "assertEntity({ type, rawValue, expectedValue })", desc: "Assert an entity the customer spoke. Types: date, time, amount, name, address, phone, action, identifier" },
            { method: "traceTool(functionName, args, result)", desc: "Record a tool/function call made by the agent" },
            { method: "assertFinalState(callback)", desc: "Provide an async callback that queries your actual backend and returns the real state" },
            { method: "assertPolicy(rule)", desc: "Add a single policy rule to check" },
            { method: "addPolicyPack(rules[])", desc: "Add a complete policy pack (e.g. ECOMMERCE_POLICY, COLLECTIONS_POLICY)" },
            { method: "verify()", desc: "Run all assertions and return VerificationResult" },
            { method: "reset()", desc: "Clear all captured data for reuse" },
          ].map((m) => (
            <Card key={m.method}>
              <CardContent className="py-3">
                <code className="text-sm font-mono text-emerald-400">{m.method}</code>
                <p className="text-xs text-muted-foreground mt-1">{m.desc}</p>
              </CardContent>
            </Card>
          ))}
        </section>

        {/* API Reference */}
        <section id="api" className="scroll-mt-6 space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Webhook className="h-5 w-5 text-emerald-500" /> API Reference
          </h2>
          {[
            {
              method: "POST", path: "/api/ingest", desc: "Ingest a production call for analysis",
              body: `{
  "transcript": "Customer said...",
  "language": "hinglish",
  "audit_name": "Production Monitoring",
  "tool_calls": [{ "function_name": "cancel_order", "arguments": { "order_id": "123" } }]
}`,
            },
            {
              method: "POST", path: "/api/process", desc: "Trigger analysis pipeline on an audit",
              body: `{ "auditId": "cuid-here" }`,
            },
            {
              method: "POST", path: "/api/sdk/verify", desc: "Receive SDK verification results",
              body: `{ "auditId": "...", "transcript": "...", "result": { ... } }`,
            },
            {
              method: "POST", path: "/api/tts", desc: "Generate speech via Maya TTS",
              body: `{ "text": "नमस्ते", "voice": "Ananya", "language": "hi" }`,
            },
            {
              method: "POST", path: "/api/run", desc: "Execute a benchmark test scenario",
              body: `{ "scenarioName": "...", "transcript": "...", "expectedEntities": [...] }`,
            },
          ].map((ep) => (
            <Card key={ep.path}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Badge variant="outline" className="font-mono text-xs">{ep.method}</Badge>
                  <code className="font-mono text-emerald-400">{ep.path}</code>
                </CardTitle>
                <p className="text-xs text-muted-foreground">{ep.desc}</p>
              </CardHeader>
              <CardContent>
                <CodeBlock language="json" code={ep.body} />
              </CardContent>
            </Card>
          ))}
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">
                <strong>Authentication:</strong> Pass <code className="text-xs bg-muted px-1 py-0.5 rounded">x-api-key</code> header
                for <code className="text-xs bg-muted px-1 py-0.5 rounded">/api/ingest</code> and
                <code className="text-xs bg-muted px-1 py-0.5 rounded">/api/sdk/verify</code>.
                Use <code className="text-xs bg-muted px-1 py-0.5 rounded">demo-key</code> for testing.
              </p>
            </CardContent>
          </Card>
        </section>

        {/* Entity Truth */}
        <section id="entities" className="scroll-mt-6 space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Languages className="h-5 w-5 text-emerald-500" /> India Entity Truth Engine
          </h2>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground mb-4">
                BhashaQA normalizes Indian expressions that generic platforms miss:
              </p>
              <div className="space-y-3">
                {[
                  { cat: "Hindi Numbers", examples: '"dedh lakh" → 1,50,000 | "chaudah sau ninyanve" → 1,499 | "dhai hazaar" → 2,500' },
                  { cat: "Hindi Time", examples: '"saade chaar" → 4:30 | "paune paanch" → 4:45 | "sawa teen" → 3:15' },
                  { cat: "Hindi Dates", examples: '"parson" → day after tomorrow | "uske agle din" → relative | "aakhri tareekh" → month end' },
                  { cat: "Spoken Digits", examples: '"one four double nine" → 1499 | "triple two" → 222' },
                  { cat: "Addresses", examples: '"mandir ke saamne" | "Flat 3B" (not 38) | "Sector 15, near metro pillar 204"' },
                ].map((row) => (
                  <div key={row.cat} className="flex gap-4 text-sm">
                    <span className="font-medium w-32 flex-shrink-0 text-emerald-400">{row.cat}</span>
                    <span className="text-muted-foreground font-mono text-xs">{row.examples}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Policy Packs */}
        <section id="policies" className="scroll-mt-6 space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Shield className="h-5 w-5 text-emerald-500" /> Policy Packs
          </h2>
          {[
            { name: "RBI Collections", id: "rbi-collections", rules: [
              "Verify borrower identity before disclosure",
              "No threatening or abusive language",
              "Capture PTP with specific amount and date",
              "Recognize and escalate hardship/dispute",
            ]},
            { name: "E-commerce", id: "ecommerce", rules: [
              "Verify order ID before mutation",
              "Refund must not exceed item value",
              "Refund method must match customer preference",
              "Confirmation must match actual action",
            ]},
            { name: "Insurance (IRDAI)", id: "insurance-irdai", rules: [
              "Verify policy number before changes",
              "Do not confirm when API returns error",
              "Nominee changes require relationship and DOB",
            ]},
          ].map((pack) => (
            <Card key={pack.id}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">{pack.name}</CardTitle>
                <Badge variant="outline" className="w-fit text-xs font-mono">{pack.id}</Badge>
              </CardHeader>
              <CardContent>
                <ul className="space-y-1">
                  {pack.rules.map((r) => (
                    <li key={r} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <ArrowRight className="h-3 w-3 mt-1 text-emerald-500 flex-shrink-0" />
                      {r}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
          <CodeBlock language="typescript" code={`import { ECOMMERCE_POLICY } from "@bhashaqa/sdk/policies";
import { COLLECTIONS_POLICY } from "@bhashaqa/sdk/policies";

bq.addPolicyPack(ECOMMERCE_POLICY);
bq.addPolicyPack(COLLECTIONS_POLICY);`} />
        </section>

        {/* Vendors */}
        <section id="vendors" className="scroll-mt-6 space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Plug className="h-5 w-5 text-emerald-500" /> Vendor Integration
          </h2>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground mb-4">
                BhashaQA normalizes tool-call formats from any vendor:
              </p>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {["Bolna", "Vapi", "Retell AI", "LiveKit", "Pipecat", "Sarvam AI", "Custom"].map((v) => (
                  <div key={v} className="rounded border border-border p-3 text-center text-sm">
                    {v}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Benchmarks */}
        <section id="benchmarks" className="scroll-mt-6 space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Package className="h-5 w-5 text-emerald-500" /> Benchmark Packs
          </h2>
          <Card>
            <CardContent className="pt-6 space-y-4">
              {[
                { name: "Hindi E-commerce", count: 10, examples: "Spoken order IDs, partial cancellation, UPI refund, dedh hazaar" },
                { name: "Hindi Appointments", count: 5, examples: "Relative dates, saade/paune times, multi-name, false confirmation" },
                { name: "Hindi Collections", count: 5, examples: "Teen vs tera, salary-relative PTP, dedh lakh, disputes" },
              ].map((b) => (
                <div key={b.name} className="flex items-start gap-4">
                  <Badge variant="outline" className="mt-0.5">{b.count}</Badge>
                  <div>
                    <p className="text-sm font-medium">{b.name}</p>
                    <p className="text-xs text-muted-foreground">{b.examples}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </section>

        {/* CLI */}
        <section id="cli" className="scroll-mt-6 space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Terminal className="h-5 w-5 text-emerald-500" /> CLI & CI/CD
          </h2>
          <CodeBlock language="bash" code={`# Run from terminal
./scripts/bhashaqa-test.sh --suite ecommerce-hindi --url http://localhost:3000

# GitHub Actions — add to your workflow
- name: BhashaQA Gate
  env:
    BHASHAQA_URL: \${{ secrets.BHASHAQA_URL }}
    BHASHAQA_API_KEY: \${{ secrets.BHASHAQA_API_KEY }}
  run: ./scripts/bhashaqa-test.sh --suite ecommerce-hindi`} />
        </section>

        {/* Final State */}
        <section id="final-state" className="scroll-mt-6 space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Database className="h-5 w-5 text-emerald-500" /> Final-State Verification
          </h2>
          <Card className="border-emerald-500/20 bg-emerald-500/5">
            <CardContent className="pt-6 space-y-4">
              <p className="text-sm font-medium">This is what makes BhashaQA different.</p>
              <p className="text-sm text-muted-foreground">
                Cekura and other platforms verify tool calls by reading function-call events
                in the transcript. BhashaQA independently queries your backend AFTER the call
                to verify the transaction actually completed correctly.
              </p>
              <CodeBlock language="typescript" code={`// The tool call said "success" — but did it really happen?
bq.assertFinalState(async () => {
  const order = await shopify.getOrder("ORD-123");
  return {
    status: order.status,        // Should be "cancelled"
    cancelled: order.cancelled,  // Should be true
    refund: order.refund_amount, // Should be 899, not 1349
  };
});

// BhashaQA catches:
// - Tool returned success but order is still active
// - Refund amount is wrong (full order instead of single item)
// - Appointment date in calendar doesn't match what was confirmed
// - Nominee change failed silently but agent said "done"`} />
            </CardContent>
          </Card>
        </section>

        <Separator />
        <p className="text-xs text-muted-foreground text-center pb-8">
          BhashaQA — Voice Agent Truth Layer &middot; Built with Next.js, Claude, and Maya
        </p>
      </div>
    </div>
  );
}
