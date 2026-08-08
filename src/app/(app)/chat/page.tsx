"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "motion/react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Mic, MicOff, Send, User, Bot, CheckCircle, XCircle,
  ShoppingCart, Loader2, MessageSquare, Volume2,
} from "lucide-react";

type Message = {
  id: string;
  role: string;
  text: string;
  toolCall: string | null;
  verdict: string | null;
  createdAt: string;
};

type Order = {
  orderId: string;
  item: string;
  amount: number;
  status: string;
};

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [input, setInput] = useState("");
  const [lang, setLang] = useState("english");
  const [processing, setProcessing] = useState(false);
  const [listening, setListening] = useState(false);
  const [liveText, setLiveText] = useState("");
  const [waveform, setWaveform] = useState<number[]>(new Array(30).fill(0.04));
  const chatEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animRef = useRef<number>(0);
  const silenceRef = useRef<NodeJS.Timeout | null>(null);
  const lastTextRef = useRef("");

  useEffect(() => {
    fetch("/api/chat/history").then((r) => r.json()).then(setMessages);
    fetch("/api/orders").then((r) => r.json()).then(setOrders);
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, liveText]);

  function refreshOrders() {
    fetch("/api/orders").then((r) => r.json()).then(setOrders);
  }

  function stopMic() {
    if (silenceRef.current) clearTimeout(silenceRef.current);
    try { recognitionRef.current?.stop(); } catch {}
    recognitionRef.current = null;
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    cancelAnimationFrame(animRef.current);
    analyserRef.current = null;
    setListening(false);
    setWaveform(new Array(30).fill(0.04));
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
      analyser.fftSize = 64;
      analyser.smoothingTimeConstant = 0.4;
      src.connect(analyser);
      analyserRef.current = analyser;

      const d = new Uint8Array(analyser.frequencyBinCount);
      function draw() {
        if (!analyserRef.current) return;
        analyserRef.current.getByteFrequencyData(d);
        setWaveform(Array.from(d.slice(0, 30)).map((v) => Math.max(0.04, v / 255)));
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
            if (lastTextRef.current.trim()) {
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

    const customerMsg: Message = {
      id: `temp-${Date.now()}`,
      role: "customer",
      text,
      toolCall: null,
      verdict: null,
      createdAt: new Date().toISOString(),
    };
    setMessages((m) => [...m, customerMsg]);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, language: lang }),
      });
      const data = await res.json();

      const agentMsg: Message = {
        id: `temp-${Date.now()}-agent`,
        role: "agent",
        text: data.reply,
        toolCall: data.tool?.name !== "no_action" ? JSON.stringify(data.tool) : null,
        verdict: data.verdict,
        createdAt: new Date().toISOString(),
      };
      setMessages((m) => [...m, agentMsg]);
      refreshOrders();

      try {
        const tts = await fetch("/api/tts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: data.reply, voice: "Ananya", language: ({ hindi:"hi", english:"en", kannada:"kn", tamil:"ta", telugu:"te", malayalam:"ml", bengali:"bn", gujarati:"gu", marathi:"mr", punjabi:"pa", odia:"or" } as Record<string,string>)[lang] }),
        });
        if (tts.ok) new Audio(URL.createObjectURL(await tts.blob())).play();
      } catch {}
    } catch {
      setMessages((m) => [...m, { id: `err-${Date.now()}`, role: "agent", text: "Connection error.", toolCall: null, verdict: null, createdAt: new Date().toISOString() }]);
    }

    setProcessing(false);
  }

  function handleSubmit() {
    if (input.trim()) {
      sendMessage(input.trim());
      setInput("");
    }
  }

  const STATUS_COLORS: Record<string, string> = {
    not_dispatched: "text-amber-400",
    shipped: "text-blue-400",
    delivered: "text-emerald-400",
    cancelled: "text-red-400",
  };

  return (
    <div className="flex gap-4 h-[calc(100vh-5rem)] max-w-6xl">
      {/* Orders sidebar */}
      <div className="hidden lg:block w-64 flex-shrink-0 space-y-2 overflow-y-auto">
        <div className="flex items-center gap-2 mb-3">
          <ShoppingCart className="h-4 w-4 text-emerald-500" />
          <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Your Orders</span>
        </div>
        {orders.map((o) => (
          <Card key={o.orderId} className="hover:border-emerald-500/20 transition-all">
            <CardContent className="py-3 px-3">
              <p className="text-xs font-medium truncate">{o.item}</p>
              <div className="flex items-center justify-between mt-1">
                <span className="text-[10px] font-mono text-muted-foreground">{o.orderId}</span>
                <span className={`text-[10px] font-medium ${STATUS_COLORS[o.status] || ""}`}>
                  {o.status.replace(/_/g, " ")}
                </span>
              </div>
              <p className="text-[10px] text-muted-foreground mt-0.5">₹{o.amount}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Chat area */}
      <div className="flex-1 flex flex-col rounded-xl border border-border bg-card overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-muted/30">
          <MessageSquare className="h-4 w-4 text-emerald-500" />
          <span className="text-sm font-medium">ShopEasy Support</span>
          <select
            value={lang}
            onChange={(e) => setLang(e.target.value)}
            className="ml-auto text-[10px] bg-transparent border border-border rounded px-2 py-1 text-muted-foreground"
          >
            <option value="english">English</option>
            <option value="hinglish">Hinglish</option>
            <option value="hindi">Hindi</option>
            <option value="kannada">ಕನ್ನಡ Kannada</option>
            <option value="tamil">தமிழ் Tamil</option>
            <option value="telugu">తెలుగు Telugu</option>
            <option value="malayalam">മലയാളം Malayalam</option>
            <option value="bengali">বাংলা Bengali</option>
            <option value="gujarati">ગુજરાતી Gujarati</option>
            <option value="marathi">मराठी Marathi</option>
            <option value="punjabi">ਪੰਜਾਬੀ Punjabi</option>
            <option value="odia">ଓଡ଼ିଆ Odia</option>
          </select>
          <Badge variant="outline" className="text-[9px] text-emerald-400 border-emerald-500/30">AI Agent</Badge>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.map((msg) => (
            <motion.div key={msg.id} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}>
              {msg.role === "system" ? (
                <p className="text-xs text-muted-foreground text-center bg-muted/30 rounded-lg px-3 py-2">{msg.text}</p>
              ) : (
                <div className="flex gap-2">
                  <div className={`h-7 w-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${msg.role === "customer" ? "bg-blue-500/10" : "bg-emerald-500/10"}`}>
                    {msg.role === "customer" ? <User className="h-3.5 w-3.5 text-blue-400" /> : <Bot className="h-3.5 w-3.5 text-emerald-500" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm">{msg.text}</p>
                    {msg.toolCall && (
                      <code className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded mt-1 inline-block">
                        {(() => { try { const t = JSON.parse(msg.toolCall); return `${t.name}(${Object.entries(t.args).map(([k,v]) => `${k}:"${v}"`).join(", ")})`; } catch { return msg.toolCall; } })()}
                      </code>
                    )}
                    {msg.verdict && (
                      <div className={`mt-1 inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded ${msg.verdict === "pass" ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"}`}>
                        {msg.verdict === "pass" ? <><CheckCircle className="h-2.5 w-2.5" /> Verified</> : <><XCircle className="h-2.5 w-2.5" /> Mismatch</>}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          ))}
          {liveText && (
            <div className="flex gap-2 opacity-60">
              <div className="h-7 w-7 rounded-full bg-blue-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <User className="h-3.5 w-3.5 text-blue-400" />
              </div>
              <p className="text-sm italic">{liveText}</p>
            </div>
          )}
          {processing && (
            <div className="flex gap-2 items-center">
              <div className="h-7 w-7 rounded-full bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                <Bot className="h-3.5 w-3.5 text-emerald-500" />
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

        {/* Waveform */}
        {listening && (
          <div className="px-4 py-2 border-t border-border">
            <div className="flex items-center justify-center gap-[2px] h-8">
              {waveform.map((l, i) => (
                <motion.div key={i} className="w-[2px] rounded-full bg-emerald-500" animate={{ height: Math.max(2, l * 32) }} transition={{ duration: 0.06 }} />
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <div className="flex items-center gap-2 p-3 border-t border-border">
          <Button size="icon" variant={listening ? "destructive" : "outline"} onClick={toggleMic} disabled={processing} className="h-9 w-9 flex-shrink-0">
            {listening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
          </Button>
          <Input placeholder="Cancel my order..." value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleSubmit()} className="text-sm h-9" disabled={processing || listening} />
          <Button size="icon" onClick={handleSubmit} disabled={!input.trim() || processing || listening} className="bg-emerald-600 hover:bg-emerald-700 h-9 w-9 flex-shrink-0">
            {processing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </div>
      </div>
    </div>
  );
}
