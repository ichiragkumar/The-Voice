import { NextResponse } from "next/server";
import { generateText } from "ai";
import { getModel, isAIConfigured } from "@/lib/ai";

export async function POST(request: Request) {
  const { auditName, context } = await request.json();

  if (!isAIConfigured()) {
    return NextResponse.json({ prompt: inferPromptFromName(auditName) });
  }

  try {
    const { text } = await generateText({
      model: getModel(),
      prompt: `Generate a concise voice agent system prompt for an agent named "${auditName}". ${context ? `Additional context: ${context}` : ""}

The prompt should:
- Define the agent's role clearly
- List what actions/tools the agent can perform
- Specify language handling (Hindi, Hinglish, English)
- Be under 200 words
- Be written as a direct instruction to the agent

Return ONLY the system prompt text, no explanation.`,
    });

    return NextResponse.json({ prompt: text });
  } catch {
    return NextResponse.json({ prompt: inferPromptFromName(auditName) });
  }
}

function inferPromptFromName(name: string): string {
  const lower = name.toLowerCase();

  if (lower.includes("ecommerce") || lower.includes("shop") || lower.includes("cancel") || lower.includes("refund")) {
    return "You are a customer support agent for an e-commerce company. Help customers cancel orders, process refunds, track deliveries, and change addresses. Support Hindi, Hinglish, and English. Refunds go to original payment method unless customer requests otherwise. Verify order ID before any changes.";
  }

  if (lower.includes("clinic") || lower.includes("doctor") || lower.includes("appointment") || lower.includes("hospital")) {
    return "You are a medical appointment assistant. Help patients book, reschedule, and cancel appointments with doctors. Support Hindi, Hinglish, and English. Verify patient identity before changes. Working hours: 9 AM - 6 PM, Monday to Saturday.";
  }

  if (lower.includes("collection") || lower.includes("finserv") || lower.includes("emi") || lower.includes("loan")) {
    return "You are a collections agent for a lending company. Remind customers about overdue EMIs, capture promise-to-pay dates and amounts. Support Hindi, Hinglish, and English. Always verify borrower identity before disclosing account details. Be polite but firm.";
  }

  if (lower.includes("insurance") || lower.includes("policy")) {
    return "You are a policy servicing agent for an insurance company. Help customers with premium payments, policy details, nominee changes, and claim status. Support Hindi, Hinglish, and English. Always verify policy number before making changes.";
  }

  return `You are a voice agent assistant for "${name}". Help customers with their requests in Hindi, Hinglish, and English. Verify identity before making changes. Be helpful and accurate.`;
}
