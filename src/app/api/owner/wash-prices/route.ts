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

    if (currentUser.role !== "OWNER") {
      return NextResponse.json(
        { error: "Akses hanya untuk Owner" },
        { status: 403 }
      );
    }

    const prices = await prisma.washPrice.findMany({
      where: {
        category: {
          in: allowedCategories,
        },
        active: true,
      },
      orderBy: {
        id: "asc",
      },
    });

    return NextResponse.json({
      success: true,
      prices,
    });
  } catch (error) {
    console.error("GET /api/owner/wash-prices error:", error);

    return NextResponse.json(
      { error: "Gagal mengambil harga cuci" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json(
        { error: "Silakan login terlebih dahulu" },
        { status: 401 }
      );
    }

    if (currentUser.role !== "OWNER") {
      return NextResponse.json(
        { error: "Akses hanya untuk Owner" },
        { status: 403 }
      );
    }

    const body = await request.json();

    const category =
      typeof body.category === "string"
        ? body.category.trim()
        : "";

    const price = Number(body.price);

    if (!allowedCategories.includes(category)) {
      return NextResponse.json(
        { error: "Kategori harga tidak valid" },
        { status: 400 }
      );
    }

    if (!Number.isInteger(price) || price <= 0) {
      return NextResponse.json(
        { error: "Harga harus berupa angka bulat lebih dari Rp0" },
        { status: 400 }
      );
    }

    const updatedPrice = await prisma.washPrice.update({
      where: {
        category,
      },
      data: {
        price,
        active: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Harga ${category} berhasil disimpan`,
      price: updatedPrice,
    });
  } catch (error) {
    console.error("PUT /api/owner/wash-prices error:", error);

    return NextResponse.json(
      { error: "Gagal menyimpan harga cuci" },
      { status: 500 }
    );
  }
}