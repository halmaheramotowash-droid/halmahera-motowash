"use client";
import { apiGet } from "@/lib/api-client";

import { useEffect, useState } from "react";
import Link from "next/link";

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
  createdAt: string;
};

type HasilData = {
  role: "KARYAWAN" | "OWNER";
  date: string;
  totalVehicles: number;
  totalResult: number;
  motorCount: number;
  mobilCount: number;
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

  return `${day}/${month}/${year}`;
}

function formatDateLong(dateString: string) {
  const [year, month, day] = dateString.split("-").map(Number);

  return new Date(year, month - 1, day).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatRupiah(value: number) {
  return `Rp${value.toLocaleString("id-ID")}`;
}

export default function HasilPage() {
  const [data, setData] = useState<HasilData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(getToday());

  const today = getToday();

  async function loadData(date: string, showLoading = true) {
    try {
      if (showLoading) {
        setLoading(true);
      }

      const response = await apiGet(
  `/api/hasil?date=${encodeURIComponent(date)}`,
  {
    cache: "no-store",
  }
);

      const result = await response.json();

      if (!response.ok || !result.success) {
        if (showLoading) {
          setData(null);
        }

        return;
      }

      setData({
        role: result.role,
        date: result.date,
        totalVehicles: result.totalVehicles,
        totalResult: result.totalResult,
        motorCount: result.motorCount,
        mobilCount: result.mobilCount,
        transactions: result.transactions ?? [],
      });
    } catch (error) {
      console.error("HASIL ERROR:", error);

      // Saat refresh otomatis gagal sementara,
      // pertahankan data yang sudah tampil.
      if (showLoading) {
        setData(null);
      }
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  }

  useEffect(() => {
    // Muat data pertama kali
    loadData(selectedDate, true);

    // Refresh otomatis setiap 5 detik
    const interval = setInterval(() => {
      loadData(selectedDate, false);
    }, 5000);

    return () => {
      clearInterval(interval);
    };
  }, [selectedDate]);

  function changeDate(days: number) {
    const [year, month, day] = selectedDate.split("-").map(Number);

    const currentDate = new Date(Date.UTC(year, month - 1, day));

    currentDate.setUTCDate(currentDate.getUTCDate() + days);

    let newDate = `${currentDate.getUTCFullYear()}-${String(
      currentDate.getUTCMonth() + 1
    ).padStart(2, "0")}-${String(currentDate.getUTCDate()).padStart(2, "0")}`;

    if (newDate > today) {
      newDate = today;
    }

    setSelectedDate(newDate);
  }

  return (
    <main className="min-h-screen bg-[#07111f] text-white">
      <div className="mx-auto min-h-screen max-w-md bg-[#07111f] pb-28">
        {/* HEADER */}
        <header className="border-b border-red-900/50 bg-gradient-to-br from-[#07111f] via-[#0b1729] to-[#210b18] px-5 py-6">
          <div className="flex items-start justify-between gap-3">
            <Link
              href="/owner"
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-red-700/70 bg-gradient-to-br from-[#3b1020] to-[#171827] text-2xl text-white shadow-lg shadow-red-950/20 transition hover:border-red-500 active:scale-[0.95]"
            >
              ←
            </Link>

            <div className="min-w-0 flex-1">
              <p className="text-xs font-black tracking-[0.18em] text-red-500">
                KARYAWAN
              </p>

              <h1 className="mt-1 text-3xl font-black tracking-tight text-white">
                HASIL KERJA
              </h1>

              <p className="mt-1 text-sm text-slate-400">
                Rekap hasil berdasarkan tanggal
              </p>
            </div>

            <div className="hidden rounded-2xl border border-slate-700 bg-[#101d30] px-3 py-3 text-right sm:block">
              <p className="text-xs text-slate-400">Tanggal aktif</p>

              <p className="mt-1 text-sm font-black text-white">
                {formatDateLong(selectedDate)}
              </p>
            </div>
          </div>
        </header>

        {/* CONTENT */}
        <section className="px-4 pt-5">
          {/* PILIH TANGGAL */}
          <div className="rounded-3xl border border-red-800/70 bg-gradient-to-br from-[#1c172b] via-[#101d30] to-[#0b1728] p-5 shadow-lg shadow-black/20">
            <div className="flex items-start gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-red-500/50 bg-red-950/50 text-2xl">
                📅
              </div>

              <div>
                <p className="text-sm font-black tracking-[0.12em] text-white">
                  PILIH TANGGAL
                </p>

                <p className="mt-1 text-sm text-slate-400">
                  Pilih tanggal untuk melihat hasil kerja
                </p>
              </div>
            </div>

            <div className="mt-5">
              <input
                type="date"
                value={selectedDate}
                max={today}
                onChange={(event) => setSelectedDate(event.target.value)}
                className="w-full rounded-2xl border border-slate-600 bg-[#0b1728] px-4 py-4 text-center font-bold text-white outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
              />
            </div>

            <div className="mt-4 grid grid-cols-3 gap-2">
              {/* TANGGAL SEBELUMNYA */}
              <button
                type="button"
                onClick={() => changeDate(-1)}
                className="rounded-2xl border border-slate-700 bg-[#101d30] px-2 py-4 text-xs font-bold text-slate-200 transition hover:border-red-700 hover:bg-[#17263d] active:scale-95"
              >
                <span className="block text-lg">←</span>
                <span className="mt-1 block">SEBELUMNYA</span>
              </button>

              {/* HARI INI */}
              <button
                type="button"
                onClick={() => setSelectedDate(today)}
                className="rounded-2xl border border-red-500 bg-gradient-to-br from-red-500 to-red-700 px-2 py-4 text-xs font-black text-white shadow-lg shadow-red-950/30 transition hover:from-red-400 hover:to-red-600 active:scale-95"
              >
                <span className="block text-lg">📅</span>
                <span className="mt-1 block">HARI INI</span>
              </button>

              {/* TANGGAL BERIKUTNYA */}
              <button
                type="button"
                onClick={() => changeDate(1)}
                disabled={selectedDate >= today}
                className="rounded-2xl border border-slate-700 bg-[#101d30] px-2 py-4 text-xs font-bold text-slate-200 transition hover:border-red-700 hover:bg-[#17263d] active:scale-95 disabled:cursor-not-allowed disabled:opacity-30"
              >
                <span className="block text-lg">→</span>
                <span className="mt-1 block">BERIKUTNYA</span>
              </button>
            </div>

            <p className="mt-4 text-center text-sm text-slate-400">
              Menampilkan hasil tanggal{" "}
              <span className="font-black text-white">
                {formatDateLong(selectedDate)}
              </span>
            </p>
          </div>

          {/* LOADING */}
          {loading ? (
            <div className="mt-5 rounded-3xl border border-slate-700/70 bg-gradient-to-br from-[#17263d] to-[#0c1728] p-6 text-center">
              <p className="text-sm font-semibold text-slate-300">
                MEMUAT DATA...
              </p>
            </div>
          ) : data ? (
            <>
              {/* TOTAL HASIL */}
              <div className="mt-5 rounded-3xl border border-red-700/80 bg-gradient-to-br from-[#3a0c1d] via-[#210d1c] to-[#101827] p-5 shadow-lg shadow-red-950/20">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-black tracking-[0.14em] text-red-400">
                      TOTAL HASIL
                    </p>

                    <p className="mt-1 text-sm text-slate-300">
                      Total pendapatan yang Anda hasilkan
                    </p>
                  </div>

                  <div className="text-3xl text-red-500">📈</div>
                </div>

                <p className="mt-5 break-words text-4xl font-black tracking-tight text-red-500">
                  {formatRupiah(data.totalResult)}
                </p>

                <p className="mt-2 text-sm text-slate-400">
                  Hasil kerja tanggal{" "}
                  <span className="font-bold text-slate-200">
                    {formatDateLong(selectedDate)}
                  </span>
                </p>
              </div>

              {/* STATISTIK */}
              <div className="mt-5 rounded-3xl border border-slate-700/70 bg-gradient-to-br from-[#17263d] to-[#0c1728] p-5 shadow-lg shadow-black/20">
                <div className="flex items-start gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#0b1728] text-2xl">
                    🏍️
                  </div>

                  <div>
                    <p className="text-sm font-black tracking-[0.12em] text-white">
                      AKTIVITAS CUCI
                    </p>

                    <h3 className="mt-1 text-lg font-bold text-slate-200">
                      {data.totalVehicles} kendaraan
                    </h3>

                    <p className="mt-1 text-xs text-slate-400">
                      Rekap jumlah kendaraan yang dicuci
                    </p>
                  </div>
                </div>

                <div className="mt-5 grid grid-cols-3 gap-2">
                  {/* TOTAL */}
                  <div className="rounded-2xl border border-slate-700/60 bg-[#101d30] p-3 text-center">
                    <p className="text-2xl font-black text-white">
                      {data.totalVehicles}
                    </p>

                    <p className="mt-2 text-[10px] font-bold tracking-wider text-slate-400">
                      TOTAL
                    </p>
                  </div>

                  {/* MOTOR */}
                  <div className="rounded-2xl border border-red-900/50 bg-[#241321] p-3 text-center">
                    <p className="text-2xl font-black text-red-500">
                      {data.motorCount}
                    </p>

                    <p className="mt-2 text-[10px] font-bold tracking-wider text-slate-400">
                      MOTOR
                    </p>
                  </div>

                  {/* MOBIL */}
                  <div className="rounded-2xl border border-slate-700/60 bg-[#101d30] p-3 text-center">
                    <p className="text-2xl font-black text-white">
                      {data.mobilCount}
                    </p>

                    <p className="mt-2 text-[10px] font-bold tracking-wider text-slate-400">
                      MOBIL
                    </p>
                  </div>
                </div>
              </div>

              {/* RINGKASAN HASIL */}
              <div className="mt-5 rounded-3xl border border-slate-700/70 bg-gradient-to-br from-[#17263d] to-[#0c1728] p-5 shadow-lg shadow-black/20">
                <div className="flex items-start gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#0b1728] text-2xl">
                    📊
                  </div>

                  <div>
                    <p className="text-sm font-black tracking-[0.12em] text-white">
                      RINGKASAN HASIL
                    </p>

                    <p className="mt-1 text-sm text-slate-400">
                      Detail pendapatan dan komisi
                    </p>
                  </div>
                </div>

                <div className="mt-5 grid grid-cols-1 gap-3">
                  <div className="rounded-2xl border border-slate-700/60 bg-[#101d30] p-4">
                    <p className="text-xs font-bold text-slate-400">
                      TOTAL HARGA CUCI
                    </p>

                    <p className="mt-2 text-2xl font-black text-white">
                      {formatRupiah(
                        data.transactions.reduce(
                          (total, transaction) =>
                            total + (Number(transaction.price) || 0),
                          0
                        )
                      )}
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      Dari {data.totalVehicles} kendaraan
                    </p>
                  </div>

                  <div className="rounded-2xl border border-green-800/60 bg-[#0c211f] p-4">
                    <p className="text-xs font-bold text-slate-400">
                      HASIL ANDA
                    </p>

                    <p className="mt-2 text-2xl font-black text-green-400">
                      {formatRupiah(data.totalResult)}
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      Sesuai komisi yang berlaku
                    </p>
                  </div>
                </div>
              </div>

              {/* DAFTAR TRANSAKSI */}
              <div className="mt-5 rounded-3xl border border-slate-700/70 bg-gradient-to-br from-[#17263d] to-[#0c1728] p-5 shadow-lg shadow-black/20">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#0b1728] text-2xl">
                      ☷
                    </div>

                    <div>
                      <p className="text-sm font-black tracking-[0.12em] text-white">
                        TRANSAKSI HARI INI
                      </p>

                      <h3 className="mt-1 text-sm text-slate-400">
                        Daftar transaksi yang Anda kerjakan
                      </h3>
                    </div>
                  </div>

                  <Link
                    href="/riwayat"
                    className="shrink-0 rounded-xl border border-red-700/70 px-3 py-2 text-xs font-bold text-red-400 transition hover:bg-red-950/40"
                  >
                    Lihat Semua →
                  </Link>
                </div>

                {data.transactions.length === 0 ? (
                  <div className="mt-5 rounded-2xl border border-slate-700/60 bg-[#101d30] p-5 text-center">
                    <div className="text-3xl">📋</div>

                    <p className="mt-3 font-bold text-white">
                      TIDAK ADA TRANSAKSI
                    </p>

                    <p className="mt-1 text-sm text-slate-400">
                      Belum ada transaksi pada tanggal ini.
                    </p>
                  </div>
                ) : (
                  <div className="mt-5 space-y-3">
                    {data.transactions.map((transaction) => (
                      <div
                        key={transaction.id}
                        className="rounded-2xl border border-slate-700/60 bg-[#101d30] p-4 transition hover:border-red-700/70"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="break-all text-sm font-black text-white">
                              {transaction.transactionNumber}
                            </p>

                            <p className="mt-2 text-sm text-slate-300">
                              {transaction.categorySnapshot}
                            </p>

                            <p className="mt-1 text-xs text-slate-400">
                              {transaction.vehicleType === "MOTOR"
                                ? "🏍️ Motor"
                                : "🚗 Mobil"}
                            </p>

                            {transaction.modelSnapshot && (
                              <p className="mt-1 text-xs text-slate-500">
                                Model: {transaction.modelSnapshot}
                              </p>
                            )}

                            {transaction.licensePlateSnapshot && (
                              <p className="mt-1 text-xs text-slate-500">
                                Plat: {transaction.licensePlateSnapshot}
                              </p>
                            )}
                          </div>

                          <div className="shrink-0 text-right">
                            <p className="text-base font-black text-white">
                              {formatRupiah(transaction.employeeResult)}
                            </p>

                            <p className="mt-1 text-xs text-slate-400">
                              Tarif {formatRupiah(transaction.price)}
                            </p>
                          </div>
                        </div>

                        <div className="mt-3 border-t border-slate-700/70 pt-3">
                          <p className="text-xs text-slate-500">
                            {new Date(
                              transaction.createdAt
                            ).toLocaleString("id-ID", {
                              timeZone: "Asia/Jakarta",
                              day: "2-digit",
                              month: "2-digit",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="mt-5 rounded-3xl border border-red-900/60 bg-gradient-to-br from-[#241321] to-[#101827] p-6 text-center">
              <div className="text-3xl">⚠️</div>

              <p className="mt-3 font-bold text-white">
                DATA TIDAK DAPAT DIMUAT
              </p>

              <p className="mt-1 text-sm text-slate-400">
                Silakan coba lagi.
              </p>
            </div>
          )}
        </section>

        {/* BOTTOM NAV */}
        <nav className="fixed bottom-0 left-0 right-0 z-50 mx-auto max-w-md border-t border-slate-700/70 bg-[#050b14]/95 px-3 py-3 backdrop-blur">
          <div className="grid grid-cols-4 gap-2">
            {/* BERANDA */}
            <Link
              href="/"
              className="flex flex-col items-center rounded-2xl px-2 py-2 text-slate-500 transition hover:text-white active:scale-[0.95]"
            >
              <span className="text-lg">⌂</span>

              <span className="mt-1 text-[10px] font-bold">
                BERANDA
              </span>
            </Link>

            {/* CUCI */}
            <Link
              href="/cuci"
              className="flex flex-col items-center rounded-2xl px-2 py-2 text-slate-500 transition hover:text-white active:scale-[0.95]"
            >
              <span className="text-lg">🛁</span>

              <span className="mt-1 text-[10px] font-bold">
                CUCI
              </span>
            </Link>

            {/* RIWAYAT */}
            <Link
              href="/riwayat"
              className="flex flex-col items-center rounded-2xl px-2 py-2 text-slate-500 transition hover:text-white active:scale-[0.95]"
            >
              <span className="text-lg">▤</span>

              <span className="mt-1 text-[10px] font-bold">
                RIWAYAT
              </span>
            </Link>

            {/* HASIL */}
            <Link
              href="/hasil"
              className="flex flex-col items-center rounded-2xl border border-red-700/70 bg-gradient-to-br from-[#3b0d1d] to-[#210b18] px-2 py-2 text-red-500 shadow-lg shadow-red-950/20 transition hover:border-red-500 active:scale-[0.95]"
            >
              <span className="text-lg">📊</span>

              <span className="mt-1 text-[10px] font-black">
                HASIL
              </span>
            </Link>
          </div>
        </nav>
      </div>
    </main>
  );
}