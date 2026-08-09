import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json({
    transcript: "",
    error: "Speech-to-text requires Chrome browser. Use the text input in other browsers.",
    hint: "browser_stt_only",
  });
}
