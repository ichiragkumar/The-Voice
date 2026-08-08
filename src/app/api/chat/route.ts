import { NextResponse } from "next/server";
import { generateText } from "ai";
import { getModel, isAIConfigured } from "@/lib/ai";
import { prisma } from "@/lib/db";
import { getUserId } from "@/lib/get-user";

export async function POST(request: Request) {
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { message, language = "hinglish" } = await request.json();
  if (!message) return NextResponse.json({ error: "message required" }, { status: 400 });

  const user = await prisma.demoUser.findUnique({ where: { id: userId } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const orders = await prisma.demoOrder.findMany({ where: { userId }, orderBy: { createdAt: "desc" } });
  const history = await prisma.chatMessage.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 10,
  });
  const recentHistory = history.reverse();

  await prisma.chatMessage.create({ data: { userId, role: "customer", text: message } });

  const ordersContext = orders.map((o) =>
    `${o.orderId}: ${o.item} ₹${o.amount} [${o.status}] method:${o.method} address:"${o.address}" tracking:${o.tracking || "none"}`
  ).join("\n");

  const historyContext = recentHistory
    .filter((m) => m.role !== "system")
    .map((m) => `${m.role}: ${m.text}`)
    .join("\n");

  const langInstruction = language === "english" ? "Respond in English only." : language === "hindi" ? "Respond in Hindi only (Devanagari script)." : "Respond in Hinglish (mix of Hindi and English).";

  const systemPrompt = `You are ShopEasy customer support voice agent. ${langInstruction}

Customer: ${user.name}
Address: ${user.address}

Orders:
${ordersContext}

Recent conversation:
${historyContext}

You must respond in JSON: {"reply":"your response","tool":{"name":"tool_name","args":{...}}}

Available tools:
- cancel_order: Cancel an order. Args: {order_id}. Only works if status is "not_dispatched".
- process_refund: Process refund. Args: {order_id, method}. Only for cancelled/delivered orders.
- track_order: Get tracking info. Args: {order_id}.
- change_address: Change delivery address. Args: {order_id, new_address}.
- place_order: Place a new order. Args: {item, method}.
- check_status: Check order status. Args: {order_id}.
- no_action: No tool needed (for general queries). Args: {}.

Rules:
1. Only cancel "not_dispatched" orders. If shipped/delivered, explain why you can't.
2. Use the customer's order IDs from the list above.
3. If the customer doesn't specify an order and has multiple, ask which one.
4. Keep replies short and conversational in Hinglish.
5. Remember previous conversation context.
6. If a question is irrelevant to orders, politely redirect.`;

  let reply = "";
  let tool = { name: "no_action", args: {} as Record<string, unknown> };

  if (isAIConfigured()) {
    try {
      const { text } = await generateText({
        model: getModel(),
        system: systemPrompt,
        prompt: `Customer says: "${message}"\nRespond in JSON.`,
      });
      const parsed = JSON.parse(text);
      reply = parsed.reply || text;
      tool = parsed.tool || tool;
    } catch {
      reply = inferReply(message, orders);
      tool = inferTool(message, orders);
    }
  } else {
    reply = inferReply(message, orders);
    tool = inferTool(message, orders);
  }

  let toolResult: Record<string, unknown> = {};
  let verdict: "pass" | "fail" | null = null;

  if (tool.name !== "no_action" && tool.name) {
    const toolRes = await executeTool(tool.name, tool.args, userId);
    toolResult = toolRes;

    if (tool.name === "cancel_order" && tool.args.order_id) {
      const order = await prisma.demoOrder.findFirst({ where: { orderId: String(tool.args.order_id), userId } });
      verdict = order?.status === "cancelled" ? "pass" : "fail";
    } else if (tool.name === "change_address" && tool.args.order_id) {
      const order = await prisma.demoOrder.findFirst({ where: { orderId: String(tool.args.order_id), userId } });
      verdict = order?.address === String(tool.args.new_address) ? "pass" : "fail";
    } else {
      verdict = "pass";
    }
  }

  await prisma.chatMessage.create({
    data: {
      userId,
      role: "agent",
      text: reply,
      toolCall: tool.name !== "no_action" ? JSON.stringify(tool) : null,
      verdict,
    },
  });

  return NextResponse.json({ reply, tool, toolResult, verdict });
}

