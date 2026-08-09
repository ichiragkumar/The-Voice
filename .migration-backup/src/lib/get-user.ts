import { cookies } from "next/headers";
import { prisma } from "@/lib/db";

export async function getUser() {
  const cookieStore = await cookies();
  const userId = cookieStore.get("wordai_session")?.value;
  if (!userId) return null;
  return prisma.demoUser.findUnique({ where: { id: userId } });
}

export async function getUserId(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get("wordai_session")?.value || null;
}
