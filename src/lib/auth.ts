import { cookies } from "next/headers";

const VALID_USER = "user1234";
const VALID_PASS = "password";
const SESSION_COOKIE = "bhashaqa_session";

export async function authenticate(username: string, password: string): Promise<boolean> {
  if (username === VALID_USER && password === VALID_PASS) {
    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE, "authenticated", {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });
    return true;
  }
  return false;
}

export async function isAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  return cookieStore.get(SESSION_COOKIE)?.value === "authenticated";
}

export async function logout(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}
