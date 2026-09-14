import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json(
        { error: "Belum login" },
        { status: 401 }
      );
    }

    if (currentUser.role !== "OWNER") {
      return NextResponse.json(
        { error: "Akses hanya untuk Owner" },
        { status: 403 }
      );
    }

    const expenses = await prisma.expense.findMany({
      orderBy: {
        expenseDate: "desc",
      },
      take: 100,
      include: {
        createdBy: {
          select: {
            name: true,
            username: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      expenses,
    });
  } catch (error) {
    console.error("GET EXPENSE ERROR:", error);

    return NextResponse.json(
      { error: "Gagal mengambil data pengeluaran" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json(
        { error: "Belum login" },
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

    const expenseDate = String(body.expenseDate ?? "");
    const category = String(body.category ?? "");
    const description = String(body.description ?? "").trim();
    const amount = Number(body.amount);

    const allowedCategories = [
      "LISTRIK",
      "AIR",
      "CHEMICAL_SABUN",
      "PERAWATAN_ALAT",
      "PERLENGKAPAN",
      "SEWA",
      "GAJI_UPAH",
      "OPERASIONAL",
      "LAINNYA",
    ];

    if (!expenseDate) {
      return NextResponse.json(
        { error: "Tanggal pengeluaran wajib diisi" },
        { status: 400 }
      );
    }

    if (!allowedCategories.includes(category)) {
      return NextResponse.json(
        { error: "Kategori pengeluaran tidak valid" },
        { status: 400 }
      );
    }

    if (!Number.isInteger(amount) || amount <= 0) {
      return NextResponse.json(
        { error: "Nominal harus lebih dari Rp0" },
        { status: 400 }
      );
    }

    const parsedDate = new Date(expenseDate);

    if (Number.isNaN(parsedDate.getTime())) {
      return NextResponse.json(
        { error: "Tanggal tidak valid" },
        { status: 400 }
      );
    }

    const startOfDay = new Date(parsedDate);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(parsedDate);
    endOfDay.setHours(23, 59, 59, 999);

    const countToday = await prisma.expense.count({
      where: {
        expenseDate: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
    });

    const datePart =
      `${parsedDate.getFullYear()}${String(
        parsedDate.getMonth() + 1
      ).padStart(2, "0")}${String(
        parsedDate.getDate()
      ).padStart(2, "0")}`;

    const expenseNumber =
      `EXP-${datePart}-${String(countToday + 1).padStart(4, "0")}`;

    const expense = await prisma.expense.create({
      data: {
        expenseNumber,
        expenseDate: parsedDate,
        category: category as
          | "LISTRIK"
          | "AIR"
          | "CHEMICAL_SABUN"
          | "PERAWATAN_ALAT"
          | "PERLENGKAPAN"
          | "SEWA"
          | "GAJI_UPAH"
          | "OPERASIONAL"
          | "LAINNYA",
        description: description || null,
        amount,
        createdById: currentUser.userId,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Pengeluaran berhasil disimpan",
      expense,
    });
  } catch (error) {
    console.error("POST EXPENSE ERROR:", error);

    return NextResponse.json(
      { error: "Gagal menyimpan pengeluaran" },
      { status: 500 }
    );
  }
}