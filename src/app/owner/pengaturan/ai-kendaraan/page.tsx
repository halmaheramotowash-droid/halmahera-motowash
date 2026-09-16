"use client";

import Link from "next/link";

export default function AIKendaraanPage() {
  return (
    <main className="min-h-screen bg-[#07111f] px-4 py-6 text-white">
      <div className="mx-auto max-w-md">
        {/* HEADER */}
        <div className="mb-7">
          <Link
            href="/owner/pengaturan"
            className="mb-5 inline-block text-sm font-bold text-slate-400 transition hover:text-white"
          >
            {"\u2190"} KEMBALI
          </Link>

          <div className="text-xs font-black tracking-[0.18em] text-red-500">
            OWNER
          </div>

          <h1 className="mt-2 text-3xl font-black tracking-tight">
            AI KENDARAAN
          </h1>

          <p className="mt-2 text-sm text-slate-400">
            Pengaturan analisis kendaraan dengan AI
          </p>

          <div className="mt-6 h-px bg-gradient-to-r from-red-600 via-red-900 to-transparent" />
        </div>

        {/* STATUS AI */}
        <section className="mb-4 rounded-3xl border border-slate-700/70 bg-gradient-to-br from-[#17263d] to-[#0c1728] p-5 shadow-lg shadow-black/20">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-sm font-black">
                STATUS AI
              </h2>

              <p className="mt-1 text-xs leading-5 text-slate-400">
                Status layanan analisis kendaraan
              </p>
            </div>

            <div className="rounded-full border border-green-700/70 bg-green-950/60 px-4 py-2 text-xs font-black text-green-400">
              AKTIF
            </div>
          </div>
        </section>

        {/* TINGKAT KEPERCAYAAN */}
        <section className="mb-4 rounded-3xl border border-slate-700/70 bg-gradient-to-br from-[#17263d] to-[#0c1728] p-5 shadow-lg shadow-black/20">
          <h2 className="text-sm font-black">
            TINGKAT KEPERCAYAAN / AKURASI
          </h2>

          <p className="mt-1 text-xs leading-5 text-slate-400">
            Tingkat kepercayaan minimum hasil analisis AI
          </p>

          <div className="mt-5 flex items-end justify-between">
            <span className="text-4xl font-black text-white">
              80%
            </span>

            <span className="text-xs font-bold text-slate-500">
              MINIMUM
            </span>
          </div>

          <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-800">
            <div className="h-full w-[80%] rounded-full bg-gradient-to-r from-red-700 to-red-500" />
          </div>
        </section>

        {/* TOMBOL KEMBALI */}
        <Link
          href="/owner/pengaturan"
          className="mt-6 block w-full rounded-2xl border border-slate-700 bg-gradient-to-r from-[#17263d] to-[#0c1728] px-5 py-4 text-center text-sm font-black text-white transition hover:border-red-600 hover:from-red-950/50 hover:to-[#17263d]"
        >
          {"\u2190"} KEMBALI KE PENGATURAN
        </Link>
      </div>
    </main>
  );
}