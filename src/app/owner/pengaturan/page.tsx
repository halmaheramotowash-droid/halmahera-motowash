"use client";

import Link from "next/link";

const settings = [
  {
    title: "HARGA CUCI",
    description: "Atur harga lima kategori utama",
    path: "/owner/pengaturan/harga",
  },
  {
    title: "KATEGORI & MODEL",
    description: "Kelola kategori, merek, dan model kendaraan",
    path: "/owner/pengaturan/kategori-model",
  },
  {
    title: "KOMPENSASI KARYAWAN",
    description: "Atur kompensasi berdasarkan jenis kendaraan",
    path: "/owner/pengaturan/kompensasi",
  },
  {
    title: "STRUK & PRINTER",
    description: "Atur struk pembayaran dan printer",
    path: "/owner/pengaturan/struk-printer",
  },
  {
    title: "AKUN & KEAMANAN",
    description: "Kelola akun dan keamanan aplikasi",
    path: "/owner/pengaturan/akun-keamanan",
  },
  {
    title: "INFORMASI USAHA",
    description: "Atur nama usaha, alamat, dan kontak",
    path: "/owner/pengaturan/informasi-usaha",
  },
  {
    title: "AI KENDARAAN",
    description: "Pengaturan analisis kendaraan dengan AI",
    path: "/owner/pengaturan/ai-kendaraan",
  },
  {
    title: "TENTANG APLIKASI & PEMBUAT",
    description: "Informasi aplikasi dan pembuat",
    path: "/owner/pengaturan/tentang-aplikasi",
  },
];

export default function PengaturanPage() {
  return (
    <main className="min-h-screen bg-black px-4 py-6 text-white">
      <div className="mx-auto max-w-md">
        {/* HEADER */}
        <div className="mb-7">
          <Link
            href="/owner"
            className="mb-5 inline-block text-sm font-bold text-zinc-400 transition hover:text-white"
          >
            {"\u2190"} KEMBALI
          </Link>

          <div className="text-xs font-black tracking-[0.18em] text-red-500">
            OWNER
          </div>

          <h1 className="mt-2 text-3xl font-black tracking-tight">
            PENGATURAN
          </h1>

          <p className="mt-2 text-sm text-zinc-500">
            Kelola pengaturan aplikasi dan usaha
          </p>

          <div className="mt-6 h-px bg-red-950" />
        </div>

        {/* SETTINGS MENU */}
        <div className="space-y-3">
          {settings.map((item) => (
            <Link
              key={item.path}
              href={item.path}
              className="group block rounded-3xl border border-zinc-900 bg-zinc-950 p-5 transition active:scale-[0.98] hover:border-red-950 hover:bg-zinc-900"
            >
              <div className="flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <h2 className="text-sm font-black tracking-wide text-white">
                    {item.title}
                  </h2>

                  <p className="mt-2 text-xs leading-5 text-zinc-500">
                    {item.description}
                  </p>
                </div>

                <div className="shrink-0 text-lg font-black text-zinc-700 transition group-hover:text-red-500">
                  {"\u2192"}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}