"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

type Transaction = {
  id: number;
  transactionNumber: string;
  licensePlateSnapshot: string | null;
  brandSnapshot: string | null;
  modelSnapshot: string | null;
  categorySnapshot: string;
  vehicleType: "MOTOR" | "MOBIL";
  price: number;
  status: string;
  createdAt: string;
};

export default function DetailTransactionPage() {
  const params = useParams();
  const router = useRouter();

  const [transaction, setTransaction] =
    useState<Transaction | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadTransaction() {
      try {
        const response = await fetch(
          `/api/transactions/${params.id}`
        );

        const data = await response.json();

        if (!response.ok || !data.success) {
          setError(
            data.error ||
              "Transaksi tidak ditemukan."
          );
          return;
        }

        setTransaction(data.transaction);
      } catch (error) {
        console.error(
          "Detail transaksi error:",
          error
        );

        setError(
          "Tidak dapat mengambil data transaksi."
        );
      } finally {
        setLoading(false);
      }
    }

    if (params.id) {
      loadTransaction();
    }
  }, [params.id]);

  function formatRupiah(value: number) {
    return `Rp${value.toLocaleString("id-ID")}`;
  }

  function formatDate(value: string) {
    return new Date(value).toLocaleString(
      "id-ID"
    );
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-black px-4 py-6 text-white">
        <div className="mx-auto max-w-md">
          <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6 text-center">
            <p className="text-sm font-bold text-zinc-400">
              MEMUAT DETAIL TRANSAKSI...
            </p>
          </div>
        </div>
      </main>
    );
  }

  if (error || !transaction) {
    return (
      <main className="min-h-screen bg-black px-4 py-6 text-white">
        <div className="mx-auto max-w-md">

          <button
            type="button"
            onClick={() =>
              router.push("/riwayat")
            }
            className="mb-6 flex h-10 w-10 items-center justify-center rounded-xl bg-red-600 text-xl font-black text-white shadow-lg transition active:scale-[0.95]"
          >
            ←
          </button>

          <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6 text-center">
            <div className="text-4xl font-black text-red-500">
              !
            </div>

            <h1 className="mt-3 text-lg font-black">
              TRANSAKSI TIDAK DITEMUKAN
            </h1>

            <p className="mt-2 text-sm text-zinc-500">
              {error ||
                "Data transaksi tidak tersedia."}
            </p>
          </div>

        </div>
      </main>
    );
  }

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

  return (
    <main className="min-h-screen bg-black px-4 py-6 text-white">
      <div className="mx-auto max-w-md pb-10">

        {/* HEADER */}
        <header className="mb-6">
          <div className="flex items-center gap-3">

            <button
              type="button"
              onClick={() =>
                router.push("/riwayat")
              }
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-600 text-xl font-black text-white shadow-lg transition active:scale-[0.95]"
              aria-label="Kembali ke riwayat"
            >
              ←
            </button>

            <div>
              <p className="text-xs font-bold tracking-widest text-zinc-500">
                DATA TRANSAKSI
              </p>

              <h1 className="mt-1 text-2xl font-black">
                DETAIL TRANSAKSI
              </h1>
            </div>

          </div>
        </header>

        {/* TRANSACTION CARD */}
        <section className="rounded-3xl border border-zinc-800 bg-zinc-950 p-5">

          {/* NOMOR TRANSAKSI */}
          <div className="flex items-start justify-between gap-3">

            <div className="min-w-0">
              <p className="text-[10px] font-black tracking-wider text-zinc-500">
                NOMOR TRANSAKSI
              </p>

              <p className="mt-1 break-all text-lg font-black text-white">
                {transaction.transactionNumber}
              </p>
            </div>

            <span className="shrink-0 rounded-full bg-green-600 px-3 py-1 text-[10px] font-black text-white">
              {transaction.status}
            </span>

          </div>

          {/* NOMOR POLISI */}
          {licensePlate && (
            <div className="mt-5 rounded-2xl border border-zinc-800 bg-black p-4">
              <p className="text-[10px] font-black text-zinc-500">
                NOMOR POLISI
              </p>

              <p className="mt-1 break-words text-2xl font-black tracking-wider text-white">
                {licensePlate}
              </p>
            </div>
          )}

          {/* MODEL */}
          <div className="mt-5 rounded-2xl border border-zinc-800 bg-black p-4">
            <p className="text-[10px] font-black text-zinc-500">
              MODEL KENDARAAN
            </p>

            <p className="mt-1 break-words text-xl font-black text-white">
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
          <div className="mt-4 grid grid-cols-2 gap-3">

            {/* JENIS */}
            <div className="rounded-2xl border border-zinc-800 bg-black p-4">
              <p className="text-[10px] font-black text-zinc-500">
                JENIS
              </p>

              <p className="mt-2 text-sm font-black text-white">
                {transaction.vehicleType ===
                "MOTOR"
                  ? "🏍️ MOTOR"
                  : "🚗 MOBIL"}
              </p>
            </div>

            {/* KATEGORI */}
            <div className="rounded-2xl border border-zinc-800 bg-black p-4">
              <p className="text-[10px] font-black text-zinc-500">
                KATEGORI
              </p>

              <p className="mt-2 break-words text-sm font-black text-white">
                {transaction.categorySnapshot}
              </p>
            </div>

          </div>

          {/* HARGA */}
          <div className="mt-4 rounded-2xl border-2 border-red-600 bg-red-600 p-5 text-white">
            <p className="text-[10px] font-black text-red-100">
              HARGA CUCI
            </p>

            <p className="mt-1 break-words text-3xl font-black">
              {formatRupiah(transaction.price)}
            </p>
          </div>

          {/* TANGGAL */}
          <div className="mt-4 rounded-2xl border border-zinc-800 bg-black p-4">
            <p className="text-[10px] font-black text-zinc-500">
              TANGGAL TRANSAKSI
            </p>

            <p className="mt-2 text-sm font-bold text-white">
              {formatDate(
                transaction.createdAt
              )}
            </p>
          </div>

          {/* CETAK STRUK */}
          <button
            type="button"
            onClick={() =>
              router.push(
                `/struk/${transaction.id}`
              )
            }
            className="mt-5 w-full rounded-2xl bg-red-600 px-4 py-5 text-base font-black text-white shadow-lg transition hover:bg-red-700 active:scale-[0.98]"
          >
            🖨️ CETAK STRUK
          </button>

        </section>

      </div>
    </main>
  );
}