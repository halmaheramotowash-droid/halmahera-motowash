import { SignJWT, jwtVerify } from "jose";

const secret = process.env.AUTH_SECRET;

if (!secret) {
  throw new Error("AUTH_SECRET belum tersedia");
}

const encodedSecret = new TextEncoder().encode(secret);

export type SessionPayload = {
  userId: number;
  username: string;
  role: "OWNER" | "KARYAWAN";
};

export async function createSession(payload: SessionPayload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(encodedSecret);
}

export async function verifySession(token: string) {
  try {
    const { payload } = await jwtVerify(token, encodedSecret);

    if (
      typeof payload.userId !== "number" ||
      typeof payload.username !== "string" ||
      (payload.role !== "OWNER" && payload.role !== "KARYAWAN")
    ) {
      return null;
    }

    return {
      userId: payload.userId,
      username: payload.username,
      role: payload.role,
    } as SessionPayload;
  } catch {
    return null;
  }
}
