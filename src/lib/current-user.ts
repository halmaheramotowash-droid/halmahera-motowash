import { cookies, headers } from "next/headers";
import { verifySession, type SessionPayload } from "@/lib/auth";

export async function getCurrentUser(): Promise<SessionPayload | null> {
  /*
   * ============================================================
   * 1. CEK BEARER TOKEN
   * ============================================================
   *
   * Digunakan oleh aplikasi Android/mobile.
   *
   * Format:
   *
   * Authorization: Bearer <JWT>
   *
   * Token tetap diverifikasi menggunakan AUTH_SECRET
   * melalui verifySession().
   */
  try {
    const headerStore = await headers();
    const authorization = headerStore.get("authorization");

    if (authorization?.startsWith("Bearer ")) {
      const token = authorization.slice("Bearer ".length).trim();

      if (token) {
        const session = await verifySession(token);

        if (session) {
          return session;
        }
      }
    }
  } catch (error) {
    console.error("Gagal membaca Bearer token:", error);
  }

  /*
   * ============================================================
   * 2. FALLBACK KE SESSION COOKIE
   * ============================================================
   *
   * Digunakan oleh website seperti sebelumnya.
   *
   * Tidak mengubah mekanisme login website yang sudah berjalan.
   */
  try {
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
  } catch (error) {
    console.error("Gagal membaca session cookie:", error);
    return null;
  }
}