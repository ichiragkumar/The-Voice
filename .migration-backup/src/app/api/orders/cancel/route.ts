import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getUserId } from "@/lib/get-user";

export async function POST(request: Request) {
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { orderId } = await request.json();
  const order = await prisma.demoOrder.findFirst({ where: { orderId, userId } });

  if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });
  if (order.status !== "not_dispatched") {
    return NextResponse.json({ error: `Cannot cancel — order is ${order.status}`, cancelled: false }, { status: 400 });
  }

  await prisma.demoOrder.update({ where: { id: order.id }, data: { status: "cancelled" } });
  return NextResponse.json({ success: true, orderId, status: "cancelled" });
}
