import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/current-user";

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

    if (!currentUser || currentUser.role !== "OWNER") {
      return NextResponse.json(
        { error: "Akses ditolak. Khusus OWNER." },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const dateParam = searchParams.get("date");

    /*
     * Jika date tidak dikirim, perilaku lama tetap digunakan:
     * semua transaksi dan semua pengeluaran.
     */
    let dateFilter = {};

    let selectedDate: string | null = null;

    if (dateParam) {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(dateParam)) {
        return NextResponse.json(
          { error: "Format tanggal tidak valid" },
          { status: 400 }
        );
      }

      selectedDate = dateParam;

      const { start, end } = getWIBDateRange(dateParam);

      dateFilter = {
        createdAt: {
          gte: start,
          lt: end,
        },
      };
    }

    const transactions = await prisma.transaction.findMany({
      where: {
        status: "COMPLETED",
        ...dateFilter,
      },
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
        employeeId: true,
        createdAt: true,
      },
    });

    const expenses = await prisma.expense.findMany({
      where: dateFilter,
      select: {
        amount: true,
      },
    });

    const totalVehicles = transactions.length;

    const revenue = transactions.reduce(
      (total, transaction) =>
        total + transaction.price,
      0
    );

    const employeeCompensation = transactions.reduce(
      (total, transaction) =>
        total + transaction.employeeResult,
      0
    );

    const totalExpenses = expenses.reduce(
      (total, expense) =>
        total + expense.amount,
      0
    );

    const netProfit =
      revenue -
      employeeCompensation -
      totalExpenses;

    const motorCount = transactions.filter(
      (transaction) =>
        transaction.vehicleType === "MOTOR"
    ).length;

    const mobilCount = transactions.filter(
      (transaction) =>
        transaction.vehicleType === "MOBIL"
    ).length;

    /*
     * Ambil nama karyawan berdasarkan employeeId.
     */
    const employeeIds = [
      ...new Set(
        transactions
          .map((transaction) => transaction.employeeId)
          .filter(
            (id): id is number =>
              typeof id === "number"
          )
      ),
    ];

    const employees =
      employeeIds.length > 0
        ? await prisma.user.findMany({
            where: {
              id: {
                in: employeeIds,
              },
            },
            select: {
              id: true,
              name: true,
              username: true,
            },
          })
        : [];

    /*
     * Buat rekap hasil masing-masing karyawan.
     */
    const employeeMap = new Map<
      number,
      {
        employeeId: number;
        name: string;
        username: string;
        totalVehicles: number;
        motorCount: number;
        mobilCount: number;
        totalResult: number;
      }
    >();

    for (const employee of employees) {
      employeeMap.set(employee.id, {
        employeeId: employee.id,
        name: employee.name,
        username: employee.username,
        totalVehicles: 0,
        motorCount: 0,
        mobilCount: 0,
        totalResult: 0,
      });
    }

    for (const transaction of transactions) {
      if (transaction.employeeId === null) {
        continue;
      }

      const employee = employeeMap.get(
        transaction.employeeId
      );

      if (!employee) {
        continue;
      }

      employee.totalVehicles += 1;

      if (transaction.vehicleType === "MOTOR") {
        employee.motorCount += 1;
      }

      if (transaction.vehicleType === "MOBIL") {
        employee.mobilCount += 1;
      }

      employee.totalResult +=
        transaction.employeeResult;
    }

    const employeeResults = Array.from(
      employeeMap.values()
    ).sort(
      (a, b) =>
        b.totalResult - a.totalResult
    );

    return NextResponse.json({
      success: true,
      date: selectedDate ?? getTodayWIB(),

      summary: {
        totalVehicles,
        revenue,
        employeeCompensation,
        expenses: totalExpenses,
        netProfit,
        motorCount,
        mobilCount,
      },

      employeeResults,

      transactions,
    });
  } catch (error) {
    console.error(
      "OWNER SUMMARY ERROR:",
      error
    );

    return NextResponse.json(
      { error: "Gagal mengambil summary owner" },
      { status: 500 }
    );
  }
}