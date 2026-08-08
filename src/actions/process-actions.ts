"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { runPipeline } from "@/lib/engine/pipeline";

export async function processAudit(auditId: string) {
  await prisma.audit.update({
    where: { id: auditId },
    data: { status: "processing" },
  });

  const calls = await prisma.call.findMany({
    where: { auditId, status: "pending" },
    include: { toolCalls: true },
  });

  let failedCount = 0;

  for (const call of calls) {
    try {
      const toolCalls = call.toolCalls.map((tc) => ({
        functionName: tc.functionName,
        arguments: tc.arguments,
        response: tc.response || undefined,
      }));

      const result = await runPipeline(
        call.transcript,
        call.language,
        toolCalls,
        call.createdAt
      );

      for (const entity of result.entities) {
        await prisma.entity.create({
          data: {
            callId: call.id,
            type: entity.type,
            rawValue: entity.rawValue,
            normalizedValue: entity.normalizedValue,
            confidence: entity.confidence,
            sourceLayer: "asr_transcript",
          },
        });
      }

      for (const comp of result.comparisons) {
        await prisma.comparison.create({
          data: {
            callId: call.id,
            expectedValue: comp.expectedValue,
            actualValue: comp.actualValue,
            match: comp.match,
            rootCause: comp.rootCause || null,
            evidence: comp.evidence || null,
            severity: comp.severity,
          },
        });
      }

      const hasFailed = result.comparisons.some((c) => !c.match);
      await prisma.call.update({
        where: { id: call.id },
        data: {
          status: hasFailed ? "failed" : "passed",
          summary: `${result.summary.totalEntities} entities, ${result.summary.mismatches} mismatches`,
        },
      });

      if (hasFailed) failedCount++;
    } catch {
      await prisma.call.update({
        where: { id: call.id },
        data: { status: "failed", summary: "Processing error" },
      });
      failedCount++;
    }
  }

  const totalCalls = await prisma.call.count({ where: { auditId } });
  const totalFailed = await prisma.call.count({
    where: { auditId, status: "failed" },
  });

  await prisma.audit.update({
    where: { id: auditId },
    data: {
      status: "completed",
      totalCalls,
      failedCalls: totalFailed,
      failureRate: totalCalls > 0 ? totalFailed / totalCalls : 0,
    },
  });

  revalidatePath("/dashboard");
  revalidatePath("/audits");
  revalidatePath(`/audits/${auditId}`);

  return { success: true, totalCalls, failedCount };
}

export async function getCallDetail(callId: string) {
  return prisma.call.findUnique({
    where: { id: callId },
    include: {
      audit: true,
      entities: true,
      toolCalls: true,
      comparisons: { include: { entity: true, toolCall: true } },
    },
  });
}
