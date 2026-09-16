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
  vehicleType: string;
  price: number;
  employeeResult: number;
  status: string;
  createdAt: string;
};

type TransactionGroup = {
  dateKey: string;
  dateLabel: string;
  transactions: Transaction[];
  total: number;
};

function getDateKey(dateString: string) {
  const date = new Date(dateString);

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function formatDateLabel(dateKey: string) {
  const [year, month, day] = dateKey.split("-").map(Number);

  return new Date(year, month - 1, day).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatRupiah(value: number) {
  return `Rp${value.toLocaleString("id-ID")}`;
}

export default function RiwayatPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedDates, setExpandedDates] = useState<string[]>([]);

  useEffect(() => {
    let isMounted = true;

    async function loadTransactions() {
      try {
        const response = await fetch("/api/transactions", {
          method: "GET",
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("Gagal mengambil data transaksi");
        }

        const data = await response.json();

        if (isMounted) {
          const loadedTransactions = data.transactions ?? [];

          setTransactions(loadedTransactions);

          if (loadedTransactions.length > 0) {
            const firstDate = getDateKey(loadedTransactions[0].createdAt);
            setExpandedDates([firstDate]);
          }

          setLoading(false);
        }
      } catch (error) {
        console.error("Gagal memuat riwayat transaksi:", error);

        if (isMounted) {
          setTransactions([]);
          setLoading(false);
        }
      }
    }

    loadTransactions();

    return () => {
      isMounted = false;
    };
  }, []);

  const groupedTransactions: TransactionGroup[] = Object.values(
    transactions.reduce<Record<string, TransactionGroup>>(
      (groups, transaction) => {
        const dateKey = getDateKey(transaction.createdAt);

        if (!groups[dateKey]) {
          groups[dateKey] = {
            dateKey,
            dateLabel: formatDateLabel(dateKey),
            transactions: [],
            total: 0,
          };
        }

        groups[dateKey].transactions.push(transaction);
        groups[dateKey].total += Number(transaction.price) || 0;

        return groups;
      },
      {}
    )
  ).sort((a, b) => b.dateKey.localeCompare(a.dateKey));

  function toggleDate(dateKey: string) {
    setExpandedDates((currentDates) =>
      currentDates.includes(dateKey)
        ? currentDates.filter((date) => date !== dateKey)
        : [...currentDates, dateKey]
    );
  }

  return (
    <main className="min-h-screen bg-[#07111f] text-white">
      <div className="mx-auto min-h-screen max-w-md bg-[#07111f] pb-24">
        {/* HEADER */}
        <header className="border-b border-red-900/40 bg-gradient-to-br from-[#07111f] via-[#0b1729] to-[#190914] px-5 py-6">
          <div className="flex items-center gap-3">
              <Link
  href="/owner"
  aria-label="Kembali ke dashboard owner"
  className="flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-700 bg-[#17263d] text-xl text-white transition hover:border-red-600 active:scale-[0.95]"
>
              ←
            </Link>

            <div>
              <p className="text-xs font-black tracking-[0.18em] text-red-500">
                DATA TRANSAKSI
              </p>

              <h1 className="mt-1 text-2xl font-black tracking-tight text-white">
                RIWAYAT TRANSAKSI
              </h1>

              <p className="mt-1 text-sm text-slate-400">
                Daftar transaksi cuci kendaraan per hari
              </p>
            </div>
          </div>
        </header>

        {/* CONTENT */}
        <section className="px-4 pt-5">
          {loading ? (
            <div className="rounded-3xl border border-slate-700/70 bg-gradient-to-br from-[#17263d] to-[#0c1728] p-6 text-center">
              <p className="text-sm font-semibold text-slate-300">
                MEMUAT DATA...
              </p>
            </div>
          ) : transactions.length === 0 ? (
            <div className="rounded-3xl border border-slate-700/70 bg-gradient-to-br from-[#17263d] to-[#0c1728] p-6 text-center">
              <div className="text-3xl">▤</div>

              <p className="mt-3 font-bold text-white">
                BELUM ADA TRANSAKSI
              </p>

              <p className="mt-1 text-sm text-slate-400">
                Transaksi yang selesai akan muncul di sini.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {groupedTransactions.map((group) => {
                const isExpanded = expandedDates.includes(group.dateKey);

                return (
                  <section key={group.dateKey} className="space-y-3">
                    {/* DAILY HEADER */}
                    <button
                      type="button"
                      onClick={() => toggleDate(group.dateKey)}
                      className="w-full rounded-3xl border border-red-800/70 bg-gradient-to-r from-[#3b0d1d] via-[#17263d] to-[#0c1728] p-4 text-left transition hover:border-red-500 active:scale-[0.99]"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-red-500/50 bg-red-950/50 text-2xl">
                          📅
                        </div>

                        <div className="min-w-0 flex-1">
                          <h2 className="text-lg font-black text-white">
                            {group.dateLabel}
                          </h2>

                          <p className="mt-1 text-xs font-medium text-slate-300">
                            {group.transactions.length} transaksi
                          </p>
                        </div>

                        <div className="border-l border-red-500/80 pl-3 text-right">
                          <p className="text-xs font-medium text-slate-300">
                            Total Cuci
                          </p>

                          <p className="mt-1 text-lg font-black text-red-500">
                            {formatRupiah(group.total)}
                          </p>
                        </div>

                        <span className="ml-1 text-xl text-white">
                          {isExpanded ? "⌃" : "⌄"}
                        </span>
                      </div>
                    </button>

                    {/* DAILY TRANSACTIONS */}
                    {isExpanded && (
                      <div className="space-y-3">
                        {group.transactions.map((transaction) => {
                          const modelName =
                            transaction.modelSnapshot?.trim() || "";

                          const brandName =
                            transaction.brandSnapshot?.trim() || "";

                          const licensePlate =
                            transaction.licensePlateSnapshot?.trim() || "";

                          const vehicleName =
                            modelName ||
                            brandName ||
                            "Model tidak diisi";

                          const price = Number(transaction.price) || 0;

                          const employeeResult =
                            Number(transaction.employeeResult) || 0;

                          return (
                            <Link
                              key={transaction.id}
                              href={`/detail/${transaction.id}`}
                              className="block rounded-3xl border border-slate-700/80 bg-gradient-to-br from-[#101d2d] to-[#0a1422] p-4 transition hover:border-red-600 active:scale-[0.99]"
                            >
                              {/* TRANSACTION HEADER */}
                              <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0">
                                  <p className="break-all text-base font-black text-white">
                                    {transaction.transactionNumber}
                                  </p>

                                  <p className="mt-1 text-xs text-slate-400">
                                    🕒{" "}
                                    {new Date(
                                      transaction.createdAt
                                    ).toLocaleTimeString("id-ID")}
                                  </p>
                                </div>

                                <span className="shrink-0 rounded-full border border-green-700/70 bg-green-950/40 px-3 py-1 text-[10px] font-black text-green-400">
                                  {transaction.status}
                                </span>
                              </div>

                              {/* NOMOR POLISI */}
                              {licensePlate && (
                                <div className="mt-4 rounded-2xl border border-slate-700/60 bg-[#17263d]/70 p-4">
                                  <p className="text-xs font-bold text-slate-400">
                                    NOMOR POLISI
                                  </p>

                                  <p className="mt-1 break-words text-xl font-black tracking-wider text-red-500">
                                    {licensePlate}
                                  </p>
                                </div>
                              )}

                              {/* MODEL KENDARAAN */}
                              <div className="mt-4 rounded-2xl border border-slate-700/60 bg-[#17263d]/70 p-4">
                                <p className="text-xs font-bold text-slate-400">
                                  MODEL KENDARAAN
                                </p>

                                <p className="mt-1 break-words text-lg font-black text-white">
                                  {vehicleName}
                                </p>

                                {brandName &&
                                  modelName &&
                                  brandName !== modelName && (
                                    <p className="mt-1 text-xs text-slate-400">
                                      {brandName}
                                    </p>
                                  )}
                              </div>

                              {/* DETAIL */}
                              <div className="mt-3 grid grid-cols-2 gap-3">
                                {/* JENIS */}
                                <div className="rounded-2xl border border-slate-700/60 bg-[#17263d]/70 p-3">
                                  <p className="text-[10px] font-bold text-slate-400">
                                    JENIS
                                  </p>

                                  <p className="mt-1 text-sm font-bold text-white">
                                    {transaction.vehicleType === "MOTOR"
                                      ? "🏍️ MOTOR"
                                      : "🚗 MOBIL"}
                                  </p>
                                </div>

                                {/* KATEGORI */}
                                <div className="rounded-2xl border border-slate-700/60 bg-[#17263d]/70 p-3">
                                  <p className="text-[10px] font-bold text-slate-400">
                                    KATEGORI
                                  </p>

                                  <p className="mt-1 break-words text-sm font-bold text-white">
                                    {transaction.categorySnapshot}
                                  </p>
                                </div>

                                {/* HASIL KARYAWAN */}
                                <div className="rounded-2xl border border-slate-700/60 bg-[#17263d]/70 p-3">
                                  <p className="text-[10px] font-bold text-slate-400">
                                    HASIL KARYAWAN
                                  </p>

                                  <p className="mt-1 text-sm font-bold text-green-400">
                                    {formatRupiah(employeeResult)}
                                  </p>
                                </div>

                                {/* HARGA */}
                                <div className="rounded-2xl border border-slate-700/60 bg-[#17263d]/70 p-3">
                                  <p className="text-[10px] font-bold text-slate-400">
                                    HARGA CUCI
                                  </p>

                                  <p className="mt-1 text-sm font-bold text-white">
                                    {formatRupiah(price)}
                                  </p>
                                </div>
                              </div>

                              {/* TOTAL */}
                              <div className="mt-3 rounded-2xl border border-red-800/70 bg-gradient-to-r from-[#250b16] to-[#160d17] p-4">
                                <div className="flex items-center justify-between gap-3">
                                  <div className="min-w-0">
                                    <p className="text-xs font-bold text-slate-400">
                                      TOTAL CUCI
                                    </p>

                                    <p className="mt-1 break-words text-2xl font-black text-red-500">
                                      {formatRupiah(price)}
                                    </p>
                                  </div>

                                  <div className="shrink-0 text-2xl">
                                    🚿
                                  </div>
                                </div>
                              </div>

                              {/* DATE */}
                              <p className="mt-4 text-xs text-slate-500">
                                {new Date(
                                  transaction.createdAt
                                ).toLocaleString("id-ID")}
                              </p>

                              {/* PETUNJUK */}
                              <p className="mt-3 text-center text-[10px] font-black text-red-500">
                                TAP UNTUK MELIHAT DETAIL
                              </p>
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </section>
                );
              })}
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
              <span className="text-lg">🚿</span>

              <span className="mt-1 text-[10px] font-bold">
                CUCI
              </span>
            </Link>

            {/* RIWAYAT */}
            <Link
              href="/riwayat"
              className="flex flex-col items-center rounded-2xl bg-red-600/15 px-2 py-2 text-red-500 transition hover:bg-red-600/25 active:scale-[0.95]"
            >
              <span className="text-lg">▤</span>

              <span className="mt-1 text-[10px] font-black">
                RIWAYAT
              </span>
            </Link>

            {/* MENU */}
            <Link
              href="/owner"
              className="flex flex-col items-center rounded-2xl px-2 py-2 text-slate-500 transition hover:text-white active:scale-[0.95]"
            >
              <span className="text-lg">☰</span>

              <span className="mt-1 text-[10px] font-bold">
                MENU
              </span>
            </Link>
          </div>
        </nav>
      </div>
    </main>
  );
}