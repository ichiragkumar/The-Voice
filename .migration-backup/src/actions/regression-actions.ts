"use server";

import { prisma } from "@/lib/db";

export type RegressionComparison = {
  callSummary: string;
  language: string;
  auditAStatus: string;
  auditBStatus: string;
  change: "improved" | "regressed" | "unchanged";
  auditAFailures: number;
  auditBFailures: number;
};

export type RegressionResult = {
  auditA: { id: string; name: string; failureRate: number | null; totalCalls: number; failedCalls: number };
  auditB: { id: string; name: string; failureRate: number | null; totalCalls: number; failedCalls: number };
  overallChange: "improved" | "regressed" | "unchanged";
  newFailures: number;
  fixedFailures: number;
  rootCauseShift: Record<string, { before: number; after: number }>;
};

export async function compareAudits(
  auditAId: string,
  auditBId: string
): Promise<RegressionResult | null> {
  const [auditA, auditB] = await Promise.all([
    prisma.audit.findUnique({
      where: { id: auditAId },
      include: {
        calls: { include: { comparisons: true } },
      },
    }),
    prisma.audit.findUnique({
      where: { id: auditBId },
      include: {
        calls: { include: { comparisons: true } },
      },
    }),
  ]);

  if (!auditA || !auditB) return null;

  const aFailedComps = auditA.calls.flatMap((c) =>
    c.comparisons.filter((comp) => !comp.match)
  );
  const bFailedComps = auditB.calls.flatMap((c) =>
    c.comparisons.filter((comp) => !comp.match)
  );

  const aRootCauses: Record<string, number> = {};
  const bRootCauses: Record<string, number> = {};

  for (const c of aFailedComps) {
    if (c.rootCause) aRootCauses[c.rootCause] = (aRootCauses[c.rootCause] || 0) + 1;
  }
  for (const c of bFailedComps) {
    if (c.rootCause) bRootCauses[c.rootCause] = (bRootCauses[c.rootCause] || 0) + 1;
  }

  const allCauses = new Set([...Object.keys(aRootCauses), ...Object.keys(bRootCauses)]);
  const rootCauseShift: Record<string, { before: number; after: number }> = {};
  for (const cause of allCauses) {
    rootCauseShift[cause] = {
      before: aRootCauses[cause] || 0,
      after: bRootCauses[cause] || 0,
    };
  }

  const rateA = auditA.failureRate || 0;
  const rateB = auditB.failureRate || 0;

  return {
    auditA: {
      id: auditA.id,
      name: auditA.name,
      failureRate: auditA.failureRate,
      totalCalls: auditA.totalCalls,
      failedCalls: auditA.failedCalls,
    },
    auditB: {
      id: auditB.id,
      name: auditB.name,
      failureRate: auditB.failureRate,
      totalCalls: auditB.totalCalls,
      failedCalls: auditB.failedCalls,
    },
    overallChange: rateB < rateA ? "improved" : rateB > rateA ? "regressed" : "unchanged",
    newFailures: Math.max(0, auditB.failedCalls - auditA.failedCalls),
    fixedFailures: Math.max(0, auditA.failedCalls - auditB.failedCalls),
    rootCauseShift,
  };
}

export async function getCompletedAudits() {
  return prisma.audit.findMany({
    where: { status: "completed" },
    orderBy: { createdAt: "desc" },
    select: { id: true, name: true, failureRate: true, totalCalls: true, createdAt: true },
  });
}
