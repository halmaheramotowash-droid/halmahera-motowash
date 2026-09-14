"use client";

import Link from "next/link";
import { useState } from "react";
import {
  findWriteCharacteristics,
  type BluetoothServiceLike,
  type BluetoothWriteCharacteristic,
} from "@/lib/bluetooth-printer";

type BrowserBluetoothDevice = {
  id: string;
  name?: string;
  gatt?: {
    connected: boolean;
    connect: () => Promise<{
      connected: boolean;
      getPrimaryServices: () =>
        Promise<BluetoothServiceLike[]>;
      disconnect?: () => void;
    }>;
  };
};

type ServiceResult = {
  uuid: string;
  isPrimary: boolean;
  characteristics: CharacteristicResult[];
};

type CharacteristicResult = {
  uuid: string;
  properties: string[];
  canWrite: boolean;
  serviceUuid: string;
};

export default function GattTestPage() {
  const [device, setDevice] =
    useState<BrowserBluetoothDevice | null>(null);

  const [services, setServices] =
    useState<ServiceResult[]>([]);

  const [writeCharacteristics, setWriteCharacteristics] =
    useState<BluetoothWriteCharacteristic[]>([]);

  const [status, setStatus] =
    useState("BELUM TERHUBUNG");

  const [error, setError] = useState("");

  const [loading, setLoading] =
    useState(false);

  async function handleScan() {
    setError("");
    setStatus("MEMBUKA BLUETOOTH...");
    setServices([]);
    setWriteCharacteristics([]);
    setDevice(null);

    try {
      if (
        typeof navigator === "undefined" ||
        !("bluetooth" in navigator)
      ) {
        throw new Error(
          "Web Bluetooth tidak tersedia di browser ini."
        );
      }

      const bluetooth = (
        navigator as Navigator & {
          bluetooth: {
            requestDevice: (options: {
              acceptAllDevices: boolean;
              optionalServices: string[];
            }) => Promise<BrowserBluetoothDevice>;
          };
        }
      ).bluetooth;

      const selectedDevice =
        await bluetooth.requestDevice({
          acceptAllDevices: true,
          optionalServices: [],
        });

      setDevice(selectedDevice);
      setStatus("PERANGKAT DIPILIH");

      if (!selectedDevice.gatt) {
        throw new Error(
          "Perangkat tidak menyediakan koneksi GATT."
        );
      }

      setStatus("MENGHUBUNGKAN GATT...");

      const server =
        await selectedDevice.gatt.connect();

      if (!server.connected) {
        throw new Error(
          "Koneksi GATT gagal."
        );
      }

      setStatus("MEMBACA SERVICE...");

      const primaryServices =
        await server.getPrimaryServices();

      const serviceResults: ServiceResult[] = [];

      for (const service of primaryServices) {
        const characteristics =
          await service.getCharacteristics();

        const characteristicResults =
          characteristics.map(
            (characteristic) => {
              const properties: string[] = [];

              if (
                characteristic.properties.read
              ) {
                properties.push("READ");
              }

              if (
                characteristic.properties.write
              ) {
                properties.push("WRITE");
              }

              if (
                characteristic.properties
                  .writeWithoutResponse
              ) {
                properties.push(
                  "WRITE WITHOUT RESPONSE"
                );
              }

              if (
                characteristic.properties.notify
              ) {
                properties.push("NOTIFY");
              }

              if (
                characteristic.properties.indicate
              ) {
                properties.push("INDICATE");
              }

              if (
                characteristic.properties.broadcast
              ) {
                properties.push("BROADCAST");
              }

              const canWrite =
                characteristic.properties.write ===
                  true ||
                characteristic.properties
                  .writeWithoutResponse ===
                  true;

              return {
                uuid: characteristic.uuid,
                properties,
                canWrite,
                serviceUuid: service.uuid,
              };
            }
          );

        serviceResults.push({
          uuid: service.uuid,
          isPrimary: service.isPrimary,
          characteristics:
            characteristicResults,
        });
      }

      setServices(serviceResults);

      const writable =
        await findWriteCharacteristics(
          primaryServices
        );

      setWriteCharacteristics(writable);

      if (writable.length > 0) {
        setStatus(
          "GATT TERHUBUNG — WRITE DITEMUKAN"
        );
      } else {
        setStatus(
          "GATT TERHUBUNG — WRITE TIDAK DITEMUKAN"
        );
      }
    } catch (error) {
      console.error(
        "GATT test error:",
        error
      );

      setStatus("GAGAL");

      setError(
        error instanceof Error
          ? error.message
          : "Gagal menghubungkan perangkat Bluetooth."
      );
    } finally {
      setLoading(false);
    }
  }

  function disconnect() {
    try {
      device?.gatt?.connect;
    } catch {
      // Tidak melakukan apa pun.
    }

    setStatus("TERPUTUS");
    setDevice(null);
    setServices([]);
    setWriteCharacteristics([]);
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
            GATT TEST
          </h1>

          <p className="mt-1 text-sm text-zinc-500">
            Pemeriksaan Bluetooth GATT dan
            Characteristic.
          </p>
        </div>

        <section className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
          <h2 className="text-lg font-black">
            BLUETOOTH
          </h2>

          <p className="mt-1 text-xs leading-5 text-zinc-500">
            Pilih perangkat Bluetooth untuk membaca
            struktur GATT. Tidak ada data cetak yang
            dikirim.
          </p>

          <div className="mt-4 rounded-xl border border-zinc-800 bg-black p-4">
            <p className="text-xs font-black text-zinc-500">
              STATUS
            </p>

            <p className="mt-2 text-sm font-black text-white">
              {status}
            </p>

            {device && (
              <div className="mt-4 space-y-2">
                <div>
                  <p className="text-[10px] font-black text-zinc-600">
                    NAMA
                  </p>

                  <p className="text-sm font-bold text-white">
                    {device.name ||
                      "Nama tidak tersedia"}
                  </p>
                </div>

                <div>
                  <p className="text-[10px] font-black text-zinc-600">
                    DEVICE ID
                  </p>

                  <p className="break-all text-xs font-bold text-zinc-400">
                    {device.id}
                  </p>
                </div>
              </div>
            )}
          </div>

          {error && (
            <div className="mt-4 rounded-xl border border-red-900 bg-red-950/30 p-4">
              <p className="text-xs font-black text-red-500">
                ERROR
              </p>

              <p className="mt-2 text-xs leading-5 text-red-300">
                {error}
              </p>
            </div>
          )}

          <div className="mt-4 grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={handleScan}
              disabled={loading}
              className="rounded-xl bg-red-600 px-4 py-3 text-xs font-black text-white transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading
                ? "MEMPROSES..."
                : "CARI & INSPEKSI"}
            </button>

            <button
              type="button"
              onClick={disconnect}
              className="rounded-xl border border-zinc-700 px-4 py-3 text-xs font-black text-zinc-300 transition hover:border-red-600 hover:text-white"
            >
              PUTUSKAN
            </button>
          </div>
        </section>

        {device && (
          <section className="mt-4 rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
            <h2 className="text-lg font-black">
              HASIL GATT
            </h2>

            <div className="mt-4 rounded-xl border border-zinc-800 bg-black p-4">
              <p className="text-xs font-black text-zinc-500">
                SERVICE
              </p>

              <p className="mt-1 text-2xl font-black text-white">
                {services.length}
              </p>
            </div>

            <div
              className={`mt-3 rounded-xl border p-4 ${
                writeCharacteristics.length > 0
                  ? "border-green-900 bg-green-950/20"
                  : "border-yellow-900 bg-yellow-950/20"
              }`}
            >
              <p
                className={`text-xs font-black ${
                  writeCharacteristics.length > 0
                    ? "text-green-500"
                    : "text-yellow-500"
                }`}
              >
                WRITE CHARACTERISTIC
              </p>

              <p className="mt-1 text-2xl font-black text-white">
                {writeCharacteristics.length}
              </p>

              <p className="mt-1 text-xs leading-5 text-zinc-500">
                {writeCharacteristics.length > 0
                  ? "Jalur pengiriman data ditemukan."
                  : "Belum ditemukan jalur untuk menulis data."}
              </p>
            </div>

            {writeCharacteristics.length >
              0 && (
              <div className="mt-4">
                <p className="mb-2 text-xs font-black text-zinc-400">
                  WRITE YANG DITEMUKAN
                </p>

                <div className="space-y-3">
                  {writeCharacteristics.map(
                    (characteristic) => (
                      <div
                        key={`${characteristic.serviceUuid}-${characteristic.uuid}`}
                        className="rounded-xl border border-green-900 bg-green-950/10 p-4"
                      >
                        <p className="text-[10px] font-black text-green-500">
                          SERVICE
                        </p>

                        <p className="mt-1 break-all text-xs font-bold text-white">
                          {characteristic.serviceUuid}
                        </p>

                        <p className="mt-3 text-[10px] font-black text-green-500">
                          CHARACTERISTIC
                        </p>

                        <p className="mt-1 break-all text-xs font-bold text-white">
                          {characteristic.uuid}
                        </p>

                        <div className="mt-3 flex flex-wrap gap-2">
                          {characteristic
                            .properties
                            .write && (
                            <span className="rounded-lg bg-green-600 px-2 py-1 text-[9px] font-black text-white">
                              WRITE
                            </span>
                          )}

                          {characteristic
                            .properties
                            .writeWithoutResponse && (
                            <span className="rounded-lg bg-green-700 px-2 py-1 text-[9px] font-black text-white">
                              WRITE WITHOUT RESPONSE
                            </span>
                          )}
                        </div>
                      </div>
                    )
                  )}
                </div>
              </div>
            )}

            <div className="mt-5">
              <p className="mb-2 text-xs font-black text-zinc-400">
                DETAIL SERVICE
              </p>

              <div className="space-y-3">
                {services.map(
                  (service) => (
                    <div
                      key={service.uuid}
                      className="rounded-xl border border-zinc-800 bg-black p-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-[10px] font-black text-zinc-600">
                            SERVICE UUID
                          </p>

                          <p className="mt-1 break-all text-xs font-bold text-white">
                            {service.uuid}
                          </p>
                        </div>

                        {service.isPrimary && (
                          <span className="shrink-0 rounded-lg border border-zinc-700 px-2 py-1 text-[9px] font-black text-zinc-400">
                            PRIMARY
                          </span>
                        )}
                      </div>

                      <div className="mt-4 space-y-2">
                        {service.characteristics.map(
                          (characteristic) => (
                            <div
                              key={`${service.uuid}-${characteristic.uuid}`}
                              className={`rounded-lg border p-3 ${
                                characteristic.canWrite
                                  ? "border-green-900 bg-green-950/10"
                                  : "border-zinc-800 bg-zinc-950"
                              }`}
                            >
                              <p className="break-all text-[10px] font-bold text-white">
                                {characteristic.uuid}
                              </p>

                              <div className="mt-2 flex flex-wrap gap-1">
                                {characteristic
                                  .properties
                                  .map(
                                    (property) => (
                                      <span
                                        key={property}
                                        className={`rounded-md px-2 py-1 text-[8px] font-black ${
                                          property ===
                                            "WRITE" ||
                                          property ===
                                            "WRITE WITHOUT RESPONSE"
                                            ? "bg-green-700 text-white"
                                            : "bg-zinc-800 text-zinc-400"
                                        }`}
                                      >
                                        {property}
                                      </span>
                                    )
                                  )}
                              </div>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>

            <div className="mt-5 rounded-xl border border-zinc-800 bg-black p-4">
              <p className="text-xs font-black text-zinc-400">
                CATATAN
              </p>

              <p className="mt-2 text-xs leading-5 text-zinc-600">
                Pemeriksaan ini hanya membaca struktur
                GATT. Aplikasi belum mengirim data ESC/POS
                dan belum mencetak apa pun.
              </p>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}