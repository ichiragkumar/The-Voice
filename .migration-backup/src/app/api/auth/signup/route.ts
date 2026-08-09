import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { generateDemoOrders } from "@/lib/demo-orders";

export async function POST(request: Request) {
  const { username, password, name } = await request.json();

  if (!username || !password || !name) {
    return NextResponse.json({ error: "username, password, and name required" }, { status: 400 });
  }

  const existing = await prisma.demoUser.findUnique({ where: { username } });
  if (existing) {
    return NextResponse.json({ error: "Username already taken" }, { status: 409 });
  }

  const address = "123 MG Road, Bangalore 560001";
  const user = await prisma.demoUser.create({
    data: { username, password, name, address },
  });

  const orders = generateDemoOrders(user.id, address);
  for (const order of orders) {
    await prisma.demoOrder.create({ data: order });
  }

  await prisma.chatMessage.create({
    data: {
      userId: user.id,
      role: "system",
      text: `Welcome ${name}! You have 5 demo orders. Try: "cancel my order", "where is my package?", or "track order".`,
    },
  });

  const response = NextResponse.json({ success: true, userId: user.id, name: user.name });
  response.cookies.set("wordai_session", user.id, {
    httpOnly: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });

  return response;
}
