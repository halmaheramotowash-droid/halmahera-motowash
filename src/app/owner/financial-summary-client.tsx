"use client";

import { useEffect, useState } from "react";
import { apiGet } from "@/lib/api-client";

type Period =
  | "today"
  | "yesterday"
  | "7days"
  | "month"
  | "lastmonth";

type Props = {
  period: Period;
};

type DashboardData = {
  periodLabel: string;
  periodStart: string;
  periodEnd: string;

  totalRevenue: number;
  totalEmployeeResult: number;
  totalExpenses: number;
  netProfit: number;

  motorCount: number;
  mobilCount: number;
  totalVehicles: number;
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

export default function FinancialSummaryClient({
  period,
}: Props) {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadSummary() {
      try {
        setLoading(true);

        const response = await apiGet(
          `/api/owner/dashboard?period=${period}`,
          {
            cache: "no-store",
          },
        );

        const result = await response.json();

        if (!response.ok) {
          throw new Error(
            result?.error || "Gagal mengambil ringkasan keuangan",
          );
        }

        if (!cancelled) {
          setData(result);
        }
      } catch (error) {
        console.error("FINANCIAL SUMMARY ERROR:", error);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadSummary();

    return () => {
      cancelled = true;
    };
  }, [period]);

  const totalRevenue = data?.totalRevenue ?? 0;
  const totalEmployeeResult = data?.totalEmployeeResult ?? 0;
  const totalExpenses = data?.totalExpenses ?? 0;
  const netProfit = data?.netProfit ?? 0;

  const motorCount = data?.motorCount ?? 0;
  const mobilCount = data?.mobilCount ?? 0;
  const totalVehicles = data?.totalVehicles ?? 0;

  return (
    <>
      <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="rounded-3xl border border-white/10 bg-[#070a0e] p-4 sm:p-5">
          <p className="text-xs font-bold tracking-widest text-zinc-500">
            PENDAPATAN
          </p>

          <p className="mt-3 break-words text-2xl font-black text-green-400 sm:text-3xl">
            {loading ? "..." : formatRupiah(totalRevenue)}
          </p>
        </div>

        <div className="rounded-3xl border border-white/10 bg-[#070a0e] p-4 sm:p-5">
          <p className="text-xs font-bold tracking-widest text-zinc-500">
            KOMISI KARYAWAN
          </p>

          <p className="mt-3 break-words text-2xl font-black text-yellow-400 sm:text-3xl">
            {loading
              ? "..."
              : formatRupiah(totalEmployeeResult)}
          </p>
        </div>

        <div className="rounded-3xl border border-white/10 bg-[#070a0e] p-4 sm:p-5">
          <p className="text-xs font-bold tracking-widest text-zinc-500">
            PENGELUARAN
          </p>

          <p className="mt-3 break-words text-2xl font-black text-red-400 sm:text-3xl">
            {loading ? "..." : formatRupiah(totalExpenses)}
          </p>
        </div>

        <div className="rounded-3xl border border-red-900/60 bg-gradient-to-br from-red-950/60 to-[#170909] p-4 sm:p-5">
          <p className="text-xs font-bold tracking-widest text-zinc-400">
            LABA BERSIH
          </p>

          <p className="mt-3 break-words text-2xl font-black text-white sm:text-3xl">
            {loading ? "..." : formatRupiah(netProfit)}
          </p>
        </div>
      </div>

      {/* RINCIAN KENDARAAN */}
      <div className="mt-4 grid grid-cols-3 gap-2 sm:gap-3">
        <div className="rounded-2xl bg-[#070a0e] p-3 text-center sm:p-4">
          <p className="text-xl font-black text-red-400 sm:text-2xl">
            {loading ? "..." : motorCount}
          </p>

          <p className="mt-1 text-[10px] font-bold text-zinc-500 sm:text-xs">
            MOTOR
          </p>
        </div>

        <div className="rounded-2xl bg-[#070a0e] p-3 text-center sm:p-4">
          <p className="text-xl font-black text-blue-400 sm:text-2xl">
            {loading ? "..." : mobilCount}
          </p>

          <p className="mt-1 text-[10px] font-bold text-zinc-500 sm:text-xs">
            MOBIL
          </p>
        </div>

        <div className="rounded-2xl bg-[#070a0e] p-3 text-center sm:p-4">
          <p className="text-xl font-black sm:text-2xl">
            {loading ? "..." : totalVehicles}
          </p>

          <p className="mt-1 text-[10px] font-bold text-zinc-500 sm:text-xs">
            TOTAL
          </p>
        </div>
      </div>

      {/* PERIODE LAPORAN */}
      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="rounded-2xl bg-[#070a0e] p-4">
          <p className="text-xs font-bold tracking-widest text-zinc-500">
            MULAI PERIODE
          </p>

          <p className="mt-2 text-sm font-black sm:text-base">
            {data ? formatDate(data.periodStart) : "..."}
          </p>
        </div>

        <div className="rounded-2xl bg-[#070a0e] p-4">
          <p className="text-xs font-bold tracking-widest text-zinc-500">
            AKHIR PERIODE
          </p>

          <p className="mt-2 text-sm font-black sm:text-base">
            {data ? formatDate(data.periodEnd) : "..."}
          </p>
        </div>
      </div>
    </>
  );
}