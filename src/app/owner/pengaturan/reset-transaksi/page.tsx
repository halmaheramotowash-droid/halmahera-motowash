"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { apiPost } from "@/lib/api-client";

export default function ResetTransaksiPage() {
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleReset(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setMessage("");
    setError("");

    if (!password) {
      setError("Password Owner wajib diisi.");
      return;
    }

    if (confirmation !== "HAPUS SEMUA TRANSAKSI") {
      setError(
        'Ketik persis "HAPUS SEMUA TRANSAKSI" untuk melanjutkan.'
      );
      return;
    }

    const confirmed = window.confirm(
      "PERINGATAN TERAKHIR!\n\nSeluruh data transaksi akan dihapus permanen.\n\nApakah Anda benar-benar ingin melanjutkan?"
    );

    if (!confirmed) {
      return;
    }

    setLoading(true);

    try {
      const response = await apiPost("/api/owner/reset-transaksi", {
  password,
});

      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(data.error || "Gagal menghapus transaksi.");
        return;
      }

      setMessage(data.message || "Transaksi berhasil dihapus.");
      setPassword("");
      setConfirmation("");
    } catch (requestError) {
      console.error(requestError);
      setError("Tidak dapat terhubung ke server.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#05080d] px-3 py-4 text-white sm:px-6 sm:py-6">
      <div className="mx-auto max-w-2xl overflow-hidden rounded-3xl border border-red-900/60 bg-[#080d14] shadow-2xl">
        <header className="border-b border-white/10 bg-[#0b111b] px-4 py-5 sm:px-7">
          <Link
            href="/owner/pengaturan"
            className="text-sm font-bold text-zinc-400 transition hover:text-white"
          >
            ← Kembali ke Pengaturan
          </Link>

          <div className="mt-7">
            <div className="text-xs font-black tracking-[0.18em] text-red-500">
              KEAMANAN OWNER
            </div>

            <h1 className="mt-2 text-2xl font-black tracking-tight sm:text-3xl">
              RESET SEMUA TRANSAKSI
            </h1>

            <p className="mt-2 text-sm leading-6 text-zinc-400">
              Hapus seluruh riwayat transaksi dengan verifikasi password
              Owner.
            </p>
          </div>
        </header>

        <section className="p-4 sm:p-7">
          <div className="rounded-2xl border border-red-700/60 bg-red-950/40 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-red-600 text-2xl">
                ⚠️
              </div>

              <div>
                <h2 className="font-black text-red-400">
                  PERINGATAN PENTING
                </h2>

                <p className="mt-1 text-sm leading-6 text-zinc-300">
                  Tindakan ini tidak dapat dibatalkan.
                </p>
              </div>
            </div>

            <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-6 text-zinc-300">
              <li>Semua data transaksi akan dihapus.</li>
              <li>Riwayat pendapatan dan hasil transaksi akan kosong.</li>
              <li>Akun, kendaraan, harga, pengeluaran, dan printer tetap aman.</li>
            </ul>
          </div>

          <form onSubmit={handleReset} className="mt-6 space-y-5">
            <div>
              <label
                htmlFor="owner-password"
                className="mb-2 block text-sm font-bold text-zinc-300"
              >
                Password Owner
              </label>

              <input
                id="owner-password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Masukkan password Owner"
                autoComplete="current-password"
                disabled={loading}
                className="w-full rounded-2xl border border-white/10 bg-[#111b28] px-4 py-3 text-white outline-none transition placeholder:text-zinc-600 focus:border-red-600"
              />
            </div>

            <div>
              <label
                htmlFor="confirmation"
                className="mb-2 block text-sm font-bold text-zinc-300"
              >
                Ketik konfirmasi
              </label>

              <p className="mb-2 text-xs leading-5 text-zinc-500">
                Ketik persis:
                <br />
                <span className="font-black text-red-400">
                  HAPUS SEMUA TRANSAKSI
                </span>
              </p>

              <input
                id="confirmation"
                type="text"
                value={confirmation}
                onChange={(event) => setConfirmation(event.target.value)}
                placeholder="HAPUS SEMUA TRANSAKSI"
                disabled={loading}
                className="w-full rounded-2xl border border-white/10 bg-[#111b28] px-4 py-3 text-white outline-none transition placeholder:text-zinc-600 focus:border-red-600"
              />
            </div>

            {error && (
              <div className="rounded-2xl border border-red-700/60 bg-red-950/50 p-4 text-sm font-semibold leading-6 text-red-300">
                {error}
              </div>
            )}

            {message && (
              <div className="rounded-2xl border border-green-700/60 bg-green-950/40 p-4 text-sm font-semibold leading-6 text-green-300">
                {message}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl bg-red-600 px-4 py-4 text-sm font-black text-white transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "MEMPROSES..." : "HAPUS SEMUA TRANSAKSI"}
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}