async function executeTool(name: string, args: Record<string, unknown>, userId: string) {
  const baseUrl = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000";

  try {
    switch (name) {
      case "cancel_order": {
        const order = await prisma.demoOrder.findFirst({ where: { orderId: String(args.order_id), userId } });
        if (!order) return { error: "Order not found" };
        if (order.status !== "not_dispatched") return { error: `Cannot cancel — ${order.status}` };
        await prisma.demoOrder.update({ where: { id: order.id }, data: { status: "cancelled" } });
        return { success: true, orderId: args.order_id, status: "cancelled" };
      }
      case "process_refund": {
        const order = await prisma.demoOrder.findFirst({ where: { orderId: String(args.order_id), userId } });
        if (!order) return { error: "Order not found" };
        return { success: true, amount: order.amount, method: args.method || order.method };
      }
      case "track_order": {
        const order = await prisma.demoOrder.findFirst({ where: { orderId: String(args.order_id), userId } });
        if (!order) return { error: "Order not found" };
        return { orderId: order.orderId, status: order.status, tracking: order.tracking || "Not available" };
      }
      case "change_address": {
        const order = await prisma.demoOrder.findFirst({ where: { orderId: String(args.order_id), userId } });
        if (!order) return { error: "Order not found" };
        await prisma.demoOrder.update({ where: { id: order.id }, data: { address: String(args.new_address) } });
        return { success: true, orderId: order.orderId, newAddress: args.new_address };
      }
      case "place_order": {
        const user = await prisma.demoUser.findUnique({ where: { id: userId } });
        const order = await prisma.demoOrder.create({
          data: {
            userId, orderId: `ORD-${1000 + Math.floor(Math.random() * 9000)}`,
            item: String(args.item || "Phone Case"), amount: 899,
            status: "not_dispatched", method: String(args.method || "cod"),
            address: user?.address || "Default",
          },
        });
        return { success: true, orderId: order.orderId, item: order.item };
      }
      case "check_status": {
        const order = await prisma.demoOrder.findFirst({ where: { orderId: String(args.order_id), userId } });
        if (!order) return { error: "Order not found" };
        return { orderId: order.orderId, item: order.item, status: order.status, amount: order.amount };
      }
      default:
        return { info: "No action taken" };
    }
  } catch (e: any) {
    return { error: e.message };
  }
}

function findOrder(message: string, orders: any[], statusFilter?: string) {
  const lower = message.toLowerCase();
  const filtered = statusFilter ? orders.filter((o: any) => o.status === statusFilter) : orders;
  const byName = filtered.find((o: any) => lower.includes(o.item.toLowerCase()));
  const byId = filtered.find((o: any) => lower.includes(o.orderId.toLowerCase()));
  return byId || byName || filtered[0] || null;
}

