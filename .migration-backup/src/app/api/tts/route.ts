import { NextResponse } from "next/server";
import { synthesizeSpeech, detectLanguage } from "@/lib/maya-tts";

export async function POST(request: Request) {
  const { text, voice, language } = await request.json();

  if (!text) {
    return NextResponse.json({ error: "text is required" }, { status: 400 });
  }

  try {
    const detectedLang = language || detectLanguage(text);
    const wav = await synthesizeSpeech(text, {
      voice: voice || "Ananya",
      language: detectedLang,
    });

    return new NextResponse(new Uint8Array(wav), {
      headers: {
        "Content-Type": "audio/wav",
        "Content-Length": wav.length.toString(),
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "TTS failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
