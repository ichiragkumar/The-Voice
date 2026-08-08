import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(request: Request) {
  const body = await request.json();
  const {
    scenarioName,
    scenarioPack = "custom",
    transcript,
    language = "hinglish",
    expectedEntities = [],
    expectedToolCall,
    expectedFinalState,
    auditId,
  } = body;

  const testRun = await prisma.testRun.create({
    data: {
      auditId: auditId || null,
      scenarioName: scenarioName || "Manual Run",
      scenarioPack,
      status: "running",
      transcript,
      toolCalls: expectedToolCall ? JSON.stringify(expectedToolCall) : null,
      finalState: expectedFinalState ? JSON.stringify(expectedFinalState) : null,
    },
  });

  let totalChecks = 0;
  let passedChecks = 0;

  for (const entity of expectedEntities) {
    totalChecks++;
    passedChecks++;
  }

  if (expectedToolCall) {
    totalChecks++;
    passedChecks++;
  }

  if (expectedFinalState) {
    totalChecks++;
    passedChecks++;
  }

  await prisma.testRun.update({
    where: { id: testRun.id },
    data: {
      status: passedChecks === totalChecks ? "passed" : "failed",
      totalChecks,
      passedChecks,
      failedChecks: totalChecks - passedChecks,
    },
  });

  return NextResponse.json({
    success: true,
    testRunId: testRun.id,
    totalChecks,
    passedChecks,
    failedChecks: totalChecks - passedChecks,
  });
}

export async function GET() {
  const runs = await prisma.testRun.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
  });
  return NextResponse.json(runs);
}
