"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function getAudits() {
  return prisma.audit.findMany({
    orderBy: { createdAt: "desc" },
    include: { calls: { select: { id: true, status: true } } },
  });
}

export async function getAudit(id: string) {
  return prisma.audit.findUnique({
    where: { id },
    include: {
      calls: {
        include: {
          entities: true,
          toolCalls: true,
          comparisons: { include: { entity: true, toolCall: true } },
        },
        orderBy: { createdAt: "asc" },
      },
    },
  });
}

export async function createAudit(data: {
  name: string;
  agentPrompt?: string;
}) {
  const audit = await prisma.audit.create({ data });
  revalidatePath("/audits");
  revalidatePath("/dashboard");
  return audit;
}

export async function deleteAudit(id: string) {
  await prisma.audit.delete({ where: { id } });
  revalidatePath("/audits");
  revalidatePath("/dashboard");
}

export async function getDashboardStats() {
  const audits = await prisma.audit.findMany();
  const totalAudits = audits.length;
  const totalCalls = audits.reduce((sum, a) => sum + a.totalCalls, 0);
  const totalFailures = audits.reduce((sum, a) => sum + a.failedCalls, 0);
  const completedAudits = audits.filter(
    (a) => a.failureRate !== null && a.failureRate !== undefined
  );
  const avgFailureRate =
    completedAudits.length > 0
      ? completedAudits.reduce((sum, a) => sum + (a.failureRate || 0), 0) /
        completedAudits.length
      : 0;

  const failedComparisons = await prisma.comparison.findMany({
    where: { match: false, rootCause: { not: null } },
    select: { rootCause: true },
  });

  const rootCauseCounts: Record<string, number> = {};
  for (const c of failedComparisons) {
    if (c.rootCause) {
      rootCauseCounts[c.rootCause] = (rootCauseCounts[c.rootCause] || 0) + 1;
    }
  }

  const recentAudits = await prisma.audit.findMany({
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  return {
    totalAudits,
    totalCalls,
    totalFailures,
    avgFailureRate,
    rootCauseCounts,
    recentAudits,
  };
}
