import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/current-user";

export async function GET() {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json(
        {
          error: "Silakan login terlebih dahulu",
        },
        {
          status: 401,
        }
      );
    }

    return NextResponse.json({
      success: true,
      user: currentUser,
    });
  } catch (error) {
    console.error(
      "GET /api/me error:",
      error
    );

    return NextResponse.json(
      {
        error: "Gagal mengambil data pengguna",
      },
      {
        status: 500,
      }
    );
  }
}