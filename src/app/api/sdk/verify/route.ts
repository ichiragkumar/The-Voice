import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(request: Request) {
  const apiKey = request.headers.get("x-api-key");
  if (!apiKey) {
    return NextResponse.json({ error: "x-api-key required" }, { status: 401 });
  }

  const { auditId, transcript, language, result } = await request.json();

  const testRun = await prisma.testRun.create({
    data: {
      auditId: auditId || null,
      scenarioName: `SDK Verification — ${new Date().toISOString()}`,
      scenarioPack: "sdk",
      status: result.passed ? "passed" : "failed",
      totalChecks: result.summary.totalChecks,
      passedChecks: result.summary.passed,
      failedChecks: result.summary.failed,
      transcript: transcript || null,
      toolCalls: JSON.stringify(result.toolResults),
      finalState: result.finalStateResult
        ? JSON.stringify(result.finalStateResult)
        : null,
    },
  });

  for (const pr of result.policyResults || []) {
    await prisma.policyCheck.create({
      data: {
        testRunId: testRun.id,
        policyPack: pr.pack,
        rule: pr.rule,
        passed: pr.passed,
        evidence: pr.evidence,
        severity: pr.severity,
      },
    });
  }

  return NextResponse.json({
    success: true,
    testRunId: testRun.id,
    passed: result.passed,
  });
}
