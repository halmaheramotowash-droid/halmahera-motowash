import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const secret = process.env.AUTH_SECRET;

const ALLOWED_ORIGINS = new Set([
  "https://localhost",
  "http://localhost",
  "capacitor://localhost",
]);

function applyCors(
  response: NextResponse,
  request: NextRequest
) {
  const origin = request.headers.get("origin");

  if (origin && ALLOWED_ORIGINS.has(origin)) {
    response.headers.set(
      "Access-Control-Allow-Origin",
      origin
    );

    response.headers.set(
      "Access-Control-Allow-Credentials",
      "true"
    );

    response.headers.set(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization, X-Client-Type"
    );

    response.headers.set(
      "Access-Control-Allow-Methods",
      "GET, POST, PUT, PATCH, DELETE, OPTIONS"
    );

    response.headers.set(
      "Vary",
      "Origin"
    );
  }

  return response;
}

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  /*
   * =========================
   * API CORS
   * =========================
   *
   * API mobile menggunakan Bearer JWT,
   * jadi API tidak boleh dipaksa memiliki
   * cookie session oleh proxy.
   */

  if (pathname.startsWith("/api/")) {
    if (request.method === "OPTIONS") {
      return applyCors(
        new NextResponse(null, {
          status: 204,
        }),
        request
      );
    }

    const response = NextResponse.next();

    return applyCors(response, request);
  }

  /*
   * =========================
   * WEB PAGE AUTH
   * =========================
   */

  const token = request.cookies.get("session")?.value;

  const isProtected =
    pathname.startsWith("/owner") ||
    pathname.startsWith("/cuci") ||
    pathname.startsWith("/hasil") ||
    pathname.startsWith("/riwayat");

  if (!isProtected) {
    return NextResponse.next();
  }

  if (!token || !secret) {
    return NextResponse.redirect(
      new URL("/login", request.url)
    );
  }

  try {
    const { payload } = await jwtVerify(
      token,
      new TextEncoder().encode(secret)
    );

    const role = payload.role;

    if (
      pathname.startsWith("/owner") &&
      role !== "OWNER"
    ) {
      return NextResponse.redirect(
        new URL("/", request.url)
      );
    }

    if (
      (
        pathname.startsWith("/cuci") ||
        pathname.startsWith("/hasil") ||
        pathname.startsWith("/riwayat")
      ) &&
      role !== "KARYAWAN" &&
      role !== "OWNER"
    ) {
      return NextResponse.redirect(
        new URL("/login", request.url)
      );
    }

    return NextResponse.next();
  } catch {
    return NextResponse.redirect(
      new URL("/login", request.url)
    );
  }
}

export const config = {
  matcher: [
    "/api/:path*",
    "/owner/:path*",
    "/cuci/:path*",
    "/hasil/:path*",
    "/riwayat/:path*",
  ],
};