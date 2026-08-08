import { NextResponse } from "next/server";
import { processAudit } from "@/actions/process-actions";

export async function POST(request: Request) {
  const { auditId } = await request.json();
  if (!auditId) {
    return NextResponse.json({ error: "auditId required" }, { status: 400 });
  }
  const result = await processAudit(auditId);
  return NextResponse.json(result);
}
