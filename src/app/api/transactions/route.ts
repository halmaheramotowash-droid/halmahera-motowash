import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/current-user";
import { randomUUID } from "node:crypto";

function getTodayWIB() {
  const now = new Date();

  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Jakarta",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

function getWIBDateRange(dateString: string) {
  const [year, month, day] = dateString.split("-").map(Number);

  const start = new Date(
    Date.UTC(year, month - 1, day, -7, 0, 0, 0)
  );

  const end = new Date(
    Date.UTC(year, month - 1, day + 1, -7, 0, 0, 0)
  );

  return { start, end };
}

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
          ? {
              employeeId: currentUser.userId,
            }
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
const paymentMethod = String(
  body.paymentMethod ?? "TUNAI"
).trim();

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
if (!["TUNAI", "QRIS"].includes(paymentMethod)) {
  return NextResponse.json(
    { error: "Metode pembayaran tidak valid" },
    { status: 400 }
  );
}

    const compensation = await prisma.employeeCompensation.findUnique({
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

    const todayWIB = getTodayWIB();
    const { start, end } = getWIBDateRange(todayWIB);

    const transactionNumber = `TRX-${todayWIB.replace(
      /-/g,
      ""
    )}-${randomUUID().replace(/-/g, "").slice(0, 8).toUpperCase()}`;

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

paymentMethod: paymentMethod as "TUNAI" | "QRIS",
paymentStatus:
  paymentMethod === "QRIS" ? "PENDING" : "PAID",

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