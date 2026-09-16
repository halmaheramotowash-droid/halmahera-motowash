import { cookies } from "next/headers";
import { verifySession, type SessionPayload } from "@/lib/auth";

export async function getCurrentUser(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();

  const sessionCookie = cookieStore.get("session");

  if (!sessionCookie?.value) {
    return null;
  }

  const session = await verifySession(sessionCookie.value);

  if (!session) {
    return null;
  }

  return session;
}