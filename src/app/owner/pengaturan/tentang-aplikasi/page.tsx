"use client";

import Link from "next/link";

export default function TentangAplikasiPage() {
  return (
    <main className="min-h-screen bg-black px-4 py-6 text-white">
      <div className="mx-auto max-w-md">
        {/* HEADER */}
        <div className="mb-6">
          <Link
            href="/owner/pengaturan"
            className="mb-4 inline-block text-sm font-bold text-zinc-400"
          >
            ← KEMBALI
          </Link>

          <h1 className="text-2xl font-black">
            TENTANG APLIKASI
          </h1>

          <p className="mt-1 text-xs text-zinc-500">
            Informasi aplikasi dan pembuat
          </p>
        </div>

        {/* APPLICATION */}
        <section className="mb-4 rounded-3xl border border-zinc-800 bg-zinc-950 p-5">
          <div className="mb-5 text-center">
            <div className="text-xl font-black">
              HALMAHERA MOTOWASH
            </div>

            <div className="mt-1 text-xs text-zinc-500">
              Versi 0.1.0
            </div>

            <div className="mt-3 text-xs font-bold text-zinc-400">
              Kasir & Manajemen Cuci Kendaraan
            </div>
          </div>

          <div className="border-t border-zinc-800 pt-4">
            <h2 className="text-sm font-black">
              TENTANG APLIKASI
            </h2>

            <p className="mt-2 text-sm leading-6 text-zinc-400">
              Aplikasi kasir dan manajemen usaha cuci kendaraan
              yang membantu pengelolaan transaksi, kendaraan,
              harga, karyawan, pembayaran, laporan, AI kendaraan,
              dan printer struk.
            </p>
          </div>
        </section>

        {/* FEATURES */}
        <section className="mb-4 rounded-3xl border border-zinc-800 bg-zinc-950 p-5">
          <h2 className="mb-4 text-sm font-black">
            FITUR UTAMA
          </h2>

          <div className="grid grid-cols-2 gap-2">
            {[
              "Transaksi Cuci",
              "AI Kendaraan",
              "Harga Cuci",
              "Kategori & Model",
              "Kompensasi Karyawan",
              "Riwayat & Hasil",
              "Struk & Printer",
              "Pengaturan Usaha",
            ].map((feature) => (
              <div
                key={feature}
                className="rounded-xl border border-zinc-800 px-3 py-3 text-xs font-bold text-zinc-400"
              >
                {feature}
              </div>
            ))}
          </div>
        </section>

        {/* CREATOR */}
        <section className="mb-4 rounded-3xl border border-zinc-800 bg-zinc-950 p-5">
          <h2 className="mb-4 text-sm font-black">
            PEMBUAT & DEVELOPER
          </h2>

          <div className="space-y-4">
            <div>
              <div className="text-[11px] font-black text-zinc-600">
                DIBUAT OLEH
              </div>

              <div className="mt-1 text-sm font-bold text-zinc-300">
                Dhany Sulthan
              </div>
            </div>

            <div>
              <div className="text-[11px] font-black text-zinc-600">
                DEVELOPER
              </div>

              <div className="mt-1 text-sm font-bold text-zinc-300">
                MUHAMMAD SULTHAN AL AULIA R., S.T.
              </div>
            </div>
          </div>
        </section>

        {/* TECHNOLOGY */}
        <section className="mb-4 rounded-3xl border border-zinc-800 bg-zinc-950 p-5">
          <h2 className="mb-4 text-sm font-black">
            TEKNOLOGI
          </h2>

          <div className="space-y-2 text-sm text-zinc-400">
            <div>Next.js</div>
            <div>Prisma + SQLite</div>
            <div>Google Gemini AI</div>
            <div>JWT Authentication</div>
            <div>Bluetooth / USB / Network Printer</div>
          </div>
        </section>

        {/* COPYRIGHT */}
        <section className="rounded-3xl border border-zinc-800 bg-zinc-950 p-5 text-center">
          <p className="text-xs font-bold text-zinc-500">
            © 2026 Halmahera Motowash.
          </p>

          <p className="mt-1 text-[11px] text-zinc-600">
            All rights reserved.
          </p>
        </section>
      </div>
    </main>
  );
}