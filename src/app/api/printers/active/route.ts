import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/current-user";

export async function GET() {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json(
        {
          error: "Silakan login terlebih dahulu",
        },
        { status: 401 }
      );
    }

    const printer =
      await prisma.printer.findFirst({
        where: {
          isActive: true,
          isDefault: true,
        },
        orderBy: {
          id: "asc",
        },
      });

    return NextResponse.json({
      success: true,
      printer,
    });
  } catch (error) {
    console.error(
      "GET /api/printers/active error:",
      error
    );

    return NextResponse.json(
      {
        error: "Gagal mengambil printer aktif",
      },
      { status: 500 }
    );
  }
}