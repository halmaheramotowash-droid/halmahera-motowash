import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/current-user";

const allowedCategories = [
  "Motor Kecil",
  "Motor Sedang",
  "Motor Besar",
  "Mobil Kecil",
  "Mobil Besar",
];

export async function GET() {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json(
        { error: "Silakan login terlebih dahulu" },
        { status: 401 }
      );
    }

    const prices = await prisma.washPrice.findMany({
      where: {
        category: {
          in: allowedCategories,
        },
        active: true,
      },
    });

    return NextResponse.json({
      success: true,
      prices,
    });
  } catch (error) {
    console.error("GET /api/wash-prices error:", error);

    return NextResponse.json(
      { error: "Gagal mengambil harga cuci" },
      { status: 500 }
    );
  }
}