import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getUserId } from "@/lib/get-user";

export async function POST() {
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  await prisma.chatMessage.deleteMany({ where: { userId } });

  const user = await prisma.demoUser.findUnique({ where: { id: userId } });
  const orders = await prisma.demoOrder.findMany({ where: { userId } });

  await prisma.chatMessage.create({
    data: {
      userId,
      role: "system",
      text: `Welcome ${user?.name || "back"}! You have ${orders.length} orders. Ask me anything — cancel orders, track packages, place new orders, or just chat.`,
    },
  });

  return NextResponse.json({ success: true });
}
