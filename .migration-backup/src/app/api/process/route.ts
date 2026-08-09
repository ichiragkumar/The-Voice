import { NextResponse } from "next/server";
import { processAudit } from "@/actions/process-actions";

export async function POST(request: Request) {
  const { auditId } = await request.json();
  if (!auditId) {
    return NextResponse.json({ error: "auditId required" }, { status: 400 });
  }
  try {
    const result = await processAudit(auditId);
    return NextResponse.json(result);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Processing failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
