import { NextResponse } from "next/server";
import { randomBytes, createHash } from "crypto";
import { prisma } from "@/lib/db";

function hashKey(key: string): string {
  return createHash("sha256").update(key).digest("hex");
}

export async function GET() {
  const keys = await prisma.apiKey.findMany({
    orderBy: { createdAt: "desc" },
    select: { id: true, name: true, keyPrefix: true, status: true, lastUsed: true, createdAt: true },
  });
  return NextResponse.json(keys);
}

export async function POST(request: Request) {
  const { name } = await request.json();
  const raw = `wai_live_${randomBytes(24).toString("hex")}`;
  const prefix = raw.slice(0, 14) + "...";
  const hash = hashKey(raw);

  const key = await prisma.apiKey.create({
    data: { name: name || "Default", keyHash: hash, keyPrefix: prefix, status: "active" },
  });

  return NextResponse.json({ id: key.id, key: raw, name: key.name, keyPrefix: prefix, created: key.createdAt });
}

export async function DELETE(request: Request) {
  const { id } = await request.json();
  await prisma.apiKey.delete({ where: { id } });
  return NextResponse.json({ success: true });
}

export async function PATCH(request: Request) {
  const { id, action } = await request.json();

  if (action === "revoke") {
    await prisma.apiKey.update({ where: { id }, data: { status: "revoked" } });
  } else if (action === "activate") {
    await prisma.apiKey.update({ where: { id }, data: { status: "active" } });
  }

  return NextResponse.json({ success: true });
}
