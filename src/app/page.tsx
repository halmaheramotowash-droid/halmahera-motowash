"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type CurrentUser = {
  userId: number;
  username: string;
  role: "OWNER" | "KARYAWAN";
};

type DashboardStats = {
  vehiclesToday: number | null;
  revenueToday: number | null;
  activeEmployees: number | null;
  weeklyTransactions: number | null;
};

function formatRupiah(value: number | null) {
  if (value === null) return "...";

  return `Rp ${value.toLocaleString("id-ID")}`;
}

function getNumberValue(
  data: Record<string, unknown>,
  keys: string[],
): number | null {
  for (const key of keys) {
    const value = data[key];

    if (typeof value === "number" && Number.isFinite(value)) {
      return value;
    }

    if (typeof value === "string") {
      const parsed = Number(value);

      if (Number.isFinite(parsed)) {
        return parsed;
      }
    }
  }

  return null;
}

export default function HomePage() {
  const [currentUser, setCurrentUser] =
    useState<CurrentUser | null>(null);

  const [loadingUser, setLoadingUser] =
    useState(true);

  const [loadingStats, setLoadingStats] =
    useState(true);

  const [showLogoutModal, setShowLogoutModal] =
    useState(false);

  const [loggingOut, setLoggingOut] =
    useState(false);

  const [stats, setStats] = useState<DashboardStats>({
    vehiclesToday: null,
    revenueToday: null,
    activeEmployees: null,
    weeklyTransactions: null,
  });

  const displayName =
    currentUser?.username || "Operator";

  const isOwner =
    currentUser?.role === "OWNER";

  useEffect(() => {
    async function loadCurrentUser() {
      try {
        const response = await fetch("/api/me", {
          cache: "no-store",
        });

        if (!response.ok) {
          window.location.href = "/login";
          return;
        }

        const data = await response.json();

        if (data.user) {
          setCurrentUser(data.user);
        } else {
          window.location.href = "/login";
        }
      } catch (error) {
        console.error(
          "Gagal mengambil data pengguna:",
          error,
        );

        window.location.href = "/login";
      } finally {
        setLoadingUser(false);
      }
    }

    loadCurrentUser();
  }, []);

  useEffect(() => {
    if (!currentUser) return;

    async function loadDashboardStats(user: CurrentUser) {
      try {
        if (user.role === "KARYAWAN") {
          const response = await fetch("/api/hasil", {
            cache: "no-store",
          });

          if (!response.ok) {
            setLoadingStats(false);
            return;
          }

          const data = await response.json();
          const result = (data?.data || data?.summary || data) as Record<string, unknown>;

          setStats({
            vehiclesToday: getNumberValue(result, [
              "vehiclesToday",
              "totalVehiclesToday",
              "totalVehicles",
              "vehicleCount",
            ]),
            revenueToday: getNumberValue(result, [
              "revenueToday",
              "totalResult",
              "employeeResult",
              "totalRevenueToday",
              "revenue",
            ]),
            activeEmployees: null,
            weeklyTransactions: null,
          });

          return;
        }

        const todayWIB = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Asia/Jakarta",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
}).format(new Date());

const [summaryResponse, transactionsResponse] = await Promise.all([
  fetch(`/api/owner/summary?date=${todayWIB}`, {
    cache: "no-store",
  }),
  fetch("/api/transactions", {
    cache: "no-store",
  }),
]);

        let summaryData: Record<string, unknown> = {};

        if (summaryResponse.ok) {
          const data = await summaryResponse.json();
          const summary = data?.summary || data?.data || data;
          if (summary && typeof summary === "object") {
            summaryData = summary as Record<string, unknown>;
          }
        }

        let monthlyTransactions: unknown[] = [];

        if (transactionsResponse.ok) {
          const data = await transactionsResponse.json();
          const rows = data?.transactions || data?.data || data;

          if (Array.isArray(rows)) {
            const now = new Date();
            const monthStart = new Date(
              now.getFullYear(),
              now.getMonth(),
              1,
              0,
              0,
              0,
              0,
            );
            const nextMonthStart = new Date(
              now.getFullYear(),
              now.getMonth() + 1,
              1,
              0,
              0,
              0,
              0,
            );

            monthlyTransactions = rows.filter((transaction) => {
              if (!transaction || typeof transaction !== "object") return false;
              const createdAt = (transaction as Record<string, unknown>).createdAt;
              const date = new Date(String(createdAt));
              return (
                !Number.isNaN(date.getTime()) &&
                date >= monthStart &&
                date < nextMonthStart
              );
            });
          }
        }

        setStats({
          vehiclesToday: getNumberValue(summaryData, [
            "vehiclesToday",
            "totalVehiclesToday",
            "todayVehicles",
            "totalVehicles",
            "vehicleCount",
          ]),
          revenueToday: getNumberValue(summaryData, [
            "revenueToday",
            "todayRevenue",
            "totalRevenueToday",
            "revenue",
            "totalResult",
          ]),
          activeEmployees: getNumberValue(summaryData, [
            "activeEmployees",
            "activeEmployeeCount",
            "totalActiveEmployees",
            "employeeCount",
          ]),
          weeklyTransactions: monthlyTransactions.length,
        });
      } catch (error) {
        console.error("Gagal mengambil statistik dashboard:", error);
      } finally {
        setLoadingStats(false);
      }
    }

    loadDashboardStats(currentUser);
  }, [currentUser]);

  const goToOwner = () => {
    window.location.href = "/owner";
  };

  const openLogoutModal = () => {
    if (!loggingOut) {
      setShowLogoutModal(true);
    }
  };

  const closeLogoutModal = () => {
    if (!loggingOut) {
      setShowLogoutModal(false);
    }
  };

  const handleLogout = async () => {
    if (loggingOut) return;

    setLoggingOut(true);

    try {
      await fetch("/api/logout", {
        method: "POST",
      });
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      window.location.href = "/login";
    }
  };

  return (
    <main className="min-h-screen bg-[#05080d] text-white">
      {/* BACKGROUND */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -right-52 -top-52 h-[600px] w-[600px] rounded-full bg-red-700/10 blur-3xl" />
        <div className="absolute -bottom-52 -left-52 h-[600px] w-[600px] rounded-full bg-blue-900/10 blur-3xl" />
      </div>

      <div className="relative flex min-h-screen w-full">
        {/* SIDEBAR LAPTOP */}
        <aside className="hidden w-[245px] shrink-0 flex-col border-r border-white/10 bg-[#080c11] px-5 py-7 md:flex">
          <div className="mb-10 px-3">
            <h1 className="text-3xl font-black tracking-tight">
              WASH<span className="text-red-500">APP</span>
            </h1>

            <p className="mt-2 text-[10px] font-semibold tracking-[0.25em] text-zinc-500">
              SMART WASH MANAGEMENT
            </p>
          </div>

          <nav className="flex flex-1 flex-col gap-2">
            <Link
              href="/"
              className="flex items-center gap-3 rounded-xl bg-red-600 px-4 py-3 text-sm font-black"
            >
              <span className="text-xl">⌂</span>
              Beranda
            </Link>

            <Link
              href="/cuci"
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold text-zinc-400 transition hover:bg-white/5 hover:text-white"
            >
              <span className="text-xl">💧</span>
              Cuci
            </Link>

            <Link
              href="/riwayat"
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold text-zinc-400 transition hover:bg-white/5 hover:text-white"
            >
              <span className="text-xl">🧾</span>
              Riwayat
            </Link>

            <Link
              href="/hasil"
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold text-zinc-400 transition hover:bg-white/5 hover:text-white"
            >
              <span className="text-xl">📊</span>
              Hasil
            </Link>

            {isOwner && (
              <>
                <Link
                  href="/owner"
                  className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold text-zinc-400 transition hover:bg-white/5 hover:text-white"
                >
                  <span className="text-xl">👥</span>
                  Owner
                </Link>

                <Link
                  href="/owner/pengeluaran"
                  className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold text-zinc-400 transition hover:bg-white/5 hover:text-white"
                >
                  <span className="text-xl">💸</span>
                  Pengeluaran
                </Link>
              </>
            )}

            <Link
              href="/owner/pengaturan"
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold text-zinc-400 transition hover:bg-white/5 hover:text-white"
            >
              <span className="text-xl">⚙</span>
              Pengaturan
            </Link>
          </nav>

          <div className="mt-8 border-t border-white/10 pt-5 px-3">
            <p className="text-xs font-bold text-zinc-300">
              WASH APP
            </p>

            <p className="mt-1 text-[10px] text-zinc-600">
              SMART WASH MANAGEMENT
            </p>
          </div>
        </aside>

        {/* KONTEN UTAMA */}
        <section className="min-w-0 flex-1 pb-24 md:pb-8">
          {/* HEADER */}
          <header className="border-b border-white/10 bg-[#080c11]/95 px-4 py-4 backdrop-blur-xl sm:px-5 sm:py-5 md:px-8">
            <div className="mx-auto flex min-w-0 max-w-[1500px] items-center justify-between gap-3">
              <div className="md:hidden">
                <h1 className="text-2xl font-black tracking-tight">
                  WASH<span className="text-red-500">APP</span>
                </h1>

                <p className="mt-1 text-[8px] font-semibold tracking-[0.2em] text-zinc-500">
                  SMART WASH MANAGEMENT
                </p>
              </div>

              <div className="hidden max-w-xl flex-1 md:block">
                <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-[#111923] px-4 py-3 text-sm text-zinc-500">
                  <span className="text-xl">⌕</span>
                  <span>Cari pelanggan...</span>
                </div>
              </div>

              <div className="flex items-center gap-2 sm:gap-3">
               {isOwner && ( 
		<button
                  type="button"
                  aria-label="Notifikasi"
                  className="relative flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-[#111923] text-xl"
                >
                  🔔

                  <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-black">
                    3
                  </span>
                </button>
		)}

                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-slate-500 to-slate-800 text-lg font-black">
                    {displayName.charAt(0).toUpperCase()}
                  </div>

                  <div className="hidden sm:block">
                    <p className="max-w-[130px] truncate text-sm font-bold">
                      {loadingUser ? "..." : displayName}
                    </p>

                    <span className="rounded-full bg-red-600 px-2.5 py-1 text-[9px] font-black">
                      {isOwner ? "OWNER" : "KARYAWAN"}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={openLogoutModal}
                  aria-label="Keluar"
                  className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-[#111923] text-xl text-zinc-300 transition hover:border-red-500 hover:text-red-500"
                >
                  ⇥
                </button>
              </div>
            </div>
          </header>

          {/* DASHBOARD */}
          <div className="mx-auto max-w-[1500px] px-4 py-5 sm:px-5 sm:py-6 md:px-8 md:py-8">
            {/* WELCOME */}
            <section className="mb-6">
              <div className="flex flex-wrap items-center gap-3">
                <div>
                  <p className="text-sm text-zinc-400">
                    Selamat Datang,
                  </p>

                  <h2 className="mt-1 text-2xl font-black capitalize sm:text-3xl md:text-4xl">
                    {loadingUser ? "..." : displayName}
                  </h2>
                </div>

                <span className="rounded-full bg-red-600 px-3 py-1.5 text-[10px] font-black">
                  {isOwner ? "OWNER" : "KASIR"}
                </span>

                {/* STATUS DI SAMPING KASIR */}
                <div className="flex items-center gap-2 rounded-full border border-green-500/20 bg-green-500/5 px-3 py-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-green-400 shadow-[0_0_12px_rgba(74,222,128,0.7)]" />

                  <span className="text-xs font-bold text-green-400">
                    Sistem Aktif
                  </span>
                </div>
              </div>

              <p className="mt-3 text-sm text-zinc-500 sm:text-base">
                Siap melayani pelanggan dengan cepat dan akurat.
              </p>
            </section>

            {/* STATISTIK DASHBOARD */}
            <section className="mb-6 grid grid-cols-3 gap-2 sm:gap-3 md:grid-cols-3">
              {/* KENDARAAN */}
              <div
                className="min-w-0 rounded-2xl border border-white/10 bg-gradient-to-br from-[#151d27] to-[#0c1118] p-3 sm:p-4"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-600/20 text-lg sm:h-11 sm:w-11 sm:text-2xl">
                  🏍️
                </div>

                <p className="mt-3 truncate text-lg font-black sm:text-2xl">
                  {loadingStats
                    ? "..."
                    : stats.vehiclesToday ?? "-"}
                </p>

                <p className="mt-1 text-[11px] font-bold leading-4 sm:text-sm">
                  Kendaraan Hari Ini
                </p>

                <p className="mt-1 hidden text-[11px] leading-5 text-zinc-500 sm:block">
                  Total kendaraan yang dicuci hari ini
                </p>
              </div>

              {/* PENDAPATAN */}
              <div
                className="min-w-0 rounded-2xl border border-white/10 bg-gradient-to-br from-[#151d27] to-[#0c1118] p-3 sm:p-4"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-600/20 text-lg sm:h-11 sm:w-11 sm:text-2xl">
                  💰
                </div>

                <p className="mt-3 truncate text-base font-black sm:text-xl md:text-2xl">
                  {loadingStats
                    ? "..."
                    : formatRupiah(stats.revenueToday)}
                </p>

                <p className="mt-1 text-[11px] font-bold leading-4 sm:text-sm">
                  Pendapatan Hari Ini
                </p>

                <p className="mt-1 hidden text-[11px] leading-5 text-zinc-500 sm:block">
                  Total pendapatan transaksi hari ini
                </p>
              </div>

              {/* TRANSAKSI MINGGU INI */}
              <div
                className="min-w-0 rounded-2xl border border-white/10 bg-gradient-to-br from-[#151d27] to-[#0c1118] p-3 sm:p-4"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-600/20 text-lg sm:h-11 sm:w-11 sm:text-2xl">
                  🧾
                </div>

                <p className="mt-3 truncate text-lg font-black sm:text-2xl">
                  {loadingStats
                    ? "..."
                    : stats.weeklyTransactions ?? "-"}
                </p>

                <p className="mt-1 text-[11px] font-bold leading-4 sm:text-sm">
                  Total Transaksi Bulan Ini
                </p>

                <p className="mt-1 hidden text-[11px] leading-5 text-zinc-500 sm:block">
                  Jumlah transaksi selama bulan berjalan
                </p>
              </div>
            </section>

            {/* BANNER SCAN */}
            <section className="mb-6">
              <Link
                href="/cuci"
                className="group relative block overflow-hidden rounded-3xl border border-red-700/70 bg-gradient-to-r from-red-950 via-red-900 to-[#17090d] p-5 transition hover:border-red-500 sm:p-6 md:p-8"
              >
                <div className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full bg-red-500/20 blur-3xl" />

                <div className="relative flex flex-col gap-5 sm:gap-6 md:flex-row md:items-center md:justify-between">
                  <div className="flex min-w-0 items-start gap-4 sm:gap-5">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-red-500 text-2xl shadow-lg shadow-red-950/40 sm:h-16 sm:w-16 sm:text-3xl md:h-20 md:w-20 md:text-4xl">
                      📷
                    </div>

                    <div className="min-w-0">
                      <p className="text-xs font-black tracking-[0.25em] text-red-300">
                        TRANSAKSI BARU
                      </p>

                      <h2 className="mt-2 text-xl font-black sm:text-2xl md:text-3xl">
                        SCAN KENDARAAN
                      </h2>

                      <p className="mt-2 max-w-xl text-sm leading-6 text-red-100/75">
                        Identifikasi motor atau mobil dan tampilkan harga rekomendasi.
                      </p>

                      <p className="mt-4 text-xs font-bold text-red-200">
                        Scan dengan AI atau manual
                      </p>
                    </div>
                  </div>

                  <span className="flex w-fit items-center gap-3 rounded-full bg-white px-6 py-3 text-sm font-black text-red-700 transition group-hover:bg-red-100">
                    MULAI SCAN
                    <span className="text-xl">→</span>
                  </span>
                </div>
              </Link>
            </section>

            {/* MENU UTAMA */}
            <section className="mb-6">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-xl font-black">
                  Menu Utama
                </h3>

                <span className="text-xs text-zinc-500">
                  Akses cepat
                </span>
              </div>

              <div className="grid gap-3 sm:gap-4 md:grid-cols-2">
                <Link
                  href="/cuci"
                  className="flex min-w-0 items-center justify-between rounded-2xl border border-white/10 bg-[#111923] p-4 transition hover:border-red-600/50 hover:bg-[#151f2b] sm:p-5"
                >
                  <div className="flex min-w-0 items-center gap-3 sm:gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-red-600/20 text-2xl">
                      💧
                    </div>

                    <div>
                      <h4 className="font-black">
                        CUCI
                      </h4>

                      <p className="mt-1 text-sm text-zinc-500">
                        Transaksi kendaraan
                      </p>
                    </div>
                  </div>

                  <span className="ml-2 shrink-0 text-xl text-zinc-400 sm:text-2xl">
                    →
                  </span>
                </Link>

                <Link
                  href="/riwayat"
                  className="flex min-w-0 items-center justify-between rounded-2xl border border-white/10 bg-[#111923] p-4 transition hover:border-red-600/50 hover:bg-[#151f2b] sm:p-5"
                >
                  <div className="flex min-w-0 items-center gap-3 sm:gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-purple-600/20 text-2xl">
                      🧾
                    </div>

                    <div>
                      <h4 className="font-black">
                        RIWAYAT
                      </h4>

                      <p className="mt-1 text-sm text-zinc-500">
                        Transaksi sebelumnya
                      </p>
                    </div>
                  </div>

                  <span className="ml-2 shrink-0 text-xl text-zinc-400 sm:text-2xl">
                    →
                  </span>
                </Link>

                <Link
                  href="/hasil"
                  className="flex min-w-0 items-center justify-between rounded-2xl border border-white/10 bg-[#111923] p-4 transition hover:border-red-600/50 hover:bg-[#151f2b] sm:p-5"
                >
                  <div className="flex min-w-0 items-center gap-3 sm:gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-orange-600/20 text-2xl">
                      📈
                    </div>

                    <div>
                      <h4 className="font-black">
                        HASIL
                      </h4>

                      <p className="mt-1 text-sm text-zinc-500">
                        Hasil karyawan
                      </p>
                    </div>
                  </div>

                  <span className="ml-2 shrink-0 text-xl text-zinc-400 sm:text-2xl">
                    →
                  </span>
                </Link>

                <button
                  type="button"
                  onClick={goToOwner}
                  className="flex min-w-0 items-center justify-between rounded-2xl border border-white/10 bg-[#111923] p-4 text-left transition hover:border-red-600/50 hover:bg-[#151f2b] sm:p-5"
                >
                  <div className="flex min-w-0 items-center gap-3 sm:gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-pink-600/20 text-2xl">
                      👥
                    </div>

                    <div>
                      <h4 className="font-black">
                        OWNER
                      </h4>

                      <p className="mt-1 text-sm text-zinc-500">
                        Dashboard pemilik
                      </p>
                    </div>
                  </div>

                  <span className="ml-2 shrink-0 text-xl text-zinc-400 sm:text-2xl">
                    →
                  </span>
                </button>
              </div>
            </section>

            {/* INFORMASI BAWAH */}
            <section className="grid gap-4 lg:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-[#0d141c] p-5">
                <div className="mb-5 flex items-center justify-between">
                  <h3 className="font-black">
                    Transaksi Terbaru
                  </h3>

                  <Link
                    href="/riwayat"
                    className="text-xs font-bold text-red-500 hover:text-red-400"
                  >
                    Lihat Semua →
                  </Link>
                </div>

                <div className="rounded-xl border border-dashed border-white/10 bg-[#111923] p-5 text-center">
                  <div className="text-3xl">
                    🧾
                  </div>

                  <p className="mt-3 text-sm font-bold text-zinc-300">
                    Data transaksi tersedia di menu Riwayat
                  </p>

                  <p className="mt-1 text-xs leading-5 text-zinc-500">
                    Buka menu Riwayat untuk melihat transaksi yang sudah tersimpan.
                  </p>
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-[#0d141c] p-5">
                <div className="mb-5 flex items-center justify-between">
                  <h3 className="font-black">
                    Rekap Hari Ini
                  </h3>

                  <span className="text-xl text-red-500">
                    ▥
                  </span>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-white/10 pb-3">
                    <span className="text-sm text-zinc-400">
                      Kendaraan Hari Ini
                    </span>

                    <span className="text-sm font-bold">
                      {loadingStats
                        ? "..."
                        : stats.vehiclesToday ?? "-"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between border-b border-white/10 pb-3">
                    <span className="text-sm text-zinc-400">
                      Pendapatan Hari Ini
                    </span>

                    <span className="text-sm font-bold">
                      {loadingStats
                        ? "..."
                        : formatRupiah(stats.revenueToday)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between border-b border-white/10 pb-3">
                    <span className="text-sm text-zinc-400">
                      Karyawan Aktif
                    </span>

                    <span className="text-sm font-bold">
                      {loadingStats
                        ? "..."
                        : stats.activeEmployees ?? "-"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-zinc-400">
                      Transaksi Bulan Ini
                    </span>

                    <span className="text-sm font-bold">
                      {loadingStats
                        ? "..."
                        : stats.weeklyTransactions ?? "-"}
                    </span>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </section>
      </div>

      {/* NAVIGASI HP */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/10 bg-[#080c11]/95 px-2 pb-2 pt-2 backdrop-blur-xl md:hidden">
        <div className="mx-auto grid max-w-md grid-cols-5">
          <Link
            href="/"
            className="flex flex-col items-center gap-1 rounded-xl py-2 text-red-500"
          >
            <span className="text-xl">⌂</span>

            <span className="text-[10px] font-black">
              Beranda
            </span>
          </Link>

          <Link
            href="/cuci"
            className="flex flex-col items-center gap-1 rounded-xl py-2 text-zinc-500 transition active:text-red-500"
          >
            <span className="text-xl">💧</span>

            <span className="text-[10px] font-bold">
              Cuci
            </span>
          </Link>

          <Link
            href="/riwayat"
            className="flex flex-col items-center gap-1 rounded-xl py-2 text-zinc-500 transition active:text-red-500"
          >
            <span className="text-xl">🧾</span>

            <span className="text-[10px] font-bold">
              Riwayat
            </span>
          </Link>

          <Link
            href="/hasil"
            className="flex flex-col items-center gap-1 rounded-xl py-2 text-zinc-500 transition active:text-red-500"
          >
            <span className="text-xl">📊</span>

            <span className="text-[10px] font-bold">
              Hasil
            </span>
          </Link>

          <Link
            href="/owner/pengaturan"
            className="flex flex-col items-center gap-1 rounded-xl py-2 text-zinc-500 transition active:text-red-500"
          >
            <span className="text-xl">⚙</span>

            <span className="text-[10px] font-bold">
              Pengaturan
            </span>
          </Link>
        </div>
      </nav>

      {/* MODAL LOGOUT */}
      {showLogoutModal && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 px-5 backdrop-blur-sm"
          onClick={closeLogoutModal}
        >
          <div
            className="w-full max-w-sm rounded-3xl border border-white/10 bg-[#0d141c] p-6 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-600/15 text-3xl">
                ⇥
              </div>
            </div>

            <div className="mt-5 text-center">
              <h2 className="text-xl font-black">
                KONFIRMASI LOGOUT
              </h2>

              <p className="mt-2 text-sm leading-6 text-zinc-400">
                Apakah Anda yakin ingin keluar dari aplikasi?
              </p>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={closeLogoutModal}
                disabled={loggingOut}
                className="rounded-2xl border border-white/10 bg-[#151d27] px-4 py-4 text-sm font-black text-zinc-300 transition hover:bg-[#202b38] disabled:opacity-50"
              >
                BATAL
              </button>

              <button
                type="button"
                onClick={handleLogout}
                disabled={loggingOut}
                className="rounded-2xl bg-red-600 px-4 py-4 text-sm font-black text-white transition hover:bg-red-700 disabled:opacity-60"
              >
                {loggingOut ? "KELUAR..." : "LOGOUT"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}