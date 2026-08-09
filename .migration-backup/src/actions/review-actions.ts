"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function getPendingReviews() {
  return prisma.comparison.findMany({
    where: { match: false, reviewStatus: "pending" },
    include: {
      call: { include: { audit: true } },
      entity: true,
      toolCall: true,
    },
    orderBy: { severity: "asc" },
  });
}

export async function getReviewStats() {
  const pending = await prisma.comparison.count({
    where: { match: false, reviewStatus: "pending" },
  });
  const confirmed = await prisma.comparison.count({
    where: { match: false, reviewStatus: "confirmed" },
  });
  const dismissed = await prisma.comparison.count({
    where: { match: false, reviewStatus: "dismissed" },
  });
  const overridden = await prisma.comparison.count({
    where: { match: false, reviewStatus: "overridden" },
  });

  return { pending, confirmed, dismissed, overridden, total: pending + confirmed + dismissed + overridden };
}

export async function reviewComparison(
  comparisonId: string,
  action: "confirmed" | "dismissed" | "overridden",
  note?: string
) {
  await prisma.comparison.update({
    where: { id: comparisonId },
    data: {
      reviewStatus: action,
      reviewNote: note || null,
      reviewedAt: new Date(),
    },
  });

  revalidatePath("/review");
  return { success: true };
}
