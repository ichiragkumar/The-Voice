"use client";

import { useState, useRef } from "react";
import { Play, Pause, Music } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export function AudioPlayer({ audioUrl }: { audioUrl?: string | null }) {
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  if (!audioUrl) {
    return (
      <Card>
        <CardContent className="flex items-center gap-3 py-4">
          <Music className="h-5 w-5 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">
            No audio file available for this call
          </span>
        </CardContent>
      </Card>
    );
  }

  function togglePlay() {
    if (!audioRef.current) return;
    if (playing) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setPlaying(!playing);
  }

  function formatTime(seconds: number) {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  }

  function handleSeek(e: React.MouseEvent<HTMLDivElement>) {
    if (!audioRef.current || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = (e.clientX - rect.left) / rect.width;
    audioRef.current.currentTime = ratio * duration;
  }

  return (
    <Card>
      <CardContent className="flex items-center gap-4 py-4">
        <audio
          ref={audioRef}
          src={audioUrl}
          onTimeUpdate={() => setCurrentTime(audioRef.current?.currentTime || 0)}
          onLoadedMetadata={() => setDuration(audioRef.current?.duration || 0)}
          onEnded={() => setPlaying(false)}
        />
        <Button variant="ghost" size="icon" onClick={togglePlay}>
          {playing ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
        </Button>
        <span className="text-xs font-mono text-muted-foreground w-10">
          {formatTime(currentTime)}
        </span>
        <div
          className="flex-1 h-2 rounded-full bg-muted cursor-pointer"
          onClick={handleSeek}
        >
          <div
            className="h-full rounded-full bg-emerald-500 transition-all"
            style={{ width: duration ? `${(currentTime / duration) * 100}%` : "0%" }}
          />
        </div>
        <span className="text-xs font-mono text-muted-foreground w-10">
          {formatTime(duration)}
        </span>
      </CardContent>
    </Card>
  );
}
