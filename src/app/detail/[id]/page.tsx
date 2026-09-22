"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { apiGet } from "@/lib/api-client";

type Transaction = {
  id: number;
  transactionNumber: string;

  licensePlateSnapshot?: string | null;
  brandSnapshot?: string | null;
  modelSnapshot?: string | null;
  categorySnapshot?: string | null;

  vehicleType?: "MOTOR" | "MOBIL" | string;
  price?: number | null;
  status?: string | null;
  createdAt: string;

  employeeName?: string | null;

  employee?: {
    id?: number;
    name?: string | null;
  } | null;

  notes?: string | null;
  note?: string | null;
};

function formatRupiah(value: number | null | undefined) {
  return `Rp${Number(value || 0).toLocaleString("id-ID")}`;
}

function formatDate(value?: string | null) {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return date.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatTime(value?: string | null) {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return date.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function getStatusLabel(status?: string | null) {
  if (!status) return "TIDAK DIKETAHUI";

  const normalized = status.toUpperCase();

  if (normalized === "COMPLETED") return "SELESAI";
  if (normalized === "PENDING") return "MENUNGGU";
  if (normalized === "CANCELLED") return "DIBATALKAN";

  return status;
}

function getVehicleLabel(vehicleType?: string) {
  return vehicleType?.toUpperCase() === "MOBIL"
    ? "Cuci Mobil"
    : "Cuci Motor";
}

export default function DetailTransactionPage() {
  const params = useParams();
  const router = useRouter();

  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copyMessage, setCopyMessage] = useState("");
  const [shareMessage, setShareMessage] = useState("");

  const transactionId = Array.isArray(params?.id)
    ? params.id[0]
    : String(params?.id || "");

  useEffect(() => {
    let mounted = true;

    async function loadTransaction() {
      if (!transactionId) {
        setError("ID transaksi tidak ditemukan.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const response = await apiGet(`/api/transactions/${transactionId}`);

        const data = await response.json().catch(() => null);

        if (!response.ok) {
          throw new Error(
            data?.error ||
              data?.message ||
              "Data transaksi tidak ditemukan."
          );
        }

        const result =
          data?.transaction ||
          data?.data ||
          (data?.id ? data : null);

        if (!result) {
          throw new Error(
            data?.error ||
              data?.message ||
              "Format data transaksi tidak sesuai."
          );
        }

        if (mounted) {
          setTransaction(result);
        }
      } catch (err) {
        console.error("Gagal memuat detail transaksi:", err);

        if (mounted) {
          setError(
            err instanceof Error
              ? err.message
              : "Gagal memuat detail transaksi."
          );
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadTransaction();

    return () => {
      mounted = false;
    };
  }, [transactionId]);

  function handleBackToOwner() {
    router.push("/owner");
  }

  function handleOpenHistory() {
    router.push("/riwayat");
  }

  function handlePrint() {
    if (!transaction) return;

    router.push(`/struk/${transaction.id}`);
  }

  async function handleCopyNumber() {
    if (!transaction?.transactionNumber) return;

    try {
      await navigator.clipboard.writeText(transaction.transactionNumber);

      setCopyMessage("Nomor transaksi berhasil disalin.");

      setTimeout(() => {
        setCopyMessage("");
      }, 2500);
    } catch (err) {
      console.error("Gagal menyalin nomor transaksi:", err);
      setCopyMessage("Gagal menyalin nomor transaksi.");
    }
  }

  async function handleShare() {
    if (!transaction) return;

    const employeeName =
      transaction.employee?.name ||
      transaction.employeeName ||
      "Tidak dicatat";

    const shareText = [
      "DETAIL TRANSAKSI HALMAHERA MOTOWASH",
      "",
      `Nomor Transaksi: ${transaction.transactionNumber}`,
      `Status: ${getStatusLabel(transaction.status)}`,
      `Tanggal: ${formatDate(transaction.createdAt)}`,
      `Waktu: ${formatTime(transaction.createdAt)}`,
      `Jenis Kendaraan: ${transaction.vehicleType || "-"}`,
      `Merek: ${transaction.brandSnapshot || "-"}`,
      `Model: ${transaction.modelSnapshot || "-"}`,
      `Nomor Polisi: ${transaction.licensePlateSnapshot || "-"}`,
      `Kategori: ${transaction.categorySnapshot || "-"}`,
      `Karyawan: ${employeeName}`,
      `Harga Cuci: ${formatRupiah(transaction.price)}`,
    ].join("\n");

    try {
      if (navigator.share) {
        await navigator.share({
          title: "Detail Transaksi",
          text: shareText,
        });
      } else {
        await navigator.clipboard.writeText(shareText);

        setShareMessage("Detail transaksi berhasil disalin.");

        setTimeout(() => {
          setShareMessage("");
        }, 3000);
      }
    } catch (err) {
      console.error("Berbagi transaksi dibatalkan:", err);
    }
  }

  const detail = useMemo(() => {
    if (!transaction) return null;

    return {
      employeeName:
        transaction.employee?.name ||
        transaction.employeeName ||
        "Tidak dicatat",

      modelName:
        transaction.modelSnapshot?.trim() || "Model tidak diisi",

      brandName:
        transaction.brandSnapshot?.trim() || "Tidak diisi",

      plateNumber:
        transaction.licensePlateSnapshot?.trim() || "Tidak dicatat",

      categoryName:
        transaction.categorySnapshot?.trim() || "Tidak ada kategori",

      note:
        transaction.notes?.trim() ||
        transaction.note?.trim() ||
        "Tidak ada catatan",

      isMotor:
        transaction.vehicleType?.toUpperCase() !== "MOBIL",

      isCompleted:
        transaction.status?.toUpperCase() === "COMPLETED",
    };
  }, [transaction]);

  if (loading) {
    return (
      <main className="min-h-screen bg-[#050b12] px-4 py-6 text-white">
        <div className="mx-auto flex min-h-[75vh] max-w-md items-center justify-center">
          <section className="w-full rounded-[2rem] border border-white/10 bg-[#0c1824] p-8 text-center shadow-2xl">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-red-500/10 text-4xl">
              ⏳
            </div>

            <h1 className="mt-6 text-xl font-black tracking-wide">
              MEMUAT DETAIL
            </h1>

            <p className="mt-2 text-sm text-slate-400">
              Mohon tunggu sebentar...
            </p>

            <div className="mx-auto mt-6 h-1.5 w-40 overflow-hidden rounded-full bg-white/10">
              <div className="h-full w-1/2 animate-pulse rounded-full bg-red-500" />
            </div>
          </section>
        </div>
      </main>
    );
  }

  if (error || !transaction || !detail) {
    return (
      <main className="min-h-screen bg-[#050b12] px-4 py-6 text-white">
        <div className="mx-auto max-w-md">
          <button
            type="button"
            onClick={handleBackToOwner}
            aria-label="Kembali ke menu Owner"
            className="flex h-14 w-14 items-center justify-center rounded-2xl border border-red-500/60 bg-[#10202d] text-3xl font-black transition hover:bg-red-500/10 active:scale-95"
          >
            ←
          </button>

          <section className="mt-6 rounded-[2rem] border border-red-500/30 bg-[#0c1824] p-7 text-center shadow-2xl">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-red-500/10 text-4xl text-red-400">
              !
            </div>

            <h1 className="mt-5 text-xl font-black">
              TRANSAKSI TIDAK DITEMUKAN
            </h1>

            <p className="mt-3 text-sm leading-6 text-slate-400">
              {error || "Data transaksi tidak tersedia."}
            </p>

            <button
              type="button"
              onClick={handleBackToOwner}
              className="mt-6 w-full rounded-2xl bg-red-600 px-5 py-4 font-black text-white transition hover:bg-red-500 active:scale-[0.98]"
            >
              KEMBALI KE MENU OWNER
            </button>
          </section>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#050b12] text-white">
      <div className="mx-auto w-full max-w-7xl px-3 pb-10 pt-4 sm:px-5 sm:pt-6 lg:px-8">
        {/* HEADER */}
        <header className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-[#142635] via-[#0c1824] to-[#190d17] p-4 shadow-2xl sm:p-6">
          <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-red-600/10 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-32 -left-20 h-64 w-64 rounded-full bg-blue-500/5 blur-3xl" />

          <div className="relative flex items-center gap-4">
            <button
              type="button"
              onClick={handleBackToOwner}
              aria-label="Kembali ke menu Owner"
              className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-red-500/70 bg-[#172b3c] text-3xl font-black shadow-lg shadow-red-950/30 transition hover:bg-red-500/10 active:scale-95"
            >
              ←
            </button>

            <div className="min-w-0">
              <p className="text-[10px] font-black tracking-[0.3em] text-slate-400 sm:text-xs">
                PUSAT INFORMASI
              </p>

              <h1 className="mt-1 text-2xl font-black tracking-tight sm:text-3xl">
                DETAIL TRANSAKSI
              </h1>

              <p className="mt-1 text-xs leading-5 text-slate-400 sm:text-sm">
                Informasi lengkap transaksi pencucian kendaraan
              </p>
            </div>
          </div>
        </header>

        {/* STATUS DAN WAKTU */}
        <section className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-[1.15fr_1fr]">
          <div className="rounded-[2rem] border border-emerald-500/30 bg-gradient-to-br from-emerald-500/15 via-[#0c1824] to-[#0c1824] p-5 shadow-xl sm:p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-emerald-400 text-3xl font-black text-[#06261d]">
                ✓
              </div>

              <div className="min-w-0">
                <p className="text-[10px] font-black tracking-[0.25em] text-emerald-200/70 sm:text-xs">
                  STATUS TRANSAKSI
                </p>

                <h2 className="mt-1 break-words text-2xl font-black text-emerald-400 sm:text-3xl">
                  {getStatusLabel(transaction.status)}
                </h2>

                <p className="mt-1 text-sm text-slate-300">
                  {detail.isCompleted
                    ? "Transaksi berhasil diselesaikan"
                    : "Status transaksi saat ini"}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-[#0c1824] p-5 shadow-xl sm:p-6">
            <p className="text-[10px] font-black tracking-[0.25em] text-slate-400 sm:text-xs">
              TANGGAL & WAKTU
            </p>

            <div className="mt-4 flex items-center gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-sky-500/10 text-3xl">
                📅
              </div>

              <div className="min-w-0">
                <p className="break-words text-base font-black text-white sm:text-lg">
                  {formatDate(transaction.createdAt)}
                </p>

                <p className="mt-1 text-base font-bold text-slate-300">
                  {formatTime(transaction.createdAt)}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* NOMOR TRANSAKSI */}
        <section className="mt-5 rounded-[2rem] border border-white/10 bg-gradient-to-br from-[#142635] to-[#0c1824] p-5 shadow-xl sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-center gap-4">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-red-500 to-red-800 text-3xl shadow-lg shadow-red-950/30">
                🧾
              </div>

              <div className="min-w-0">
                <p className="text-[10px] font-black tracking-[0.2em] text-slate-400 sm:text-xs">
                  NOMOR TRANSAKSI
                </p>

                <p className="mt-2 break-all text-lg font-black leading-relaxed text-white sm:text-2xl">
                  {transaction.transactionNumber}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleCopyNumber}
              className="flex h-12 items-center justify-center gap-2 rounded-xl border border-white/10 bg-[#1a2a39] px-5 text-sm font-black text-white transition hover:bg-[#243b4f] active:scale-95"
            >
              📋 SALIN
            </button>
          </div>

          {copyMessage && (
            <p className="mt-4 rounded-xl bg-emerald-500/10 px-4 py-3 text-sm font-bold text-emerald-400">
              {copyMessage}
            </p>
          )}
        </section>

        {/* INFORMASI KENDARAAN */}
        <section className="mt-5 rounded-[2rem] border border-white/10 bg-[#0c1824] p-5 shadow-xl sm:p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-red-500/10 text-2xl">
              {detail.isMotor ? "🏍️" : "🚗"}
            </div>

            <div>
              <p className="text-[10px] font-black tracking-[0.2em] text-red-400 sm:text-xs">
                INFORMASI KENDARAAN
              </p>

              <h2 className="mt-1 text-xl font-black">
                Data Kendaraan
              </h2>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-[1.25fr_1fr]">
            <div className="rounded-2xl border border-white/10 bg-[#091521] p-4 sm:p-5">
              <div className="flex items-start gap-4">
                <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-gradient-to-br from-[#203547] to-[#10202d] text-5xl">
                  {detail.isMotor ? "🏍️" : "🚗"}
                </div>

                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-400">
                    MODEL KENDARAAN
                  </p>

                  <p className="mt-1 break-words text-lg font-black text-white sm:text-xl">
                    {detail.modelName}
                  </p>

                  <p className="mt-3 text-xs font-bold text-slate-400">
                    JENIS KENDARAAN
                  </p>

                  <p className="mt-1 text-base font-black text-white">
                    {detail.isMotor ? "🏍️ MOTOR" : "🚗 MOBIL"}
                  </p>
                </div>
              </div>

              <div className="mt-5 border-t border-white/10 pt-4">
                <p className="text-xs font-bold text-slate-400">
                  MEREK KENDARAAN
                </p>

                <p className="mt-1 break-words text-sm font-bold text-slate-200">
                  {detail.brandName}
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-[#091521] p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-[#182b3c] text-2xl">
                  🏷️
                </div>

                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-400">
                    KATEGORI CUCI
                  </p>

                  <p className="mt-1 break-words text-lg font-black text-white">
                    {detail.categoryName}
                  </p>
                </div>
              </div>

              <div className="mt-6 border-t border-white/10 pt-5">
                <p className="text-xs font-black tracking-[0.18em] text-red-300">
                  NOMOR POLISI
                </p>

                <p className="mt-2 break-all text-2xl font-black tracking-widest text-white">
                  {detail.plateNumber}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* HARGA */}
        <section className="mt-5 rounded-[2rem] border-2 border-red-500/80 bg-gradient-to-r from-red-700/80 via-red-900/60 to-[#29121d] p-5 shadow-xl shadow-red-950/30 sm:p-7">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-red-500/20 text-4xl">
              🪙
            </div>

            <div className="min-w-0">
              <p className="text-[10px] font-black tracking-[0.25em] text-red-100/80 sm:text-xs">
                TOTAL HARGA CUCI
              </p>

              <p className="mt-1 break-words text-3xl font-black text-white sm:text-5xl">
                {formatRupiah(transaction.price)}
              </p>
            </div>
          </div>
        </section>

        {/* KARYAWAN DAN LAYANAN */}
        <section className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="rounded-[2rem] border border-white/10 bg-[#0c1824] p-5 shadow-xl">
            <p className="text-[10px] font-black tracking-[0.2em] text-slate-400 sm:text-xs">
              KARYAWAN YANG MENCUCI
            </p>

            <div className="mt-4 flex items-center gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-cyan-400/20 bg-cyan-500/10 text-2xl">
                👤
              </div>

              <p className="break-words text-lg font-black text-white">
                {detail.employeeName}
              </p>
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-[#0c1824] p-5 shadow-xl">
            <p className="text-[10px] font-black tracking-[0.2em] text-slate-400 sm:text-xs">
              LAYANAN CUCI
            </p>

            <p className="mt-3 text-lg font-black text-white">
              {getVehicleLabel(transaction.vehicleType)}
            </p>

            <p className="mt-1 break-words text-sm text-slate-400">
              {detail.categoryName}
            </p>
          </div>
        </section>

        {/* WAKTU DAN CATATAN */}
        <section className="mt-5 rounded-[2rem] border border-white/10 bg-[#0c1824] p-5 shadow-xl sm:p-6">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div>
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-red-500/10 text-2xl">
                  🕒
                </div>

                <h2 className="text-xl font-black">
                  RINCIAN WAKTU
                </h2>
              </div>

              <div className="mt-5 space-y-6 border-l-2 border-red-500/60 pl-6">
                <div className="relative">
                  <span className="absolute -left-[2.05rem] top-1 h-4 w-4 rounded-full border-4 border-[#0c1824] bg-red-500" />

                  <p className="text-sm text-slate-400">
                    Tanggal
                  </p>

                  <p className="mt-1 text-base font-black text-white">
                    {formatDate(transaction.createdAt)}
                  </p>
                </div>

                <div className="relative">
                  <span className="absolute -left-[2.05rem] top-1 h-4 w-4 rounded-full border-4 border-[#0c1824] bg-red-500" />

                  <p className="text-sm text-slate-400">
                    Waktu
                  </p>

                  <p className="mt-1 text-base font-black text-white">
                    {formatTime(transaction.createdAt)}
                  </p>
                </div>

                <div className="relative">
                  <span className="absolute -left-[2.05rem] top-1 h-4 w-4 rounded-full border-4 border-[#0c1824] bg-red-500" />

                  <p className="text-sm text-slate-400">
                    Durasi Proses
                  </p>

                  <p className="mt-1 text-base font-black text-white">
                    Belum tersedia
                  </p>
                </div>
              </div>
            </div>

            <div className="border-t border-white/10 pt-6 lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-red-500/10 text-2xl">
                  📝
                </div>

                <h2 className="text-xl font-black">
                  CATATAN
                </h2>
              </div>

              <div className="mt-5 flex min-h-40 items-center justify-center rounded-2xl border border-white/10 bg-[#08131e] p-5 text-center">
                <p className="break-words text-sm italic leading-6 text-slate-400">
                  {detail.note}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* TOMBOL AKSI */}
        <section className="mt-5">
          <button
            type="button"
            onClick={handlePrint}
            className="flex w-full items-center justify-center gap-3 rounded-[1.5rem] bg-gradient-to-r from-red-600 to-red-500 px-5 py-5 text-lg font-black text-white shadow-xl shadow-red-950/40 transition hover:from-red-500 hover:to-red-400 active:scale-[0.98]"
          >
            <span className="text-2xl">🖨️</span>
            CETAK STRUK
          </button>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={handleShare}
              className="flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-[#172b3c] px-3 py-4 text-sm font-black text-white transition hover:bg-[#243b4f] active:scale-[0.98] sm:text-base"
            >
              <span className="text-xl">↗</span>
              BAGIKAN
            </button>

            <button
              type="button"
              onClick={handleOpenHistory}
              className="flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-[#172b3c] px-3 py-4 text-sm font-black text-white transition hover:bg-[#243b4f] active:scale-[0.98] sm:text-base"
            >
              <span className="text-xl">🧾</span>
              LIHAT RIWAYAT
            </button>
          </div>

          <button
            type="button"
            onClick={handleBackToOwner}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl border border-white/10 bg-[#10202d] px-3 py-4 text-sm font-black text-white transition hover:bg-[#1a3448] active:scale-[0.98]"
          >
            <span className="text-xl">⌂</span>
            KEMBALI KE MENU OWNER
          </button>

          {shareMessage && (
            <p className="mt-4 rounded-2xl bg-emerald-500/10 px-4 py-3 text-center text-sm font-bold text-emerald-400">
              {shareMessage}
            </p>
          )}
        </section>
      </div>
    </main>
  );
}