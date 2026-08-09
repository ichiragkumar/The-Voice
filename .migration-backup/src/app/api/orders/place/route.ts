import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getUserId } from "@/lib/get-user";

const ITEMS = [
  { item: "Wireless Earbuds", amount: 1499 },
  { item: "Running Shoes", amount: 2999 },
  { item: "Phone Case", amount: 899 },
  { item: "USB-C Cable", amount: 349 },
  { item: "Laptop Stand", amount: 1899 },
  { item: "Bluetooth Speaker", amount: 2499 },
];

export async function POST(request: Request) {
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { item, method } = await request.json();
  const user = await prisma.demoUser.findUnique({ where: { id: userId } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const product = ITEMS.find((i) => i.item.toLowerCase().includes((item || "").toLowerCase())) || ITEMS[Math.floor(Math.random() * ITEMS.length)];

  const order = await prisma.demoOrder.create({
    data: {
      userId,
      orderId: `ORD-${1000 + Math.floor(Math.random() * 9000)}`,
      item: product.item,
      amount: product.amount,
      status: "not_dispatched",
      method: method || "cod",
      address: user.address,
    },
  });

  return NextResponse.json({ success: true, orderId: order.orderId, item: order.item, amount: order.amount });
}
