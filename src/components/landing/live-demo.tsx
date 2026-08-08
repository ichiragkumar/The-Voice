"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "motion/react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Zap, AlertTriangle, Mic, MicOff, Send,
  CheckCircle, XCircle, User, Bot, ExternalLink,
  AudioLines, FileText, Target, Code, Database, Shield, Loader2,
} from "lucide-react";
import { DEMO_SCENARIOS } from "@/lib/demo-scenarios";
import Link from "next/link";

type Message = { role: "customer" | "agent"; text: string };
type StageStatus = "idle" | "active" | "ok" | "fail";

const PIPELINE = [
  { id: "audio", label: "Audio", icon: AudioLines },
  { id: "transcript", label: "Transcript", icon: FileText },
  { id: "entities", label: "Entities", icon: Target },
  { id: "tool", label: "Tool Call", icon: Code },
  { id: "backend", label: "Backend", icon: Database },
  { id: "verdict", label: "Verdict", icon: Shield },
];

export function LandingLiveDemo() {
  const [listening, setListening] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [stages, setStages] = useState<Record<string, StageStatus>>({});
  const [injectFailure, setInjectFailure] = useState(false);
  const [waveform, setWaveform] = useState<number[]>(new Array(60).fill(0.04));
  const [liveText, setLiveText] = useState("");
  const [typedText, setTypedText] = useState("");
  const [lastRunId, setLastRunId] = useState<string | null>(null);
  const [toolInfo, setToolInfo] = useState<{ name: string; args: Record<string, unknown> } | null>(null);
  const [failInfo, setFailInfo] = useState<{ expected: string; actual: string } | null>(null);
  const animRef = useRef<number>(0);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recognitionRef = useRef<any>(null);

  function resetAll() {
    setMessages([]);
    setStages({});
    setLiveText("");
    setWaveform(new Array(60).fill(0.04));
    setLastRunId(null);
    setToolInfo(null);
    setFailInfo(null);
    setProcessing(false);
  }

  function stopMic() {
    try { recognitionRef.current?.stop(); } catch {}
    recognitionRef.current = null;
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    cancelAnimationFrame(animRef.current);
    analyserRef.current = null;
    setListening(false);
    setWaveform(new Array(60).fill(0.04));
  }

  useEffect(() => () => stopMic(), []);

  const sttWorkingRef = useRef(false);

  async function toggleMic() {
    if (listening) {
      stopMic();
      const text = liveText;
      if (text && text !== "Listening..." && text !== "Mic active — speak now (transcript requires Chrome)") {
        await runVerification(text);
        setLiveText("");
      }
      return;
    }

    resetAll();
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const ctx = new AudioContext();
      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 128;
      analyser.smoothingTimeConstant = 0.4;
      source.connect(analyser);
      analyserRef.current = analyser;

      const fftData = new Uint8Array(analyser.frequencyBinCount);
      function draw() {
        if (!analyserRef.current) return;
        analyserRef.current.getByteFrequencyData(fftData);
        setWaveform(Array.from(fftData.slice(0, 60)).map((v) => Math.max(0.04, v / 255)));
        animRef.current = requestAnimationFrame(draw);
      }
      draw();

      // Browser STT — works in Chrome, blocked in Brave
      sttWorkingRef.current = false;
      const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SR) {
        try {
          const rec = new SR();
          rec.continuous = true;
          rec.interimResults = true;
          rec.lang = "en-IN";
          rec.onresult = (e: any) => {
            sttWorkingRef.current = true;
            let full = "";
            for (let i = 0; i < e.results.length; i++) full += e.results[i][0].transcript;
            setLiveText(full);
          };
          rec.onerror = () => {
            if (!sttWorkingRef.current) setLiveText("Mic active — speak now (transcript requires Chrome)");
          };
          rec.onend = () => { if (streamRef.current) try { rec.start(); } catch {} };
          rec.start();
          recognitionRef.current = rec;
          setTimeout(() => {
            if (!sttWorkingRef.current) setLiveText("Mic active — speak now (transcript requires Chrome)");
          }, 2000);
        } catch {
          setLiveText("Mic active — speak now (transcript requires Chrome)");
        }
      } else {
        setLiveText("Mic active — speak now (transcript requires Chrome)");
      }

      setListening(true);
      setStages({ audio: "active" });
    } catch {
      setLiveText("");
    }
  }

  function handleTypedSubmit() {
    if (!typedText.trim() || processing) return;
    resetAll();
    runVerification(typedText.trim());
    setTypedText("");
  }

  function loadScenario(transcript: string) {
    resetAll();
    runVerification(transcript);
  }

  async function runVerification(text: string) {
    stopMic();
    setProcessing(true);
    setMessages([{ role: "customer", text }]);
    setStages({ audio: "ok", transcript: "active" });

    await delay(300);
    setStages((s) => ({ ...s, transcript: "ok", entities: "active" }));

    await delay(300);
    setStages((s) => ({ ...s, entities: "ok", tool: "active" }));

    try {
      const res = await fetch("/api/claude", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcript: text, locale: "hi-IN", inject_failure: injectFailure }),
      });
      const data = await res.json();

      setToolInfo({ name: data.tool.name, args: data.tool.args });

      await delay(400);
      setStages((s) => ({ ...s, tool: "ok", backend: "active" }));

      await delay(500);
      const backendOk = data.finalState?.status === data.expectedState && !data.injectedFailure;

      if (!backendOk) {
        setFailInfo({ expected: data.expectedState || "cancelled", actual: data.finalState?.status || "active" });
      }

      setStages((s) => ({
        ...s,
        backend: backendOk ? "ok" : "fail",
        verdict: backendOk ? "ok" : "fail",
      }));

      setMessages((m) => [...m, { role: "agent", text: data.reply }]);

      if (data.testRunId) setLastRunId(data.testRunId);

      // Play TTS
      try {
        const tts = await fetch("/api/tts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: data.reply, voice: "Ananya" }),
        });
        if (tts.ok) new Audio(URL.createObjectURL(await tts.blob())).play();
      } catch {}
    } catch {
      setStages((s) => ({ ...s, tool: "fail", backend: "fail", verdict: "fail" }));
      setMessages((m) => [...m, { role: "agent", text: "Error connecting to agent" }]);
    }

    setProcessing(false);
  }

  const hasResult = Object.keys(stages).length > 0;
  const isFail = stages.verdict === "fail";
  const isPass = stages.verdict === "ok";

  return (
    <section id="live-demo" className="py-20 px-6">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center space-y-2">
          <Badge variant="outline" className="gap-1.5 border-emerald-500/30 text-emerald-500">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Interactive Demo
          </Badge>
          <h2 className="text-2xl sm:text-4xl font-bold">Hear the customer. Verify the outcome.</h2>
          <p className="text-sm text-muted-foreground">Test voice conversations with AI agents and validate outcomes end-to-end.</p>
        </motion.div>

        {/* Mode toggle */}
        <div className="flex justify-center gap-2">
          <Button variant={!injectFailure ? "default" : "outline"} size="sm" onClick={() => { setInjectFailure(false); resetAll(); }} className={!injectFailure ? "bg-emerald-600 hover:bg-emerald-700 gap-1.5" : "gap-1.5"}>
            <CheckCircle className="h-3 w-3" /> Working Agent
          </Button>
          <Button variant={injectFailure ? "default" : "outline"} size="sm" onClick={() => { setInjectFailure(true); resetAll(); }} className={injectFailure ? "bg-red-600 hover:bg-red-700 gap-1.5" : "gap-1.5"}>
            <AlertTriangle className="h-3 w-3" /> Broken Agent
          </Button>
        </div>

        {/* Scenario buttons */}
        <div className="flex justify-center gap-2 flex-wrap">
          {DEMO_SCENARIOS.map((s) => (
            <Button key={s.id} variant="outline" size="sm" className="text-xs" onClick={() => loadScenario(s.transcript)} disabled={processing}>
              {s.label}
            </Button>
          ))}
        </div>

        {/* Two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* LEFT: Input */}
          <div className="space-y-4">
            <div className="rounded-xl border border-border bg-card p-5 space-y-4">
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Input</p>

              {/* Waveform */}
              <div className="flex items-center justify-center gap-[2px] h-16 bg-muted/30 rounded-lg px-3">
                {waveform.map((level, i) => (
                  <motion.div key={i} className={`w-[2px] rounded-full ${listening ? "bg-emerald-500" : "bg-emerald-500/30"}`} animate={{ height: Math.max(2, level * 64) }} transition={{ duration: 0.06 }} />
                ))}
              </div>

              {/* Live transcript */}
              {listening && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-lg border border-emerald-500/20 px-3 py-2 min-h-[48px]">
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
                    <span className="text-[9px] text-emerald-400 uppercase">Live</span>
                  </div>
                  <p className="text-sm">{liveText || <span className="text-muted-foreground italic">Speak now...</span>}</p>
                </motion.div>
              )}

              {/* Mic button */}
              <div className="flex justify-center">
                <Button onClick={toggleMic} disabled={processing} size="sm" className={`gap-2 px-5 ${listening ? "bg-red-500 hover:bg-red-600" : "bg-emerald-600 hover:bg-emerald-700"}`}>
                  {listening ? <><MicOff className="h-3.5 w-3.5" /> Stop &amp; Verify</> : <><Mic className="h-3.5 w-3.5" /> Start Mic</>}
                </Button>
              </div>

              {/* Text input */}
              <div className="flex gap-2">
                <Input placeholder="Or type: Mera order cancel kar do" value={typedText} onChange={(e) => setTypedText(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleTypedSubmit()} className="text-xs h-9" disabled={processing || listening} />
                <Button size="icon" onClick={handleTypedSubmit} disabled={!typedText.trim() || processing || listening} className="bg-emerald-600 hover:bg-emerald-700 h-9 w-9">
                  {processing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
                </Button>
              </div>
            </div>
          </div>

          {/* RIGHT: Results */}
          <div className="space-y-4">
            {/* Transcript */}
            <div className="rounded-xl border border-border bg-card p-5 min-h-[120px]">
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-3 border-b border-border pb-2">Transcript</p>
              {messages.length === 0 && !processing ? (
                <p className="text-sm text-muted-foreground italic">Results will appear here...</p>
              ) : (
                <div className="space-y-3">
                  {messages.map((msg, i) => (
                    <motion.div key={i} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }} className="flex items-start gap-2">
                      <div className={`h-6 w-6 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === "customer" ? "bg-muted" : "bg-emerald-500/10"}`}>
                        {msg.role === "customer" ? <User className="h-3 w-3 text-muted-foreground" /> : <Bot className="h-3 w-3 text-emerald-500" />}
                      </div>
                      <div>
                        <span className={`text-[10px] font-semibold ${msg.role === "customer" ? "text-blue-400" : "text-emerald-400"}`}>
                          {msg.role === "customer" ? "Customer" : "Agent"}
                        </span>
                        <p className="text-sm">{msg.text}</p>
                      </div>
                    </motion.div>
                  ))}
                  {processing && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Loader2 className="h-3 w-3 animate-spin" /> Thinking...
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Tool call */}
            {toolInfo && (
              <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl border border-border bg-card p-4">
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-1">Tool Called</p>
                <code className="text-xs font-mono text-emerald-400">
                  {toolInfo.name}({Object.entries(toolInfo.args).map(([k, v]) => `${k}: "${v}"`).join(", ")})
                </code>
              </motion.div>
            )}

            {/* Fail card */}
            {failInfo && (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="rounded-xl border border-red-500/30 bg-red-500/10 p-4">
                <p className="text-[10px] text-red-400 font-semibold mb-2">FALSE CONFIRMATION</p>
                <div className="grid grid-cols-2 gap-2">
                  <div className="rounded bg-emerald-500/10 px-2 py-1.5">
                    <p className="text-[9px] text-emerald-400">Agent said</p>
                    <p className="text-xs font-mono">{failInfo.expected}</p>
                  </div>
                  <div className="rounded bg-red-500/10 px-2 py-1.5">
                    <p className="text-[9px] text-red-400">Backend</p>
                    <p className="text-xs font-mono">{failInfo.actual}</p>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>

        {/* 6-stage pipeline */}
        {hasResult && (
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {PIPELINE.map((stage, idx) => {
              const status = stages[stage.id] || "idle";
              const Icon = stage.icon;
              return (
                <motion.div key={stage.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.08 }}
                  className={`rounded-xl border p-3 flex flex-col items-center gap-1.5 transition-all ${
                    status === "ok" ? "border-emerald-500/30 bg-emerald-500/5" :
                    status === "fail" ? "border-red-500/30 bg-red-500/5" :
                    status === "active" ? "border-emerald-500/20 bg-emerald-500/5" :
                    "border-border bg-card"}`}>
                  <Icon className={`h-5 w-5 ${status === "ok" ? "text-emerald-500" : status === "fail" ? "text-red-500" : status === "active" ? "text-emerald-500 animate-pulse" : "text-muted-foreground"}`} />
                  <span className="text-[10px] font-medium">{stage.label}</span>
                  {status === "ok" && <><CheckCircle className="h-3.5 w-3.5 text-emerald-500" /><span className="text-[9px] text-emerald-400">OK</span></>}
                  {status === "fail" && <><XCircle className="h-3.5 w-3.5 text-red-500" /><span className="text-[9px] text-red-400">FAIL</span></>}
                  {status === "active" && <Loader2 className="h-3.5 w-3.5 text-emerald-500 animate-spin" />}
                </motion.div>
              );
            })}
          </div>
        )}

        {/* View full trace link */}
        {(isPass || isFail) && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center space-y-2">
            <p className="text-[10px] text-muted-foreground">
              Agent: {injectFailure ? "Broken demo" : "Demo / Claude"} &middot; STT: Browser &middot; Tools: Mock staging &middot; TTS: Maya &middot; Saved to DB
            </p>
            <Link href="/runs" className="inline-flex items-center gap-1 text-xs text-emerald-400 hover:underline">
              View all traces <ExternalLink className="h-3 w-3" />
            </Link>
          </motion.div>
        )}
      </div>
    </section>
  );
}

function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}
