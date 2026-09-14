"use client";

import Link from "next/link";
import { useState } from "react";
import {
  escPosReceipt,
} from "@/lib/escpos";

function bytesToHex(data: Uint8Array) {
  return Array.from(data)
    .map((byte) =>
      byte.toString(16).padStart(2, "0").toUpperCase()
    )
    .join(" ");
}

export default function TestEscPosPage() {
  const [result, setResult] = useState<Uint8Array | null>(
    null
  );

  function generateTestReceipt() {
    const data = escPosReceipt({
      businessName: "HALMAHERA MOTOWASH",
      address: "Jl. Contoh Alamat",
      phone: "081234567890",
      transactionNumber: "TRX-000021",
      vehicle: "Yamaha Vixion",
      category: "Motor Sedang",
      price: "Rp20.000",
      footer:
        "Terima kasih telah menggunakan layanan kami.",
      paperWidth: 58,
    });

    setResult(data);
  }

  return (
    <main className="min-h-screen bg-black px-4 py-6 text-white">
      <div className="mx-auto max-w-md">
        <div className="mb-6">
          <Link
            href="/owner/pengaturan/struk-printer"
            className="mb-4 inline-flex items-center text-sm font-bold text-zinc-400 transition hover:text-white"
          >
            ← KEMBALI
          </Link>

          <h1 className="text-2xl font-black tracking-tight">
            TEST ESC/POS
          </h1>

          <p className="mt-1 text-sm text-zinc-500">
            Pengujian data struk sebelum dikirim ke
            printer.
          </p>
        </div>

        <section className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
          <h2 className="text-lg font-black">
            GENERATOR STRUK
          </h2>

          <p className="mt-1 text-xs leading-5 text-zinc-500">
            Data di bawah hanya untuk pengujian. Tidak
            dikirim ke printer dan tidak mengubah transaksi
            database.
          </p>

          <div className="mt-4 rounded-xl border border-zinc-800 bg-black p-4">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between gap-4">
                <span className="text-zinc-500">
                  Transaksi
                </span>

                <span className="font-bold text-white">
                  TRX-000021
                </span>
              </div>

              <div className="flex justify-between gap-4">
                <span className="text-zinc-500">
                  Kendaraan
                </span>

                <span className="font-bold text-white">
                  Yamaha Vixion
                </span>
              </div>

              <div className="flex justify-between gap-4">
                <span className="text-zinc-500">
                  Kategori
                </span>

                <span className="font-bold text-white">
                  Motor Sedang
                </span>
              </div>

              <div className="flex justify-between gap-4">
                <span className="text-zinc-500">
                  Total
                </span>

                <span className="font-black text-white">
                  Rp20.000
                </span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={generateTestReceipt}
            className="mt-4 w-full rounded-xl bg-red-600 px-4 py-3 text-sm font-black text-white transition hover:bg-red-500"
          >
            GENERATE TEST STRUK
          </button>

          {result && (
            <div className="mt-4 space-y-4">
              <div className="rounded-xl border border-green-900 bg-green-950/20 p-4">
                <p className="text-xs font-black text-green-500">
                  BERHASIL
                </p>

                <p className="mt-1 text-sm font-bold text-white">
                  Data ESC/POS berhasil dibuat.
                </p>

                <p className="mt-2 text-xs text-zinc-500">
                  Ukuran data:
                </p>

                <p className="text-lg font-black text-white">
                  {result.length} byte
                </p>
              </div>

              <div>
                <p className="mb-2 text-xs font-black text-zinc-400">
                  DATA HEX
                </p>

                <pre className="max-h-80 overflow-auto rounded-xl border border-zinc-800 bg-black p-4 text-[10px] leading-5 text-zinc-300">
                  {bytesToHex(result)}
                </pre>
              </div>

              <div className="rounded-xl border border-zinc-800 bg-black p-4">
                <p className="text-xs font-black text-zinc-400">
                  STATUS
                </p>

                <p className="mt-2 text-xs leading-5 text-zinc-500">
                  Data hanya dibuat di browser. Belum ada
                  koneksi Bluetooth dan belum ada data yang
                  dikirim ke perangkat apa pun.
                </p>
              </div>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}