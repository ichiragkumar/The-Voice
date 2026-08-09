"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Loader2, ArrowRight, ArrowLeft, Sparkles, Zap, Copy } from "lucide-react";
import { createAudit } from "@/actions/audit-actions";
import { uploadBulkTranscripts } from "@/actions/upload-actions";

type CallEntry = {
  transcript: string;
  language: string;
  toolCallsJson: string;
};

const MOCK_TEMPLATES = [
  {
    name: "E-commerce Cancel (Hinglish)",
    auditName: "ShopEasy — Cancel & Refund Audit",
    prompt: "You are a customer support agent for ShopEasy e-commerce. Help customers cancel orders, process refunds, and reschedule deliveries. Refunds go to original payment method unless customer requests otherwise.",
    calls: [
      {
        transcript: "Agent: ShopEasy support, namaste.\nCustomer: Mera order cancel karna hai. Order number one four double nine hai.\nAgent: Order #1499 mil gaya. Cancel kar diya. ₹1349 refund ho jayega.\nCustomer: Theek hai.",
        language: "hinglish",
        toolCallsJson: JSON.stringify([{ functionName: "cancel_order", arguments: { order_id: "1499", refund_amount: 1349 }, response: { success: true } }], null, 2),
      },
      {
        transcript: "Agent: ShopEasy.\nCustomer: Refund UPI par chahiye, account mein nahi.\nAgent: ₹1200 refund UPI par process kar diya.\nCustomer: PhonePe par aayega na?\nAgent: Haan ji.",
        language: "hinglish",
        toolCallsJson: JSON.stringify([{ functionName: "process_refund", arguments: { amount: 1200, method: "bank_account" }, response: { success: true } }], null, 2),
      },
    ],
  },
  {
    name: "Clinic Appointment (Hindi)",
    auditName: "Dr. Sharma Clinic — Appointment Audit",
    prompt: "You are a medical appointment assistant for Dr. Sharma's clinic. Help patients book, reschedule, and cancel appointments. Available doctors: Dr. Sharma, Dr. Patel, Dr. Gupta. Hours: 9 AM - 6 PM, Mon-Sat.",
    calls: [
      {
        transcript: "Agent: Namaste, Dr. Sharma clinic.\nCustomer: Mera appointment kal ke liye tha. Lekin kal nahi, uske agle din shaam ko saade chaar baje kar do.\nAgent: Theek hai, reschedule kar diya kal 4 baje.\nCustomer: Dhanyavaad.",
        language: "hinglish",
        toolCallsJson: JSON.stringify([{ functionName: "reschedule_appointment", arguments: { doctor: "Dr. Sharma", date: "2026-08-11", time: "16:00" }, response: { success: true } }], null, 2),
      },
    ],
  },
  {
    name: "Collections PTP (Hinglish)",
    auditName: "FinServ — Collections PTP Audit",
    prompt: "You are a collections agent for FinServ lending. Remind customers about overdue EMIs, capture promise-to-pay dates and amounts. Be polite but firm. Always verify borrower identity first.",
    calls: [
      {
        transcript: "Agent: FinServ collections se bol raha hoon. Aapka ₹15,000 ka EMI pending hai.\nCustomer: Teen hazaar abhi de dunga, baaki parson.\nAgent: ₹13,000 aaj aur baaki parson.\nCustomer: Nahi, teen hazaar! 3000!",
        language: "hinglish",
        toolCallsJson: JSON.stringify([{ functionName: "log_promise_to_pay", arguments: { amount_today: 13000, later_date: "2026-08-10" }, response: { success: true } }], null, 2),
      },
    ],
  },
];

