const MAYA_TTS_URL = "https://tts.mayaresearch.ai/v1/tts";

type MayaVoice = "Ananya" | "Arjun";
type MayaLanguage = "hi" | "te" | "bn" | "gu" | "kn" | "ml" | "mr" | "or" | "pa" | "ta" | "en";

export async function synthesizeSpeech(
  text: string,
  options: { voice?: MayaVoice; language?: MayaLanguage } = {}
): Promise<Buffer> {
  const apiKey = process.env.MAYA_API_KEY;
  if (!apiKey) throw new Error("MAYA_API_KEY not set");

  const body: Record<string, string> = { text };
  if (options.voice) body.voice = options.voice;
  if (options.language) body.language = options.language;

  const res = await fetch(MAYA_TTS_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "content-type": "application/json",
      "user-agent": "wordai/1.0",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Maya TTS error ${res.status}: ${errText}`);
  }

  const chunks: Uint8Array[] = [];
  const reader = res.body?.getReader();
  if (!reader) throw new Error("No response body");

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
  }

  const pcm = Buffer.concat(chunks);
  return pcmToWav(pcm, 24000, 1, 16);
}

function pcmToWav(pcm: Buffer, sampleRate: number, channels: number, bitsPerSample: number): Buffer {
  const byteRate = sampleRate * channels * (bitsPerSample / 8);
  const blockAlign = channels * (bitsPerSample / 8);
  const header = Buffer.alloc(44);

  header.write("RIFF", 0);
  header.writeUInt32LE(36 + pcm.length, 4);
  header.write("WAVE", 8);
  header.write("fmt ", 12);
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20);
  header.writeUInt16LE(channels, 22);
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(byteRate, 28);
  header.writeUInt16LE(blockAlign, 32);
  header.writeUInt16LE(bitsPerSample, 34);
  header.write("data", 36);
  header.writeUInt32LE(pcm.length, 40);

  return Buffer.concat([header, pcm]);
}

export function detectLanguage(text: string): MayaLanguage | undefined {
  if (/[ऀ-ॿ]/.test(text)) return "hi";
  if (/[ఀ-౿]/.test(text)) return "te";
  if (/[ঀ-৿]/.test(text)) return "bn";
  if (/[઀-૿]/.test(text)) return "gu";
  if (/[ಀ-೿]/.test(text)) return "kn";
  if (/[ഀ-ൿ]/.test(text)) return "ml";
  if (/[਀-੿]/.test(text)) return "pa";
  if (/[଀-୿]/.test(text)) return "or";
  if (/[஀-௿]/.test(text)) return "ta";
  if (/[a-zA-Z]/.test(text)) return undefined; // let Maya auto-detect for Hinglish
  return undefined;
}
