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

const vehicleTypeOrder: VehicleType[] = ["MOTOR", "MOBIL"];

export default function KompensasiPage() {
  const [compensations, setCompensations] = useState<Compensation[]>([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");

  const [editingType, setEditingType] = useState<VehicleType | null>(null);
  const [editAmount, setEditAmount] = useState("");
  const [formError, setFormError] = useState("");

  async function loadCompensations() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/owner/compensation");

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.error || "Gagal mengambil data kompensasi"
        );
      }

      const sorted = (data.compensations ?? []).sort(
        (a: Compensation, b: Compensation) =>
          vehicleTypeOrder.indexOf(a.vehicleType) -
          vehicleTypeOrder.indexOf(b.vehicleType)
      );

      setCompensations(sorted);
    } catch (error) {
      console.error("loadCompensations error:", error);

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

  function openEdit(compensation: Compensation) {
    setEditingType(compensation.vehicleType);
    setEditAmount(String(compensation.amount));
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
        setFormError("Tipe kendaraan belum dipilih");
        return;
      }

      const amount = Number(editAmount.replace(/\D/g, ""));

      if (!Number.isInteger(amount) || amount <= 0) {
        setFormError(
          "Kompensasi harus berupa angka bulat lebih dari Rp0"
        );
        return;
      }

      const response = await fetch("/api/owner/compensation", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          vehicleType: editingType,
          amount,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.error || "Gagal menyimpan kompensasi"
        );
      }

      await loadCompensations();

      const savedType = editingType;

      closeEdit();

      alert(
        data.message ||
          `Kompensasi ${savedType} berhasil disimpan`
      );
    } catch (error) {
      console.error("saveCompensation error:", error);

      setFormError(
        error instanceof Error
          ? error.message
          : "Gagal menyimpan kompensasi"
      );
    } finally {
      setSaving(false);
    }
  }

  function getCompensation(vehicleType: VehicleType) {
    return compensations.find(
      (item) => item.vehicleType === vehicleType
    );
  }

  function CompensationCard({
    vehicleType,
  }: {
    vehicleType: VehicleType;
  }) {
    const compensation = getCompensation(vehicleType);

    if (!compensation) {
      return (
        <div className="rounded-2xl border border-red-950/70 bg-gradient-to-br from-[#351019] via-[#17131f] to-[#0d1725] p-4 shadow-lg shadow-black/20">
          <h3 className="text-sm font-black tracking-wide text-white">
            {vehicleType}
          </h3>

          <p className="mt-2 text-xs font-bold text-slate-500">
            DATA KOMPENSASI BELUM TERSEDIA
          </p>
        </div>
      );
    }

    return (
      <div className="rounded-2xl border border-red-900/70 bg-gradient-to-br from-[#45121b] via-[#21131d] to-[#101c2d] p-4 shadow-lg shadow-black/30">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-black tracking-wide text-white">
              {vehicleType}
            </h3>

            <p className="mt-1 text-xs text-slate-400">
              Kompensasi per transaksi
            </p>

            <p className="mt-2 text-xl font-black text-red-400">
              {formatRupiah(compensation.amount)}
            </p>
          </div>

          <div className="text-right">
            <p className="text-[10px] font-black tracking-widest text-emerald-400">
              AKTIF
            </p>

            <button
              type="button"
              onClick={() => openEdit(compensation)}
              className="mt-3 rounded-xl border border-red-700/80 bg-red-950/30 px-4 py-2 text-[10px] font-black tracking-wide text-red-300 transition hover:border-red-400 hover:bg-red-600 hover:text-white"
            >
              EDIT
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#070b14] px-4 py-6 text-white">
      <div className="mx-auto max-w-md">
        {/* HEADER */}
        <div className="mb-6">
          <Link
            href="/owner/pengaturan"
            className="mb-4 inline-flex items-center text-sm font-bold text-slate-400 transition hover:text-red-400"
          >
            ← KEMBALI
          </Link>

          <h1 className="text-2xl font-black tracking-tight text-white">
            KOMPENSASI KARYAWAN
          </h1>

          <p className="mt-1 text-sm text-slate-400">
            Atur kompensasi karyawan per transaksi
          </p>
        </div>

        {/* INFO */}
        <div className="mb-4 rounded-2xl border border-red-900/70 bg-gradient-to-r from-red-950/70 via-[#21121d] to-[#101c2c] p-4 shadow-lg shadow-black/20">
          <p className="text-xs leading-5 text-slate-300">
            Nominal kompensasi yang diatur di sini akan digunakan
            untuk transaksi baru.
          </p>
        </div>

        {/* ERROR */}
        {error && (
          <div className="mb-4 rounded-2xl border border-red-800/80 bg-red-950/60 p-4">
            <p className="text-sm font-bold text-red-300">
              {error}
            </p>

            <button
              type="button"
              onClick={loadCompensations}
              className="mt-3 rounded-xl border border-red-700 bg-red-950/40 px-4 py-2 text-xs font-black text-red-300 transition hover:bg-red-600 hover:text-white"
            >
              COBA LAGI
            </button>
          </div>
        )}

        {/* FORM EDIT */}
        {editingType && (
          <div className="mb-5 rounded-2xl border border-red-900/70 bg-gradient-to-br from-[#32101a] via-[#171421] to-[#0e1a2a] p-4 shadow-xl shadow-black/30">
            <div className="mb-4">
              <h2 className="text-base font-black tracking-wide text-white">
                EDIT KOMPENSASI {editingType}
              </h2>

              <p className="mt-1 text-xs text-slate-400">
                Masukkan nominal kompensasi baru
              </p>
            </div>

            {formError && (
              <div className="mb-4 rounded-xl border border-red-800/80 bg-red-950/60 p-3">
                <p className="text-xs font-bold text-red-300">
                  {formError}
                </p>
              </div>
            )}

            <div className="mb-5">
              <label
                htmlFor="compensation-amount"
                className="mb-2 block text-xs font-black tracking-wide text-slate-300"
              >
                NOMINAL KOMPENSASI
              </label>

              <div className="flex items-center rounded-xl border border-slate-700 bg-[#070b14] px-3 transition focus-within:border-red-500">
                <span className="text-sm font-black text-slate-500">
                  Rp
                </span>

                <input
                  id="compensation-amount"
                  type="text"
                  inputMode="numeric"
                  value={Number(
                    editAmount.replace(/\D/g, "") || "0"
                  ).toLocaleString("id-ID")}
                  onChange={(event) => {
                    const numericValue =
                      event.target.value.replace(/\D/g, "");

                    setEditAmount(numericValue);
                  }}
                  disabled={saving}
                  className="w-full bg-transparent px-2 py-3 text-lg font-black text-white outline-none placeholder:text-slate-600 disabled:opacity-50"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={closeEdit}
                disabled={saving}
                className="rounded-xl border border-slate-700 bg-[#080d17] px-4 py-3 text-xs font-black text-slate-400 transition hover:border-slate-500 hover:text-white disabled:opacity-50"
              >
                BATAL
              </button>

              <button
                type="button"
                onClick={saveCompensation}
                disabled={saving}
                className="rounded-xl bg-red-600 px-4 py-3 text-xs font-black text-white transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving ? "MENYIMPAN..." : "SIMPAN"}
              </button>
            </div>
          </div>
        )}

        {/* DATA KOMPENSASI */}
        {loading ? (
          <div className="rounded-2xl border border-red-950/70 bg-gradient-to-br from-[#25111a] to-[#0e1928] p-5 text-center">
            <p className="text-sm font-bold text-slate-400">
              MEMUAT KOMPENSASI...
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <CompensationCard vehicleType="MOTOR" />
            <CompensationCard vehicleType="MOBIL" />
          </div>
        )}

        {/* CATATAN */}
        <div className="mt-5 rounded-2xl border border-slate-800/80 bg-gradient-to-br from-[#111827] to-[#0b1220] p-4">
          <h2 className="text-xs font-black tracking-wide text-slate-300">
            CATATAN
          </h2>

          <p className="mt-2 text-xs leading-5 text-slate-500">
            Perubahan kompensasi tidak mengubah transaksi yang
            sudah tersimpan. Nominal baru digunakan pada transaksi
            berikutnya.
          </p>
        </div>
      </div>
    </main>
  );
}