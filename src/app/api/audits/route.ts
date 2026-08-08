import { NextResponse } from "next/server";
import { getAudits, createAudit } from "@/actions/audit-actions";

export async function GET() {
  const audits = await getAudits();
  return NextResponse.json(audits);
}

export async function POST(request: Request) {
  const body = await request.json();
  const audit = await createAudit(body);
  return NextResponse.json(audit);
}