function inferReply(message: string, orders: any[]) {
  const lower = message.toLowerCase();
  if (lower.includes("cancel")) {
    const nd = findOrder(message, orders, "not_dispatched");
    return nd ? `${nd.orderId} (${nd.item}) cancel kar diya hai.` : "Koi cancellable order nahi hai. Sirf 'not dispatched' orders cancel ho sakte hain.";
  }
  if (lower.includes("track") || lower.includes("where") || lower.includes("kahan") || lower.includes("package")) {
    const shipped = findOrder(message, orders, "shipped");
    return shipped ? `${shipped.orderId} (${shipped.item}) shipped hai. Tracking: ${shipped.tracking}. 2-3 din mein aa jayega.` : "Koi shipped order nahi hai abhi.";
  }
  if (lower.includes("place") || lower.includes("new order") || lower.includes("buy") || lower.includes("order kar") ||
      (lower.includes("order") && (lower.includes("please") || lower.includes("can you") || lower.includes("want")))) {
    const itemMatch = lower.match(/(?:order|buy|place|get)\s+(?:a\s+|an\s+|me\s+(?:a\s+|an\s+)?)?(.+?)(?:\s+for|\s+please|\s*$)/);
    const itemName = itemMatch?.[1]?.trim() || "item";
    return `${itemName} ka naya order place kar diya hai! Order sidebar mein dekh sakte hain.`;
  }
  if (lower.includes("refund") || lower.includes("paisa wapas") || lower.includes("money back")) {
    const target = findOrder(message, orders);
    const eligible = target && (target.status === "cancelled" || target.status === "delivered") ? target : orders.find((o: any) => o.status === "cancelled" || o.status === "delivered");
    return eligible ? `${eligible.orderId} (${eligible.item}) ka ₹${eligible.amount} refund process kar diya.` : "Refund ke liye pehle order cancel karein ya delivered order select karein.";
  }
  if (lower.includes("address") || lower.includes("pata") || lower.includes("change address")) {
    const active = findOrder(message, orders, "not_dispatched") || findOrder(message, orders, "shipped");
    return active ? `${active.orderId} (${active.item}) ka address update kar diya.` : "Koi active order nahi hai address change karne ke liye.";
  }
  if (lower.includes("status") || lower.includes("orders") || lower.includes("show") || lower.includes("list") || lower.includes("dikhao")) {
    return `Aapke ${orders.length} orders hain:\n${orders.map((o) => `• ${o.orderId}: ${o.item} ₹${o.amount} [${o.status}]`).join("\n")}`;
  }
  if (lower.includes("hello") || lower.includes("hi") || lower.includes("hey") || lower.includes("namaste")) {
    return `Namaste! Main ShopEasy support hoon. Aapke ${orders.length} orders hain. Cancel, track, refund, ya kuch aur help chahiye?`;
  }
  return `Main samajh gaya. Aapke paas ${orders.length} orders hain. Try: "cancel my order", "track my package", "show my orders", ya "place new order".`;
}

function inferTool(message: string, orders: any[]) {
  const lower = message.toLowerCase();
  if (lower.includes("cancel")) {
    const nd = findOrder(message, orders, "not_dispatched");
    return nd ? { name: "cancel_order", args: { order_id: nd.orderId } } : { name: "no_action", args: {} };
  }
  if (lower.includes("track") || lower.includes("where") || lower.includes("kahan") || lower.includes("package")) {
    const shipped = findOrder(message, orders, "shipped");
    return shipped ? { name: "track_order", args: { order_id: shipped.orderId } } : { name: "no_action", args: {} };
  }
  if (lower.includes("place") || lower.includes("new order") || lower.includes("buy") || lower.includes("order kar") ||
      (lower.includes("order") && (lower.includes("please") || lower.includes("can you") || lower.includes("want")))) {
    const itemMatch = lower.match(/(?:order|buy|place|get)\s+(?:a\s+|an\s+|me\s+(?:a\s+|an\s+)?)?(.+?)(?:\s+for|\s+please|\s*$)/);
    const item = itemMatch?.[1]?.trim() || "Phone Case";
    return { name: "place_order", args: { item, method: "upi" } };
  }
  if (lower.includes("refund") || lower.includes("paisa") || lower.includes("money back")) {
    const target = findOrder(message, orders);
    const eligible = target && (target.status === "cancelled" || target.status === "delivered") ? target : orders.find((o: any) => o.status === "cancelled" || o.status === "delivered");
    return eligible ? { name: "process_refund", args: { order_id: eligible.orderId, method: "upi" } } : { name: "no_action", args: {} };
  }
  if (lower.includes("address") || lower.includes("pata")) {
    const active = findOrder(message, orders, "not_dispatched") || findOrder(message, orders, "shipped");
    const addrMatch = lower.match(/(?:to|change.*to)\s+(.+)/);
    const newAddr = addrMatch?.[1]?.trim() || "456 Work Plaza, Mumbai";
    return active ? { name: "change_address", args: { order_id: active.orderId, new_address: newAddr } } : { name: "no_action", args: {} };
  }
  if (lower.includes("status") || lower.includes("orders") || lower.includes("show") || lower.includes("list") || lower.includes("dikhao")) {
    const target = findOrder(message, orders);
    return target ? { name: "check_status", args: { order_id: target.orderId } } : { name: "no_action", args: {} };
  }
  return { name: "no_action", args: {} };
}
