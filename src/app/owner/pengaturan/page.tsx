"use client";

import Link from "next/link";

const settings = [
  {
    title: "HARGA CUCI",
    description: "Atur harga lima kategori utama",
    path: "/owner/pengaturan/harga",
    icon: "💰",
    color: "from-red-950/80 to-[#151b27]",
  },
  {
    title: "KATEGORI & MODEL",
    description: "Kelola kategori, merek, dan model kendaraan",
    path: "/owner/pengaturan/kategori-model",
    icon: "🏍️",
    color: "from-red-950/80 to-[#151b27]",
  },
  {
    title: "KOMPENSASI KARYAWAN",
    description: "Atur kompensasi berdasarkan jenis kendaraan",
    path: "/owner/pengaturan/kompensasi",
    icon: "👥",
    color: "from-red-950/80 to-[#151b27]",
  },
  {
    title: "STRUK & PRINTER",
    description: "Atur struk pembayaran dan printer",
    path: "/owner/pengaturan/struk-printer",
    icon: "🖨️",
    color: "from-red-950/80 to-[#151b27]",
  },
  {
    title: "AKUN & KEAMANAN",
    description: "Kelola akun dan keamanan aplikasi",
    path: "/owner/pengaturan/akun-keamanan",
    icon: "🔐",
    color: "from-red-950/80 to-[#151b27]",
  },
  {
    title: "INFORMASI USAHA",
    description: "Atur nama usaha, alamat, dan kontak",
    path: "/owner/pengaturan/informasi-usaha",
    icon: "🏢",
    color: "from-red-950/80 to-[#151b27]",
  },
  {
    title: "AI KENDARAAN",
    description: "Pengaturan analisis kendaraan dengan AI",
    path: "/owner/pengaturan/ai-kendaraan",
    icon: "🤖",
    color: "from-red-950/80 to-[#151b27]",
  },
  {
    title: "TENTANG APLIKASI & PEMBUAT",
    description: "Informasi aplikasi dan pembuat",
    path: "/owner/pengaturan/tentang-aplikasi",
    icon: "ℹ️",
    color: "from-red-950/80 to-[#151b27]",
  },
];

