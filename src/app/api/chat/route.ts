import { NextResponse } from "next/server";
import { generateText } from "ai";
import { z } from "zod/v4";
import { getModel, isAIConfigured } from "@/lib/ai";
import { prisma } from "@/lib/db";
import { getUserId } from "@/lib/get-user";

const toolDefs = {
  cancel_order: {
    description: "Cancel order (only not_dispatched)",
    inputSchema: z.object({ order_id: z.string() }),
  },
  process_refund: {
    description: "Refund cancelled/delivered order",
    inputSchema: z.object({ order_id: z.string(), method: z.string().optional() }),
  },
  track_order: {
    description: "Track an order",
    inputSchema: z.object({ order_id: z.string() }),
  },
  change_address: {
    description: "Change delivery address",
    inputSchema: z.object({ order_id: z.string(), new_address: z.string() }),
  },
  place_order: {
    description: "Place a new order",
    inputSchema: z.object({ item: z.string(), method: z.string().optional() }),
  },
  check_orders: {
    description: "Check order status or list all orders",
    inputSchema: z.object({ order_id: z.string().optional() }),
  },
};

async function executeTool(name: string, args: Record<string, any>, userId: string, userAddress: string) {
  switch (name) {
    case "cancel_order": {
      const order = await prisma.demoOrder.findFirst({ where: { orderId: args.order_id, userId } });
      if (!order) return { success: false, error: "Order not found" };
      if (order.status !== "not_dispatched") return { success: false, error: `Cannot cancel: ${order.status}` };
      await prisma.demoOrder.update({ where: { id: order.id }, data: { status: "cancelled" } });
      return { success: true, orderId: args.order_id, item: order.item, newStatus: "cancelled" };
    }
    case "process_refund": {
      const order = await prisma.demoOrder.findFirst({ where: { orderId: args.order_id, userId } });
      if (!order) return { success: false, error: "Order not found" };
      return { success: true, amount: order.amount, method: args.method || order.method };
    }
    case "track_order": {
      const order = await prisma.demoOrder.findFirst({ where: { orderId: args.order_id, userId } });
      if (!order) return { error: "Order not found" };
      return { orderId: order.orderId, item: order.item, status: order.status, tracking: order.tracking || "N/A" };
    }
    case "change_address": {
      const order = await prisma.demoOrder.findFirst({ where: { orderId: args.order_id, userId } });
      if (!order) return { success: false, error: "Order not found" };
      if (order.status === "delivered" || order.status === "cancelled") return { success: false, error: `Can't change: ${order.status}` };
      await prisma.demoOrder.update({ where: { id: order.id }, data: { address: args.new_address } });
      return { success: true, orderId: args.order_id, newAddress: args.new_address };
    }
    case "place_order": {
      const order = await prisma.demoOrder.create({
        data: {
          userId, orderId: `ORD-${1000 + Math.floor(Math.random() * 9000)}`,
          item: args.item, amount: 500 + Math.floor(Math.random() * 3000),
          status: "not_dispatched", method: args.method || "cod", address: userAddress,
        },
      });
      return { success: true, orderId: order.orderId, item: order.item, amount: order.amount };
    }
    case "check_orders": {
      if (args.order_id) {
        const order = await prisma.demoOrder.findFirst({ where: { orderId: args.order_id, userId } });
        return order ? { orderId: order.orderId, item: order.item, amount: order.amount, status: order.status } : { error: "Not found" };
      }
      const all = await prisma.demoOrder.findMany({ where: { userId } });
      return { orders: all.map((o) => ({ orderId: o.orderId, item: o.item, amount: o.amount, status: o.status })) };
    }
    default:
      return { error: "Unknown tool" };
  }
}

export async function POST(request: Request) {
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  if (!isAIConfigured()) {
    return NextResponse.json({ error: "ANTHROPIC_API_KEY required" }, { status: 500 });
  }

  const body = await request.json();
  const message = body.message;
  const language = body.language || "english";
  if (!message) return NextResponse.json({ error: "message required" }, { status: 400 });

  const user = await prisma.demoUser.findUnique({ where: { id: userId } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const orders = await prisma.demoOrder.findMany({ where: { userId }, orderBy: { createdAt: "desc" } });
  const history = await prisma.chatMessage.findMany({ where: { userId }, orderBy: { createdAt: "desc" }, take: 20 });

  await prisma.chatMessage.create({ data: { userId, role: "customer", text: message } });

  const ordersCtx = orders.map((o) => `${o.orderId}: ${o.item} ₹${o.amount} [${o.status}]`).join("\n");
  const historyCtx = history.reverse().filter((m) => m.role !== "system").slice(-15).map((m) => `${m.role}: ${m.text}`).join("\n");

  const langs: Record<string, string> = {
    english: "English", hinglish: "Hinglish", hindi: "Hindi", kannada: "Kannada",
    tamil: "Tamil", telugu: "Telugu", malayalam: "Malayalam", bengali: "Bengali",
    gujarati: "Gujarati", marathi: "Marathi", punjabi: "Punjabi", odia: "Odia",
  };

  const sys = `You are a helpful AI assistant for ShopEasy e-commerce. Respond in ${langs[language] || "English"}.

Customer: ${user.name}, Address: ${user.address}
Orders:\n${ordersCtx || "None"}
Recent chat:\n${historyCtx || "None"}

Help with anything. Use tools ONLY for order actions. For general questions, just answer. Be concise and friendly.
When using a tool, always confirm the result to the customer.`;

  let reply = "";
  let toolName = "no_action";
  let toolArgs: Record<string, any> = {};
  let toolResult: Record<string, any> = {};
  let verdict: string | null = null;

  try {
    const execTools = Object.fromEntries(
      Object.entries(toolDefs).map(([name, def]) => [
        name,
        {
          ...def,
          execute: async (args: any) => {
            const res = await executeTool(name, args, userId, user.address);
            toolName = name;
            toolArgs = args;
            toolResult = res;
            return res;
          },
        },
      ])
    );

    const result = await generateText({
      model: getModel(),
      system: sys,
      prompt: message,
      tools: execTools,
      maxSteps: 3 as any,
    });

    reply = result.text || "Done.";

    if (toolName !== "no_action") {
      if (toolName === "cancel_order") {
        const order = await prisma.demoOrder.findFirst({ where: { orderId: String(toolArgs.order_id), userId } });
        verdict = order?.status === "cancelled" ? "pass" : "fail";
      } else if (toolName === "change_address") {
        const order = await prisma.demoOrder.findFirst({ where: { orderId: String(toolArgs.order_id), userId } });
        verdict = order?.address === String(toolArgs.new_address) ? "pass" : "fail";
      } else {
        verdict = toolResult.success !== false ? "pass" : "fail";
      }
    }
  } catch (err: unknown) {
    const errDetail = err instanceof Error ? `${err.name}: ${err.message}` : String(err);
    console.error("Chat API error:", errDetail);
    reply = `Error: ${errDetail}`;
  }

  const td = toolName !== "no_action" ? { name: toolName, args: toolArgs } : null;
  await prisma.chatMessage.create({ data: { userId, role: "agent", text: reply, toolCall: td ? JSON.stringify(td) : null, verdict } });

  return NextResponse.json({ reply, tool: td || { name: "no_action", args: {} }, toolResult, verdict });
}
