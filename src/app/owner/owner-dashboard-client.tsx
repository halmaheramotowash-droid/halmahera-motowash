"use client";

import { useEffect, useState } from "react";
import { apiGet } from "@/lib/api-client";

type Period =
  | "today"
  | "yesterday"
  | "7days"
  | "month"
  | "lastmonth";

type DashboardData = {
  success: boolean;
  period: Period;
  periodLabel: string;
  ownerName: string;
  ownerInitial: string;

  periodStart: string;
  periodEnd: string;

  totalRevenue: number;
  totalEmployeeResult: number;
  totalExpenses: number;
  netProfit: number;

  totalVehicles: number;
  totalEmployeeVehicles: number;
  totalEmployeeIncome: number;

  motorCount: number;
  mobilCount: number;
};

type Props = {
  initialPeriod: Period;
};

function formatRupiah(value: number) {
  return `Rp${value.toLocaleString("id-ID")}`;
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export default function OwnerDashboardClient({
  initialPeriod,
}: Props) {
  const [period, setPeriod] = useState<Period>(initialPeriod);

  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setPeriod(initialPeriod);
  }, [initialPeriod]);

  useEffect(() => {
    let cancelled = false;

    async function loadDashboard() {
      try {
        setLoading(true);
        setError("");

        const response = await apiGet(
          `/api/owner/dashboard?period=${period}`,
          {
            cache: "no-store",
          },
        );

        const result = await response.json();

        if (!response.ok) {
          throw new Error(
            result?.error || "Gagal mengambil data dashboard",
          );
        }

        if (!cancelled) {
          setData(result);
        }
      } catch (err) {
        console.error("OWNER DASHBOARD CLIENT ERROR:", err);

        if (!cancelled) {
          setError("Gagal mengambil data dashboard");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadDashboard();

    return () => {
      cancelled = true;
    };
  }, [period]);

  if (loading && !data) {
    return (
      <section className="mt-5 rounded-3xl border border-white/10 bg-[#111923] p-5 sm:p-6">
        <p className="text-sm font-bold text-zinc-400">
          Memuat data dashboard...
        </p>
      </section>
    );
  }

  if (error && !data) {
    return (
      <section className="mt-5 rounded-3xl border border-red-500/30 bg-red-950/20 p-5 sm:p-6">
        <p className="text-sm font-bold text-red-300">
          {error}
        </p>
      </section>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <section className="mt-5">
      {/* RINGKASAN KEUANGAN */}
      <div className="rounded-3xl border border-white/10 bg-[#111923] p-4 sm:p-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-black tracking-[0.2em] text-zinc-500">
              RINGKASAN KEUANGAN
            </p>

            <h2 className="mt-1 text-xl font-black sm:text-2xl">
              {data.periodLabel}
            </h2>
          </div>

          <div className="text-left text-xs text-zinc-500 sm:text-right">
            <p>{formatDate(data.periodStart)}</p>
            <p>s/d {formatDate(data.periodEnd)}</p>
          </div>
        </div>

        {/* 4 KARTU KEUANGAN */}
        <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
          <div className="rounded-2xl border border-white/10 bg-[#0c1118] p-4">
            <p className="text-[11px] font-bold text-zinc-500">
              Pendapatan
            </p>

            <p className="mt-2 break-words text-lg font-black text-yellow-300 sm:text-2xl">
              {formatRupiah(data.totalRevenue)}
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#0c1118] p-4">
            <p className="text-[11px] font-bold text-zinc-500">
              Hasil Karyawan
            </p>

            <p className="mt-2 break-words text-lg font-black text-orange-300 sm:text-2xl">
              {formatRupiah(data.totalEmployeeResult)}
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#0c1118] p-4">
            <p className="text-[11px] font-bold text-zinc-500">
              Pengeluaran
            </p>

            <p className="mt-2 break-words text-lg font-black text-red-300 sm:text-2xl">
              {formatRupiah(data.totalExpenses)}
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#0c1118] p-4">
            <p className="text-[11px] font-bold text-zinc-500">
              Laba Bersih
            </p>

            <p className="mt-2 break-words text-lg font-black text-green-300 sm:text-2xl">
              {formatRupiah(data.netProfit)}
            </p>
          </div>
        </div>

        {/* DETAIL KENDARAAN */}
        <div className="mt-4 grid grid-cols-3 gap-3">
          <div className="rounded-2xl border border-white/10 bg-[#0c1118] p-3 text-center">
            <p className="text-lg font-black sm:text-2xl">
              {data.totalVehicles}
            </p>

            <p className="mt-1 text-[10px] font-bold text-zinc-500 sm:text-xs">
              Total Kendaraan
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#0c1118] p-3 text-center">
            <p className="text-lg font-black sm:text-2xl">
              {data.motorCount}
            </p>

            <p className="mt-1 text-[10px] font-bold text-zinc-500 sm:text-xs">
              Motor
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#0c1118] p-3 text-center">
            <p className="text-lg font-black sm:text-2xl">
              {data.mobilCount}
            </p>

            <p className="mt-1 text-[10px] font-bold text-zinc-500 sm:text-xs">
              Mobil
            </p>
          </div>
        </div>

        {/* DATA KARYAWAN */}
        <div className="mt-4 rounded-2xl border border-white/10 bg-[#0c1118] p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold text-zinc-500">
                Aktivitas Karyawan Hari Ini
              </p>

              <p className="mt-1 text-lg font-black sm:text-xl">
                {data.totalEmployeeVehicles} kendaraan
              </p>
            </div>

            <div className="text-right">
              <p className="text-xs font-bold text-zinc-500">
                Hasil Karyawan
              </p>

              <p className="mt-1 text-lg font-black text-orange-300 sm:text-xl">
                {formatRupiah(data.totalEmployeeIncome)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {loading && (
        <p className="mt-2 text-right text-[10px] text-zinc-600">
          Memperbarui data...
        </p>
      )}
    </section>
  );
}