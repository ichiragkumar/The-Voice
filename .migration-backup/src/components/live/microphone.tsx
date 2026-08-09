"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion } from "motion/react";
import { Mic, MicOff, Type, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Props = {
  onTranscript: (text: string, isFinal: boolean) => void;
  onListening: (listening: boolean) => void;
  disabled?: boolean;
};

export function LiveMicrophone({ onTranscript, onListening, disabled }: Props) {
  const [listening, setListening] = useState(false);
  const [levels, setLevels] = useState<number[]>(new Array(32).fill(0.05));
  const [showTyped, setShowTyped] = useState(false);
  const [typedText, setTypedText] = useState("");
  const [micSupported, setMicSupported] = useState(true);
  const recognitionRef = useRef<any>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animRef = useRef<number>(0);
  const streamRef = useRef<MediaStream | null>(null);
  const listeningRef = useRef(false);

  useEffect(() => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR || !navigator.mediaDevices?.getUserMedia) {
      setMicSupported(false);
      setShowTyped(true);
    }
  }, []);

  const stopListening = useCallback(() => {
    listeningRef.current = false;
    try { recognitionRef.current?.stop(); } catch {}
    recognitionRef.current = null;
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    cancelAnimationFrame(animRef.current);
    analyserRef.current = null;
    setListening(false);
    onListening(false);
    setLevels(new Array(32).fill(0.05));
  }, [onListening]);

  useEffect(() => () => stopListening(), [stopListening]);

  async function startListening() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
      });
      streamRef.current = stream;

      const audioCtx = new AudioContext();
      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 128;
      analyser.smoothingTimeConstant = 0.4;
      source.connect(analyser);
      analyserRef.current = analyser;

      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      function updateWaveform() {
        if (!analyserRef.current) return;
        analyserRef.current.getByteFrequencyData(dataArray);
        const bars = Array.from(dataArray.slice(0, 32)).map((v) => Math.max(0.05, v / 255));
        setLevels(bars);
        animRef.current = requestAnimationFrame(updateWaveform);
      }
      updateWaveform();

      const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SR();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "hi-IN";

      recognition.onresult = (e: any) => {
        for (let i = e.resultIndex; i < e.results.length; i++) {
          const text = e.results[i][0].transcript;
          onTranscript(text, e.results[i].isFinal);
        }
      };

      recognition.onerror = (e: any) => {
        if (e.error !== "no-speech" && e.error !== "aborted") stopListening();
      };

      recognition.onend = () => {
        if (listeningRef.current) {
          try { recognition.start(); } catch { stopListening(); }
        }
      };

      recognition.start();
      recognitionRef.current = recognition;
      listeningRef.current = true;
      setListening(true);
      onListening(true);
    } catch {
      setMicSupported(false);
      setShowTyped(true);
    }
  }

  function handleTypedSubmit() {
    if (typedText.trim()) {
      onTranscript(typedText.trim(), true);
      setTypedText("");
    }
  }

  return (
    <div className="flex flex-col items-center gap-4 w-full max-w-md mx-auto">
      {/* Waveform */}
      <div className="flex items-end justify-center gap-[3px] h-16 w-full">
        {levels.map((level, i) => (
          <motion.div
            key={i}
            className={`w-1 rounded-full ${listening ? "bg-emerald-500" : "bg-muted-foreground/20"}`}
            animate={{ height: listening ? Math.max(3, level * 64) : 3 }}
            transition={{ duration: 0.08, ease: "easeOut" }}
          />
        ))}
      </div>

      {/* Mic button with pulse ring */}
      <div className="relative">
        {listening && (
          <motion.div
            className="absolute inset-0 rounded-full bg-emerald-500/20"
            animate={{ scale: [1, 1.6, 1], opacity: [0.4, 0, 0.4] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        )}
        <motion.div whileTap={{ scale: 0.9 }}>
          <Button
            size="lg"
            disabled={disabled || !micSupported}
            onClick={listening ? stopListening : startListening}
            className={`rounded-full h-16 w-16 relative z-10 ${
              listening
                ? "bg-red-500 hover:bg-red-600 shadow-lg shadow-red-500/25"
                : "bg-emerald-500 hover:bg-emerald-600 shadow-lg shadow-emerald-500/25"
            }`}
          >
            {listening ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
          </Button>
        </motion.div>
      </div>

      {listening && (
        <motion.p
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-sm text-emerald-400 flex items-center gap-2"
        >
          <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
          Listening — speak in Hindi or Hinglish
        </motion.p>
      )}

      {!listening && !showTyped && micSupported && (
        <button
          onClick={() => setShowTyped(true)}
          className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1.5 transition-colors"
        >
          <Type className="h-3 w-3" /> or type instead
        </button>
      )}

      {showTyped && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex gap-2 w-full"
        >
          <Input
            placeholder="Type Hindi/Hinglish... e.g., Mera order cancel kar do"
            value={typedText}
            onChange={(e) => setTypedText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleTypedSubmit()}
            className="text-sm flex-1"
            autoFocus
          />
          <Button
            size="icon"
            onClick={handleTypedSubmit}
            disabled={!typedText.trim() || disabled}
            className="bg-emerald-500 hover:bg-emerald-600"
          >
            <Send className="h-4 w-4" />
          </Button>
        </motion.div>
      )}
    </div>
  );
}
