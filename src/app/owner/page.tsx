import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/current-user";

import { PrismaClient } from "../../../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

import LogoutButton from "./logout-button";
import OwnerPeriodFilter from "./period-filter";
import OwnerAutoRefresh from "./auto-refresh";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

export const dynamic = "force-dynamic";

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
      0
    );

    const lastMonthEnd = new Date(
      now.getFullYear(),
      now.getMonth(),
      0,
      23,
      59,
      59,
      999
    );

    return {
      start: lastMonthStart,
      end: lastMonthEnd,
    };
  }

  return { start, end };
}

function formatRupiah(value: number) {
  return `Rp${value.toLocaleString("id-ID")}`;
}

function formatDate(value: Date) {
  return value.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export default async function OwnerPage({
  searchParams,
}: {
  searchParams: Promise<{
    period?: string;
  }>;
}) {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect("/login");
  }

  if (currentUser.role !== "OWNER") {
    redirect("/");
  }

  const params = await searchParams;

  const allowedPeriods: Period[] = [
    "today",
    "yesterday",
    "7days",
    "month",
    "lastmonth",
  ];

  const period: Period = allowedPeriods.includes(
    params.period as Period
  )
    ? (params.period as Period)
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
    (total, transaction) => total + transaction.price,
    0
  );

  const totalEmployeeResult = transactions.reduce(
    (total, transaction) => total + transaction.employeeResult,
    0
  );

  const totalExpenses = expenses.reduce(
    (total, expense) => total + expense.amount,
    0
  );

  const netProfit =
    totalRevenue -
    totalEmployeeResult -
    totalExpenses;

  const motorCount = transactions.filter(
    (transaction) => transaction.vehicleType === "MOTOR"
  ).length;

  const mobilCount = transactions.filter(
    (transaction) => transaction.vehicleType === "MOBIL"
  ).length;

  const totalTransactions = transactions.length;

  return (
    <main className="min-h-screen bg-black text-white">
      <OwnerAutoRefresh />

      <div className="mx-auto min-h-screen max-w-md bg-black px-5 pb-10">
        {/* HEADER */}
        <header className="border-b border-red-900/40 py-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold tracking-widest text-red-500">
                OWNER
              </p>

              <h1 className="text-2xl font-black">
                DASHBOARD
              </h1>

              <p className="mt-1 text-xs text-zinc-500">
                Halo, {currentUser.username}
              </p>
            </div>
          </div>
        </header>

        {/* RINGKASAN KEUANGAN */}
        <section className="mt-5">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5">
            <p className="text-xs font-bold tracking-widest text-red-500">
              PERIODE
            </p>

            <h2 className="mt-1 text-xl font-black">
              Ringkasan Keuangan
            </h2>

            <OwnerPeriodFilter activePeriod={period} />
          </div>
        </section>

        {/* RINGKASAN */}
        <section className="mt-4 grid grid-cols-2 gap-3">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
            <p className="text-[10px] font-black tracking-widest text-zinc-500">
              PENDAPATAN
            </p>

            <p className="mt-2 text-xl font-black text-green-400">
              {formatRupiah(totalRevenue)}
            </p>
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
            <p className="text-[10px] font-black tracking-widest text-zinc-500">
              KOMISI KARYAWAN
            </p>

            <p className="mt-2 text-xl font-black text-yellow-400">
              {formatRupiah(totalEmployeeResult)}
            </p>
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
            <p className="text-[10px] font-black tracking-widest text-zinc-500">
              PENGELUARAN
            </p>

            <p className="mt-2 text-xl font-black text-red-400">
              {formatRupiah(totalExpenses)}
            </p>
          </div>

          <div className="rounded-2xl border border-red-900/50 bg-red-950/20 p-4">
            <p className="text-[10px] font-black tracking-widest text-zinc-500">
              LABA BERSIH
            </p>

            <p className="mt-2 text-xl font-black text-white">
              {formatRupiah(netProfit)}
            </p>
          </div>
        </section>

        {/* TRANSAKSI */}
        <section className="mt-4">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5">
            <p className="text-xs font-bold tracking-widest text-red-500">
              TRANSAKSI
            </p>

            <div className="mt-4 grid grid-cols-3 gap-3">
              <div className="rounded-xl bg-black p-3 text-center">
                <p className="text-2xl font-black">
                  {totalTransactions}
                </p>

                <p className="mt-1 text-[10px] font-bold text-zinc-500">
                  TOTAL
                </p>
              </div>

              <div className="rounded-xl bg-black p-3 text-center">
                <p className="text-2xl font-black">
                  {motorCount}
                </p>

                <p className="mt-1 text-[10px] font-bold text-zinc-500">
                  MOTOR
                </p>
              </div>

              <div className="rounded-xl bg-black p-3 text-center">
                <p className="text-2xl font-black">
                  {mobilCount}
                </p>

                <p className="mt-1 text-[10px] font-bold text-zinc-500">
                  MOBIL
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* MENU OWNER */}
        <section className="mt-5">
          <div className="mb-3">
            <p className="text-xs font-bold tracking-widest text-red-500">
              MENU OPERASIONAL
            </p>

            <h2 className="mt-1 text-xl font-black">
              Menu Owner
            </h2>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Link
              href="/cuci"
              className="flex min-h-[78px] items-center justify-center rounded-2xl border border-zinc-800 bg-zinc-950 px-4 text-center text-sm font-black text-white transition active:scale-[0.98]"
            >
              CUCI
            </Link>

            <Link
              href="/riwayat"
              className="flex min-h-[78px] items-center justify-center rounded-2xl border border-zinc-800 bg-zinc-950 px-4 text-center text-sm font-black text-white transition active:scale-[0.98]"
            >
              RIWAYAT
            </Link>

            <Link
              href="/hasil"
              className="flex min-h-[78px] items-center justify-center rounded-2xl border border-zinc-800 bg-zinc-950 px-4 text-center text-sm font-black text-white transition active:scale-[0.98]"
            >
              HASIL
            </Link>

            <Link
              href="/owner/pengeluaran"
              className="flex min-h-[78px] items-center justify-center rounded-2xl border border-zinc-800 bg-zinc-950 px-4 text-center text-sm font-black text-white transition active:scale-[0.98]"
            >
              PENGELUARAN
            </Link>

            <Link
              href="/owner/karyawan"
              className="flex min-h-[78px] items-center justify-center rounded-2xl border border-red-900/50 bg-red-950/20 px-4 text-center text-sm font-black text-red-400 transition active:scale-[0.98]"
            >
              KARYAWAN
            </Link>

            <Link
              href="/owner/pengaturan"
              className="flex min-h-[78px] items-center justify-center rounded-2xl border border-red-900/50 bg-red-950/20 px-4 text-center text-sm font-black text-red-400 transition active:scale-[0.98]"
            >
              PENGATURAN
            </Link>
          </div>
        </section>

        {/* INFORMASI PERIODE */}
        <section className="mt-5">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5">
            <p className="text-xs font-bold tracking-widest text-zinc-500">
              INFORMASI PERIODE
            </p>

            <div className="mt-3 space-y-2 text-sm">
              <div className="flex justify-between gap-3">
                <span className="text-zinc-500">
                  Mulai
                </span>

                <span className="font-bold">
                  {formatDate(start)}
                </span>
              </div>

              <div className="flex justify-between gap-3">
                <span className="text-zinc-500">
                  Sampai
                </span>

                <span className="font-bold">
                  {formatDate(end)}
                </span>
              </div>
            </div>
          </div>
        </section>

        <LogoutButton />
      </div>
    </main>
  );
}