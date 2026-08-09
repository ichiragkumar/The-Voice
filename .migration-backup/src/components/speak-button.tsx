"use client";

import { useState, useRef } from "react";
import { Volume2, Loader2, Square } from "lucide-react";
import { Button } from "@/components/ui/button";

type Props = {
  text: string;
  voice?: "Ananya" | "Arjun";
  language?: string;
  size?: "default" | "sm" | "icon";
  label?: string;
};

export function SpeakButton({ text, voice, language, size = "sm", label }: Props) {
  const [state, setState] = useState<"idle" | "loading" | "playing">("idle");
  const audioRef = useRef<HTMLAudioElement | null>(null);

  async function handleClick() {
    if (state === "playing") {
      audioRef.current?.pause();
      setState("idle");
      return;
    }

    setState("loading");

    try {
      const res = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, voice, language }),
      });

      if (!res.ok) {
        setState("idle");
        return;
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);

      if (audioRef.current) {
        audioRef.current.pause();
        URL.revokeObjectURL(audioRef.current.src);
      }

      const audio = new Audio(url);
      audioRef.current = audio;

      audio.onended = () => {
        setState("idle");
        URL.revokeObjectURL(url);
      };

      audio.onerror = () => {
        setState("idle");
        URL.revokeObjectURL(url);
      };

      await audio.play();
      setState("playing");
    } catch {
      setState("idle");
    }
  }

  return (
    <Button
      variant="outline"
      size={size}
      onClick={handleClick}
      disabled={state === "loading"}
      className="gap-1.5"
    >
      {state === "loading" && <Loader2 className="h-3 w-3 animate-spin" />}
      {state === "playing" && <Square className="h-3 w-3 fill-current" />}
      {state === "idle" && <Volume2 className="h-3 w-3" />}
      {label === "" ? null : label ?? (state === "playing" ? "Stop" : "Listen")}
    </Button>
  );
}
