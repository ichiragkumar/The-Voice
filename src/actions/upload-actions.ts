"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { writeFileSync, mkdirSync, existsSync } from "fs";
import { join } from "path";

export async function uploadCallData(auditId: string, formData: FormData) {
  const audioFile = formData.get("audio") as File | null;
  const transcript = formData.get("transcript") as string;
  const language = formData.get("language") as string;
  const toolCallsJson = formData.get("toolCalls") as string;

  let audioUrl: string | null = null;

  if (audioFile && audioFile.size > 0) {
    const uploadDir = join(process.cwd(), "public", "uploads", auditId);
    if (!existsSync(uploadDir)) {
      mkdirSync(uploadDir, { recursive: true });
    }
    const fileName = `${Date.now()}-${audioFile.name}`;
    const buffer = Buffer.from(await audioFile.arrayBuffer());
    writeFileSync(join(uploadDir, fileName), buffer);
    audioUrl = `/uploads/${auditId}/${fileName}`;
  }

  const call = await prisma.call.create({
    data: {
      auditId,
      transcript,
      language: language || "hinglish",
      audioUrl,
      status: "pending",
    },
  });

  if (toolCallsJson) {
    try {
      const toolCalls = JSON.parse(toolCallsJson);
      if (Array.isArray(toolCalls)) {
        for (const tc of toolCalls) {
          await prisma.toolCall.create({
            data: {
              callId: call.id,
              functionName: tc.functionName || tc.function_name || "unknown",
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
      }
    } catch {
      // Invalid JSON — skip tool calls
    }
  }

  await prisma.audit.update({
    where: { id: auditId },
    data: { totalCalls: { increment: 1 } },
  });

  revalidatePath(`/audits/${auditId}`);
  return { success: true, callId: call.id };
}

export async function uploadBulkTranscripts(
  auditId: string,
  data: Array<{
    transcript: string;
    language: string;
    toolCalls: Array<{
      functionName: string;
      arguments: string;
      response?: string;
    }>;
  }>
) {
  const callIds: string[] = [];

  for (const item of data) {
    const call = await prisma.call.create({
      data: {
        auditId,
        transcript: item.transcript,
        language: item.language,
        status: "pending",
      },
    });

    for (const tc of item.toolCalls) {
      await prisma.toolCall.create({
        data: {
          callId: call.id,
          functionName: tc.functionName,
          arguments: tc.arguments,
          response: tc.response || null,
        },
      });
    }

    callIds.push(call.id);
  }

  await prisma.audit.update({
    where: { id: auditId },
    data: { totalCalls: { increment: data.length } },
  });

  revalidatePath(`/audits/${auditId}`);
  revalidatePath("/audits");
  return { success: true, callIds };
}
