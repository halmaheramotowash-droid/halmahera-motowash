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

  return `${month}/${day}/${year}`;
}

function formatRupiah(value: number) {
  return `Rp${value.toLocaleString("id-ID")}`;
}

export default function OwnerHasilPage() {
  const [data, setData] = useState<OwnerData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(getToday());

  const today = getToday();

  async function loadData(date: string) {
    try {
      setLoading(true);

      const response = await fetch(
        `/api/owner/summary?date=${encodeURIComponent(date)}`
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
              href="/owner"
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
              OWNER
            </p>

            <h2 className="mt-1 text-2xl font-black">
              HASIL USAHA
            </h2>

            <p className="mt-1 text-sm text-zinc-500">
              Rekap usaha berdasarkan tanggal
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

              {/* RINGKASAN UTAMA */}
              <div className="mt-5">

                <p className="mb-3 text-xs font-bold tracking-widest text-red-500">
                  RINGKASAN USAHA
                </p>

                <div className="grid grid-cols-2 gap-3">

                  {/* OMZET */}
                  <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4">

                    <p className="text-xs font-bold text-zinc-500">
                      OMZET
                    </p>

                    <p className="mt-2 text-xl font-black text-white">
                      {formatRupiah(
                        data.summary.revenue
                      )}
                    </p>

                  </div>

                  {/* LABA BERSIH */}
                  <div className="rounded-2xl border border-red-900/50 bg-red-950/20 p-4">

                    <p className="text-xs font-bold text-red-500">
                      LABA BERSIH
                    </p>

                    <p className="mt-2 text-xl font-black text-white">
                      {formatRupiah(
                        data.summary.netProfit
                      )}
                    </p>

                  </div>

                  {/* KOMPENSASI */}
                  <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4">

                    <p className="text-xs font-bold text-zinc-500">
                      KOMPENSASI
                    </p>

                    <p className="mt-2 text-xl font-black text-white">
                      {formatRupiah(
                        data.summary.employeeCompensation
                      )}
                    </p>

                  </div>

                  {/* PENGELUARAN */}
                  <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4">

                    <p className="text-xs font-bold text-zinc-500">
                      PENGELUARAN
                    </p>

                    <p className="mt-2 text-xl font-black text-white">
                      {formatRupiah(
                        data.summary.expenses
                      )}
                    </p>

                  </div>

                </div>

              </div>

              {/* STATISTIK CUCI */}
              <div className="mt-5 rounded-2xl border border-zinc-800 bg-zinc-950 p-5">

                <p className="text-xs font-bold tracking-widest text-red-500">
                  AKTIVITAS CUCI
                </p>

                <h3 className="mt-1 text-lg font-bold">
                  {data.summary.totalVehicles} kendaraan
                </h3>

                <div className="mt-4 grid grid-cols-3 gap-3">

                  {/* TOTAL */}
                  <div className="rounded-xl bg-zinc-900 p-4 text-center">

                    <p className="text-2xl font-black">
                      {data.summary.totalVehicles}
                    </p>

                    <p className="mt-1 text-[10px] font-bold tracking-wider text-zinc-500">
                      TOTAL
                    </p>

                  </div>

                  {/* MOTOR */}
                  <div className="rounded-xl bg-zinc-900 p-4 text-center">

                    <p className="text-2xl font-black text-red-500">
                      {data.summary.motorCount}
                    </p>

                    <p className="mt-1 text-[10px] font-bold tracking-wider text-zinc-500">
                      MOTOR
                    </p>

                  </div>

                  {/* MOBIL */}
                  <div className="rounded-xl bg-zinc-900 p-4 text-center">

                    <p className="text-2xl font-black text-red-500">
                      {data.summary.mobilCount}
                    </p>

                    <p className="mt-1 text-[10px] font-bold tracking-wider text-zinc-500">
                      MOBIL
                    </p>

                  </div>

                </div>

              </div>

              {/* HASIL PER KARYAWAN */}
              <div className="mt-5 rounded-2xl border border-zinc-800 bg-zinc-950 p-5">

                <p className="text-xs font-bold tracking-widest text-red-500">
                  HASIL KARYAWAN
                </p>

                <h3 className="mt-1 text-lg font-bold">
                  Rekap per karyawan
                </h3>

                {data.employeeResults.length === 0 ? (

                  <div className="mt-4 rounded-xl bg-zinc-900 p-5 text-center">

                    <div className="text-3xl">
                      👤
                    </div>

                    <p className="mt-3 font-bold">
                      BELUM ADA HASIL
                    </p>

                    <p className="mt-1 text-sm text-zinc-500">
                      Tidak ada hasil karyawan pada tanggal ini.
                    </p>

                  </div>

                ) : (

                  <div className="mt-4 space-y-3">

                    {data.employeeResults.map(
                      (employee) => (

                        <div
                          key={employee.employeeId}
                          className="rounded-xl bg-zinc-900 p-4"
                        >

                          <div className="flex items-start justify-between gap-3">

                            <div>

                              <p className="font-bold text-white">
                                {employee.name}
                              </p>

                              <p className="mt-1 text-xs text-zinc-500">
                                @{employee.username}
                              </p>

                            </div>

                            <p className="font-black text-red-500">
                              {formatRupiah(
                                employee.totalResult
                              )}
                            </p>

                          </div>

                          <div className="mt-3 grid grid-cols-3 gap-2">

                            {/* JUMLAH CUCI */}
                            <div className="rounded-lg bg-zinc-950 p-2 text-center">

                              <p className="font-bold">
                                {employee.totalVehicles}
                              </p>

                              <p className="text-[9px] text-zinc-500">
                                CUCI
                              </p>

                            </div>

                            {/* MOTOR */}
                            <div className="rounded-lg bg-zinc-950 p-2 text-center">

                              <p className="font-bold">
                                {employee.motorCount}
                              </p>

                              <p className="text-[9px] text-zinc-500">
                                MOTOR
                              </p>

                            </div>

                            {/* MOBIL */}
                            <div className="rounded-lg bg-zinc-950 p-2 text-center">

                              <p className="font-bold">
                                {employee.mobilCount}
                              </p>

                              <p className="text-[9px] text-zinc-500">
                                MOBIL
                              </p>

                            </div>

                          </div>

                        </div>

                      )
                    )}

                  </div>

                )}

              </div>

              {/* TRANSAKSI */}
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
                                  transaction.price
                                )}
                              </p>

                              <p className="mt-1 text-xs text-red-500">
                                Hasil{" "}
                                {formatRupiah(
                                  transaction.employeeResult
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
              href="/owner"
              className="flex flex-col items-center rounded-xl px-2 py-2 text-zinc-500"
            >
              <span className="text-lg">
                ⌂
              </span>

              <span className="mt-1 text-[10px] font-bold">
                DASHBOARD
              </span>
            </Link>

            <Link
              href="/cuci"
              className="flex flex-col items-center rounded-xl px-2 py-2 text-zinc-500"
            >
              <span className="text-lg">
                🚿
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
              href="/owner/hasil"
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