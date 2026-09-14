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

export default function RiwayatPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

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
          setTransactions(data.transactions ?? []);
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

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="mx-auto min-h-screen max-w-md bg-black pb-24">
        {/* HEADER */}
        <header className="border-b border-red-900/40 bg-black px-5 py-6">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-900 text-xl text-white transition active:scale-[0.95]"
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
              DATA TRANSAKSI
            </p>

            <h2 className="mt-1 text-2xl font-black">
              RIWAYAT TRANSAKSI
            </h2>

            <p className="mt-1 text-sm text-zinc-500">
              Daftar transaksi cuci kendaraan
            </p>
          </div>
        </header>

        {/* CONTENT */}
        <section className="px-5 pt-5">
          {loading ? (
            <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6 text-center">
              <p className="text-sm font-semibold text-zinc-400">
                MEMUAT DATA...
              </p>
            </div>
          ) : transactions.length === 0 ? (
            <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6 text-center">
              <div className="text-3xl">▤</div>

              <p className="mt-3 font-bold text-white">
                BELUM ADA TRANSAKSI
              </p>

              <p className="mt-1 text-sm text-zinc-500">
                Transaksi yang selesai akan muncul di sini.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {transactions.map((transaction) => {
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
                    className="block rounded-2xl border border-zinc-800 bg-zinc-950 p-5 transition hover:border-red-600 active:scale-[0.99]"
                  >
                    {/* TRANSACTION HEADER */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-xs font-bold tracking-wider text-zinc-500">
                          NOMOR TRANSAKSI
                        </p>

                        <p className="mt-1 break-all font-bold text-white">
                          {transaction.transactionNumber}
                        </p>
                      </div>

                      <span className="shrink-0 rounded-full border border-green-900/50 bg-green-950/30 px-3 py-1 text-[10px] font-black text-green-500">
                        {transaction.status}
                      </span>
                    </div>

                    {/* NOMOR POLISI */}
                    {licensePlate && (
                      <div className="mt-4 rounded-xl bg-zinc-900 p-4">
                        <p className="text-xs font-bold text-zinc-500">
                          NOMOR POLISI
                        </p>

                        <p className="mt-1 break-words text-2xl font-black tracking-wider text-red-500">
                          {licensePlate}
                        </p>
                      </div>
                    )}

                    {/* MODEL KENDARAAN */}
                    <div className="mt-4 rounded-xl bg-zinc-900 p-4">
                      <p className="text-xs font-bold text-zinc-500">
                        MODEL KENDARAAN
                      </p>

                      <p className="mt-1 break-words text-lg font-black text-white">
                        {vehicleName}
                      </p>

                      {brandName &&
                        modelName &&
                        brandName !== modelName && (
                          <p className="mt-1 text-xs text-zinc-500">
                            {brandName}
                          </p>
                        )}
                    </div>

                    {/* DETAIL */}
                    <div className="mt-3 grid grid-cols-2 gap-3">
                      {/* JENIS */}
                      <div className="rounded-xl bg-zinc-900 p-3">
                        <p className="text-[10px] font-bold text-zinc-500">
                          JENIS
                        </p>

                        <p className="mt-1 text-sm font-bold text-white">
                          {transaction.vehicleType === "MOTOR"
                            ? "🏍️ MOTOR"
                            : "🚗 MOBIL"}
                        </p>
                      </div>

                      {/* KATEGORI */}
                      <div className="rounded-xl bg-zinc-900 p-3">
                        <p className="text-[10px] font-bold text-zinc-500">
                          KATEGORI
                        </p>

                        <p className="mt-1 break-words text-sm font-bold text-white">
                          {transaction.categorySnapshot}
                        </p>
                      </div>

                      {/* HASIL KARYAWAN */}
                      <div className="rounded-xl bg-zinc-900 p-3">
                        <p className="text-[10px] font-bold text-zinc-500">
                          HASIL KARYAWAN
                        </p>

                        <p className="mt-1 text-sm font-bold text-green-500">
                          Rp
                          {employeeResult.toLocaleString("id-ID")}
                        </p>
                      </div>

                      {/* HARGA */}
                      <div className="rounded-xl bg-zinc-900 p-3">
                        <p className="text-[10px] font-bold text-zinc-500">
                          HARGA CUCI
                        </p>

                        <p className="mt-1 text-sm font-bold text-white">
                          Rp
                          {price.toLocaleString("id-ID")}
                        </p>
                      </div>
                    </div>

                    {/* TOTAL */}
                    <div className="mt-3 rounded-xl border border-red-900/40 bg-red-950/20 p-4">
                      <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-zinc-500">
                            TOTAL CUCI
                          </p>

                          <p className="mt-1 break-words text-2xl font-black text-red-500">
                            Rp
                            {price.toLocaleString("id-ID")}
                          </p>
                        </div>

                        <div className="shrink-0 text-2xl">
                          🚿
                        </div>
                      </div>
                    </div>

                    {/* DATE */}
                    <p className="mt-4 text-xs text-zinc-600">
                      {new Date(
                        transaction.createdAt
                      ).toLocaleString("id-ID")}
                    </p>

                    {/* PETUNJUK */}
                    <p className="mt-3 text-center text-[10px] font-bold text-red-500">
                      TAP UNTUK MELIHAT DETAIL
                    </p>
                  </Link>
                );
              })}
            </div>
          )}
        </section>

        {/* BOTTOM NAV */}
        <nav className="fixed bottom-0 left-0 right-0 z-50 mx-auto max-w-md border-t border-zinc-800 bg-black/95 px-3 py-3 backdrop-blur">
          <div className="grid grid-cols-4 gap-2">
            {/* BERANDA */}
            <Link
              href="/"
              className="flex flex-col items-center rounded-xl px-2 py-2 text-zinc-500 transition active:scale-[0.95]"
            >
              <span className="text-lg">⌂</span>

              <span className="mt-1 text-[10px] font-bold">
                BERANDA
              </span>
            </Link>

            {/* CUCI */}
            <Link
              href="/cuci"
              className="flex flex-col items-center rounded-xl px-2 py-2 text-zinc-500 transition active:scale-[0.95]"
            >
              <span className="text-lg">🚿</span>

              <span className="mt-1 text-[10px] font-bold">
                CUCI
              </span>
            </Link>

            {/* RIWAYAT */}
            <Link
              href="/riwayat"
              className="flex flex-col items-center rounded-xl bg-red-600/10 px-2 py-2 text-red-500 transition active:scale-[0.95]"
            >
              <span className="text-lg">▤</span>

              <span className="mt-1 text-[10px] font-bold">
                RIWAYAT
              </span>
            </Link>

            {/* MENU */}
            <Link
              href="/owner"
              className="flex flex-col items-center rounded-xl px-2 py-2 text-zinc-500 transition active:scale-[0.95]"
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