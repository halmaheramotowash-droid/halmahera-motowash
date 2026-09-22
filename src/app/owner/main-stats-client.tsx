"use client";

import { useEffect, useState } from "react";
import { apiGet } from "@/lib/api-client";

type DashboardData = {
  totalVehicles: number;
  totalRevenue: number;
  netProfit: number;
};

function formatRupiah(value: number) {
  return `Rp${value.toLocaleString("id-ID")}`;
}

export default function MainStatsClient() {
  const [stats, setStats] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadStats() {
      try {
        const response = await apiGet(
          "/api/owner/dashboard?period=today",
          {
            cache: "no-store",
          },
        );

        const result = await response.json();

        if (!response.ok) {
          throw new Error(
            result?.error || "Gagal mengambil statistik",
          );
        }

        if (!cancelled) {
          setStats({
            totalVehicles: result.totalVehicles ?? 0,
            totalRevenue: result.totalRevenue ?? 0,
            netProfit: result.netProfit ?? 0,
          });
        }
      } catch (error) {
        console.error("MAIN STATS ERROR:", error);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadStats();

    return () => {
      cancelled = true;
    };
  }, []);

  const totalVehicles = stats?.totalVehicles ?? 0;
  const totalRevenue = stats?.totalRevenue ?? 0;
  const netProfit = stats?.netProfit ?? 0;

  return (
    <section className="mt-5 grid grid-cols-3 gap-2 sm:gap-3 lg:gap-4">
      {/* KENDARAAN HARI INI */}
      <div className="min-w-0 rounded-3xl border border-white/10 bg-[#111923] p-3 sm:p-4 lg:p-5">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-red-950/80 text-xl sm:h-12 sm:w-12 sm:text-2xl lg:h-16 lg:w-16 lg:text-3xl">
          🚿
        </div>

        <p className="mt-4 truncate text-2xl font-black sm:text-3xl lg:text-4xl">
          {loading ? "..." : totalVehicles}
        </p>

        <p className="mt-2 text-[11px] leading-4 text-zinc-300 sm:text-sm lg:text-lg">
          Kendaraan yang
          <br />
          Dicuci
        </p>
      </div>

      {/* PENDAPATAN HARI INI */}
      <div className="min-w-0 rounded-3xl border border-white/10 bg-[#111923] p-3 sm:p-4 lg:p-5">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-yellow-950/80 text-xl sm:h-12 sm:w-12 sm:text-2xl lg:h-16 lg:w-16 lg:text-3xl">
          💰
        </div>

        <p className="mt-4 truncate text-lg font-black text-yellow-300 sm:text-2xl lg:text-3xl">
          {loading ? "..." : formatRupiah(totalRevenue)}
        </p>

        <p className="mt-2 text-[11px] leading-4 text-zinc-300 sm:text-sm lg:text-lg">
          Pendapatan
          <br />
          Hari Ini
        </p>
      </div>

      {/* LABA BERSIH */}
      <div className="min-w-0 rounded-3xl border border-white/10 bg-[#111923] p-3 sm:p-4 lg:p-5">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-purple-950/80 text-xl sm:h-12 sm:w-12 sm:text-2xl lg:h-16 lg:w-16 lg:text-3xl">
          🧾
        </div>

        <p className="mt-4 break-words text-[clamp(0.9rem,3.7vw,2.25rem)] font-black leading-tight tracking-tight sm:text-3xl lg:text-4xl">
          {loading ? "..." : formatRupiah(netProfit)}
        </p>

        <p className="mt-2 text-[11px] leading-4 text-zinc-300 sm:text-sm lg:text-lg">
          Laba Bersih
          <br />
          Hari Ini
        </p>
      </div>
    </section>
  );
}