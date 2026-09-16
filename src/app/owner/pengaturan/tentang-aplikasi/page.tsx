"use client";

import Link from "next/link";

export default function TentangAplikasiPage() {
  return (
    <main className="min-h-screen bg-[#07111f] px-4 py-6 text-white">
      <div className="mx-auto max-w-md">
        {/* HEADER */}
        <div className="mb-6">
          <Link
            href="/owner/pengaturan"
            className="mb-4 inline-block text-sm font-bold text-slate-400 transition hover:text-white"
          >
            ← KEMBALI
          </Link>

          <h1 className="text-2xl font-black tracking-tight">
            TENTANG APLIKASI
          </h1>

          <p className="mt-1 text-xs text-slate-400">
            Informasi aplikasi dan pembuat
          </p>

          <div className="mt-5 h-px bg-gradient-to-r from-red-700 via-red-500 to-transparent" />
        </div>

        {/* APPLICATION */}
        <section className="mb-4 rounded-3xl border border-slate-700/70 bg-gradient-to-br from-[#17263d] to-[#0c1728] p-5 shadow-lg shadow-black/20">
          <div className="mb-5 text-center">
            <div className="text-xl font-black tracking-tight">
              HALMAHERA MOTOWASH
            </div>

            <div className="mt-1 text-xs text-slate-400">
              Versi 0.1.0
            </div>

            <div className="mt-3 text-xs font-bold text-slate-300">
              Kasir & Manajemen Cuci Kendaraan
            </div>
          </div>

          <div className="border-t border-slate-700/70 pt-4">
            <h2 className="text-sm font-black">
              TENTANG APLIKASI
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-300">
              Aplikasi kasir dan manajemen usaha cuci kendaraan
              yang membantu pengelolaan transaksi, kendaraan,
              harga, karyawan, pembayaran, laporan, AI kendaraan,
              dan printer struk.
            </p>
          </div>
        </section>

        {/* FEATURES */}
        <section className="mb-4 rounded-3xl border border-slate-700/70 bg-gradient-to-br from-[#17263d] to-[#0c1728] p-5 shadow-lg shadow-black/20">
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
                className="rounded-xl border border-slate-600/70 bg-[#0b1729]/70 px-3 py-3 text-xs font-bold text-slate-300 transition hover:border-red-700/70 hover:bg-[#132238]"
              >
                {feature}
              </div>
            ))}
          </div>
        </section>

        {/* CREATOR */}
        <section className="mb-4 rounded-3xl border border-slate-700/70 bg-gradient-to-br from-[#17263d] to-[#0c1728] p-5 shadow-lg shadow-black/20">
          <h2 className="mb-4 text-sm font-black">
            PEMBUAT & DEVELOPER
          </h2>

          <div className="space-y-4">
            <div>
              <div className="text-[11px] font-black text-slate-500">
                DIBUAT OLEH
              </div>

              <div className="mt-1 text-sm font-bold text-slate-200">
                MUHAMMAD SULTHAN AL AULIA R, S.T.
              </div>
            </div>

            <div>
              <div className="text-[11px] font-black text-slate-500">
                DEVELOPER
              </div>

              <div className="mt-1 text-sm font-bold text-slate-200">
                HALMAHERA MOTOWASH
              </div>
            </div>
          </div>
        </section>

        {/* TECHNOLOGY */}
        <section className="mb-4 rounded-3xl border border-slate-700/70 bg-gradient-to-br from-[#17263d] to-[#0c1728] p-5 shadow-lg shadow-black/20">
          <h2 className="mb-4 text-sm font-black">
            TEKNOLOGI
          </h2>

          <div className="space-y-2 text-sm text-slate-300">
            <div>Next.js</div>
            <div>Prisma + SQLite</div>
            <div>Google Gemini AI</div>
            <div>JWT Authentication</div>
            <div>Bluetooth / USB / Network Printer</div>
          </div>
        </section>

        {/* COPYRIGHT */}
        <section className="rounded-3xl border border-slate-700/70 bg-gradient-to-br from-[#17263d] to-[#0c1728] p-5 text-center shadow-lg shadow-black/20">
          <p className="text-xs font-bold text-slate-400">
            © 2026 Halmahera Motowash.
          </p>

          <p className="mt-1 text-[11px] text-slate-500">
            All rights reserved.
          </p>
        </section>
      </div>
    </main>
  );
}