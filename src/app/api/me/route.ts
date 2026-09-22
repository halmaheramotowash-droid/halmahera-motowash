import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/current-user";
import { applyCors, corsOptions } from "@/lib/cors";

export async function OPTIONS(request: Request) {
  return corsOptions(request);
}

export async function GET(request: Request) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return applyCors(
        NextResponse.json(
          {
            error: "Silakan login terlebih dahulu",
          },
          {
            status: 401,
          }
        ),
        request
      );
    }

    return applyCors(
      NextResponse.json({
        success: true,
        user: currentUser,
      }),
      request
    );
  } catch (error) {
    console.error(
      "GET /api/me error:",
      error
    );

    return applyCors(
      NextResponse.json(
        {
          error: "Gagal mengambil data pengguna",
        },
        {
          status: 500,
        }
      ),
      request
    );
  }
}
