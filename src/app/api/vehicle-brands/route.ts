import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/current-user";

export async function GET() {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json(
        { error: "Silakan login terlebih dahulu" },
        { status: 401 }
      );
    }

    const brands = await prisma.vehicleBrand.findMany({
      where: {
        active: true,
      },
      orderBy: {
        name: "asc",
      },
      select: {
        id: true,
        name: true,
        active: true,
      },
    });

    return NextResponse.json({
      success: true,
      brands,
    });
  } catch (error) {
    console.error("GET /api/vehicle-brands error:", error);

    return NextResponse.json(
      { error: "Gagal mengambil merek kendaraan" },
      { status: 500 }
    );
  }
}