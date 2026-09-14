"use client";

import Link from "next/link";

export default function AIKendaraanPage() {
  return (
    <main className="min-h-screen bg-black px-4 py-6 text-white">
      <div className="mx-auto max-w-md">
        {/* HEADER */}
        <div className="mb-7">
          <Link
            href="/owner/pengaturan"
            className="mb-5 inline-block text-sm font-bold text-zinc-400 transition hover:text-white"
          >
            {"\u2190"} KEMBALI
          </Link>

          <div className="text-xs font-black tracking-[0.18em] text-red-500">
            OWNER
          </div>

          <h1 className="mt-2 text-3xl font-black tracking-tight">
            AI KENDARAAN
          </h1>

          <p className="mt-2 text-sm text-zinc-500">
            Pengaturan analisis kendaraan dengan AI
          </p>

          <div className="mt-6 h-px bg-red-950" />
        </div>

        {/* STATUS AI */}
        <section className="mb-4 rounded-3xl border border-zinc-900 bg-zinc-950 p-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-sm font-black">
                STATUS AI
              </h2>

              <p className="mt-1 text-xs leading-5 text-zinc-500">
                Status layanan analisis kendaraan
              </p>
            </div>

            <div className="rounded-full border border-green-900 bg-green-950 px-4 py-2 text-xs font-black text-green-400">
              AKTIF
            </div>
          </div>
        </section>

        {/* TINGKAT KEPERCAYAAN */}
        <section className="mb-4 rounded-3xl border border-zinc-900 bg-zinc-950 p-5">
          <h2 className="text-sm font-black">
            TINGKAT KEPERCAYAAN / AKURASI
          </h2>

          <p className="mt-1 text-xs leading-5 text-zinc-500">
            Tingkat kepercayaan minimum hasil analisis AI
          </p>

          <div className="mt-5 flex items-end justify-between">
            <span className="text-4xl font-black text-white">
              80%
            </span>

            <span className="text-xs font-bold text-zinc-600">
              MINIMUM
            </span>
          </div>

          <div className="mt-4 h-2 overflow-hidden rounded-full bg-zinc-900">
            <div className="h-full w-[80%] rounded-full bg-red-600" />
          </div>
        </section>

        {/* TOMBOL KEMBALI */}
        <Link
          href="/owner/pengaturan"
          className="mt-6 block w-full rounded-2xl border border-zinc-800 bg-zinc-950 px-5 py-4 text-center text-sm font-black text-white transition hover:border-red-900 hover:bg-zinc-900"
        >
          {"\u2190"} KEMBALI KE PENGATURAN
        </Link>
      </div>
    </main>
  );
}