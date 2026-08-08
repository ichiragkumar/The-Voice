import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getUserId } from "@/lib/get-user";

export async function POST(request: Request) {
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { orderId } = await request.json();
  const order = await prisma.demoOrder.findFirst({ where: { orderId, userId } });

  if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });

  return NextResponse.json({
    orderId,
    status: order.status,
    tracking: order.tracking || "Not available yet",
    item: order.item,
    estimatedDelivery: order.status === "shipped" ? "2-3 business days" : null,
  });
}
