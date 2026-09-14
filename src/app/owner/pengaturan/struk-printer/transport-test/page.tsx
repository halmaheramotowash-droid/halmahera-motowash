"use client";

import Link from "next/link";
import { useState } from "react";

import { escPosReceipt } from "@/lib/escpos";

import {
  sendEscPos,
  type BluetoothPrinterConnection,
  type BluetoothWriteCharacteristic,
} from "@/lib/bluetooth-printer";

export default function TransportTestPage() {
  const [status, setStatus] = useState(
    "BELUM DIUJI"
  );

  const [result, setResult] = useState<{
    bytesSent: number;
    totalBytes: number;
    chunks: number;
    chunkSize: number;
    delayMs: number;
    method: string;
  } | null>(null);

  const [error, setError] = useState("");

  const [receivedChunks, setReceivedChunks] =
    useState<number[]>([]);

  async function runTransportTest() {
    setStatus("MENYIAPKAN DATA...");
    setError("");
    setResult(null);
    setReceivedChunks([]);

    try {
      const receiptData = escPosReceipt({
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

      const simulatedChunks: Uint8Array[] = [];

      const characteristic: BluetoothWriteCharacteristic =
        {
          uuid:
            "0000ff03-0000-1000-8000-00805f9b34fb",

          serviceUuid:
            "0000ff00-0000-1000-8000-00805f9b34fb",

          properties: {
            writeWithoutResponse: true,
          },

          writeValueWithoutResponse:
            async (value: BufferSource) => {
              const chunk =
                value instanceof Uint8Array
                  ? new Uint8Array(value)
                  : new Uint8Array(value as ArrayBuffer);

              simulatedChunks.push(chunk);
            },
        };

      const connection: BluetoothPrinterConnection =
        {
          device: {
            id: "SIMULATED-DEVICE",
            name: "Simulated Thermal Printer",
          },

          server: {
            connected: true,

            getPrimaryServices:
              async () => [],
          },

          characteristic,
        };

      setStatus("MENGIRIM DATA SIMULASI...");

      const sendResult =
        await sendEscPos(
          connection,
          receiptData,
          {
            chunkSize: 20,
            delayMs: 5,
          }
        );

      setReceivedChunks(
        simulatedChunks.map(
          (chunk) => chunk.length
        )
      );

      setResult(sendResult);

      if (
        sendResult.bytesSent !==
        sendResult.totalBytes
      ) {
        throw new Error(
          `Data tidak lengkap. Terkirim ${sendResult.bytesSent} dari ${sendResult.totalBytes} byte.`
        );
      }

      setStatus(
        "TEST BERHASIL — SEMUA DATA TERKIRIM"
      );
    } catch (error) {
      console.error(
        "Transport test error:",
        error
      );

      setStatus("TEST GAGAL");

      setError(
        error instanceof Error
          ? error.message
          : "Pengujian transport gagal."
      );
    }
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
            TRANSPORT TEST
          </h1>

          <p className="mt-1 text-sm text-zinc-500">
            Pengujian pengiriman data ESC/POS dalam
            mode simulasi.
          </p>
        </div>

        <section className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
          <h2 className="text-lg font-black">
            SIMULASI PRINTER
          </h2>

          <div className="mt-4 rounded-xl border border-yellow-900 bg-yellow-950/20 p-4">
            <p className="text-xs font-black text-yellow-500">
              MODE SIMULASI
            </p>

            <p className="mt-2 text-xs leading-5 text-zinc-500">
              Tidak ada printer Bluetooth yang
              digunakan. Data hanya masuk ke printer
              simulasi di browser.
            </p>
          </div>

          <div className="mt-4 rounded-xl border border-zinc-800 bg-black p-4">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between gap-4">
                <span className="text-zinc-500">
                  Printer
                </span>

                <span className="font-bold">
                  Simulated Thermal Printer
                </span>
              </div>

              <div className="flex justify-between gap-4">
                <span className="text-zinc-500">
                  Mode
                </span>

                <span className="font-bold text-green-500">
                  WRITE WITHOUT RESPONSE
                </span>
              </div>

              <div className="flex justify-between gap-4">
                <span className="text-zinc-500">
                  Paket
                </span>

                <span className="font-bold">
                  20 byte
                </span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={runTransportTest}
            className="mt-4 w-full rounded-xl bg-red-600 px-4 py-3 text-sm font-black text-white transition hover:bg-red-500"
          >
            JALANKAN TEST PENGIRIMAN
          </button>

          <div className="mt-4 rounded-xl border border-zinc-800 bg-black p-4">
            <p className="text-xs font-black text-zinc-500">
              STATUS
            </p>

            <p
              className={`mt-2 text-sm font-black ${
                status.startsWith("TEST BERHASIL")
                  ? "text-green-500"
                  : status === "TEST GAGAL"
                    ? "text-red-500"
                    : "text-white"
              }`}
            >
              {status}
            </p>
          </div>

          {error && (
            <div className="mt-4 rounded-xl border border-red-900 bg-red-950/20 p-4">
              <p className="text-xs font-black text-red-500">
                ERROR
              </p>

              <p className="mt-2 text-xs leading-5 text-red-300">
                {error}
              </p>
            </div>
          )}

          {result && (
            <div className="mt-4 space-y-3">
              <div className="rounded-xl border border-green-900 bg-green-950/20 p-4">
                <p className="text-xs font-black text-green-500">
                  HASIL PENGIRIMAN
                </p>

                <div className="mt-3 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-zinc-500">
                      Total data
                    </span>

                    <span className="font-black">
                      {result.totalBytes} byte
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-zinc-500">
                      Terkirim
                    </span>

                    <span className="font-black text-green-500">
                      {result.bytesSent} byte
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-zinc-500">
                      Jumlah paket
                    </span>

                    <span className="font-black">
                      {result.chunks}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-zinc-500">
                      Ukuran paket
                    </span>

                    <span className="font-black">
                      {result.chunkSize} byte
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-zinc-500">
                      Delay
                    </span>

                    <span className="font-black">
                      {result.delayMs} ms
                    </span>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-zinc-800 bg-black p-4">
                <p className="text-xs font-black text-zinc-400">
                  PAKET YANG DITERIMA SIMULATOR
                </p>

                <p className="mt-2 text-sm font-bold text-white">
                  {receivedChunks.length} paket
                </p>

                <p className="mt-2 break-all text-xs leading-5 text-zinc-500">
                  {receivedChunks.join(
                    " + "
                  )} byte
                </p>
              </div>
            </div>
          )}

          <div className="mt-5 rounded-xl border border-zinc-800 bg-black p-4">
            <p className="text-xs font-black text-zinc-400">
              ALUR TEST
            </p>

            <div className="mt-3 space-y-2 text-xs leading-5">
              <p className="text-zinc-500">
                1. Buat struk ESC/POS
              </p>

              <p className="text-zinc-500">
                2. Buat koneksi printer simulasi
              </p>

              <p className="text-zinc-500">
                3. Pecah data menjadi paket
              </p>

              <p className="text-zinc-500">
                4. Kirim setiap paket
              </p>

              <p className="text-green-500">
                5. Pastikan seluruh byte diterima
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}