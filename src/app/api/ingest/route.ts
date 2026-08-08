import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(request: Request) {
  const apiKey = request.headers.get("x-api-key");
  if (apiKey !== process.env.WORDAI_API_KEY && apiKey !== "demo-key") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();

  const {
    audit_id,
    audit_name,
    transcript,
    language = "hinglish",
    tool_calls = [],
    audio_url,
    metadata = {},
  } = body;

  if (!transcript) {
    return NextResponse.json(
      { error: "transcript is required" },
      { status: 400 }
    );
  }

  let auditId = audit_id;

  if (!auditId && audit_name) {
    let audit = await prisma.audit.findFirst({
      where: { name: audit_name },
    });
    if (!audit) {
      audit = await prisma.audit.create({
        data: { name: audit_name, status: "pending" },
      });
    }
    auditId = audit.id;
  }

  if (!auditId) {
    const audit = await prisma.audit.create({
      data: {
        name: `Ingested — ${new Date().toISOString().split("T")[0]}`,
        status: "pending",
      },
    });
    auditId = audit.id;
  }

  const call = await prisma.call.create({
    data: {
      auditId,
      transcript,
      language,
      audioUrl: audio_url || null,
      status: "pending",
      summary: metadata.summary || null,
    },
  });

  for (const tc of tool_calls) {
    await prisma.toolCall.create({
      data: {
        callId: call.id,
        functionName: tc.function_name || tc.functionName || "unknown",
        arguments:
          typeof tc.arguments === "string"
            ? tc.arguments
            : JSON.stringify(tc.arguments),
        response: tc.response
          ? typeof tc.response === "string"
            ? tc.response
            : JSON.stringify(tc.response)
          : null,
      },
    });
  }

  await prisma.audit.update({
    where: { id: auditId },
    data: { totalCalls: { increment: 1 } },
  });

  return NextResponse.json({
    success: true,
    call_id: call.id,
    audit_id: auditId,
    message: "Call ingested. Run POST /api/process to analyze.",
  });
}

export async function GET() {
  return NextResponse.json({
    service: "Word AI Ingestion API",
    version: "1.0",
    endpoints: {
      "POST /api/ingest": {
        description: "Ingest a production call for analysis",
        headers: { "x-api-key": "Your API key" },
        body: {
          transcript: "string (required)",
          language: "hindi | hinglish | english",
          audit_id: "string (optional — existing audit)",
          audit_name: "string (optional — creates or finds audit)",
          audio_url: "string (optional)",
          tool_calls: [
            {
              function_name: "string",
              arguments: "object or JSON string",
              response: "object or JSON string",
            },
          ],
          metadata: { summary: "string" },
        },
      },
    },
  });
}
