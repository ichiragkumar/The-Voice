"use server";

import { authenticate, logout } from "@/lib/auth";
import { redirect } from "next/navigation";

export async function loginAction(formData: FormData) {
  const username = formData.get("username") as string;
  const password = formData.get("password") as string;

  const success = await authenticate(username, password);

  if (!success) {
    return { error: "Invalid username or password" };
  }

  redirect("/dashboard");
}

export async function logoutAction() {
  await logout();
  redirect("/");
}
