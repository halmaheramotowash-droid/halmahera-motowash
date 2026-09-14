"use client";

import Link from "next/link";
import { useState } from "react";
import {
  findWriteCharacteristic,
  findWriteCharacteristics,
  type BluetoothServiceLike,
} from "@/lib/bluetooth-printer";

type TestCharacteristic = {
  uuid: string;
  properties: {
    read?: boolean;
    write?: boolean;
    writeWithoutResponse?: boolean;
    notify?: boolean;
    indicate?: boolean;
  };
};

type TestService = {
  uuid: string;
  isPrimary: boolean;
  characteristics: TestCharacteristic[];
};

export default function GattSimulatorPage() {
  const [result, setResult] = useState("");
  const [details, setDetails] = useState<string[]>([]);
  const [testing, setTesting] = useState(false);

  async function runTest() {
    setTesting(true);
    setResult("");
    setDetails([]);

    try {
      const simulatedServices: BluetoothServiceLike[] =
        [
          {
            uuid: "00001800-0000-1000-8000-00805f9b34fb",
            isPrimary: true,
            getCharacteristics: async () => [
              {
                uuid:
                  "00002a00-0000-1000-8000-00805f9b34fb",
                properties: {
                  read: true,
                },
              },
            ],
          },

          {
            uuid: "00001801-0000-1000-8000-00805f9b34fb",
            isPrimary: true,
            getCharacteristics: async () => [
              {
                uuid:
                  "00002a05-0000-1000-8000-00805f9b34fb",
                properties: {
                  notify: true,
                  indicate: true,
                },
              },
            ],
          },

          {
            uuid:
              "0000ff00-0000-1000-8000-00805f9b34fb",
            isPrimary: true,
            getCharacteristics: async () => [
              {
                uuid:
                  "0000ff01-0000-1000-8000-00805f9b34fb",
                properties: {
                  read: true,
                  notify: true,
                },
              },

              {
                uuid:
                  "0000ff02-0000-1000-8000-00805f9b34fb",
                properties: {
                  write: true,
                },
              },

              {
                uuid:
                  "0000ff03-0000-1000-8000-00805f9b34fb",
                properties: {
                  writeWithoutResponse: true,
                },
              },
            ],
          },
        ];

      const allWritable =
        await findWriteCharacteristics(
          simulatedServices
        );

      const selected =
        await findWriteCharacteristic(
          simulatedServices
        );

      const newDetails: string[] = [];

      newDetails.push(
        `Jumlah service: ${simulatedServices.length}`
      );

      newDetails.push(
        `Jumlah WRITE ditemukan: ${allWritable.length}`
      );

      for (const item of allWritable) {
        const modes: string[] = [];

        if (item.properties.write) {
          modes.push("WRITE");
        }

        if (
          item.properties.writeWithoutResponse
        ) {
          modes.push(
            "WRITE WITHOUT RESPONSE"
          );
        }

        newDetails.push(
          `Service ${item.serviceUuid}`
        );

        newDetails.push(
          `Characteristic ${item.uuid}`
        );

        newDetails.push(
          `Mode: ${modes.join(" + ")}`
        );
      }

      if (!selected) {
        throw new Error(
          "Characteristic WRITE tidak berhasil ditemukan."
        );
      }

      newDetails.push("");
      newDetails.push(
        `Characteristic terpilih: ${selected.uuid}`
      );

      if (
        selected.properties
          .writeWithoutResponse
      ) {
        newDetails.push(
          "Mode terpilih: WRITE WITHOUT RESPONSE"
        );
      } else if (
        selected.properties.write
      ) {
        newDetails.push(
          "Mode terpilih: WRITE"
        );
      }

      setDetails(newDetails);
      setResult(
        "TEST BERHASIL — WRITE CHARACTERISTIC TERDETEKSI"
      );
    } catch (error) {
      console.error(
        "GATT simulator error:",
        error
      );

      setResult(
        error instanceof Error
          ? `TEST GAGAL — ${error.message}`
          : "TEST GAGAL"
      );
    } finally {
      setTesting(false);
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
            GATT SIMULATOR
          </h1>

          <p className="mt-1 text-sm text-zinc-500">
            Pengujian logika Bluetooth tanpa perangkat
            fisik.
          </p>
        </div>

        <section className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
          <h2 className="text-lg font-black">
            TEST CHARACTERISTIC
          </h2>

          <p className="mt-1 text-xs leading-5 text-zinc-500">
            Simulator membuat beberapa service dan
            characteristic palsu untuk menguji pencarian
            WRITE.
          </p>

          <div className="mt-4 rounded-xl border border-yellow-900 bg-yellow-950/20 p-4">
            <p className="text-xs font-black text-yellow-500">
              MODE SIMULASI
            </p>

            <p className="mt-2 text-xs leading-5 text-zinc-500">
              Tidak ada koneksi Bluetooth. Tidak ada
              perangkat yang dipasangkan. Tidak ada data
              yang dikirim.
            </p>
          </div>

          <button
            type="button"
            onClick={runTest}
            disabled={testing}
            className="mt-4 w-full rounded-xl bg-red-600 px-4 py-3 text-sm font-black text-white transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {testing
              ? "MENJALANKAN TEST..."
              : "JALANKAN TEST GATT"}
          </button>

          {result && (
            <div
              className={`mt-4 rounded-xl border p-4 ${
                result.startsWith("TEST BERHASIL")
                  ? "border-green-900 bg-green-950/20"
                  : "border-red-900 bg-red-950/20"
              }`}
            >
              <p
                className={`text-sm font-black ${
                  result.startsWith("TEST BERHASIL")
                    ? "text-green-500"
                    : "text-red-500"
                }`}
              >
                {result}
              </p>
            </div>
          )}

          {details.length > 0 && (
            <div className="mt-4">
              <p className="mb-2 text-xs font-black text-zinc-400">
                HASIL TEST
              </p>

              <div className="rounded-xl border border-zinc-800 bg-black p-4">
                <div className="space-y-2">
                  {details.map(
                    (detail, index) => (
                      <p
                        key={`${detail}-${index}`}
                        className="break-all text-xs leading-5 text-zinc-300"
                      >
                        {detail || "\u00A0"}
                      </p>
                    )
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="mt-4 rounded-xl border border-zinc-800 bg-black p-4">
            <p className="text-xs font-black text-zinc-400">
              SKENARIO
            </p>

            <div className="mt-3 space-y-2 text-xs">
              <p className="text-zinc-500">
                READ → diabaikan
              </p>

              <p className="text-zinc-500">
                NOTIFY → diabaikan
              </p>

              <p className="text-green-500">
                WRITE → ditemukan
              </p>

              <p className="text-green-500">
                WRITE WITHOUT RESPONSE → ditemukan
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}