export function UploadForm() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [auditName, setAuditName] = useState("");
  const [agentPrompt, setAgentPrompt] = useState("");
  const [calls, setCalls] = useState<CallEntry[]>([
    { transcript: "", language: "hinglish", toolCallsJson: "" },
  ]);

  function addCall() {
    setCalls([...calls, { transcript: "", language: "hinglish", toolCallsJson: "" }]);
  }

  function removeCall(index: number) {
    setCalls(calls.filter((_, i) => i !== index));
  }

  function updateCall(index: number, field: keyof CallEntry, value: string) {
    const updated = [...calls];
    updated[index] = { ...updated[index], [field]: value };
    setCalls(updated);
  }

  function loadTemplate(template: typeof MOCK_TEMPLATES[0]) {
    setAuditName(template.auditName);
    setAgentPrompt(template.prompt);
    setCalls(template.calls);
    setStep(2);
  }

  async function generatePrompt() {
    if (!auditName.trim()) return;
    setGenerating(true);
    try {
      const res = await fetch("/api/generate-prompt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ auditName, context: agentPrompt }),
      });
      if (res.ok) {
        const data = await res.json();
        setAgentPrompt(data.prompt);
      }
    } catch {
      // fallback
    }
    setGenerating(false);
  }

  async function handleSubmit() {
    setLoading(true);
    try {
      const audit = await createAudit({
        name: auditName,
        agentPrompt: agentPrompt || undefined,
      });

      const bulkData = calls
        .filter((c) => c.transcript.trim())
        .map((c) => {
          let toolCalls: Array<{ functionName: string; arguments: string; response?: string }> = [];
          if (c.toolCallsJson.trim()) {
            try {
              const parsed = JSON.parse(c.toolCallsJson);
              toolCalls = Array.isArray(parsed) ? parsed : [parsed];
            } catch { /* skip */ }
          }
          return { transcript: c.transcript, language: c.language, toolCalls };
        });

      if (bulkData.length > 0) {
        await uploadBulkTranscripts(audit.id, bulkData);
      }

      router.push(`/audits/${audit.id}`);
    } catch {
      setLoading(false);
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left: Form */}
      <div className="lg:col-span-2 space-y-6">
        <div className="flex items-center gap-2 mb-2">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div
                className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                  step >= s
                    ? "bg-emerald-500 text-white"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {s}
              </div>
              {s < 3 && <div className="w-8 h-px bg-border" />}
            </div>
          ))}
        </div>

        {step === 1 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Audit Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="name">Audit Name</Label>
                <Input
                  id="name"
                  placeholder="e.g., ShopEasy — Cancel & Refund Audit"
                  value={auditName}
                  onChange={(e) => setAuditName(e.target.value)}
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <Label htmlFor="prompt">Agent System Prompt</Label>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={generatePrompt}
                    disabled={generating || !auditName.trim()}
                    className="gap-1 text-xs h-6"
                  >
                    {generating ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <Sparkles className="h-3 w-3 text-emerald-500" />
                    )}
                    Generate with AI
                  </Button>
                </div>
                <Textarea
                  id="prompt"
                  placeholder="Paste the voice agent's system prompt, or click 'Generate with AI'..."
                  value={agentPrompt}
                  onChange={(e) => setAgentPrompt(e.target.value)}
                  rows={4}
                />
              </div>
              <Button
                onClick={() => setStep(2)}
                disabled={!auditName.trim()}
                className="w-full bg-emerald-600 hover:bg-emerald-700"
              >
                Next <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold">Call Data</h3>
              <Button variant="outline" size="sm" onClick={addCall}>
                <Plus className="mr-1 h-3 w-3" /> Add Call
              </Button>
            </div>
            {calls.map((call, i) => (
              <Card key={i}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xs">Call {i + 1}</CardTitle>
                    {calls.length > 1 && (
                      <Button variant="ghost" size="icon" onClick={() => removeCall(i)} className="h-6 w-6">
                        <Trash2 className="h-3 w-3 text-muted-foreground" />
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <Label className="text-xs">Language</Label>
                    <Select
                      value={call.language}
                      onValueChange={(v: string | null) => v && updateCall(i, "language", v)}
                    >
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="hindi">Hindi</SelectItem>
                        <SelectItem value="hinglish">Hinglish</SelectItem>
                        <SelectItem value="english">Indian English</SelectItem>
                        <SelectItem value="telugu">Telugu</SelectItem>
                        <SelectItem value="bengali">Bengali</SelectItem>
                        <SelectItem value="gujarati">Gujarati</SelectItem>
                        <SelectItem value="kannada">Kannada</SelectItem>
                        <SelectItem value="malayalam">Malayalam</SelectItem>
                        <SelectItem value="marathi">Marathi</SelectItem>
                        <SelectItem value="odia">Odia</SelectItem>
                        <SelectItem value="punjabi">Punjabi</SelectItem>
                        <SelectItem value="tamil">Tamil</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs">Transcript</Label>
                    <Textarea
                      placeholder="Agent: ...\nCustomer: ..."
                      value={call.transcript}
                      onChange={(e) => updateCall(i, "transcript", e.target.value)}
                      rows={4}
                      className="text-xs font-mono"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Tool Calls (JSON)</Label>
                    <Textarea
                      placeholder='[{"functionName": "...", "arguments": {...}}]'
                      value={call.toolCallsJson}
                      onChange={(e) => updateCall(i, "toolCallsJson", e.target.value)}
                      rows={3}
                      className="text-xs font-mono"
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
            <div className="flex gap-3">
              <Button variant="outline" size="sm" onClick={() => setStep(1)}>
                <ArrowLeft className="mr-1 h-3 w-3" /> Back
              </Button>
              <Button
                onClick={() => setStep(3)}
                disabled={!calls.some((c) => c.transcript.trim())}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                size="sm"
              >
                Review <ArrowRight className="ml-1 h-3 w-3" />
              </Button>
            </div>
          </div>
        )}

        {step === 3 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Review & Submit</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-xs text-muted-foreground">Audit</p>
                <p className="text-sm font-medium">{auditName}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Calls</p>
                <div className="flex gap-1.5 mt-1 flex-wrap">
                  {calls.filter((c) => c.transcript.trim()).map((c, i) => (
                    <Badge key={i} variant="secondary" className="text-xs capitalize">
                      {i + 1}. {c.language}
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" size="sm" onClick={() => setStep(2)}>
                  <ArrowLeft className="mr-1 h-3 w-3" /> Back
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                  size="sm"
                >
                  {loading ? (
                    <><Loader2 className="mr-1 h-3 w-3 animate-spin" /> Creating...</>
                  ) : (
                    "Create Audit"
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Right: Templates + AI */}
      <div className="space-y-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs flex items-center gap-1.5">
              <Zap className="h-3.5 w-3.5 text-emerald-500" />
              Quick Fill — Click to load
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {MOCK_TEMPLATES.map((t) => (
              <button
                key={t.name}
                onClick={() => loadTemplate(t)}
                className="w-full text-left rounded-md border border-border p-3 hover:border-emerald-500/30 hover:bg-accent/50 transition-all group"
              >
                <p className="text-xs font-medium group-hover:text-emerald-500 transition-colors">
                  {t.name}
                </p>
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  {t.calls.length} call{t.calls.length > 1 ? "s" : ""} with tool logs
                </p>
              </button>
            ))}
          </CardContent>
        </Card>

        <Card className="border-emerald-500/20 bg-emerald-500/5">
          <CardContent className="pt-4 space-y-2">
            <div className="flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-emerald-500" />
              <p className="text-xs font-medium">AI System Prompt Generator</p>
            </div>
            <p className="text-[10px] text-muted-foreground leading-relaxed">
              Enter your audit name in Step 1, then click &ldquo;Generate with AI&rdquo;
              — Claude will write a system prompt for your voice agent based on the
              workflow type.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
