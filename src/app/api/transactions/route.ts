import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/current-user";
import { randomUUID } from "node:crypto";

export async function GET() {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json(
        { error: "Silakan login terlebih dahulu" },
        { status: 401 }
      );
    }

    const transactions = await prisma.transaction.findMany({
      where:
        currentUser.role === "KARYAWAN"
          ? { employeeId: currentUser.userId }
          : undefined,
      orderBy: {
        createdAt: "desc",
      },
      take: 100,
    });

    return NextResponse.json({
      success: true,
      transactions,
    });
  } catch (error) {
    console.error("GET /api/transactions error:", error);

    return NextResponse.json(
      { error: "Gagal mengambil riwayat transaksi" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json(
        { error: "Silakan login terlebih dahulu" },
        { status: 401 }
      );
    }

    const body = await request.json();

    const vehicleType = String(body.vehicleType ?? "").trim();
    const category = String(body.category ?? "").trim();
    const model = String(body.model ?? "").trim();
    const price = Number(body.price);

    if (!["MOTOR", "MOBIL"].includes(vehicleType)) {
      return NextResponse.json(
        { error: "Tipe kendaraan tidak valid" },
        { status: 400 }
      );
    }

    if (!category) {
      return NextResponse.json(
        { error: "Kategori kendaraan wajib diisi" },
        { status: 400 }
      );
    }

    if (!Number.isInteger(price) || price <= 0) {
      return NextResponse.json(
        { error: "Harga transaksi tidak valid" },
        { status: 400 }
      );
    }

    const compensation =
      await prisma.employeeCompensation.findUnique({
        where: {
          vehicleType: vehicleType as "MOTOR" | "MOBIL",
        },
      });

    if (!compensation || !compensation.active) {
      return NextResponse.json(
        {
          error:
            "Kompensasi karyawan untuk tipe kendaraan ini belum diatur",
        },
        { status: 400 }
      );
    }

    const now = new Date();

    const startOfDay = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    );

    const startOfTomorrow = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() + 1
    );

    const datePart =
      now.getFullYear().toString() +
      String(now.getMonth() + 1).padStart(2, "0") +
      String(now.getDate()).padStart(2, "0");

    const transactionCount = await prisma.transaction.count({
      where: {
        createdAt: {
          gte: startOfDay,
          lt: startOfTomorrow,
        },
      },
    });

    const transactionNumber =
  `TRX-${datePart}-${randomUUID().replace(/-/g, "").slice(0, 8).toUpperCase()}`;

    const transaction = await prisma.transaction.create({
      data: {
        transactionNumber,

        vehicleId: null,
        employeeId: currentUser.userId,

        licensePlateSnapshot: null,
        brandSnapshot: null,
        modelSnapshot: model || null,

        categorySnapshot: category,
        vehicleType: vehicleType as "MOTOR" | "MOBIL",

        price,
        employeeResult: compensation.amount,

        status: "COMPLETED",
      },
    });

    return NextResponse.json({
      success: true,
      message: "Transaksi berhasil disimpan",
      transaction,
    });
  } catch (error) {
    console.error("POST /api/transactions error:", error);

    return NextResponse.json(
      { error: "Gagal menyimpan transaksi" },
      { status: 500 }
    );
  }
}