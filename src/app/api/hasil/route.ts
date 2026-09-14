import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";

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

  return {
    start,
    end,
  };
}

export async function GET(request: Request) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json(
        { error: "Belum login" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);

    const dateParam = searchParams.get("date");

    const selectedDate = dateParam || getTodayWIB();

    if (!/^\d{4}-\d{2}-\d{2}$/.test(selectedDate)) {
      return NextResponse.json(
        { error: "Format tanggal tidak valid" },
        { status: 400 }
      );
    }

    const { start, end } = getWIBDateRange(selectedDate);

    const where =
      currentUser.role === "KARYAWAN"
        ? {
            status: "COMPLETED" as const,
            employeeId: currentUser.userId,
            createdAt: {
              gte: start,
              lt: end,
            },
          }
        : {
            status: "COMPLETED" as const,
            createdAt: {
              gte: start,
              lt: end,
            },
          };

    const transactions = await prisma.transaction.findMany({
      where,
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        transactionNumber: true,
        licensePlateSnapshot: true,
        brandSnapshot: true,
        modelSnapshot: true,
        categorySnapshot: true,
        vehicleType: true,
        price: true,
        employeeResult: true,
        createdAt: true,
      },
    });

    const totalVehicles = transactions.length;

    const totalResult = transactions.reduce(
      (total, transaction) =>
        total + transaction.employeeResult,
      0
    );

    const motorCount = transactions.filter(
      (transaction) => transaction.vehicleType === "MOTOR"
    ).length;

    const mobilCount = transactions.filter(
      (transaction) => transaction.vehicleType === "MOBIL"
    ).length;

    return NextResponse.json({
      success: true,
      role: currentUser.role,
      date: selectedDate,
      totalVehicles,
      totalResult,
      motorCount,
      mobilCount,
      transactions,
    });
  } catch (error) {
    console.error("HASIL ERROR:", error);

    return NextResponse.json(
      { error: "Gagal mengambil hasil karyawan" },
      { status: 500 }
    );
  }
}