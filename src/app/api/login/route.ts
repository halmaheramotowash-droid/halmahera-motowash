import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { createSession } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const username = String(body.username ?? "").trim();
    const password = String(body.password ?? "");

    if (!username || !password) {
      return NextResponse.json(
        { error: "Username dan password wajib diisi" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { username },
    });

    if (!user || !user.active) {
      return NextResponse.json(
        { error: "Username atau password salah" },
        { status: 401 }
      );
    }

    const passwordValid = await bcrypt.compare(
      password,
      user.passwordHash
    );

    if (!passwordValid) {
      return NextResponse.json(
        { error: "Username atau password salah" },
        { status: 401 }
      );
    }

    const sessionToken = await createSession({
      userId: user.id,
      username: user.username,
      role: user.role,
    });

    /*
     * Website tetap menggunakan HttpOnly cookie.
     *
     * APK/mobile nantinya dapat meminta JWT secara eksplisit
     * menggunakan header:
     *
     * X-Client-Type: mobile
     *
     * Token hanya dikembalikan untuk client mobile.
     */
    const isMobileClient =
      request.headers.get("x-client-type") === "mobile";

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        username: user.username,
        role: user.role,
      },
      ...(isMobileClient
        ? {
            sessionToken,
          }
        : {}),
    });

    /*
     * Cookie session tetap dibuat seperti sebelumnya.
     * Ini menjaga login website tetap kompatibel.
     */
    response.cookies.set({
      name: "session",
      value: sessionToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Gagal memproses login" },
      { status: 500 }
    );
  }
}