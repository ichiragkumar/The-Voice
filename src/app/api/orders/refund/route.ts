import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getUserId } from "@/lib/get-user";

export async function POST(request: Request) {
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { orderId, method } = await request.json();
  const order = await prisma.demoOrder.findFirst({ where: { orderId, userId } });

  if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });
  if (order.status !== "cancelled" && order.status !== "delivered") {
    return NextResponse.json({ error: `Refund only for cancelled/delivered orders. Current: ${order.status}` }, { status: 400 });
  }

  const refundMethod = method || order.method;
  return NextResponse.json({ success: true, orderId, amount: order.amount, method: refundMethod, status: "refund_processed" });
}
