"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Zap, AlertTriangle, Play, ArrowRight, Mic, MicOff, Send,
  CheckCircle, XCircle, User, Bot, ExternalLink,
  AudioLines, FileText, Target, Code, Database, Shield, Loader2,
  ShoppingCart, Volume2, MessageSquare,
} from "lucide-react";

type StageStatus = "idle" | "active" | "ok" | "fail";

const PIPELINE = [
  { id: "audio", label: "Audio", icon: AudioLines },
  { id: "transcript", label: "Transcript", icon: FileText },
  { id: "entities", label: "Entities", icon: Target },
  { id: "tool", label: "Tool Call", icon: Code },
  { id: "backend", label: "Backend", icon: Database },
  { id: "verdict", label: "Verdict", icon: Shield },
];

const ORDER = {
  id: "ORD-123",
  item: "Wireless Earbuds",
  amount: 1499,
  status: "not_dispatched",
};

const CUSTOMER_TEXT = "Mera order ORD-123 cancel kar do. Abhi dispatch nahi hua.";

export function LandingLiveDemo() {
  const [mode, setMode] = useState<"working" | "broken">("working");
  const [step, setStep] = useState(0);
  const [stages, setStages] = useState<Record<string, StageStatus>>({});
  const [running, setRunning] = useState(false);

  function reset() {
    setStep(0);
    setStages({});
    setRunning(false);
  }

  async function runDemo() {
    if (running) return;
    setRunning(true);
    setStep(1);

    // Step 1: Audio received
    setStages({ audio: "active" });
    await delay(800);
    setStages({ audio: "ok" });

    // Step 2: Transcript
    setStep(2);
    setStages((s) => ({ ...s, transcript: "active" }));
    await delay(600);
    setStages((s) => ({ ...s, transcript: "ok" }));

    // Step 3: Entities
    setStep(3);
    setStages((s) => ({ ...s, entities: "active" }));
    await delay(600);
    setStages((s) => ({ ...s, entities: "ok" }));

    // Step 4: Tool call
    setStep(4);
    setStages((s) => ({ ...s, tool: "active" }));

    try {
      await fetch("/api/claude", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcript: CUSTOMER_TEXT, locale: "hi-IN", inject_failure: mode === "broken" }),
      });
    } catch {}

    await delay(500);
    setStages((s) => ({ ...s, tool: "ok" }));

    // Step 5: Backend state
    setStep(5);
    setStages((s) => ({ ...s, backend: "active" }));
    await delay(800);

    const backendOk = mode === "working";
    setStages((s) => ({ ...s, backend: backendOk ? "ok" : "fail" }));

    // Step 6: Verdict
    setStep(6);
    await delay(400);
    setStages((s) => ({ ...s, verdict: backendOk ? "ok" : "fail" }));

    // Play TTS
    try {
      const reply = backendOk
        ? "Order ORD-123 ki cancellation process ho rahi hai."
        : "Order ORD-123 cancel ho gaya hai. Confirmed.";
      const tts = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: reply, voice: "Ananya" }),
      });
      if (tts.ok) new Audio(URL.createObjectURL(await tts.blob())).play();
    } catch {}

    setRunning(false);
  }

  return (
    <section id="live-demo" className="py-20 px-6">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center space-y-2">
          <Badge variant="outline" className="gap-1.5 border-emerald-500/30 text-emerald-500">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Interactive Demo
          </Badge>
          <h2 className="text-2xl sm:text-4xl font-bold">See The Voice catch a real failure</h2>
          <p className="text-sm text-muted-foreground max-w-lg mx-auto">
            A customer calls to cancel an order. The agent responds. But did the backend actually cancel it?
          </p>
        </motion.div>

        {/* Mode toggle */}
        <div className="flex justify-center gap-3">
          <Button variant={mode === "working" ? "default" : "outline"} size="sm" onClick={() => { setMode("working"); reset(); }} className={mode === "working" ? "bg-emerald-600 hover:bg-emerald-700 gap-1.5" : "gap-1.5"}>
            <CheckCircle className="h-3 w-3" /> Working Agent
          </Button>
          <Button variant={mode === "broken" ? "default" : "outline"} size="sm" onClick={() => { setMode("broken"); reset(); }} className={mode === "broken" ? "bg-red-600 hover:bg-red-700 gap-1.5" : "gap-1.5"}>
            <AlertTriangle className="h-3 w-3" /> Broken Agent
          </Button>
        </div>

        {/* Two columns */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* LEFT: The story */}
          <div className="space-y-4">
            {/* Order context */}
            <div className="rounded-xl border border-border bg-card p-5">
              <div className="flex items-center gap-2 mb-3">
                <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Order</p>
              </div>
              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Order ID</span><span className="font-mono">{ORDER.id}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Item</span><span>{ORDER.item}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Amount</span><span className="font-mono">₹{ORDER.amount}</span></div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status</span>
                  <Badge variant="outline" className="text-[10px]">{step >= 5 && mode === "working" ? "cancelled" : ORDER.status}</Badge>
                </div>
              </div>
            </div>

            {/* Customer says */}
            <AnimatePresence>
              {step >= 1 && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl border border-border bg-card p-5">
                  <div className="flex items-start gap-3">
                    <div className="h-7 w-7 rounded-full bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                      <User className="h-3.5 w-3.5 text-blue-400" />
                    </div>
                    <div>
                      <p className="text-[10px] text-blue-400 font-semibold uppercase">Customer</p>
                      <p className="text-sm mt-1 italic">&ldquo;{CUSTOMER_TEXT}&rdquo;</p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Entities extracted */}
            <AnimatePresence>
              {step >= 3 && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl border border-border bg-card p-5">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-3">Entities Extracted</p>
                  <div className="flex gap-2 flex-wrap">
                    <Badge variant="outline" className="text-xs font-mono">order_id: ORD-123</Badge>
                    <Badge variant="outline" className="text-xs font-mono">action: cancel</Badge>
                    <Badge variant="outline" className="text-xs font-mono">status: not_dispatched</Badge>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Agent response */}
            <AnimatePresence>
              {step >= 4 && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl border border-border bg-card p-5">
                  <div className="flex items-start gap-3">
                    <div className="h-7 w-7 rounded-full bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                      <Bot className="h-3.5 w-3.5 text-emerald-500" />
                    </div>
                    <div>
                      <p className="text-[10px] text-emerald-400 font-semibold uppercase">Agent</p>
                      <p className="text-sm mt-1">
                        {mode === "broken"
                          ? "Order ORD-123 cancel ho gaya hai. Confirmed."
                          : "Order ORD-123 ki cancellation process ho rahi hai."}
                      </p>
                      <div className="mt-2">
                        <code className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded">
                          cancel_order(order_id: &quot;ORD-123&quot;)
                        </code>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* RIGHT: Verification result */}
          <div className="space-y-4">
            {/* Pipeline */}
            <div className="rounded-xl border border-border bg-card p-5">
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-4">Verification Pipeline</p>
              <div className="grid grid-cols-3 gap-2">
                {PIPELINE.map((stage) => {
                  const status = stages[stage.id] || "idle";
                  const Icon = stage.icon;
                  return (
                    <motion.div key={stage.id} animate={{ scale: status === "active" ? 1.02 : 1 }}
                      className={`rounded-lg border p-3 flex flex-col items-center gap-1 transition-all ${
                        status === "ok" ? "border-emerald-500/30 bg-emerald-500/5" :
                        status === "fail" ? "border-red-500/30 bg-red-500/5" :
                        status === "active" ? "border-emerald-500/20 bg-emerald-500/5" :
                        "border-border"}`}>
                      <Icon className={`h-4 w-4 ${status === "ok" ? "text-emerald-500" : status === "fail" ? "text-red-500" : status === "active" ? "text-emerald-500 animate-pulse" : "text-muted-foreground/50"}`} />
                      <span className="text-[9px] font-medium">{stage.label}</span>
                      {status === "ok" && <CheckCircle className="h-3 w-3 text-emerald-500" />}
                      {status === "fail" && <XCircle className="h-3 w-3 text-red-500" />}
                      {status === "active" && <Loader2 className="h-3 w-3 text-emerald-500 animate-spin" />}
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Backend state check */}
            <AnimatePresence>
              {step >= 5 && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl border border-border bg-card p-5">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-3">Backend State Check</p>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Tool result</span>
                      <span className="font-mono text-emerald-400">accepted</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Agent said</span>
                      <span className={mode === "broken" ? "text-red-400" : "text-emerald-400"}>
                        {mode === "broken" ? '"Confirmed / cancelled"' : '"Process ho rahi hai"'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Actual backend</span>
                      <span className={`font-mono font-semibold ${mode === "broken" ? "text-red-400" : "text-emerald-400"}`}>
                        {mode === "broken" ? "active ✗" : "cancelled ✓"}
                      </span>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Verdict */}
            <AnimatePresence>
              {step >= 6 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ type: "spring" }}
                  className={`rounded-xl border p-5 ${mode === "broken" ? "border-red-500/30 bg-red-500/10" : "border-emerald-500/30 bg-emerald-500/10"}`}
                >
                  {mode === "broken" ? (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <XCircle className="h-5 w-5 text-red-500" />
                        <span className="text-sm font-bold text-red-400">FAIL — FALSE CONFIRMATION</span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Agent told the customer &ldquo;cancelled&rdquo; but the order is still <span className="text-red-400 font-semibold">active</span> in the database.
                      </p>
                      <div className="rounded bg-red-500/10 border border-red-500/20 p-3">
                        <p className="text-[10px] text-red-400">First divergence: <span className="font-mono">final_state.status</span></p>
                        <p className="text-xs text-muted-foreground mt-1">Fix: Agent must not confirm completion before backend state agrees.</p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <CheckCircle className="h-6 w-6 text-emerald-500" />
                      <div>
                        <p className="text-sm font-bold text-emerald-400">PASS — All layers match</p>
                        <p className="text-xs text-muted-foreground">Entity, tool call, backend state, and agent confirmation all agree.</p>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Run button */}
        <div className="text-center space-y-3">
          <Button
            onClick={step === 0 ? runDemo : reset}
            disabled={running}
            size="lg"
            className={step === 0 ? "bg-emerald-600 hover:bg-emerald-700 gap-2 px-8" : "gap-2 px-8"}
            variant={step === 0 ? "default" : "outline"}
          >
            {running ? (
              <><Loader2 className="h-4 w-4 animate-spin" /> Running...</>
            ) : step === 0 ? (
              <><Play className="h-4 w-4" /> Run Demo</>
            ) : (
              <><ArrowRight className="h-4 w-4" /> Run Again</>
            )}
          </Button>

          {step >= 6 && (
            <div className="space-y-1">
              <p className="text-[10px] text-muted-foreground">
                Agent: {mode === "broken" ? "Broken demo" : "Working demo"} · Tools: Mock staging · TTS: Maya · Saved to DB
              </p>
              <a href="/runs" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-emerald-400 hover:underline">
                View trace <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          )}
        </div>

        {/* Why this matters */}
        {step >= 6 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl border border-border bg-card p-6 max-w-2xl mx-auto">
            <h3 className="text-sm font-bold mb-3">Why does this matter?</h3>
            {mode === "broken" ? (
              <div className="space-y-3 text-sm text-muted-foreground">
                <p>This customer now believes their order is cancelled. They won&rsquo;t check again. But the order will ship, charge their card, and they&rsquo;ll call back angry.</p>
                <div className="grid grid-cols-3 gap-3 pt-2">
                  <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-center">
                    <p className="text-lg font-bold text-red-400">₹1,499</p>
                    <p className="text-[10px] text-muted-foreground">Wrong charge</p>
                  </div>
                  <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-center">
                    <p className="text-lg font-bold text-red-400">2x</p>
                    <p className="text-[10px] text-muted-foreground">Repeat contact</p>
                  </div>
                  <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-center">
                    <p className="text-lg font-bold text-red-400">-1</p>
                    <p className="text-[10px] text-muted-foreground">Lost customer</p>
                  </div>
                </div>
                <p className="text-xs"><span className="text-red-400 font-medium">The Voice catches this before release.</span> The agent sounds perfect. The transaction failed silently.</p>
              </div>
            ) : (
              <div className="space-y-3 text-sm text-muted-foreground">
                <p>The working agent uses cautious language — &ldquo;process ho rahi hai&rdquo; (processing) — and the backend confirms the cancellation actually happened.</p>
                <div className="grid grid-cols-3 gap-3 pt-2">
                  <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-3 text-center">
                    <p className="text-lg font-bold text-emerald-400">✓</p>
                    <p className="text-[10px] text-muted-foreground">Truthful</p>
                  </div>
                  <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-3 text-center">
                    <p className="text-lg font-bold text-emerald-400">0</p>
                    <p className="text-[10px] text-muted-foreground">Repeat contacts</p>
                  </div>
                  <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-3 text-center">
                    <p className="text-lg font-bold text-emerald-400">+1</p>
                    <p className="text-[10px] text-muted-foreground">Trust earned</p>
                  </div>
                </div>
                <p className="text-xs"><span className="text-emerald-400 font-medium">This is the release you can ship.</span> Every layer verified. No silent failures.</p>
              </div>
            )}
          </motion.div>
        )}
        {/* Voice Chat */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center space-y-3 pt-8">
          <h3 className="text-xl font-bold">Try it yourself</h3>
          <p className="text-sm text-muted-foreground">Speak or type to the agent. Each response is verified against the backend in real time.</p>
        </motion.div>

        <VoiceChat injectFailure={mode === "broken"} />
      </div>
    </section>
  );
}

function VoiceChat({ injectFailure }: { injectFailure: boolean }) {
  const [messages, setMessages] = useState<Array<{ role: "customer" | "agent" | "system"; text: string; tool?: string; verdict?: "pass" | "fail" }>>([
    { role: "system", text: "You have order ORD-123 (Wireless Earbuds, ₹1,499). Try: \"Cancel my order\", \"Refund UPI par chahiye\", or ask anything." },
  ]);
  const [inputText, setInputText] = useState("");
  const [listening, setListening] = useState(false);
  const [liveText, setLiveText] = useState("");
  const [processing, setProcessing] = useState(false);
  const [waveform, setWaveform] = useState<number[]>(new Array(40).fill(0.04));
  const recognitionRef = useRef<any>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animRef = useRef<number>(0);
  const silenceRef = useRef<NodeJS.Timeout | null>(null);
  const lastTextRef = useRef("");
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  function stopMic() {
    if (silenceRef.current) clearTimeout(silenceRef.current);
    try { recognitionRef.current?.stop(); } catch {}
    recognitionRef.current = null;
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    cancelAnimationFrame(animRef.current);
    analyserRef.current = null;
    setListening(false);
    setWaveform(new Array(40).fill(0.04));
  }

  async function toggleMic() {
    if (listening) {
      stopMic();
      if (lastTextRef.current.trim()) {
        await sendMessage(lastTextRef.current.trim());
        setLiveText("");
        lastTextRef.current = "";
      }
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const ctx = new AudioContext();
      const src = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 128;
      analyser.smoothingTimeConstant = 0.4;
      src.connect(analyser);
      analyserRef.current = analyser;

      const d = new Uint8Array(analyser.frequencyBinCount);
      function draw() {
        if (!analyserRef.current) return;
        analyserRef.current.getByteFrequencyData(d);
        setWaveform(Array.from(d.slice(0, 40)).map((v) => Math.max(0.04, v / 255)));
        animRef.current = requestAnimationFrame(draw);
      }
      draw();

      const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SR) {
        const rec = new SR();
        rec.continuous = true;
        rec.interimResults = true;
        rec.lang = "en-IN";
        rec.onresult = (e: any) => {
          let full = "";
          for (let i = 0; i < e.results.length; i++) full += e.results[i][0].transcript;
          setLiveText(full);
          lastTextRef.current = full;
          if (silenceRef.current) clearTimeout(silenceRef.current);
          silenceRef.current = setTimeout(() => {
            if (lastTextRef.current.trim() && streamRef.current) {
              stopMic();
              sendMessage(lastTextRef.current.trim());
              setLiveText("");
              lastTextRef.current = "";
            }
          }, 3000);
        };
        rec.onerror = () => {};
        rec.onend = () => { if (streamRef.current) try { rec.start(); } catch {} };
        rec.start();
        recognitionRef.current = rec;
      }

      setListening(true);
    } catch {}
  }

  async function sendMessage(text: string) {
    if (!text.trim() || processing) return;
    setProcessing(true);
    setMessages((m) => [...m, { role: "customer", text }]);

    try {
      const res = await fetch("/api/claude", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcript: text, locale: "hi-IN", inject_failure: injectFailure }),
      });
      const data = await res.json();
      const backendOk = data.finalState?.status === data.expectedState && !data.injectedFailure;

      setMessages((m) => [...m, {
        role: "agent",
        text: data.reply,
        tool: `${data.tool.name}(${Object.entries(data.tool.args).map(([k, v]) => `${k}: "${v}"`).join(", ")})`,
        verdict: backendOk ? "pass" : "fail",
      }]);

      try {
        const tts = await fetch("/api/tts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: data.reply, voice: "Ananya" }),
        });
        if (tts.ok) new Audio(URL.createObjectURL(await tts.blob())).play();
      } catch {}
    } catch {
      setMessages((m) => [...m, { role: "agent", text: "Connection error. Try again." }]);
    }

    setProcessing(false);
  }

  function handleSubmit() {
    if (inputText.trim()) {
      sendMessage(inputText.trim());
      setInputText("");
    }
  }

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden max-w-2xl mx-auto">
      {/* Chat header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-muted/30">
        <MessageSquare className="h-4 w-4 text-emerald-500" />
        <span className="text-xs font-medium">Voice Chat with Agent</span>
        <Badge variant="outline" className={`ml-auto text-[9px] ${injectFailure ? "text-red-400 border-red-500/30" : "text-emerald-400 border-emerald-500/30"}`}>
          {injectFailure ? "Broken Agent" : "Working Agent"}
        </Badge>
      </div>

      {/* Messages */}
      <div className="h-72 overflow-y-auto p-4 space-y-3">
        {messages.map((msg, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i === messages.length - 1 ? 0 : 0 }}>
            {msg.role === "system" ? (
              <p className="text-xs text-muted-foreground text-center bg-muted/30 rounded-lg px-3 py-2">{msg.text}</p>
            ) : (
              <div className={`flex gap-2 ${msg.role === "customer" ? "" : ""}`}>
                <div className={`h-6 w-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${msg.role === "customer" ? "bg-blue-500/10" : "bg-emerald-500/10"}`}>
                  {msg.role === "customer" ? <User className="h-3 w-3 text-blue-400" /> : <Bot className="h-3 w-3 text-emerald-500" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm">{msg.text}</p>
                  {msg.tool && (
                    <code className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded mt-1 inline-block">{msg.tool}</code>
                  )}
                  {msg.verdict && (
                    <div className={`mt-1 inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded ${msg.verdict === "pass" ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"}`}>
                      {msg.verdict === "pass" ? <><CheckCircle className="h-2.5 w-2.5" /> Backend verified</> : <><XCircle className="h-2.5 w-2.5" /> Backend mismatch!</>}
                    </div>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        ))}
        {liveText && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.6 }} className="flex gap-2">
            <div className="h-6 w-6 rounded-full bg-blue-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
              <User className="h-3 w-3 text-blue-400" />
            </div>
            <p className="text-sm italic text-muted-foreground">{liveText}</p>
          </motion.div>
        )}
        {processing && (
          <div className="flex gap-2 items-center">
            <div className="h-6 w-6 rounded-full bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
              <Bot className="h-3 w-3 text-emerald-500" />
            </div>
            <div className="flex gap-1">
              {[0, 1, 2].map((i) => (
                <motion.div key={i} className="h-1.5 w-1.5 rounded-full bg-emerald-500" animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.2 }} />
              ))}
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Waveform when listening */}
      {listening && (
        <div className="px-4 py-2 border-t border-border">
          <div className="flex items-center justify-center gap-[2px] h-8">
            {waveform.map((l, i) => (
              <motion.div key={i} className="w-[2px] rounded-full bg-emerald-500" animate={{ height: Math.max(2, l * 32) }} transition={{ duration: 0.06 }} />
            ))}
          </div>
        </div>
      )}

      {/* Input bar */}
      <div className="flex items-center gap-2 p-3 border-t border-border">
        <Button size="icon" variant={listening ? "destructive" : "outline"} onClick={toggleMic} disabled={processing} className="h-9 w-9 flex-shrink-0">
          {listening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
        </Button>
        <Input placeholder="Type or speak..." value={inputText} onChange={(e) => setInputText(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleSubmit()} className="text-sm h-9" disabled={processing || listening} />
        <Button size="icon" onClick={handleSubmit} disabled={!inputText.trim() || processing || listening} className="bg-emerald-600 hover:bg-emerald-700 h-9 w-9 flex-shrink-0">
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}
