"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type VehicleType = "MOTOR" | "MOBIL";

type Compensation = {
  id: number;
  vehicleType: VehicleType;
  amount: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
};

const vehicleTypeOrder: VehicleType[] = [
  "MOTOR",
  "MOBIL",
];

export default function KompensasiPage() {
  const [compensations, setCompensations] = useState<
    Compensation[]
  >([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");

  const [editingType, setEditingType] =
    useState<VehicleType | null>(null);

  const [editAmount, setEditAmount] =
    useState("");

  const [formError, setFormError] =
    useState("");

  async function loadCompensations() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        "/api/owner/compensation"
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.error ||
            "Gagal mengambil data kompensasi"
        );
      }

      const sorted =
        (data.compensations ?? []).sort(
          (a: Compensation, b: Compensation) =>
            vehicleTypeOrder.indexOf(
              a.vehicleType
            ) -
            vehicleTypeOrder.indexOf(
              b.vehicleType
            )
        );

      setCompensations(sorted);
    } catch (error) {
      console.error(
        "loadCompensations error:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "Gagal mengambil data kompensasi"
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCompensations();
  }, []);

  function formatRupiah(value: number) {
    return `Rp${value.toLocaleString("id-ID")}`;
  }

  function openEdit(
    compensation: Compensation
  ) {
    setEditingType(
      compensation.vehicleType
    );
    setEditAmount(
      String(compensation.amount)
    );
    setFormError("");
  }

  function closeEdit() {
    if (saving) {
      return;
    }

    setEditingType(null);
    setEditAmount("");
    setFormError("");
  }

  async function saveCompensation() {
    try {
      setSaving(true);
      setFormError("");

      if (!editingType) {
        setFormError(
          "Tipe kendaraan belum dipilih"
        );
        return;
      }

      const amount = Number(
        editAmount.replace(/\D/g, "")
      );

      if (
        !Number.isInteger(amount) ||
        amount <= 0
      ) {
        setFormError(
          "Kompensasi harus berupa angka bulat lebih dari Rp0"
        );
        return;
      }

      const response = await fetch(
        "/api/owner/compensation",
        {
          method: "PUT",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            vehicleType: editingType,
            amount,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.error ||
            "Gagal menyimpan kompensasi"
        );
      }

      await loadCompensations();

      closeEdit();

      alert(
        data.message ||
          `Kompensasi ${editingType} berhasil disimpan`
      );
    } catch (error) {
      console.error(
        "saveCompensation error:",
        error
      );

      setFormError(
        error instanceof Error
          ? error.message
          : "Gagal menyimpan kompensasi"
      );
    } finally {
      setSaving(false);
    }
  }

  function getCompensation(
    vehicleType: VehicleType
  ) {
    return compensations.find(
      (item) =>
        item.vehicleType === vehicleType
    );
  }

  function CompensationCard({
    vehicleType,
  }: {
    vehicleType: VehicleType;
  }) {
    const compensation =
      getCompensation(vehicleType);

    if (!compensation) {
      return (
        <div className="rounded-xl border border-zinc-800 bg-black p-4">
          <h3 className="text-sm font-black text-white">
            {vehicleType}
          </h3>

          <p className="mt-2 text-xs font-bold text-zinc-600">
            DATA KOMPENSASI BELUM TERSEDIA
          </p>
        </div>
      );
    }

    return (
      <div className="rounded-xl border border-zinc-800 bg-black p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-black text-white">
              {vehicleType}
            </h3>

            <p className="mt-1 text-xs text-zinc-500">
              Kompensasi per transaksi
            </p>

            <p className="mt-2 text-xl font-black text-red-500">
              {formatRupiah(
                compensation.amount
              )}
            </p>
          </div>

          <div className="text-right">
            <p className="text-[10px] font-bold text-green-500">
              AKTIF
            </p>

            <button
              type="button"
              onClick={() =>
                openEdit(compensation)
              }
              className="mt-2 rounded-lg border border-zinc-700 px-4 py-2 text-[10px] font-black text-zinc-300 transition hover:border-red-600 hover:text-red-500"
            >
              EDIT
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-black px-4 py-6 text-white">
      <div className="mx-auto max-w-md">
        {/* HEADER */}
        <div className="mb-6">
          <Link
            href="/owner/pengaturan"
            className="mb-4 inline-flex items-center text-sm font-bold text-zinc-400 transition hover:text-white"
          >
            ← KEMBALI
          </Link>

          <h1 className="text-2xl font-black tracking-tight">
            KOMPENSASI KARYAWAN
          </h1>

          <p className="mt-1 text-sm text-zinc-500">
            Atur kompensasi karyawan per transaksi
          </p>
        </div>

        {/* INFO */}
        <div className="mb-4 rounded-2xl border border-red-900 bg-red-950/20 p-4">
          <p className="text-xs leading-5 text-zinc-400">
            Nominal kompensasi yang diatur di sini
            akan digunakan untuk transaksi baru.
          </p>
        </div>

        {/* ERROR */}
        {error && (
          <div className="mb-4 rounded-xl border border-red-900 bg-red-950/40 p-4">
            <p className="text-sm font-bold text-red-400">
              {error}
            </p>

            <button
              type="button"
              onClick={loadCompensations}
              className="mt-3 rounded-xl border border-red-800 px-4 py-2 text-xs font-black text-red-400"
            >
              COBA LAGI
            </button>
          </div>
        )}

        {/* FORM EDIT */}
        {editingType && (
          <div className="mb-5 rounded-2xl border border-red-900 bg-zinc-950 p-4">
            <div className="mb-4">
              <h2 className="text-base font-black">
                EDIT KOMPENSASI{" "}
                {editingType}
              </h2>

              <p className="mt-1 text-xs text-zinc-500">
                Masukkan nominal kompensasi baru
              </p>
            </div>

            {formError && (
              <div className="mb-4 rounded-xl border border-red-900 bg-red-950/40 p-3">
                <p className="text-xs font-bold text-red-400">
                  {formError}
                </p>
              </div>
            )}

            <div className="mb-5">
              <label
                htmlFor="compensation-amount"
                className="mb-2 block text-xs font-black text-zinc-400"
              >
                NOMINAL KOMPENSASI
              </label>

              <div className="flex items-center rounded-xl border border-zinc-800 bg-black px-3 focus-within:border-red-600">
                <span className="text-sm font-black text-zinc-500">
                  Rp
                </span>

                <input
                  id="compensation-amount"
                  type="text"
                  inputMode="numeric"
                  value={Number(
                    editAmount.replace(
                      /\D/g,
                      ""
                    ) || "0"
                  ).toLocaleString("id-ID")}
                  onChange={(event) => {
                    const numericValue =
                      event.target.value.replace(
                        /\D/g,
                        ""
                      );

                    setEditAmount(
                      numericValue
                    );
                  }}
                  disabled={saving}
                  className="w-full bg-transparent px-2 py-3 text-lg font-black text-white outline-none disabled:opacity-50"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={closeEdit}
                disabled={saving}
                className="rounded-xl border border-zinc-800 bg-black px-4 py-3 text-xs font-black text-zinc-400 transition hover:text-white disabled:opacity-50"
              >
                BATAL
              </button>

              <button
                type="button"
                onClick={saveCompensation}
                disabled={saving}
                className="rounded-xl bg-red-600 px-4 py-3 text-xs font-black text-white transition hover:bg-red-500 disabled:opacity-50"
              >
                {saving
                  ? "MENYIMPAN..."
                  : "SIMPAN"}
              </button>
            </div>
          </div>
        )}

        {/* DATA KOMPENSASI */}
        {loading ? (
          <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5 text-center">
            <p className="text-sm font-bold text-zinc-500">
              MEMUAT KOMPENSASI...
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <CompensationCard
              vehicleType="MOTOR"
            />

            <CompensationCard
              vehicleType="MOBIL"
            />
          </div>
        )}

        {/* CATATAN */}
        <div className="mt-5 rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
          <h2 className="text-xs font-black text-zinc-400">
            CATATAN
          </h2>

          <p className="mt-2 text-xs leading-5 text-zinc-600">
            Perubahan kompensasi tidak mengubah
            transaksi yang sudah tersimpan.
            Nominal baru digunakan pada transaksi
            berikutnya.
          </p>
        </div>
      </div>
    </main>
  );
}