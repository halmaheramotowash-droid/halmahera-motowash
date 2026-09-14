"use client";

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

  return `${month}/${day}/${year}`;
}

function formatRupiah(value: number) {
  return `Rp${value.toLocaleString("id-ID")}`;
}

export default function HasilPage() {
  const [data, setData] = useState<HasilData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(getToday());

  const today = getToday();

  async function loadData(
    date: string,
    showLoading = true
  ) {
    try {
      if (showLoading) {
        setLoading(true);
      }

      const response = await fetch(
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
    const [year, month, day] = selectedDate
      .split("-")
      .map(Number);

    const currentDate = new Date(
      Date.UTC(year, month - 1, day)
    );

    currentDate.setUTCDate(
      currentDate.getUTCDate() + days
    );

    let newDate =
      `${currentDate.getUTCFullYear()}-${String(
        currentDate.getUTCMonth() + 1
      ).padStart(2, "0")}-${String(
        currentDate.getUTCDate()
      ).padStart(2, "0")}`;

    if (newDate > today) {
      newDate = today;
    }

    setSelectedDate(newDate);
  }

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="mx-auto min-h-screen max-w-md bg-black pb-24">

        {/* HEADER */}
        <header className="border-b border-red-900/40 bg-black px-5 py-6">

          <div className="flex items-center gap-3">

            <Link
              href="/"
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-900 text-xl text-white"
            >
              ←
            </Link>

            <div>
              <p className="text-xs font-semibold tracking-widest text-red-500">
                HALMAHERA
              </p>

              <h1 className="text-xl font-black tracking-wide text-white">
                MOTOWASH
              </h1>
            </div>

          </div>

          <div className="mt-6">

            <p className="text-xs font-semibold tracking-widest text-zinc-500">
              KARYAWAN
            </p>

            <h2 className="mt-1 text-2xl font-black">
              HASIL KERJA
            </h2>

            <p className="mt-1 text-sm text-zinc-500">
              Rekap hasil berdasarkan tanggal
            </p>

          </div>

        </header>

        {/* CONTENT */}
        <section className="px-5 pt-5">

          {/* PILIH TANGGAL */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4">

            <p className="text-xs font-bold tracking-widest text-red-500">
              PILIH TANGGAL
            </p>

            <div className="mt-3">

              <input
                type="date"
                value={selectedDate}
                max={today}
                onChange={(event) =>
                  setSelectedDate(event.target.value)
                }
                className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-center font-bold text-white outline-none focus:border-red-500"
              />

            </div>

            <div className="mt-3 grid grid-cols-3 gap-2">

              {/* TANGGAL SEBELUMNYA */}
              <button
                type="button"
                onClick={() => changeDate(-1)}
                className="rounded-xl bg-zinc-900 px-2 py-3 text-xs font-bold text-white active:scale-95"
              >
                ← SEBELUMNYA
              </button>

              {/* HARI INI */}
              <button
                type="button"
                onClick={() => setSelectedDate(today)}
                className="rounded-xl bg-red-600 px-2 py-3 text-xs font-bold text-white active:scale-95"
              >
                HARI INI
              </button>

              {/* TANGGAL BERIKUTNYA */}
              <button
                type="button"
                onClick={() => changeDate(1)}
                disabled={selectedDate >= today}
                className="rounded-xl bg-zinc-900 px-2 py-3 text-xs font-bold text-white active:scale-95 disabled:cursor-not-allowed disabled:opacity-30"
              >
                BERIKUTNYA →
              </button>

            </div>

            <p className="mt-3 text-center text-xs text-zinc-500">
              Menampilkan hasil tanggal{" "}
              <span className="font-bold text-zinc-300">
                {formatDate(selectedDate)}
              </span>
            </p>

          </div>

          {/* LOADING */}
          {loading ? (

            <div className="mt-5 rounded-2xl border border-zinc-800 bg-zinc-950 p-6 text-center">

              <p className="text-sm font-semibold text-zinc-400">
                MEMUAT DATA...
              </p>

            </div>

          ) : data ? (

            <>

              {/* TOTAL HASIL */}
              <div className="mt-5 rounded-2xl border border-red-900/50 bg-red-950/20 p-5">

                <p className="text-xs font-bold tracking-widest text-red-500">
                  TOTAL HASIL
                </p>

                <p className="mt-2 text-3xl font-black text-white">
                  {formatRupiah(data.totalResult)}
                </p>

                <p className="mt-2 text-sm text-zinc-500">
                  Hasil kerja tanggal{" "}
                  {formatDate(selectedDate)}
                </p>

              </div>

              {/* STATISTIK */}
              <div className="mt-5 rounded-2xl border border-zinc-800 bg-zinc-950 p-5">

                <p className="text-xs font-bold tracking-widest text-red-500">
                  AKTIVITAS CUCI
                </p>

                <h3 className="mt-1 text-lg font-bold">
                  {data.totalVehicles} kendaraan
                </h3>

                <div className="mt-4 grid grid-cols-3 gap-3">

                  {/* TOTAL */}
                  <div className="rounded-xl bg-zinc-900 p-4 text-center">

                    <p className="text-2xl font-black">
                      {data.totalVehicles}
                    </p>

                    <p className="mt-1 text-[10px] font-bold tracking-wider text-zinc-500">
                      TOTAL
                    </p>

                  </div>

                  {/* MOTOR */}
                  <div className="rounded-xl bg-zinc-900 p-4 text-center">

                    <p className="text-2xl font-black text-red-500">
                      {data.motorCount}
                    </p>

                    <p className="mt-1 text-[10px] font-bold tracking-wider text-zinc-500">
                      MOTOR
                    </p>

                  </div>

                  {/* MOBIL */}
                  <div className="rounded-xl bg-zinc-900 p-4 text-center">

                    <p className="text-2xl font-black text-red-500">
                      {data.mobilCount}
                    </p>

                    <p className="mt-1 text-[10px] font-bold tracking-wider text-zinc-500">
                      MOBIL
                    </p>

                  </div>

                </div>

              </div>

              {/* DAFTAR TRANSAKSI */}
              <div className="mt-5 rounded-2xl border border-zinc-800 bg-zinc-950 p-5">

                <p className="text-xs font-bold tracking-widest text-red-500">
                  TRANSAKSI
                </p>

                <h3 className="mt-1 text-lg font-bold">
                  Transaksi tanggal{" "}
                  {formatDate(selectedDate)}
                </h3>

                {data.transactions.length === 0 ? (

                  <div className="mt-4 rounded-xl bg-zinc-900 p-5 text-center">

                    <div className="text-3xl">
                      📋
                    </div>

                    <p className="mt-3 font-bold">
                      TIDAK ADA TRANSAKSI
                    </p>

                    <p className="mt-1 text-sm text-zinc-500">
                      Belum ada transaksi pada tanggal ini.
                    </p>

                  </div>

                ) : (

                  <div className="mt-4 space-y-3">

                    {data.transactions.map(
                      (transaction) => (

                        <div
                          key={transaction.id}
                          className="rounded-xl bg-zinc-900 p-4"
                        >

                          <div className="flex items-start justify-between gap-3">

                            <div>

                              <p className="font-bold">
                                {transaction.transactionNumber}
                              </p>

                              <p className="mt-1 text-sm text-zinc-400">
                                {transaction.categorySnapshot}
                              </p>

                              <p className="mt-1 text-xs text-zinc-500">
                                {transaction.vehicleType ===
                                "MOTOR"
                                  ? "Motor"
                                  : "Mobil"}
                              </p>

                              {transaction.modelSnapshot && (
                                <p className="mt-1 text-xs text-zinc-500">
                                  Model:{" "}
                                  {transaction.modelSnapshot}
                                </p>
                              )}

                              {transaction.licensePlateSnapshot && (
                                <p className="mt-1 text-xs text-zinc-500">
                                  Plat:{" "}
                                  {transaction.licensePlateSnapshot}
                                </p>
                              )}

                            </div>

                            <div className="text-right">

                              <p className="font-black">
                                {formatRupiah(
                                  transaction.employeeResult
                                )}
                              </p>

                              <p className="mt-1 text-xs text-zinc-500">
                                Tarif{" "}
                                {formatRupiah(
                                  transaction.price
                                )}
                              </p>

                            </div>

                          </div>

                          <div className="mt-3 border-t border-zinc-800 pt-3">

                            <p className="text-xs text-zinc-500">
                              {new Date(
                                transaction.createdAt
                              ).toLocaleString(
                                "id-ID",
                                {
                                  timeZone:
                                    "Asia/Jakarta",
                                  day: "2-digit",
                                  month: "2-digit",
                                  year: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                }
                              )}
                            </p>

                          </div>

                        </div>

                      )
                    )}

                  </div>

                )}

              </div>

            </>

          ) : (

            <div className="mt-5 rounded-2xl border border-zinc-800 bg-zinc-950 p-6 text-center">

              <div className="text-3xl">
                ⚠️
              </div>

              <p className="mt-3 font-bold">
                DATA TIDAK DAPAT DIMUAT
              </p>

              <p className="mt-1 text-sm text-zinc-500">
                Silakan coba lagi.
              </p>

            </div>

          )}

        </section>

        {/* BOTTOM NAV */}
        <nav className="fixed bottom-0 left-0 right-0 z-50 mx-auto max-w-md border-t border-zinc-800 bg-black/95 px-3 py-3 backdrop-blur">

          <div className="grid grid-cols-4 gap-2">

            <Link
              href="/"
              className="flex flex-col items-center rounded-xl px-2 py-2 text-zinc-500"
            >
              <span className="text-lg">
                ⌂
              </span>

              <span className="mt-1 text-[10px] font-bold">
                BERANDA
              </span>
            </Link>

            <Link
              href="/cuci"
              className="flex flex-col items-center rounded-xl px-2 py-2 text-zinc-500"
            >
              <span className="text-lg">
                🛁
              </span>

              <span className="mt-1 text-[10px] font-bold">
                CUCI
              </span>
            </Link>

            <Link
              href="/riwayat"
              className="flex flex-col items-center rounded-xl px-2 py-2 text-zinc-500"
            >
              <span className="text-lg">
                ▤
              </span>

              <span className="mt-1 text-[10px] font-bold">
                RIWAYAT
              </span>
            </Link>

            <Link
              href="/hasil"
              className="flex flex-col items-center rounded-xl bg-red-600/10 px-2 py-2 text-red-500"
            >
              <span className="text-lg">
                📊
              </span>

              <span className="mt-1 text-[10px] font-bold">
                HASIL
              </span>
            </Link>

          </div>

        </nav>

      </div>
    </main>
  );
}