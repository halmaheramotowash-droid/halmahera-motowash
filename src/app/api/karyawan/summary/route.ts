import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/current-user";

function getTodayWIB() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Jakarta",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

function getWIBDateRange(dateString: string) {
  const [year, month, day] = dateString.split("-").map(Number);

  const start = new Date(
    Date.UTC(year, month - 1, day, -7, 0, 0, 0),
  );

  const end = new Date(
    Date.UTC(year, month - 1, day + 1, -7, 0, 0, 0),
  );

  return { start, end };
}

function getStartOfWeekWIB(dateString: string) {
  const [year, month, day] = dateString.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));

  const dayOfWeek = date.getUTCDay();
  const difference = dayOfWeek === 0 ? 6 : dayOfWeek - 1;

  date.setUTCDate(date.getUTCDate() - difference);

  return `${date.getUTCFullYear()}-${String(
    date.getUTCMonth() + 1,
  ).padStart(2, "0")}-${String(date.getUTCDate()).padStart(2, "0")}`;
}

export async function GET() {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json(
        { error: "Belum login." },
        { status: 401 },
      );
    }

    if (currentUser.role !== "KARYAWAN") {
      return NextResponse.json(
        { error: "Endpoint ini khusus KARYAWAN." },
        { status: 403 },
      );
    }

    const today = getTodayWIB();
    const weekStart = getStartOfWeekWIB(today);

    const todayRange = getWIBDateRange(today);
    const weekRange = getWIBDateRange(weekStart);

    const todayTransactions = await prisma.transaction.findMany({
      where: {
        status: "COMPLETED",
        employeeId: currentUser.userId,
        createdAt: {
          gte: todayRange.start,
          lt: todayRange.end,
        },
      },
      select: {
        price: true,
      },
    });

    const weekTransactions = await prisma.transaction.findMany({
      where: {
        status: "COMPLETED",
        employeeId: currentUser.userId,
        createdAt: {
          gte: weekRange.start,
          lt: todayRange.end,
        },
      },
      select: {
        price: true,
      },
    });

    const revenueToday = todayTransactions.reduce(
      (total, transaction) => total + transaction.price,
      0,
    );

    const weeklyRevenue = weekTransactions.reduce(
      (total, transaction) => total + transaction.price,
      0,
    );

    return NextResponse.json({
      success: true,
      date: today,
      summary: {
        vehiclesToday: todayTransactions.length,
        revenueToday,
        weeklyRevenue,
      },
    });
  } catch (error) {
    console.error("EMPLOYEE SUMMARY ERROR:", error);

    return NextResponse.json(
      { error: "Gagal mengambil statistik Karyawan." },
      { status: 500 },
    );
  }
}