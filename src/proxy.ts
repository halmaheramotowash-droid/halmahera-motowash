import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const secret = process.env.AUTH_SECRET;

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
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
    return NextResponse.redirect(new URL("/login", request.url));
  }

  try {
    const { payload } = await jwtVerify(
      token,
      new TextEncoder().encode(secret)
    );

    const role = payload.role;

    if (pathname.startsWith("/owner") && role !== "OWNER") {
      return NextResponse.redirect(new URL("/", request.url));
    }

    if (
      (pathname.startsWith("/cuci") ||
        pathname.startsWith("/hasil") ||
        pathname.startsWith("/riwayat")) &&
      role !== "KARYAWAN" &&
      role !== "OWNER"
    ) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    return NextResponse.next();
  } catch {
    return NextResponse.redirect(new URL("/login", request.url));
  }
}

export const config = {
  matcher: ["/owner/:path*", "/cuci/:path*", "/hasil/:path*", "/riwayat/:path*"],
};