export default function PengaturanPage() {
  return (
    <main className="min-h-screen bg-[#05080d] px-3 py-4 text-white sm:px-6 sm:py-6">
      <div className="mx-auto max-w-6xl overflow-hidden rounded-3xl border border-white/10 bg-[#080d14] shadow-2xl">
        {/* HEADER */}
        <header className="relative overflow-hidden border-b border-white/10 bg-[#0b111b] px-4 py-4 sm:px-7 sm:py-5">
          <div className="absolute -right-20 -top-28 h-64 w-64 rounded-full border border-red-600/40 bg-red-600/10 blur-2xl" />

          <div className="relative flex items-center justify-between gap-3">
            <Link href="/owner" className="block">
              <div className="text-2xl font-black tracking-tight sm:text-3xl">
                WASH<span className="text-red-600">APP</span>
              </div>

              <div className="text-[10px] font-semibold tracking-[0.16em] text-zinc-400 sm:text-xs">
                SMART WASH MANAGEMENT
              </div>
            </Link>

            <div className="flex items-center gap-2 sm:gap-3">
              <button
                type="button"
                aria-label="Notifikasi"
                className="relative flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-[#111b28] text-xl transition hover:border-red-600 active:scale-95"
              >
                🔔

                <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-black text-white">
                  3
                </span>
              </button>

              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-900 text-lg font-black text-white">
                D
              </div>
            </div>
          </div>
        </header>

        {/* KONTEN */}
        <section className="px-3 py-5 sm:px-7 sm:py-7">
          <div className="mb-5 flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <Link
                href="/owner"
                aria-label="Kembali ke dashboard Owner"
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/10 bg-[#111b28] text-2xl transition hover:border-red-600 active:scale-95"
              >
                ←
              </Link>

              <div>
                <div className="text-xs font-black tracking-[0.18em] text-red-500">
                  OWNER
                </div>

                <h1 className="mt-1 text-2xl font-black tracking-tight sm:text-3xl">
                  PENGATURAN
                </h1>

                <p className="mt-1 text-xs text-zinc-400 sm:text-sm">
                  Kelola pengaturan aplikasi dan usaha
                </p>
              </div>
            </div>

            <div className="hidden rounded-2xl border border-red-900/70 bg-red-950/40 px-4 py-3 text-right sm:block">
              <div className="flex items-center justify-end gap-2 text-sm font-black">
                <span className="h-2.5 w-2.5 rounded-full bg-green-500" />
                Sistem Aktif
              </div>

              <div className="mt-1 text-[10px] text-zinc-400">
                Semua layanan berjalan
              </div>
            </div>
          </div>

          {/* RINGKASAN */}
          <div className="mb-5 rounded-2xl border border-red-900/60 bg-gradient-to-r from-red-950/70 via-[#17101a] to-[#111b28] p-4 sm:p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-red-600 text-2xl shadow-[0_0_25px_rgba(239,68,68,0.25)]">
                ⚙️
              </div>

              <div>
                <h2 className="text-sm font-black sm:text-base">
                  PUSAT PENGATURAN
                </h2>

                <p className="mt-1 text-xs leading-5 text-zinc-400">
                  Sesuaikan sistem WASHAPP dengan kebutuhan usaha Anda.
                </p>
              </div>
            </div>
          </div>

          {/* MENU PENGATURAN */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {settings.map((item) => (
              <Link
                key={item.path}
                href={item.path}
                className={`group relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br ${item.color} p-4 transition hover:-translate-y-1 hover:border-red-600/80 hover:shadow-[0_0_25px_rgba(239,68,68,0.14)] active:scale-[0.98] sm:p-5`}
              >
                <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-red-600/5 transition group-hover:bg-red-600/10" />

                <div className="relative flex items-start justify-between gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-red-700/50 bg-red-950/70 text-2xl">
                    {item.icon}
                  </div>

                  <div className="text-xl font-black text-zinc-600 transition group-hover:text-red-500">
                    →
                  </div>
                </div>

                <div className="relative mt-5">
                  <h2 className="text-sm font-black tracking-wide text-white">
                    {item.title}
                  </h2>

                  <p className="mt-2 min-h-[40px] text-xs leading-5 text-zinc-400">
                    {item.description}
                  </p>
                </div>

                <div className="relative mt-4 h-1 w-12 rounded-full bg-red-600 transition-all group-hover:w-full" />
              </Link>
            ))}
          </div>
        </section>

        {/* NAVIGASI BAWAH */}
        <nav className="border-t border-white/10 bg-[#080d14] px-2 py-4 sm:px-6">
          <div className="grid grid-cols-5 gap-1">
            <Link
              href="/owner"
              className="flex flex-col items-center gap-1 rounded-xl px-1 py-2 text-zinc-400 transition hover:bg-white/5 hover:text-white"
            >
              <span className="text-xl">⌂</span>
              <span className="text-[10px] font-bold sm:text-xs">
                Beranda
              </span>
            </Link>

            <Link
              href="/cuci"
              className="flex flex-col items-center gap-1 rounded-xl px-1 py-2 text-zinc-400 transition hover:bg-white/5 hover:text-white"
            >
              <span className="text-xl">♨</span>
              <span className="text-[10px] font-bold sm:text-xs">
                Cuci
              </span>
            </Link>

            <Link
              href="/riwayat"
              className="flex flex-col items-center gap-1 rounded-xl px-1 py-2 text-zinc-400 transition hover:bg-white/5 hover:text-white"
            >
              <span className="text-xl">▤</span>
              <span className="text-[10px] font-bold sm:text-xs">
                Riwayat
              </span>
            </Link>

            <Link
              href="/hasil"
              className="flex flex-col items-center gap-1 rounded-xl px-1 py-2 text-zinc-400 transition hover:bg-white/5 hover:text-white"
            >
              <span className="text-xl">▥</span>
              <span className="text-[10px] font-bold sm:text-xs">
                Hasil
              </span>
            </Link>

            <Link
              href="/owner/pengaturan"
              className="flex flex-col items-center gap-1 rounded-xl bg-red-950/40 px-1 py-2 text-red-500"
            >
              <span className="text-xl">⚙</span>
              <span className="text-[10px] font-black sm:text-xs">
                Pengaturan
              </span>
            </Link>
          </div>
        </nav>
      </div>
    </main>
  );
}