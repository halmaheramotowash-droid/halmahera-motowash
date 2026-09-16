import NotificationButton from "./notification-button";
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
    params.period as Period,
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

  // Statistik kartu utama selalu memakai data HARI INI,
  // tidak terpengaruh oleh filter periode laporan owner di bawah.
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);

  // Hanya transaksi yang benar-benar dikerjakan oleh karyawan.
  const employeeTransactions = await prisma.transaction.findMany({
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
    (total, transaction) => total + transaction.price,
    0,
  );

  const totalEmployeeResult = transactions.reduce(
    (total, transaction) => total + transaction.employeeResult,
    0,
  );

  const totalExpenses = expenses.reduce(
    (total, expense) => total + expense.amount,
    0,
  );

  const netProfit =
    totalRevenue -
    totalEmployeeResult -
    totalExpenses;

  const totalVehicles = transactions.length;
  const totalEmployeeVehicles = employeeTransactions.length;
  const totalEmployeeIncome = employeeTransactions.reduce(
    (total, transaction) => total + transaction.employeeResult,
    0,
  );

  const motorCount = transactions.filter(
    (transaction) => transaction.vehicleType === "MOTOR",
  ).length;

  const mobilCount = transactions.filter(
    (transaction) => transaction.vehicleType === "MOBIL",
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

  return (
    <main className="min-h-screen bg-[#05080d] text-white">
      <OwnerAutoRefresh />

      <div className="min-h-screen pb-24 lg:pb-8">
        {/* HEADER */}
        <header className="border-b border-white/10 bg-[#080c12]">
          <div className="mx-auto flex w-full max-w-[1500px] items-center justify-between gap-3 px-4 py-5 sm:px-6 lg:px-8">
            <div className="min-w-0">
              <h1 className="text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl">
                WASH<span className="text-red-500">APP</span>
              </h1>

              <p className="mt-1 text-[10px] font-medium tracking-[0.22em] text-zinc-500 sm:text-xs">
                SMART WASH MANAGEMENT
              </p>
            </div>

            <div className="flex min-w-0 shrink-0 items-center gap-1 sm:gap-3">
              {/* NOTIFIKASI TRANSAKSI TERBARU */}
              <NotificationButton />

              {/* PROFIL OWNER */}
              <div
                title={ownerName}
                className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-slate-500 to-slate-800 text-xl font-black sm:h-16 sm:w-16 sm:text-2xl"
              >
                {ownerInitial}
              </div>

              {/* LOGOUT */}
              <div className="flex shrink-0">
                <LogoutButton />
              </div>
            </div>
          </div>
        </header>

        {/* KONTEN UTAMA */}
        <div className="mx-auto w-full max-w-[1500px] px-4 sm:px-6 lg:px-8">
          {/* SAPAAN OWNER */}
          <section className="mt-5 border-b border-red-950/50 bg-gradient-to-r from-[#18070f] via-[#12080f] to-[#080d14] px-0 py-5 sm:mt-8 sm:rounded-[2rem] sm:border sm:p-7 lg:p-8">
            <div className="flex flex-col gap-5">
              <div className="min-w-0">
                <p className="text-base text-zinc-400 sm:text-xl">
                  Selamat Datang,
                </p>

                <div className="mt-2 flex flex-wrap items-center gap-3">
                  <h2 className="break-words text-4xl font-black tracking-tight sm:text-5xl lg:text-6xl">
                    {ownerName}
                  </h2>

                  <span className="rounded-full bg-red-600 px-5 py-2 text-xs font-black sm:px-6 sm:py-3 sm:text-sm">
                    OWNER
                  </span>

                  <span className="inline-flex items-center gap-2 rounded-full border border-green-500/30 bg-green-950/20 px-4 py-2 text-sm font-black text-green-400 sm:px-5 sm:py-3 sm:text-base">
                    <span className="h-3 w-3 rounded-full bg-green-400 shadow-[0_0_14px_rgba(74,222,128,0.9)]" />
                    Sistem Aktif
                  </span>
                </div>

                <p className="mt-4 text-sm text-zinc-400 sm:text-lg lg:text-xl">
                  Siap melayani pelanggan dengan cepat dan akurat.
                </p>
              </div>
            </div>
          </section>

          {/* TIGA KARTU STATISTIK UTAMA */}
          <section className="mt-5 grid grid-cols-3 gap-2 sm:gap-3 lg:gap-4">
            {/* KENDARAAN HARI INI */}
            <div className="min-w-0 rounded-3xl border border-white/10 bg-[#111923] p-3 sm:p-4 lg:p-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-red-950/80 text-xl sm:h-12 sm:w-12 sm:text-2xl lg:h-16 lg:w-16 lg:text-3xl">
                🏍️
              </div>

              <p className="mt-4 truncate text-2xl font-black sm:text-3xl lg:text-4xl">
                {totalVehicles}
              </p>

              <p className="mt-2 text-[11px] leading-4 text-zinc-300 sm:text-sm lg:text-lg">
                Kendaraan yang
                <br />
                Dicuci
              </p>
            </div>

            {/* PENDAPATAN HARI INI */}
            <div className="min-w-0 rounded-3xl border border-white/10 bg-[#111923] p-3 sm:p-4 lg:p-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-yellow-950/80 text-xl sm:h-12 sm:w-12 sm:text-2xl lg:h-16 lg:w-16 lg:text-3xl">
                💰
              </div>

              <p className="mt-4 truncate text-lg font-black text-yellow-300 sm:text-2xl lg:text-3xl">
                {formatRupiah(totalRevenue)}
              </p>

              <p className="mt-2 text-[11px] leading-4 text-zinc-300 sm:text-sm lg:text-lg">
                Pendapatan
                <br />
                Hari Ini
              </p>
            </div>

            {/* LABA BERSIH */}
            <div className="min-w-0 rounded-3xl border border-white/10 bg-[#111923] p-3 sm:p-4 lg:p-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-purple-950/80 text-xl sm:h-12 sm:w-12 sm:text-2xl lg:h-16 lg:w-16 lg:text-3xl">
                🧾
              </div>

              <p className="mt-4 break-words text-[clamp(0.9rem,3.7vw,2.25rem)] font-black leading-tight tracking-tight sm:text-3xl lg:text-4xl">
                {formatRupiah(netProfit)}
              </p>

              <p className="mt-2 text-[11px] leading-4 text-zinc-300 sm:text-sm lg:text-lg">
                Laba Bersih
                <br />
                Hari Ini
              </p>
            </div>
          </section>

          {/* BANNER SCAN */}
          <section className="mt-5">
            <Link
              href="/cuci"
              className="group block overflow-hidden rounded-[2rem] border border-red-600/80 bg-gradient-to-br from-red-950 via-[#68151b] to-[#1b1018] p-5 shadow-2xl shadow-red-950/20 transition hover:border-red-400 sm:p-8 lg:p-10"
            >
              <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:gap-10">
                <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-3xl bg-red-500 text-4xl shadow-xl sm:h-28 sm:w-28 sm:text-6xl lg:h-32 lg:w-32 lg:text-7xl">
                  📷
                </div>

                <div className="min-w-0">
                  <p className="text-xs font-black tracking-[0.3em] text-red-200 sm:text-sm lg:text-lg">
                    TRANSAKSI BARU
                  </p>

                  <h3 className="mt-2 text-3xl font-black sm:text-4xl lg:text-5xl">
                    SCAN KENDARAAN
                  </h3>

                  <p className="mt-3 max-w-3xl text-sm leading-7 text-red-100/80 sm:text-lg lg:text-2xl lg:leading-10">
                    Identifikasi motor atau mobil dan tampilkan harga
                    rekomendasi.
                  </p>

                  <p className="mt-3 text-sm font-bold text-white sm:text-base lg:text-xl">
                    Scan dengan AI atau manual
                  </p>

                  <div className="mt-5 inline-flex items-center gap-5 rounded-full bg-white px-7 py-4 text-sm font-black text-red-700 transition group-hover:bg-red-100 sm:text-base lg:px-10 lg:py-5 lg:text-xl">
                    MULAI SCAN
                    <span className="text-xl lg:text-3xl">
                      →
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          </section>

          {/* MENU UTAMA */}
          <section className="mt-8">
            <div className="flex items-end justify-between gap-3">
              <div>
                <h3 className="text-2xl font-black sm:text-3xl lg:text-4xl">
                  Menu Utama
                </h3>

                <p className="mt-1 text-xs text-zinc-500 sm:text-sm lg:text-lg">
                  Akses cepat pengelolaan usaha
                </p>
              </div>

              <span className="text-xs text-zinc-500 sm:text-sm lg:text-lg">
                Akses cepat
              </span>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-3">
              <Link
                href="/owner/reports"
                className="flex items-center gap-4 rounded-3xl border border-white/10 bg-[#111923] p-4 transition hover:border-red-500 hover:bg-red-950/20 sm:p-5 lg:p-6"
              >
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-red-950/80 text-3xl sm:h-20 sm:w-20 sm:text-4xl">
                  📊
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-lg font-black sm:text-xl lg:text-2xl">
                    LAPORAN
                  </p>

                  <p className="mt-1 text-sm text-zinc-400 sm:text-base lg:text-xl">
                    Pendapatan & statistik
                  </p>
                </div>

                <span className="text-2xl text-zinc-400 sm:text-3xl">
                  →
                </span>
              </Link>

              <Link
                href="/owner/pengeluaran"
                className="flex items-center gap-4 rounded-3xl border border-white/10 bg-[#111923] p-4 transition hover:border-red-500 hover:bg-red-950/20 sm:p-5 lg:p-6"
              >
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-yellow-950/80 text-3xl sm:h-20 sm:w-20 sm:text-4xl">
                  💰
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-lg font-black sm:text-xl lg:text-2xl">
                    PENGELUARAN
                  </p>

                  <p className="mt-1 text-sm text-zinc-400 sm:text-base lg:text-xl">
                    Kelola pengeluaran
                  </p>
                </div>

                <span className="text-2xl text-zinc-400 sm:text-3xl">
                  →
                </span>
              </Link>

              <Link
                href="/owner/karyawan"
                className="flex items-center gap-4 rounded-3xl border border-white/10 bg-[#111923] p-4 transition hover:border-red-500 hover:bg-red-950/20 sm:p-5 lg:p-6"
              >
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-blue-950/80 text-3xl sm:h-20 sm:w-20 sm:text-4xl">
                  👥
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-lg font-black sm:text-xl lg:text-2xl">
                    KARYAWAN
                  </p>

                  <p className="mt-1 text-sm text-zinc-400 sm:text-base lg:text-xl">
                    Kelola data karyawan
                  </p>
                </div>

                <span className="text-2xl text-zinc-400 sm:text-3xl">
                  →
                </span>
              </Link>

              <Link
                href="/owner/pengaturan"
                className="flex items-center gap-4 rounded-3xl border border-white/10 bg-[#111923] p-4 transition hover:border-red-500 hover:bg-red-950/20 sm:p-5 lg:p-6"
              >
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-purple-950/80 text-3xl sm:h-20 sm:w-20 sm:text-4xl">
                  ⚙️
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-lg font-black sm:text-xl lg:text-2xl">
                    PENGATURAN
                  </p>

                  <p className="mt-1 text-sm text-zinc-400 sm:text-base lg:text-xl">
                    Pengaturan aplikasi
                  </p>
                </div>

                <span className="text-2xl text-zinc-400 sm:text-3xl">
                  →
                </span>
              </Link>
            </div>
          </section>

          {/* RINGKASAN KEUANGAN */}
          <section className="mt-6 rounded-[2rem] border border-white/10 bg-[#10161e] p-4 sm:p-6 lg:p-8">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <p className="text-xs font-black tracking-[0.25em] text-red-500 sm:text-sm">
                  LAPORAN OWNER
                </p>

                <h3 className="mt-1 text-2xl font-black sm:text-3xl lg:text-4xl">
                  Ringkasan Keuangan
                </h3>

                <p className="mt-1 text-xs text-zinc-500 sm:text-sm lg:text-lg">
                  Detail pemasukan, komisi, pengeluaran, dan laba bersih.
                </p>
              </div>

              <div className="w-full xl:w-auto">
                <OwnerPeriodFilter activePeriod={period} />
              </div>
            </div>

            <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="rounded-3xl border border-white/10 bg-[#070a0e] p-4 sm:p-5">
                <p className="text-xs font-bold tracking-widest text-zinc-500">
                  PENDAPATAN
                </p>

                <p className="mt-3 break-words text-2xl font-black text-green-400 sm:text-3xl">
                  {formatRupiah(totalRevenue)}
                </p>
              </div>

              <div className="rounded-3xl border border-white/10 bg-[#070a0e] p-4 sm:p-5">
                <p className="text-xs font-bold tracking-widest text-zinc-500">
                  KOMISI KARYAWAN
                </p>

                <p className="mt-3 break-words text-2xl font-black text-yellow-400 sm:text-3xl">
                  {formatRupiah(totalEmployeeResult)}
                </p>
              </div>

              <div className="rounded-3xl border border-white/10 bg-[#070a0e] p-4 sm:p-5">
                <p className="text-xs font-bold tracking-widest text-zinc-500">
                  PENGELUARAN
                </p>

                <p className="mt-3 break-words text-2xl font-black text-red-400 sm:text-3xl">
                  {formatRupiah(totalExpenses)}
                </p>
              </div>

              <div className="rounded-3xl border border-red-900/60 bg-gradient-to-br from-red-950/60 to-[#170909] p-4 sm:p-5">
                <p className="text-xs font-bold tracking-widest text-zinc-400">
                  LABA BERSIH
                </p>

                <p className="mt-3 break-words text-2xl font-black text-white sm:text-3xl">
                  {formatRupiah(netProfit)}
                </p>
              </div>
            </div>

            {/* RINCIAN KENDARAAN */}
            <div className="mt-4 grid grid-cols-3 gap-2 sm:gap-3">
              <div className="rounded-2xl bg-[#070a0e] p-3 text-center sm:p-4">
                <p className="text-xl font-black text-red-400 sm:text-2xl">
                  {motorCount}
                </p>

                <p className="mt-1 text-[10px] font-bold text-zinc-500 sm:text-xs">
                  MOTOR
                </p>
              </div>

              <div className="rounded-2xl bg-[#070a0e] p-3 text-center sm:p-4">
                <p className="text-xl font-black text-blue-400 sm:text-2xl">
                  {mobilCount}
                </p>

                <p className="mt-1 text-[10px] font-bold text-zinc-500 sm:text-xs">
                  MOBIL
                </p>
              </div>

              <div className="rounded-2xl bg-[#070a0e] p-3 text-center sm:p-4">
                <p className="text-xl font-black sm:text-2xl">
                  {totalVehicles}
                </p>

                <p className="mt-1 text-[10px] font-bold text-zinc-500 sm:text-xs">
                  TOTAL
                </p>
              </div>
            </div>

            {/* PERIODE LAPORAN */}
            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-[#070a0e] p-4">
                <p className="text-xs text-zinc-500">
                  Periode Mulai
                </p>

                <p className="mt-1 text-sm font-black sm:text-base">
                  {formatDate(start)}
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-[#070a0e] p-4">
                <p className="text-xs text-zinc-500">
                  Periode Sampai
                </p>

                <p className="mt-1 text-sm font-black sm:text-base">
                  {formatDate(end)}
                </p>
              </div>
            </div>
          </section>

        </div>
      </div>

      {/* NAVIGASI BAWAH HP */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/10 bg-[#080c12]/95 px-2 py-2 backdrop-blur lg:hidden">
        <div className="mx-auto grid max-w-xl grid-cols-5 gap-1">
          <Link
            href="/owner"
            className="flex flex-col items-center justify-center rounded-xl px-1 py-2 text-[10px] font-bold text-red-500"
          >
            <span className="text-xl">⌂</span>
            Beranda
          </Link>

          <Link
            href="/cuci"
            className="flex flex-col items-center justify-center rounded-xl px-1 py-2 text-[10px] font-bold text-zinc-400"
          >
            <span className="text-xl">💧</span>
            Cuci
          </Link>

          <Link
            href="/riwayat"
            className="flex flex-col items-center justify-center rounded-xl px-1 py-2 text-[10px] font-bold text-zinc-400"
          >
            <span className="text-xl">🧾</span>
            Riwayat
          </Link>

          <Link
            href="/hasil"
            className="flex flex-col items-center justify-center rounded-xl px-1 py-2 text-[10px] font-bold text-zinc-400"
          >
            <span className="text-xl">📊</span>
            Hasil
          </Link>

          <Link
            href="/owner/pengaturan"
            className="flex flex-col items-center justify-center rounded-xl px-1 py-2 text-[10px] font-bold text-zinc-400"
          >
            <span className="text-xl">⚙️</span>
            Pengaturan
          </Link>
        </div>
      </nav>
    </main>
  );
}