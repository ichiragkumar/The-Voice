"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { FadeIn } from "@/components/motion-wrapper";
import { CodeBlock } from "@/components/code-block";
import { Key, Plus, Trash2, Copy, Check, Code, Terminal, Ban, RotateCcw, Eye, EyeOff } from "lucide-react";

type ApiKey = {
  id: string;
  key?: string;
  keyPrefix: string;
  name: string;
  status: string;
  lastUsed: string | null;
  created: string;
  createdAt?: string;
};

const SDK_INSTALL = `npm install @imchiragkumar22/wordai-sdk`;

const SDK_USAGE = `import { WordAI } from "@imchiragkumar22/wordai-sdk";

const wai = new WordAI({
  apiKey: process.env.WORDAI_API_KEY,
  endpoint: "https://your-wordai-instance.vercel.app",
});

// After your voice agent handles a call:
wai.captureTranscript(transcript, "hinglish");

wai.assertEntity({
  type: "amount",
  rawValue: "dedh hazaar",
  expectedValue: "1500",
});

wai.traceTool("cancel_order", { order_id: "ORD-123" }, result);

wai.assertFinalState(async () => {
  const order = await db.getOrder("ORD-123");
  return { status: order.status, cancelled: order.cancelled };
});

const result = await wai.verify();
console.log(result.passed);`;

const ENV_TEMPLATE = `# Add to your .env file
WORDAI_API_KEY="your-api-key-here"
WORDAI_ENDPOINT="https://your-wordai-instance.vercel.app"`;

const FULL_MARKDOWN = `# The Voice SDK Integration

## Install
\`\`\`bash
npm install @wordai/sdk
\`\`\`

## Environment Variables
\`\`\`
WORDAI_API_KEY="your-api-key-here"
WORDAI_ENDPOINT="https://your-wordai-instance.vercel.app"
\`\`\`

## Usage
\`\`\`typescript
${SDK_USAGE}
\`\`\`

## API Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/ingest | Ingest production call data |
| POST | /api/process | Run analysis pipeline |
| POST | /api/sdk/verify | Submit verification result |
| POST | /api/claude | Claude agent proxy |
| POST | /api/tts | Maya TTS synthesis |
| POST | /api/run | Execute benchmark scenario |
| GET | /api/audits | List all audits |

## Headers
\`\`\`
x-api-key: your-wordai-api-key
Content-Type: application/json
\`\`\`
`;

