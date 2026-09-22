"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiGet } from "@/lib/api-client";

type Transaction = {
  id: number;
  transactionNumber: string;
  licensePlateSnapshot: string | null;
  brandSnapshot: string | null;
  modelSnapshot: string | null;
  categorySnapshot: string;
  vehicleType: "MOTOR" | "MOBIL";
  price: number;
  employeeResult: number;
  employeeId: number | null;
  createdAt: string;
};

type EmployeeResult = {
  employeeId: number;
  name: string;
  username: string;
  totalVehicles: number;
  motorCount: number;
  mobilCount: number;
  totalResult: number;
};

type Summary = {
  totalVehicles: number;
  revenue: number;
  employeeCompensation: number;
  expenses: number;
  netProfit: number;
  motorCount: number;
  mobilCount: number;
};

type OwnerData = {
  date: string;
  summary: Summary;
  employeeResults: EmployeeResult[];
  transactions: Transaction[];
};

function getToday() {
  const now = new Date();

  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Jakarta",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

function formatDate(dateString: string) {
  const [year, month, day] = dateString.split("-");

  const date = new Date(
    Number(year),
    Number(month) - 1,
    Number(day)
  );

  return date.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatShortDate(dateString: string) {
  const [year, month, day] = dateString.split("-");

  return `${day}/${month}/${year}`;
}

function formatRupiah(value: number) {
  return `Rp ${value.toLocaleString("id-ID")}`;
}

function getPercentage(value: number, total: number) {
  if (!total || total <= 0) {
    return 0;
  }

  return Math.round((value / total) * 100);
}

function getProfitStatus(value: number) {
  if (value > 0) {
    return "POSITIF";
  }

  if (value < 0) {
    return "RUGI";
  }

  return "SEIMBANG";
}

export default function OwnerHasilPage() {
  const [data, setData] = useState<OwnerData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(getToday());

  const today = getToday();

  async function loadData(date: string) {
    try {
      setLoading(true);

      const response = await apiGet(
  `/api/owner/summary?date=${encodeURIComponent(date)}`,
  {
    cache: "no-store",
  }
);

      const result = await response.json();

      if (!response.ok || !result.success) {
        setData(null);
        return;
      }

      setData({
        date: result.date,
        summary: result.summary,
        employeeResults: result.employeeResults ?? [],
        transactions: result.transactions ?? [],
      });
    } catch (error) {
      console.error("OWNER HASIL ERROR:", error);
      setData(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData(selectedDate);
  }, [selectedDate]);

  function changeDate(days: number) {
    const [year, month, day] = selectedDate.split("-").map(Number);

    const currentDate = new Date(
      Date.UTC(year, month - 1, day)
    );

    currentDate.setUTCDate(currentDate.getUTCDate() + days);

    let newDate = `${currentDate.getUTCFullYear()}-${String(
      currentDate.getUTCMonth() + 1
    ).padStart(2, "0")}-${String(
      currentDate.getUTCDate()
    ).padStart(2, "0")}`;

    if (newDate > today) {
      newDate = today;
    }

    setSelectedDate(newDate);
  }

  const summary = data?.summary;

  const motorPercentage = summary
    ? getPercentage(summary.motorCount, summary.totalVehicles)
    : 0;

  const mobilPercentage = summary
    ? getPercentage(summary.mobilCount, summary.totalVehicles)
    : 0;

  return (
    <main className="min-h-screen bg-[#05080d] text-white">
      <div className="mx-auto min-h-screen w-full max-w-5xl pb-28">
        {/* HEADER */}
        <header className="border-b border-white/10 bg-[#070b12] px-4 py-5 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Link
                href="/owner"
                aria-label="Kembali ke dashboard owner"
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-xl text-zinc-200 transition hover:border-red-500/50 hover:bg-red-500/10 active:scale-95"
              >
                ←
              </Link>

              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.28em] text-red-500 sm:text-xs">
                  Halmahera
                </p>

                <h1 className="text-xl font-black tracking-tight sm:text-2xl">
                  Motowash
                </h1>
              </div>
            </div>

            <div className="hidden items-center gap-3 sm:flex">
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-right">
                <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                  Tanggal laporan
                </p>

                <p className="mt-1 text-sm font-bold text-zinc-200">
                  {formatShortDate(selectedDate)}
                </p>
              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-600 text-lg font-black shadow-lg shadow-red-950/30">
                D
              </div>
            </div>
          </div>

          <div className="mt-7">
            <p className="text-xs font-black uppercase tracking-[0.25em] text-red-500">
              Laporan
            </p>

            <h2 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">
              Pendapatan & Statistik
            </h2>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">
              Ringkasan performa usaha Halmahera Motowash berdasarkan tanggal
              yang dipilih.
            </p>
          </div>
        </header>

        {/* CONTENT */}
        <section className="space-y-5 px-4 pt-5 sm:px-6 lg:px-8">
          {/* FILTER TANGGAL */}
          <section className="rounded-3xl border border-white/10 bg-[#0b121b] p-4 sm:p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.25em] text-red-500 sm:text-xs">
                  Filter Laporan
                </p>

                <h3 className="mt-2 text-xl font-black">
                  Pilih Periode Harian
                </h3>

                <p className="mt-1 text-sm text-zinc-500">
                  Gunakan tanggal untuk melihat laporan usaha pada hari
                  tertentu.
                </p>
              </div>

              <div className="w-full lg:max-w-xs">
                <label
                  htmlFor="selectedDate"
                  className="mb-2 block text-xs font-bold uppercase tracking-wider text-zinc-400"
                >
                  Tanggal
                </label>

                <input
                  id="selectedDate"
                  type="date"
                  value={selectedDate}
                  max={today}
                  onChange={(event) =>
                    setSelectedDate(event.target.value)
                  }
                  className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm font-bold text-white outline-none transition focus:border-red-500 focus:ring-4 focus:ring-red-500/10"
                />
              </div>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => changeDate(-1)}
                className="rounded-2xl border border-white/10 bg-white/[0.04] px-2 py-3 text-xs font-black text-zinc-300 transition hover:bg-white/[0.08] active:scale-95"
              >
                ← SEBELUMNYA
              </button>

              <button
                type="button"
                onClick={() => setSelectedDate(today)}
                className="rounded-2xl bg-red-600 px-2 py-3 text-xs font-black text-white shadow-lg shadow-red-950/20 transition hover:bg-red-500 active:scale-95"
              >
                HARI INI
              </button>

              <button
                type="button"
                onClick={() => changeDate(1)}
                disabled={selectedDate >= today}
                className="rounded-2xl border border-white/10 bg-white/[0.04] px-2 py-3 text-xs font-black text-zinc-300 transition hover:bg-white/[0.08] active:scale-95 disabled:cursor-not-allowed disabled:opacity-30"
              >
                BERIKUTNYA →
              </button>
            </div>

            <div className="mt-4 rounded-2xl bg-black/30 px-4 py-3 text-center">
              <p className="text-xs text-zinc-500">
                Menampilkan laporan tanggal
              </p>

              <p className="mt-1 text-sm font-black text-zinc-200">
                {formatDate(selectedDate)}
              </p>
            </div>
          </section>

          {/* LOADING */}
          {loading ? (
            <section className="rounded-3xl border border-white/10 bg-[#0b121b] p-10 text-center">
              <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-white/10 border-t-red-500" />

              <p className="mt-4 text-sm font-black uppercase tracking-wider text-zinc-400">
                Memuat laporan...
              </p>

              <p className="mt-2 text-xs text-zinc-600">
                Mengambil data pendapatan dan statistik usaha.
              </p>
            </section>
          ) : data && summary ? (
            <>
              {/* KARTU RINGKASAN */}
              <section>
                <div className="mb-3 flex items-end justify-between gap-3">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.25em] text-red-500 sm:text-xs">
                      Ringkasan Keuangan
                    </p>

                    <h3 className="mt-1 text-xl font-black">
                      Performa Usaha
                    </h3>
                  </div>

                  <span
                    className={`rounded-full px-3 py-1 text-[10px] font-black ${
                      summary && summary.netProfit >= 0
                        ? "bg-emerald-500/10 text-emerald-400"
                        : "bg-red-500/10 text-red-400"
                    }`}
                  >
                    {summary ? getProfitStatus(summary.netProfit) : "-"}
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  {/* PENDAPATAN */}
                  <div className="rounded-3xl border border-emerald-500/30 bg-gradient-to-br from-emerald-950/40 to-[#0b121b] p-5">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-xs font-black uppercase tracking-wider text-emerald-300">
                        Pendapatan
                      </p>

                      <span className="text-2xl">💰</span>
                    </div>

                    <p className="mt-5 break-words text-2xl font-black text-emerald-300">
                      {formatRupiah(summary.revenue)}
                    </p>

                    <p className="mt-2 text-xs text-zinc-500">
                      Total omzet transaksi
                    </p>
                  </div>

                  {/* KOMPENSASI */}
                  <div className="rounded-3xl border border-yellow-500/30 bg-gradient-to-br from-yellow-950/30 to-[#0b121b] p-5">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-xs font-black uppercase tracking-wider text-yellow-300">
                        Kompensasi
                      </p>

                      <span className="text-2xl">👥</span>
                    </div>

                    <p className="mt-5 break-words text-2xl font-black text-yellow-300">
                      {formatRupiah(summary.employeeCompensation)}
                    </p>

                    <p className="mt-2 text-xs text-zinc-500">
                      Hasil atau komisi karyawan
                    </p>
                  </div>

                  {/* PENGELUARAN */}
                  <div className="rounded-3xl border border-red-500/30 bg-gradient-to-br from-red-950/35 to-[#0b121b] p-5">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-xs font-black uppercase tracking-wider text-red-300">
                        Pengeluaran
                      </p>

                      <span className="text-2xl">💳</span>
                    </div>

                    <p className="mt-5 break-words text-2xl font-black text-red-300">
                      {formatRupiah(summary.expenses)}
                    </p>

                    <p className="mt-2 text-xs text-zinc-500">
                      Total biaya operasional
                    </p>
                  </div>

                  {/* LABA BERSIH */}
                  <div className="rounded-3xl border border-purple-500/30 bg-gradient-to-br from-purple-950/35 to-[#0b121b] p-5">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-xs font-black uppercase tracking-wider text-purple-300">
                        Laba Bersih
                      </p>

                      <span className="text-2xl">📈</span>
                    </div>

                    <p
                      className={`mt-5 break-words text-2xl font-black ${
                        summary.netProfit >= 0
                          ? "text-purple-300"
                          : "text-red-300"
                      }`}
                    >
                      {formatRupiah(summary.netProfit)}
                    </p>

                    <p className="mt-2 text-xs text-zinc-500">
                      Setelah kompensasi dan pengeluaran
                    </p>
                  </div>
                </div>
              </section>

              {/* STATISTIK KENDARAAN */}
              <section className="rounded-3xl border border-white/10 bg-[#0b121b] p-5 sm:p-6">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.25em] text-red-500 sm:text-xs">
                      Statistik Aktivitas
                    </p>

                    <h3 className="mt-2 text-xl font-black">
                      Statistik Kendaraan
                    </h3>

                    <p className="mt-1 text-sm text-zinc-500">
                      Jumlah kendaraan yang dicuci pada tanggal ini.
                    </p>
                  </div>

                  <div className="text-left sm:text-right">
                    <p className="text-3xl font-black">
                      {summary.totalVehicles}
                    </p>

                    <p className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                      Total Kendaraan
                    </p>
                  </div>
                </div>

                <div className="mt-5 h-4 overflow-hidden rounded-full bg-black/50">
                  <div className="flex h-full w-full">
                    <div
                      className="h-full bg-red-500 transition-all"
                      style={{ width: `${motorPercentage}%` }}
                    />

                    <div
                      className="h-full bg-blue-500 transition-all"
                      style={{ width: `${mobilPercentage}%` }}
                    />
                  </div>
                </div>

                <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <div className="rounded-2xl border border-white/5 bg-black/30 p-4">
                    <p className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                      Total
                    </p>

                    <p className="mt-2 text-3xl font-black text-white">
                      {summary.totalVehicles}
                    </p>

                    <p className="mt-1 text-xs text-zinc-600">
                      Semua kendaraan
                    </p>
                  </div>

                  <div className="rounded-2xl border border-red-500/20 bg-red-950/20 p-4">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs font-bold uppercase tracking-wider text-red-300">
                        Motor
                      </p>

                      <span className="text-xl">🏍️</span>
                    </div>

                    <p className="mt-2 text-3xl font-black text-red-300">
                      {summary.motorCount}
                    </p>

                    <p className="mt-1 text-xs text-red-400/70">
                      {motorPercentage}% dari total
                    </p>
                  </div>

                  <div className="rounded-2xl border border-blue-500/20 bg-blue-950/20 p-4">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs font-bold uppercase tracking-wider text-blue-300">
                        Mobil
                      </p>

                      <span className="text-xl">🚗</span>
                    </div>

                    <p className="mt-2 text-3xl font-black text-blue-300">
                      {summary.mobilCount}
                    </p>

                    <p className="mt-1 text-xs text-blue-400/70">
                      {mobilPercentage}% dari total
                    </p>
                  </div>
                </div>
              </section>

              {/* HASIL PER KARYAWAN */}
              <section className="rounded-3xl border border-white/10 bg-[#0b121b] p-5 sm:p-6">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.25em] text-red-500 sm:text-xs">
                    Performa Tim
                  </p>

                  <h3 className="mt-2 text-xl font-black">
                    Hasil Per Karyawan
                  </h3>

                  <p className="mt-1 text-sm text-zinc-500">
                    Rekap jumlah kendaraan dan hasil setiap karyawan.
                  </p>
                </div>

                {data.employeeResults.length === 0 ? (
                  <div className="mt-5 rounded-2xl border border-dashed border-white/10 bg-black/20 p-8 text-center">
                    <div className="text-4xl">👤</div>

                    <p className="mt-3 font-black">
                      BELUM ADA HASIL
                    </p>

                    <p className="mt-1 text-sm text-zinc-500">
                      Tidak ada hasil karyawan pada tanggal ini.
                    </p>
                  </div>
                ) : (
                  <div className="mt-5 grid grid-cols-1 gap-3 lg:grid-cols-2">
                    {data.employeeResults.map((employee) => (
                      <div
                        key={employee.employeeId}
                        className="rounded-2xl border border-white/10 bg-black/25 p-4"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="truncate text-base font-black text-white">
                              {employee.name}
                            </p>

                            <p className="mt-1 text-xs text-zinc-500">
                              @{employee.username}
                            </p>
                          </div>

                          <p className="shrink-0 text-right text-lg font-black text-red-400">
                            {formatRupiah(employee.totalResult)}
                          </p>
                        </div>

                        <div className="mt-4 grid grid-cols-3 gap-2">
                          <div className="rounded-xl bg-[#070b12] p-3 text-center">
                            <p className="text-xl font-black">
                              {employee.totalVehicles}
                            </p>

                            <p className="mt-1 text-[10px] font-bold uppercase tracking-wider text-zinc-600">
                              Cuci
                            </p>
                          </div>

                          <div className="rounded-xl bg-[#070b12] p-3 text-center">
                            <p className="text-xl font-black text-red-400">
                              {employee.motorCount}
                            </p>

                            <p className="mt-1 text-[10px] font-bold uppercase tracking-wider text-zinc-600">
                              Motor
                            </p>
                          </div>

                          <div className="rounded-xl bg-[#070b12] p-3 text-center">
                            <p className="text-xl font-black text-blue-400">
                              {employee.mobilCount}
                            </p>

                            <p className="mt-1 text-[10px] font-bold uppercase tracking-wider text-zinc-600">
                              Mobil
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              {/* TRANSAKSI */}
              <section className="rounded-3xl border border-white/10 bg-[#0b121b] p-5 sm:p-6">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.25em] text-red-500 sm:text-xs">
                      Aktivitas Transaksi
                    </p>

                    <h3 className="mt-2 text-xl font-black">
                      Transaksi Terbaru
                    </h3>

                    <p className="mt-1 text-sm text-zinc-500">
                      Transaksi pada tanggal {formatDate(selectedDate)}.
                    </p>
                  </div>

                  <span className="text-xs font-bold text-zinc-500">
                    {data.transactions.length} transaksi
                  </span>
                </div>

                {data.transactions.length === 0 ? (
                  <div className="mt-5 rounded-2xl border border-dashed border-white/10 bg-black/20 p-8 text-center">
                    <div className="text-4xl">📋</div>

                    <p className="mt-3 font-black">
                      TIDAK ADA TRANSAKSI
                    </p>

                    <p className="mt-1 text-sm text-zinc-500">
                      Belum ada transaksi pada tanggal ini.
                    </p>
                  </div>
                ) : (
                  <div className="mt-5 space-y-3">
                    {data.transactions.map((transaction) => (
                      <div
                        key={transaction.id}
                        className="rounded-2xl border border-white/10 bg-black/25 p-4"
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-xl ${
                              transaction.vehicleType === "MOTOR"
                                ? "bg-red-500/15 text-red-400"
                                : "bg-blue-500/15 text-blue-400"
                            }`}
                          >
                            {transaction.vehicleType === "MOTOR"
                              ? "🏍️"
                              : "🚗"}
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                              <div className="min-w-0">
                                <p className="truncate text-sm font-black text-white">
                                  {transaction.transactionNumber}
                                </p>

                                <p className="mt-1 text-sm text-zinc-300">
                                  {transaction.categorySnapshot}
                                </p>

                                <p className="mt-1 text-xs text-zinc-500">
                                  {transaction.vehicleType === "MOTOR"
                                    ? "Motor"
                                    : "Mobil"}
                                </p>
                              </div>

                              <div className="text-left sm:text-right">
                                <p className="text-base font-black text-white">
                                  {formatRupiah(transaction.price)}
                                </p>

                                <p className="mt-1 text-xs font-bold text-red-400">
                                  Hasil{" "}
                                  {formatRupiah(transaction.employeeResult)}
                                </p>
                              </div>
                            </div>

                            <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-zinc-600">
                              {transaction.modelSnapshot && (
                                <span>
                                  Model: {transaction.modelSnapshot}
                                </span>
                              )}

                              {transaction.licensePlateSnapshot && (
                                <span>
                                  Plat: {transaction.licensePlateSnapshot}
                                </span>
                              )}
                            </div>

                            <div className="mt-3 border-t border-white/10 pt-3">
                              <p className="text-xs text-zinc-500">
                                {new Date(
                                  transaction.createdAt
                                ).toLocaleString("id-ID", {
                                  timeZone: "Asia/Jakarta",
                                  day: "2-digit",
                                  month: "long",
                                  year: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </>
          ) : (
            <section className="rounded-3xl border border-red-500/20 bg-red-950/20 p-8 text-center">
              <div className="text-4xl">⚠️</div>

              <p className="mt-3 font-black">
                DATA TIDAK DAPAT DIMUAT
              </p>

              <p className="mt-2 text-sm text-zinc-400">
                Silakan coba lagi atau pilih tanggal yang berbeda.
              </p>

              <button
                type="button"
                onClick={() => loadData(selectedDate)}
                className="mt-5 rounded-2xl bg-red-600 px-5 py-3 text-xs font-black text-white transition hover:bg-red-500 active:scale-95"
              >
                COBA LAGI
              </button>
            </section>
          )}
        </section>

        {/* BOTTOM NAVIGATION */}
        <nav className="fixed bottom-0 left-0 right-0 z-50 mx-auto max-w-5xl border-t border-white/10 bg-[#070b12]/95 px-3 py-3 backdrop-blur-xl">
          <div className="mx-auto grid max-w-2xl grid-cols-4 gap-2">
            <Link
              href="/owner"
              className="flex flex-col items-center rounded-2xl px-2 py-2 text-zinc-500 transition hover:bg-white/[0.04] hover:text-white"
            >
              <span className="text-xl">⌂</span>

              <span className="mt-1 text-[10px] font-black tracking-wide">
                DASHBOARD
              </span>
            </Link>

            <Link
              href="/cuci"
              className="flex flex-col items-center rounded-2xl px-2 py-2 text-zinc-500 transition hover:bg-white/[0.04] hover:text-white"
            >
              <span className="text-xl">🚿</span>

              <span className="mt-1 text-[10px] font-black tracking-wide">
                CUCI
              </span>
            </Link>

            <Link
              href="/riwayat"
              className="flex flex-col items-center rounded-2xl px-2 py-2 text-zinc-500 transition hover:bg-white/[0.04] hover:text-white"
            >
              <span className="text-xl">▤</span>

              <span className="mt-1 text-[10px] font-black tracking-wide">
                RIWAYAT
              </span>
            </Link>

            <Link
              href="/owner/hasil"
              className="flex flex-col items-center rounded-2xl bg-red-600/10 px-2 py-2 text-red-500"
            >
              <span className="text-xl">📊</span>

              <span className="mt-1 text-[10px] font-black tracking-wide">
                HASIL
              </span>
            </Link>
          </div>
        </nav>
      </div>
    </main>
  );
}