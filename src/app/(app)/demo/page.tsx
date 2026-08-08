"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SpeakButton } from "@/components/speak-button";
import { FadeIn } from "@/components/motion-wrapper";
import { Volume2, Zap, ArrowRight } from "lucide-react";

const SAMPLE_PHRASES = [
  { text: "Kal nahi, uske agle din shaam ko saade chaar baje kar do.", lang: "Hinglish", label: "Appointment reschedule" },
  { text: "Mera order cancel karna hai. Order number one four double nine hai.", lang: "Hinglish", label: "Order cancellation" },
  { text: "Refund UPI par chahiye, account mein nahi.", lang: "Hinglish", label: "Refund method" },
  { text: "Sharma ji ka appointment cancel kar do. Aur Verma ji ka next week Monday rakh do.", lang: "Hinglish", label: "Multi-instruction" },
  { text: "नमस्ते! आपका ऑर्डर कल पहुँच जाएगा।", lang: "Hindi", label: "Delivery confirmation" },
  { text: "Teen hazaar abhi de dunga, baaki parson.", lang: "Hinglish", label: "Promise to pay" },
];

export default function DemoPage() {
  const [customText, setCustomText] = useState("");
  const [voice, setVoice] = useState<"Ananya" | "Arjun">("Ananya");

  return (
    <div className="space-y-8 max-w-4xl">
      <FadeIn>
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Zap className="h-5 w-5 text-emerald-500" />
            Live Demo
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Hear how Indian customers speak to voice agents — powered by Maya TTS
          </p>
        </div>
      </FadeIn>

      <FadeIn delay={0.1}>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Try It — Type or select a phrase</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4 items-end">
              <div className="flex-1">
                <Textarea
                  placeholder="Type any Hindi, Hinglish, or English text..."
                  value={customText}
                  onChange={(e) => setCustomText(e.target.value)}
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Select
                  value={voice}
                  onValueChange={(v: string | null) => {
                    if (v === "Ananya" || v === "Arjun") setVoice(v);
                  }}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Ananya">Ananya (F)</SelectItem>
                    <SelectItem value="Arjun">Arjun (M)</SelectItem>
                  </SelectContent>
                </Select>
                <SpeakButton
                  text={customText || "नमस्ते"}
                  voice={voice}
                  size="default"
                  label="Speak"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </FadeIn>

      <FadeIn delay={0.2}>
        <div>
          <h2 className="text-lg font-semibold mb-4">Sample Customer Phrases</h2>
          <p className="text-sm text-muted-foreground mb-4">
            These are real scenarios Word AI tests against. Click <Volume2 className="inline h-3 w-3" /> to hear them.
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            {SAMPLE_PHRASES.map((phrase) => (
              <Card key={phrase.text} className="group hover:border-emerald-500/30 transition-colors">
                <CardContent className="pt-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <Badge variant="outline" className="mb-2 text-xs">
                        {phrase.label}
                      </Badge>
                      <p className="text-sm italic text-muted-foreground leading-relaxed">
                        &ldquo;{phrase.text}&rdquo;
                      </p>
                    </div>
                    <SpeakButton text={phrase.text} voice={voice} size="icon" label="" />
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Badge variant="secondary" className="text-[10px]">{phrase.lang}</Badge>
                    <ArrowRight className="h-3 w-3" />
                    <span>Extracts entities, normalizes, verifies backend</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </FadeIn>

      <FadeIn delay={0.3}>
        <Card className="border-emerald-500/20 bg-emerald-500/5">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="h-10 w-10 rounded-lg bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                <Volume2 className="h-5 w-5 text-emerald-500" />
              </div>
              <div>
                <h3 className="font-semibold">Powered by Maya Research</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Native-sounding speech in 11 Indian languages with ~75ms latency.
                  Maya generates realistic customer audio for Word AI test scenarios.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </FadeIn>
    </div>
  );
}