export default function DeveloperPage() {
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [newKeyName, setNewKeyName] = useState("");
  const [newKey, setNewKey] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [showKey, setShowKey] = useState(false);

  function loadKeys() {
    fetch("/api/keys").then((r) => r.json()).then(setKeys);
  }

  useEffect(() => { loadKeys(); }, []);

  async function createKey() {
    if (!newKeyName.trim()) return;
    const res = await fetch("/api/keys", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newKeyName || "Default" }),
    });
    const data = await res.json();
    setNewKey(data.key);
    setNewKeyName("");
    setShowKey(true);
    loadKeys();
  }

  async function deleteKey(id: string) {
    await fetch("/api/keys", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    loadKeys();
  }

  async function toggleKey(id: string, currentStatus: string) {
    await fetch("/api/keys", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, action: currentStatus === "active" ? "revoke" : "activate" }),
    });
    loadKeys();
  }

  function copyText(text: string, id: string) {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  }

  return (
    <div className="space-y-8 max-w-4xl">
      <FadeIn>
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Code className="h-5 w-5 text-emerald-500" /> Developer
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage API keys, integrate the SDK, and access developer resources
          </p>
        </div>
      </FadeIn>

      {/* API Keys */}
      <FadeIn delay={0.1}>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Key className="h-4 w-4 text-emerald-500" /> API Keys
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Create key */}
            <div className="flex gap-2">
              <Input
                placeholder="Key name (e.g., Production, Staging)"
                value={newKeyName}
                onChange={(e) => setNewKeyName(e.target.value)}
                className="max-w-xs"
                onKeyDown={(e) => e.key === "Enter" && createKey()}
              />
              <Button onClick={createKey} disabled={!newKeyName.trim()} className="bg-emerald-600 hover:bg-emerald-700 gap-1.5">
                <Plus className="h-3 w-3" /> Create Key
              </Button>
            </div>

            {/* New key reveal */}
            {newKey && (
              <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-4 space-y-3">
                <p className="text-xs text-emerald-400 font-medium">
                  API key created — copy it now. It won&rsquo;t be shown again.
                </p>
                <div className="flex items-center gap-2">
                  <code className="text-xs font-mono bg-background px-3 py-2 rounded border border-border flex-1 truncate">
                    {showKey ? newKey : newKey.slice(0, 14) + "•".repeat(30)}
                  </code>
                  <Button size="sm" variant="outline" onClick={() => setShowKey(!showKey)} className="gap-1">
                    {showKey ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => copyText(newKey, "newkey")} className="gap-1">
                    {copied === "newkey" ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                    Copy
                  </Button>
                </div>
                <div className="rounded bg-muted/50 p-3">
                  <p className="text-[10px] text-muted-foreground mb-1">Add to your .env:</p>
                  <code className="text-xs font-mono text-emerald-400">WORDAI_API_KEY=&quot;{showKey ? newKey : newKey.slice(0, 14) + "..."}&quot;</code>
                </div>
              </div>
            )}

            {/* Key list */}
            {keys.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Your keys</p>
                {keys.map((k) => (
                  <div key={k.id} className="flex items-center justify-between rounded-lg border border-border p-3 hover:bg-accent/30 transition-colors">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`h-2 w-2 rounded-full ${k.status === "active" ? "bg-emerald-500" : "bg-red-500"}`} />
                      <div className="min-w-0">
                        <p className="text-sm font-medium">{k.name}</p>
                        <p className="text-xs text-muted-foreground font-mono">{k.keyPrefix}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Badge variant="outline" className={`text-[10px] ${k.status === "active" ? "text-emerald-400" : "text-red-400"}`}>
                        {k.status}
                      </Badge>
                      <Badge variant="outline" className="text-[10px]">
                        {new Date(k.createdAt || k.created).toLocaleDateString()}
                      </Badge>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => toggleKey(k.id, k.status)}
                        title={k.status === "active" ? "Revoke" : "Activate"}
                      >
                        {k.status === "active" ? <Ban className="h-3 w-3 text-amber-500" /> : <RotateCcw className="h-3 w-3 text-emerald-500" />}
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => deleteKey(k.id)}>
                        <Trash2 className="h-3 w-3 text-red-400" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {keys.length === 0 && !newKey && (
              <p className="text-sm text-muted-foreground text-center py-4">
                No API keys yet. Create one to start integrating.
              </p>
            )}
          </CardContent>
        </Card>
      </FadeIn>

      {/* SDK Integration */}
      <FadeIn delay={0.2}>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <Terminal className="h-4 w-4 text-emerald-500" /> SDK Integration
            </CardTitle>
            <Button
              size="sm"
              variant="outline"
              onClick={() => copyText(FULL_MARKDOWN, "markdown")}
              className="gap-1.5 text-xs"
            >
              {copied === "markdown" ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
              Copy Full Guide
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-xs text-muted-foreground mb-2">1. Install</p>
              <CodeBlock code={SDK_INSTALL} language="bash" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-2">2. Add to .env</p>
              <CodeBlock code={ENV_TEMPLATE} language="bash" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-2">3. Integrate</p>
              <CodeBlock code={SDK_USAGE} language="typescript" />
            </div>
          </CardContent>
        </Card>
      </FadeIn>

      {/* Copy for AI */}
      <FadeIn delay={0.3}>
        <Card className="border-emerald-500/20 bg-emerald-500/5">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium">Give this to any AI agent</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Copy the full markdown guide and paste it into Claude, ChatGPT, Cursor or any coding agent.
                  It will install the SDK, ask for your API key, and integrate automatically.
                </p>
              </div>
              <Button
                onClick={() => copyText(FULL_MARKDOWN, "ai-copy")}
                className="bg-emerald-600 hover:bg-emerald-700 gap-1.5 flex-shrink-0"
                size="sm"
              >
                {copied === "ai-copy" ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                Copy for AI
              </Button>
            </div>
          </CardContent>
        </Card>
      </FadeIn>
    </div>
  );
}
