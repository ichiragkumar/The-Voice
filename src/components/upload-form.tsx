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
import { Plus, Trash2, Loader2, ArrowRight, ArrowLeft } from "lucide-react";
import { createAudit } from "@/actions/audit-actions";
import { uploadBulkTranscripts } from "@/actions/upload-actions";

type CallEntry = {
  transcript: string;
  language: string;
  toolCallsJson: string;
};

export function UploadForm() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
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
            } catch {
              // skip invalid JSON
            }
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
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-2 mb-6">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center gap-2">
            <div
              className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step >= s
                  ? "bg-emerald-500 text-white"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {s}
            </div>
            {s < 3 && <div className="w-12 h-px bg-border" />}
          </div>
        ))}
      </div>

      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Audit Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="name">Audit Name</Label>
              <Input
                id="name"
                placeholder="e.g., Dr. Sharma Clinic - August Audit"
                value={auditName}
                onChange={(e) => setAuditName(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="prompt">Agent System Prompt (optional)</Label>
              <Textarea
                id="prompt"
                placeholder="Paste the voice agent's system prompt here..."
                value={agentPrompt}
                onChange={(e) => setAgentPrompt(e.target.value)}
                rows={4}
              />
            </div>
            <Button
              onClick={() => setStep(2)}
              disabled={!auditName.trim()}
              className="w-full"
            >
              Next <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Add Call Data</h3>
            <Button variant="outline" size="sm" onClick={addCall}>
              <Plus className="mr-1 h-4 w-4" /> Add Call
            </Button>
          </div>
          {calls.map((call, i) => (
            <Card key={i}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm">Call {i + 1}</CardTitle>
                  {calls.length > 1 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeCall(i)}
                    >
                      <Trash2 className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label>Language</Label>
                  <Select
                    value={call.language}
                    onValueChange={(v: string | null) => v && updateCall(i, "language", v)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hindi">Hindi</SelectItem>
                      <SelectItem value="hinglish">Hinglish</SelectItem>
                      <SelectItem value="english">English</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Transcript</Label>
                  <Textarea
                    placeholder="Paste the call transcript here..."
                    value={call.transcript}
                    onChange={(e) => updateCall(i, "transcript", e.target.value)}
                    rows={5}
                  />
                </div>
                <div>
                  <Label>Tool Calls (JSON, optional)</Label>
                  <Textarea
                    placeholder='[{"functionName": "book_appointment", "arguments": "{...}", "response": "{...}"}]'
                    value={call.toolCallsJson}
                    onChange={(e) => updateCall(i, "toolCallsJson", e.target.value)}
                    rows={3}
                    className="font-mono text-xs"
                  />
                </div>
              </CardContent>
            </Card>
          ))}
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setStep(1)}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Back
            </Button>
            <Button
              onClick={() => setStep(3)}
              disabled={!calls.some((c) => c.transcript.trim())}
              className="flex-1"
            >
              Review <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {step === 3 && (
        <Card>
          <CardHeader>
            <CardTitle>Review & Submit</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Audit Name</p>
              <p className="font-medium">{auditName}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Calls to analyze</p>
              <div className="flex gap-2 mt-1 flex-wrap">
                {calls
                  .filter((c) => c.transcript.trim())
                  .map((c, i) => (
                    <Badge key={i} variant="secondary" className="capitalize">
                      Call {i + 1} — {c.language}
                    </Badge>
                  ))}
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep(2)}>
                <ArrowLeft className="mr-2 h-4 w-4" /> Back
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={loading}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating...
                  </>
                ) : (
                  "Create Audit"
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
