import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";

type Period =
  | "today"
  | "yesterday"
  | "7days"
  | "month"
  | "lastmonth";

function getPeriodRange(period: Period) {
  const now = new Date();

  const start = new Date(now);
  const end = new Date(now);

  start.setHours(0, 0, 0, 0);
  end.setHours(23, 59, 59, 999);

  if (period === "today") {
    return { start, end };
  }

  if (period === "yesterday") {
    start.setDate(start.getDate() - 1);
    end.setDate(end.getDate() - 1);

    return { start, end };
  }

  if (period === "7days") {
    start.setDate(start.getDate() - 6);

    return { start, end };
  }

  if (period === "month") {
    start.setDate(1);

    return { start, end };
  }

  if (period === "lastmonth") {
    const lastMonthStart = new Date(
      now.getFullYear(),
      now.getMonth() - 1,
      1,
      0,
      0,
      0,
      0,
    );

    const lastMonthEnd = new Date(
      now.getFullYear(),
      now.getMonth(),
      0,
      23,
      59,
      59,
      999,
    );

    return {
      start: lastMonthStart,
      end: lastMonthEnd,
    };
  }

  return { start, end };
}

export async function GET(request: Request) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json(
        { error: "Belum login" },
        { status: 401 },
      );
    }

    if (currentUser.role !== "OWNER") {
      return NextResponse.json(
        { error: "Akses hanya untuk OWNER" },
        { status: 403 },
      );
    }

    const { searchParams } = new URL(request.url);

    const allowedPeriods: Period[] = [
      "today",
      "yesterday",
      "7days",
      "month",
      "lastmonth",
    ];

    const requestedPeriod = searchParams.get("period");

    const period: Period = allowedPeriods.includes(
      requestedPeriod as Period,
    )
      ? (requestedPeriod as Period)
      : "today";

    const { start, end } = getPeriodRange(period);

    const transactions = await prisma.transaction.findMany({
      where: {
        status: "COMPLETED",
        createdAt: {
          gte: start,
          lte: end,
        },
      },
      select: {
        id: true,
        vehicleType: true,
        price: true,
        employeeResult: true,
        createdAt: true,
      },
    });

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const employeeTransactions =
      await prisma.transaction.findMany({
        where: {
          status: "COMPLETED",
          employeeId: {
            gt: 0,
          },
          createdAt: {
            gte: todayStart,
            lte: todayEnd,
          },
        },
        select: {
          id: true,
          employeeResult: true,
        },
      });

    const expenses = await prisma.expense.findMany({
      where: {
        expenseDate: {
          gte: start,
          lte: end,
        },
      },
      select: {
        amount: true,
        expenseDate: true,
      },
    });

    const totalRevenue = transactions.reduce(
      (total, transaction) =>
        total + transaction.price,
      0,
    );

    const totalEmployeeResult =
      transactions.reduce(
        (total, transaction) =>
          total + transaction.employeeResult,
        0,
      );

    const totalExpenses = expenses.reduce(
      (total, expense) =>
        total + expense.amount,
      0,
    );

    const netProfit =
      totalRevenue -
      totalEmployeeResult -
      totalExpenses;

    const totalVehicles = transactions.length;

    const totalEmployeeVehicles =
      employeeTransactions.length;

    const totalEmployeeIncome =
      employeeTransactions.reduce(
        (total, transaction) =>
          total + transaction.employeeResult,
        0,
      );

    const motorCount = transactions.filter(
      (transaction) =>
        transaction.vehicleType === "MOTOR",
    ).length;

    const mobilCount = transactions.filter(
      (transaction) =>
        transaction.vehicleType === "MOBIL",
    ).length;

    const periodLabel =
      period === "today"
        ? "Hari Ini"
        : period === "yesterday"
          ? "Kemarin"
          : period === "7days"
            ? "7 Hari Terakhir"
            : period === "month"
              ? "Bulan Ini"
              : "Bulan Lalu";

    const ownerName =
      currentUser.username?.trim() || "Owner";

    const ownerInitial =
      ownerName.charAt(0).toUpperCase();

    return NextResponse.json({
      success: true,
      period,
      periodLabel,
      ownerName,
      ownerInitial,
periodStart: start.toISOString(),
periodEnd: end.toISOString(),
totalRevenue,
      totalEmployeeResult,
      totalExpenses,
      netProfit,
      totalVehicles,
      totalEmployeeVehicles,
      totalEmployeeIncome,
      motorCount,
      mobilCount,
    });
  } catch (error) {
    console.error(
      "OWNER DASHBOARD ERROR:",
      error,
    );

    return NextResponse.json(
      {
        error:
          "Gagal mengambil data dashboard owner",
      },
      { status: 500 },
    );
  }
}