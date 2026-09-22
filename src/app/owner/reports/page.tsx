"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { apiGet } from "@/lib/api-client";

type Period = "daily" | "weekly" | "monthly";

type Transaction = {
  id: number;
  transactionNumber: string;
  licensePlateSnapshot: string | null;
  brandSnapshot: string | null;
  modelSnapshot: string | null;
  categorySnapshot: string;
  vehicleType: "MOTOR" | "MOBIL";
  price: number;
  employeeResult: number;
  employeeId: number | null;
  createdAt: string;
};

type EmployeeResult = {
  employeeId: number;
  name: string;
  username: string;
  totalVehicles: number;
  motorCount: number;
  mobilCount: number;
  totalResult: number;
};

type Summary = {
  totalVehicles: number;
  revenue: number;
  employeeCompensation: number;
  expenses: number;
  netProfit: number;
  motorCount: number;
  mobilCount: number;
};

type ReportData = {
  date: string;
  summary: Summary;
  employeeResults: EmployeeResult[];
  transactions: Transaction[];
};

type PeriodSummary = {
  date: string;
  totalVehicles: number;
  revenue: number;
  expenses: number;
  employeeCompensation: number;
  netProfit: number;
  motorCount: number;
  mobilCount: number;
};

function getToday() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Jakarta",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

function formatRupiah(value: number) {
  return `Rp${Number(value || 0).toLocaleString("id-ID")}`;
}

function formatNumber(value: number) {
  return Number(value || 0).toLocaleString("id-ID");
}

function formatDateLong(dateString: string) {
  const [year, month, day] = dateString.split("-").map(Number);

  return new Date(year, month - 1, day).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatShortDate(dateString: string) {
  const [year, month, day] = dateString.split("-");

  return `${day}/${month}`;
}

function formatTime(dateString: string) {
  return new Date(dateString).toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function parseDate(dateString: string) {
  const [year, month, day] = dateString.split("-").map(Number);

  return new Date(Date.UTC(year, month - 1, day));
}

function formatDateInput(date: Date) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "UTC",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

function addDays(dateString: string, amount: number) {
  const date = parseDate(dateString);
  date.setUTCDate(date.getUTCDate() + amount);

  return formatDateInput(date);
}

function getStartOfMonth(dateString: string) {
  const [year, month] = dateString.split("-").map(Number);

  return `${year}-${String(month).padStart(2, "0")}-01`;
}

function getEndOfMonth(dateString: string) {
  const [year, month] = dateString.split("-").map(Number);

  const lastDay = new Date(Date.UTC(year, month, 0)).getUTCDate();

  return `${year}-${String(month).padStart(2, "0")}-${String(lastDay).padStart(
    2,
    "0",
  )}`;
}

function getPercentage(value: number, total: number) {
  if (!total || total <= 0) return 0;

  return Math.round((value / total) * 100);
}

function emptySummary(): Summary {
  return {
    totalVehicles: 0,
    revenue: 0,
    employeeCompensation: 0,
    expenses: 0,
    netProfit: 0,
    motorCount: 0,
    mobilCount: 0,
  };
}

function mergeReports(reports: ReportData[]): ReportData {
  const summary = reports.reduce(
    (result, report) => {
      result.totalVehicles += report.summary.totalVehicles;
      result.revenue += report.summary.revenue;
      result.employeeCompensation += report.summary.employeeCompensation;
      result.expenses += report.summary.expenses;
      result.netProfit += report.summary.netProfit;
      result.motorCount += report.summary.motorCount;
      result.mobilCount += report.summary.mobilCount;

      return result;
    },
    emptySummary(),
  );

  const employeeMap = new Map<number, EmployeeResult>();

  for (const report of reports) {
    for (const employee of report.employeeResults) {
      const current = employeeMap.get(employee.employeeId);

      if (!current) {
        employeeMap.set(employee.employeeId, {
          ...employee,
        });
      } else {
        current.totalVehicles += employee.totalVehicles;
        current.motorCount += employee.motorCount;
        current.mobilCount += employee.mobilCount;
        current.totalResult += employee.totalResult;
      }
    }
  }

  return {
    date: reports[0]?.date ?? "",
    summary,
    employeeResults: Array.from(employeeMap.values()).sort(
      (a, b) => b.totalResult - a.totalResult,
    ),
    transactions: reports
      .flatMap((report) => report.transactions)
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() -
          new Date(a.createdAt).getTime(),
      ),
  };
}

function toPeriodSummary(report: ReportData): PeriodSummary {
  return {
    date: report.date,
    totalVehicles: report.summary.totalVehicles,
    revenue: report.summary.revenue,
    expenses: report.summary.expenses,
    employeeCompensation: report.summary.employeeCompensation,
    netProfit: report.summary.netProfit,
    motorCount: report.summary.motorCount,
    mobilCount: report.summary.mobilCount,
  };
}

export default function ReportsPage() {
  const [period, setPeriod] = useState<Period>("daily");
  const [selectedDate, setSelectedDate] = useState(getToday());

  const [dailyData, setDailyData] = useState<ReportData | null>(null);
  const [weeklyData, setWeeklyData] = useState<PeriodSummary[]>([]);
  const [monthlyData, setMonthlyData] = useState<PeriodSummary[]>([]);

  const [loading, setLoading] = useState(true);
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [error, setError] = useState("");

  async function fetchReport(date: string): Promise<ReportData | null> {
    try {
      const response = await apiGet(
  `/api/owner/summary?date=${encodeURIComponent(date)}`,
  {
    cache: "no-store",
  },
);
      const result = await response.json();

      if (!response.ok || !result.success) {
        return null;
      }

      return {
        date: result.date ?? date,
        summary: {
          totalVehicles: Number(result.summary?.totalVehicles ?? 0),
          revenue: Number(result.summary?.revenue ?? 0),
          employeeCompensation: Number(
            result.summary?.employeeCompensation ?? 0,
          ),
          expenses: Number(result.summary?.expenses ?? 0),
          netProfit: Number(result.summary?.netProfit ?? 0),
          motorCount: Number(result.summary?.motorCount ?? 0),
          mobilCount: Number(result.summary?.mobilCount ?? 0),
        },
        employeeResults: result.employeeResults ?? [],
        transactions: result.transactions ?? [],
      };
    } catch (error) {
      console.error("FETCH REPORT ERROR:", error);
      return null;
    }
  }

  async function loadDailyReport(date: string) {
    try {
      setLoading(true);
      setError("");

      const report = await fetchReport(date);

      if (!report) {
        setDailyData(null);
        setError("Laporan pada tanggal tersebut belum tersedia.");
        return;
      }

      setDailyData(report);
    } catch (error) {
      console.error("DAILY REPORT ERROR:", error);
      setError("Gagal mengambil laporan harian.");
    } finally {
      setLoading(false);
    }
  }

  async function loadWeeklyAndMonthlyReports(date: string) {
    try {
      setLoadingSummary(true);

      const weeklyDates = Array.from({ length: 7 }, (_, index) =>
        addDays(date, index - 6),
      );

      const weeklyReports = await Promise.all(
        weeklyDates.map((item) => fetchReport(item)),
      );

      setWeeklyData(
        weeklyReports
          .filter((item): item is ReportData => item !== null)
          .map(toPeriodSummary)
          .sort((a, b) => a.date.localeCompare(b.date)),
      );

      const startOfMonth = getStartOfMonth(date);
      const endOfMonth = getEndOfMonth(date);

      const monthDates: string[] = [];
      let currentDate = startOfMonth;

      while (currentDate <= endOfMonth) {
        monthDates.push(currentDate);
        currentDate = addDays(currentDate, 1);
      }

      const monthReports = await Promise.all(
        monthDates.map((item) => fetchReport(item)),
      );

      setMonthlyData(
        monthReports
          .filter((item): item is ReportData => item !== null)
          .map(toPeriodSummary)
          .sort((a, b) => a.date.localeCompare(b.date)),
      );
    } catch (error) {
      console.error("SUMMARY REPORT ERROR:", error);
    } finally {
      setLoadingSummary(false);
    }
  }

  useEffect(() => {
    loadDailyReport(selectedDate);
    loadWeeklyAndMonthlyReports(selectedDate);
  }, [selectedDate]);

  const dailySummary = dailyData?.summary ?? emptySummary();

  const hourlyData = useMemo(() => {
    const hours = Array.from({ length: 24 }, (_, hour) => ({
      hour,
      total: 0,
      vehicles: 0,
    }));

    for (const transaction of dailyData?.transactions ?? []) {
      const hour = new Date(transaction.createdAt).getHours();

      if (hours[hour]) {
        hours[hour].total += Number(transaction.price || 0);
        hours[hour].vehicles += 1;
      }
    }

    return hours.filter((item) => item.vehicles > 0);
  }, [dailyData]);

  const serviceData = useMemo(() => {
    const map = new Map<string, number>();

    for (const transaction of dailyData?.transactions ?? []) {
      const service = transaction.categorySnapshot || "Lainnya";
      map.set(service, (map.get(service) ?? 0) + 1);
    }

    return Array.from(map.entries())
      .map(([label, value]) => ({ label, value }))
      .sort((a, b) => b.value - a.value);
  }, [dailyData]);

  const highestHourlyRevenue = Math.max(
    ...hourlyData.map((item) => item.total),
    1,
  );

  const highestHourlyVehicles = Math.max(
    ...hourlyData.map((item) => item.vehicles),
    1,
  );

  const highestEmployeeResult = Math.max(
    ...(dailyData?.employeeResults ?? []).map(
      (employee) => employee.totalResult,
    ),
    1,
  );

  const weeklyTotals = useMemo(() => {
    return weeklyData.reduce(
      (result, item) => {
        result.totalVehicles += item.totalVehicles;
        result.revenue += item.revenue;
        result.expenses += item.expenses;
        result.employeeCompensation += item.employeeCompensation;
        result.netProfit += item.netProfit;

        return result;
      },
      {
        totalVehicles: 0,
        revenue: 0,
        expenses: 0,
        employeeCompensation: 0,
        netProfit: 0,
      },
    );
  }, [weeklyData]);

  const monthlyTotals = useMemo(() => {
    return monthlyData.reduce(
      (result, item) => {
        result.totalVehicles += item.totalVehicles;
        result.revenue += item.revenue;
        result.expenses += item.expenses;
        result.employeeCompensation += item.employeeCompensation;
        result.netProfit += item.netProfit;

        return result;
      },
      {
        totalVehicles: 0,
        revenue: 0,
        expenses: 0,
        employeeCompensation: 0,
        netProfit: 0,
      },
    );
  }, [monthlyData]);

  const chartData =
    period === "daily"
      ? hourlyData.map((item) => ({
          label: `${String(item.hour).padStart(2, "0")}:00`,
          revenue: item.total,
          vehicles: item.vehicles,
        }))
      : period === "weekly"
        ? weeklyData.map((item) => ({
            label: formatShortDate(item.date),
            revenue: item.revenue,
            vehicles: item.totalVehicles,
          }))
        : monthlyData.map((item) => ({
            label: formatShortDate(item.date),
            revenue: item.revenue,
            vehicles: item.totalVehicles,
          }));

  const highestChartRevenue = Math.max(
    ...chartData.map((item) => item.revenue),
    1,
  );

  return (
    <main className="min-h-screen bg-[#05080d] text-white">
      <div className="mx-auto min-h-screen w-full max-w-[1500px] px-4 pb-12 sm:px-6 lg:px-8">
        {/* HEADER */}
        <header className="border-b border-white/10 py-5">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.25em] text-red-500">
                Wash App
              </p>

              <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">
                Laporan & Statistik
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">
                Pantau pendapatan, kendaraan, pengeluaran, keuntungan,
                dan performa setiap karyawan.
              </p>
            </div>

            <Link
              href="/owner"
              className="inline-flex items-center justify-center rounded-2xl border border-white/10 bg-[#111923] px-5 py-3 text-sm font-bold text-zinc-200 transition hover:border-red-500/50 hover:bg-red-500/10 hover:text-red-300"
            >
              ← Kembali ke Dashboard
            </Link>
          </div>
        </header>

        {/* FILTER */}
        <section className="mt-6 rounded-3xl border border-white/10 bg-[#0b121b] p-4 sm:p-5">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-red-500">
                Periode Laporan
              </p>

              <h2 className="mt-2 text-xl font-black">
                {period === "daily"
                  ? "Laporan Harian"
                  : period === "weekly"
                    ? "Rangkuman 7 Hari Terakhir"
                    : "Rangkuman Bulanan"}
              </h2>

              <p className="mt-1 text-sm text-zinc-500">
                {formatDateLong(selectedDate)}
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="grid grid-cols-3 gap-2 rounded-2xl bg-[#05080d] p-2">
                <button
                  type="button"
                  onClick={() => setPeriod("daily")}
                  className={`rounded-xl px-4 py-3 text-sm font-bold transition ${
                    period === "daily"
                      ? "bg-red-500 text-white shadow-lg shadow-red-500/20"
                      : "text-zinc-400 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  Harian
                </button>

                <button
                  type="button"
                  onClick={() => setPeriod("weekly")}
                  className={`rounded-xl px-4 py-3 text-sm font-bold transition ${
                    period === "weekly"
                      ? "bg-red-500 text-white shadow-lg shadow-red-500/20"
                      : "text-zinc-400 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  7 Hari
                </button>

                <button
                  type="button"
                  onClick={() => setPeriod("monthly")}
                  className={`rounded-xl px-4 py-3 text-sm font-bold transition ${
                    period === "monthly"
                      ? "bg-red-500 text-white shadow-lg shadow-red-500/20"
                      : "text-zinc-400 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  Bulanan
                </button>
              </div>

              <input
                type="date"
                value={selectedDate}
                max={getToday()}
                onChange={(event) => setSelectedDate(event.target.value)}
                className="rounded-2xl border border-white/10 bg-[#111923] px-4 py-3 text-sm font-semibold text-white outline-none transition focus:border-red-500"
              />
            </div>
          </div>
        </section>

        {loading && period === "daily" && (
          <div className="mt-6 rounded-3xl border border-white/10 bg-[#0b121b] p-8 text-center text-zinc-400">
            Memuat laporan harian...
          </div>
        )}

        {error && period === "daily" && !loading && (
          <div className="mt-6 rounded-3xl border border-red-500/30 bg-red-500/10 p-6 text-center text-red-300">
            {error}
          </div>
        )}

        {/* DAILY REPORT */}
        {period === "daily" && !loading && dailyData && (
          <>
            <section className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
              <SummaryCard
                title="Total Kendaraan"
                value={formatNumber(dailySummary.totalVehicles)}
                description={`${dailySummary.motorCount} motor • ${dailySummary.mobilCount} mobil`}
                icon="🏍️"
                color="blue"
              />

              <SummaryCard
                title="Pendapatan"
                value={formatRupiah(dailySummary.revenue)}
                description="Pemasukan pada hari ini"
                icon="💰"
                color="green"
              />

              <SummaryCard
                title="Pengeluaran"
                value={formatRupiah(dailySummary.expenses)}
                description="Biaya operasional hari ini"
                icon="🧾"
                color="orange"
              />

              <SummaryCard
                title="Hasil Karyawan"
                value={formatRupiah(dailySummary.employeeCompensation)}
                description="Pembagian hasil karyawan"
                icon="👥"
                color="purple"
              />

              <SummaryCard
                title="Keuntungan Bersih"
                value={formatRupiah(dailySummary.netProfit)}
                description="Hasil bersih pada hari ini"
                icon="📈"
                color="red"
              />
            </section>

            <section className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
              <MiniCard
                title="Motor"
                value={formatNumber(dailySummary.motorCount)}
                percentage={getPercentage(
                  dailySummary.motorCount,
                  dailySummary.totalVehicles,
                )}
                icon="🏍️"
              />

              <MiniCard
                title="Mobil"
                value={formatNumber(dailySummary.mobilCount)}
                percentage={getPercentage(
                  dailySummary.mobilCount,
                  dailySummary.totalVehicles,
                )}
                icon="🚗"
              />

              <MiniCard
                title="Rata-rata Transaksi"
                value={formatRupiah(
                  dailySummary.totalVehicles > 0
                    ? dailySummary.revenue / dailySummary.totalVehicles
                    : 0,
                )}
                percentage={0}
                icon="🧮"
              />

              <MiniCard
                title="Jumlah Transaksi"
                value={formatNumber(dailyData.transactions.length)}
                percentage={0}
                icon="🧾"
              />

              <MiniCard
                title="Status Operasional"
                value="Normal"
                percentage={100}
                icon="🟢"
              />
            </section>

            <section className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-2">
              <ChartPanel
                title="Pendapatan Per Jam"
                description="Pendapatan berdasarkan jam transaksi."
              >
                {hourlyData.length === 0 ? (
                  <EmptyState text="Belum ada transaksi pada tanggal ini." />
                ) : (
                  <div className="space-y-4">
                    {hourlyData.map((item) => (
                      <div key={item.hour}>
                        <div className="mb-2 flex justify-between gap-3 text-sm">
                          <span className="font-semibold text-zinc-300">
                            {String(item.hour).padStart(2, "0")}:00
                          </span>

                          <span className="font-bold text-emerald-300">
                            {formatRupiah(item.total)}
                          </span>
                        </div>

                        <div className="h-3 overflow-hidden rounded-full bg-[#05080d]">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-red-600 to-red-300 transition-all duration-500"
                            style={{
                              width: `${
                                (item.total / highestHourlyRevenue) * 100
                              }%`,
                            }}
                          />
                        </div>

                        <p className="mt-1 text-xs text-zinc-600">
                          {item.vehicles} kendaraan
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </ChartPanel>

              <ChartPanel
                title="Jumlah Kendaraan Per Jam"
                description="Jumlah kendaraan yang dicuci berdasarkan jam."
              >
                {hourlyData.length === 0 ? (
                  <EmptyState text="Belum ada transaksi pada tanggal ini." />
                ) : (
                  <div className="flex h-64 items-end gap-2 overflow-x-auto rounded-2xl bg-[#05080d] p-4">
                    {hourlyData.map((item) => (
                      <div
                        key={item.hour}
                        className="flex h-full min-w-8 flex-1 flex-col items-center justify-end gap-2"
                      >
                        <span className="text-[10px] font-bold text-zinc-400">
                          {item.vehicles}
                        </span>

                        <div
                          className="w-full rounded-t-lg bg-gradient-to-t from-blue-600 to-cyan-300 transition-all duration-500"
                          style={{
                            height: `${
                              (item.vehicles / highestHourlyVehicles) * 75
                            }%`,
                          }}
                        />

                        <span className="text-[10px] text-zinc-600">
                          {String(item.hour).padStart(2, "0")}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </ChartPanel>
            </section>

            <section className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-2">
              <ChartPanel
                title="Distribusi Layanan"
                description="Layanan yang paling banyak digunakan."
              >
                {serviceData.length === 0 ? (
                  <EmptyState text="Belum ada data layanan." />
                ) : (
                  <div className="space-y-4">
                    {serviceData.map((service, index) => {
                      const percentage = getPercentage(
                        service.value,
                        dailySummary.totalVehicles,
                      );

                      return (
                        <div key={service.label}>
                          <div className="mb-2 flex justify-between gap-3 text-sm">
                            <span className="font-semibold text-zinc-300">
                              {service.label}
                            </span>

                            <span className="text-zinc-400">
                              {service.value} kendaraan
                            </span>
                          </div>

                          <div className="h-3 overflow-hidden rounded-full bg-[#05080d]">
                            <div
                              className={`h-full rounded-full ${
                                index % 4 === 0
                                  ? "bg-red-500"
                                  : index % 4 === 1
                                    ? "bg-orange-400"
                                    : index % 4 === 2
                                      ? "bg-blue-400"
                                      : "bg-purple-400"
                              }`}
                              style={{ width: `${percentage}%` }}
                            />
                          </div>

                          <p className="mt-1 text-xs text-zinc-600">
                            {percentage}% dari total kendaraan
                          </p>
                        </div>
                      );
                    })}
                  </div>
                )}
              </ChartPanel>

              <ChartPanel
                title="Komposisi Kendaraan"
                description="Perbandingan motor dan mobil."
              >
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-2xl border border-blue-400/20 bg-blue-400/5 p-5">
                    <p className="text-sm text-zinc-400">Motor</p>

                    <p className="mt-2 text-3xl font-black text-blue-300">
                      {formatNumber(dailySummary.motorCount)}
                    </p>

                    <p className="mt-2 text-xs text-zinc-500">
                      {getPercentage(
                        dailySummary.motorCount,
                        dailySummary.totalVehicles,
                      )}
                      % dari total
                    </p>
                  </div>

                  <div className="rounded-2xl border border-purple-400/20 bg-purple-400/5 p-5">
                    <p className="text-sm text-zinc-400">Mobil</p>

                    <p className="mt-2 text-3xl font-black text-purple-300">
                      {formatNumber(dailySummary.mobilCount)}
                    </p>

                    <p className="mt-2 text-xs text-zinc-500">
                      {getPercentage(
                        dailySummary.mobilCount,
                        dailySummary.totalVehicles,
                      )}
                      % dari total
                    </p>
                  </div>
                </div>

                <div className="mt-5 h-5 overflow-hidden rounded-full bg-[#05080d]">
                  <div
                    className="h-full bg-blue-500"
                    style={{
                      width: `${getPercentage(
                        dailySummary.motorCount,
                        dailySummary.totalVehicles,
                      )}%`,
                    }}
                  />
                </div>

                <div className="mt-3 flex justify-between text-xs text-zinc-500">
                  <span>Motor</span>
                  <span>Mobil</span>
                </div>
              </ChartPanel>
            </section>

            <EmployeeSection
              employees={dailyData.employeeResults}
              highestResult={highestEmployeeResult}
              totalEmployeeCompensation={
                dailySummary.employeeCompensation
              }
            />

            <TransactionSection transactions={dailyData.transactions} />
          </>
        )}

        {/* WEEKLY REPORT */}
        {period === "weekly" && (
          <>
            <SummaryOverview
              title="Rangkuman 7 Hari Terakhir"
              description="Total hasil selama tujuh hari sampai tanggal yang dipilih."
              totals={weeklyTotals}
              loading={loadingSummary}
            />

            <section className="mt-6 rounded-3xl border border-white/10 bg-[#0b121b] p-5 sm:p-7">
              <SectionHeading
                title="Grafik Pendapatan 7 Hari"
                description="Perbandingan pendapatan setiap hari."
              />

              <SimpleRevenueChart
                data={weeklyData.map((item) => ({
                  label: formatShortDate(item.date),
                  revenue: item.revenue,
                }))}
              />
            </section>

            <section className="mt-6 rounded-3xl border border-white/10 bg-[#0b121b] p-5 sm:p-7">
              <SectionHeading
                title="Rincian 7 Hari Terakhir"
                description="Rangkuman jumlah kendaraan, pendapatan, pengeluaran, dan keuntungan."
              />

              <PeriodTable data={weeklyData} />
            </section>
          </>
        )}

        {/* MONTHLY REPORT */}
        {period === "monthly" && (
          <>
            <SummaryOverview
              title="Rangkuman Bulanan"
              description="Total hasil selama bulan yang dipilih."
              totals={monthlyTotals}
              loading={loadingSummary}
            />

            <section className="mt-6 rounded-3xl border border-white/10 bg-[#0b121b] p-5 sm:p-7">
              <SectionHeading
                title="Grafik Pendapatan Bulanan"
                description="Perbandingan pendapatan setiap tanggal dalam bulan terpilih."
              />

              <SimpleRevenueChart
                data={monthlyData.map((item) => ({
                  label: formatShortDate(item.date),
                  revenue: item.revenue,
                }))}
              />
            </section>

            <section className="mt-6 rounded-3xl border border-white/10 bg-[#0b121b] p-5 sm:p-7">
              <SectionHeading
                title="Rincian Bulanan"
                description="Rangkuman setiap tanggal dalam bulan yang dipilih."
              />

              <PeriodTable data={monthlyData} />
            </section>
          </>
        )}

        <section className="mt-6 rounded-3xl border border-red-500/20 bg-red-500/5 p-5 sm:p-7">
          <h2 className="text-lg font-black text-red-300">
            Rumus Keuntungan Bersih
          </h2>

          <p className="mt-3 text-sm leading-7 text-zinc-300">
            Keuntungan bersih dihitung dari pendapatan dikurangi pengeluaran
            dan hasil pembagian karyawan pada periode yang sama.
          </p>

          <div className="mt-4 rounded-2xl bg-[#05080d] p-4 font-mono text-sm text-emerald-300">
            Keuntungan Bersih = Pendapatan - Pengeluaran - Hasil Karyawan
          </div>
        </section>

        <footer className="py-8 text-center text-xs text-zinc-600">
          Wash App • Bersih Maksimal, Performa Optimal
        </footer>
      </div>
    </main>
  );
}

function SummaryCard({
  title,
  value,
  description,
  icon,
  color,
}: {
  title: string;
  value: string;
  description: string;
  icon: string;
  color: "blue" | "green" | "orange" | "purple" | "red";
}) {
  const colorClasses = {
    blue: "border-blue-500/20 bg-blue-500/5",
    green: "border-emerald-500/20 bg-emerald-500/5",
    orange: "border-orange-500/20 bg-orange-500/5",
    purple: "border-purple-500/20 bg-purple-500/5",
    red: "border-red-500/30 bg-red-500/10",
  };

  return (
    <div
      className={`rounded-3xl border p-5 ${colorClasses[color]}`}
    >
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-zinc-400">
          {title}
        </p>

        <span className="text-2xl">{icon}</span>
      </div>

      <p className="mt-4 break-words text-2xl font-black text-white">
        {value}
      </p>

      <p className="mt-2 text-xs text-zinc-500">
        {description}
      </p>
    </div>
  );
}

function MiniCard({
  title,
  value,
  percentage,
  icon,
}: {
  title: string;
  value: string;
  percentage: number;
  icon: string;
}) {
  return (
    <div className="rounded-3xl border border-white/10 bg-[#0b121b] p-5">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-zinc-400">{title}</p>
        <span className="text-xl">{icon}</span>
      </div>

      <p className="mt-3 text-2xl font-black text-white">
        {value}
      </p>

      {percentage > 0 && (
        <p className="mt-2 text-xs text-zinc-500">
          {percentage}% dari total
        </p>
      )}
    </div>
  );
}

function ChartPanel({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-3xl border border-white/10 bg-[#0b121b] p-5 sm:p-7">
      <SectionHeading title={title} description={description} />
      {children}
    </section>
  );
}

function SectionHeading({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="mb-6">
      <div className="flex items-center gap-3">
        <span className="h-7 w-1 rounded-full bg-red-500" />

        <h2 className="text-xl font-black text-white">
          {title}
        </h2>
      </div>

      <p className="mt-2 text-sm text-zinc-500">
        {description}
      </p>
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="rounded-2xl bg-[#05080d] p-8 text-center text-sm text-zinc-500">
      {text}
    </div>
  );
}

function EmployeeSection({
  employees,
  highestResult,
  totalEmployeeCompensation,
}: {
  employees: EmployeeResult[];
  highestResult: number;
  totalEmployeeCompensation: number;
}) {
  return (
    <section className="mt-6 rounded-3xl border border-white/10 bg-[#0b121b] p-5 sm:p-7">
      <SectionHeading
        title="Hasil Setiap Karyawan"
        description="Performa setiap akun karyawan pada tanggal yang dipilih."
      />

      {employees.length === 0 ? (
        <EmptyState text="Belum ada hasil karyawan pada tanggal ini." />
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {employees.map((employee) => {
            const percentage =
              highestResult > 0
                ? (employee.totalResult / highestResult) * 100
                : 0;

            return (
              <div
                key={employee.employeeId}
                className="rounded-2xl border border-white/10 bg-[#05080d] p-5"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-500/15 text-xl">
                      👤
                    </div>

                    <div>
                      <h3 className="font-bold text-white">
                        {employee.name}
                      </h3>

                      <p className="text-xs text-zinc-500">
                        @{employee.username}
                      </p>
                    </div>
                  </div>

                  <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-300">
                    Karyawan
                  </span>
                </div>

                <div className="mt-5 grid grid-cols-2 gap-3">
                  <div className="rounded-xl bg-white/[0.03] p-3">
                    <p className="text-xs text-zinc-500">
                      Kendaraan
                    </p>

                    <p className="mt-1 text-xl font-black text-white">
                      {formatNumber(employee.totalVehicles)}
                    </p>
                  </div>

                  <div className="rounded-xl bg-white/[0.03] p-3">
                    <p className="text-xs text-zinc-500">
                      Hasil
                    </p>

                    <p className="mt-1 text-lg font-black text-purple-300">
                      {formatRupiah(employee.totalResult)}
                    </p>
                  </div>
                </div>

                <div className="mt-4">
                  <div className="mb-2 flex justify-between text-xs">
                    <span className="text-zinc-500">
                      Perbandingan hasil
                    </span>

                    <span className="text-zinc-300">
                      {Math.round(percentage)}%
                    </span>
                  </div>

                  <div className="h-2 overflow-hidden rounded-full bg-[#111923]">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-purple-600 to-pink-300"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>

                <p className="mt-3 text-xs text-zinc-600">
                  Kontribusi terhadap hasil karyawan:{" "}
                  {getPercentage(
                    employee.totalResult,
                    totalEmployeeCompensation,
                  )}
                  %
                </p>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

function TransactionSection({
  transactions,
}: {
  transactions: Transaction[];
}) {
  return (
    <section className="mt-6 rounded-3xl border border-white/10 bg-[#0b121b] p-5 sm:p-7">
      <SectionHeading
        title="Rincian Transaksi Harian"
        description="Semua transaksi pada tanggal yang dipilih."
      />

      {transactions.length === 0 ? (
        <EmptyState text="Tidak ada transaksi pada tanggal ini." />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-white/10 text-xs uppercase tracking-wider text-zinc-500">
                <th className="px-4 py-4">Jam</th>
                <th className="px-4 py-4">Nomor</th>
                <th className="px-4 py-4">Plat Nomor</th>
                <th className="px-4 py-4">Jenis</th>
                <th className="px-4 py-4">Layanan</th>
                <th className="px-4 py-4">Harga</th>
                <th className="px-4 py-4">Hasil Karyawan</th>
              </tr>
            </thead>

            <tbody>
              {transactions.map((transaction) => (
                <tr
                  key={transaction.id}
                  className="border-b border-white/5 transition hover:bg-white/[0.03]"
                >
                  <td className="px-4 py-4 text-zinc-400">
                    {formatTime(transaction.createdAt)}
                  </td>

                  <td className="px-4 py-4 font-semibold text-white">
                    {transaction.transactionNumber}
                  </td>

                  <td className="px-4 py-4 text-zinc-300">
                    {transaction.licensePlateSnapshot || "-"}
                  </td>

                  <td className="px-4 py-4">
                    <span className="rounded-full bg-blue-500/10 px-3 py-1 text-xs font-bold text-blue-300">
                      {transaction.vehicleType}
                    </span>
                  </td>

                  <td className="px-4 py-4 text-zinc-300">
                    {transaction.categorySnapshot}
                  </td>

                  <td className="px-4 py-4 font-bold text-emerald-300">
                    {formatRupiah(transaction.price)}
                  </td>

                  <td className="px-4 py-4 font-bold text-purple-300">
                    {formatRupiah(transaction.employeeResult)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

function SummaryOverview({
  title,
  description,
  totals,
  loading,
}: {
  title: string;
  description: string;
  totals: {
    totalVehicles: number;
    revenue: number;
    expenses: number;
    employeeCompensation: number;
    netProfit: number;
  };
  loading: boolean;
}) {
  return (
    <>
      <section className="mt-6 rounded-3xl border border-white/10 bg-[#0b121b] p-5 sm:p-7">
        <SectionHeading title={title} description={description} />

        {loading ? (
          <p className="text-sm text-zinc-500">
            Mengumpulkan data laporan...
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
            <SummaryCard
              title="Total Kendaraan"
              value={formatNumber(totals.totalVehicles)}
              description="Jumlah kendaraan"
              icon="🏍️"
              color="blue"
            />

            <SummaryCard
              title="Pendapatan"
              value={formatRupiah(totals.revenue)}
              description="Total pemasukan"
              icon="💰"
              color="green"
            />

            <SummaryCard
              title="Pengeluaran"
              value={formatRupiah(totals.expenses)}
              description="Total biaya"
              icon="🧾"
              color="orange"
            />

            <SummaryCard
              title="Hasil Karyawan"
              value={formatRupiah(totals.employeeCompensation)}
              description="Total pembagian"
              icon="👥"
              color="purple"
            />

            <SummaryCard
              title="Keuntungan Bersih"
              value={formatRupiah(totals.netProfit)}
              description="Keuntungan akhir"
              icon="📈"
              color="red"
            />
          </div>
        )}
      </section>
    </>
  );
}

function SimpleRevenueChart({
  data,
}: {
  data: {
    label: string;
    revenue: number;
  }[];
}) {
  const highestRevenue = Math.max(
    ...data.map((item) => item.revenue),
    1,
  );

  if (data.length === 0) {
    return <EmptyState text="Belum ada data grafik pada periode ini." />;
  }

  return (
    <div className="flex h-72 items-end gap-2 overflow-x-auto rounded-2xl bg-[#05080d] p-4 sm:gap-3">
      {data.map((item) => {
        const height = Math.max(
          (item.revenue / highestRevenue) * 85,
          3,
        );

        return (
          <div
            key={item.label}
            className="flex h-full min-w-7 flex-1 flex-col items-center justify-end gap-2 sm:min-w-9"
          >
            <span className="max-w-20 truncate text-[10px] font-bold text-emerald-300">
              {item.revenue > 0 ? formatRupiah(item.revenue) : "Rp0"}
            </span>

            <div
              className="w-full rounded-t-xl bg-gradient-to-t from-red-600 to-red-300 transition-all duration-500"
              style={{ height: `${height}%` }}
              title={`${item.label}: ${formatRupiah(item.revenue)}`}
            />

            <span className="text-[10px] text-zinc-500">
              {item.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function PeriodTable({
  data,
}: {
  data: PeriodSummary[];
}) {
  if (data.length === 0) {
    return <EmptyState text="Belum ada data laporan pada periode ini." />;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[850px] border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-white/10 text-xs uppercase tracking-wider text-zinc-500">
            <th className="px-4 py-4">Tanggal</th>
            <th className="px-4 py-4">Kendaraan</th>
            <th className="px-4 py-4">Pendapatan</th>
            <th className="px-4 py-4">Pengeluaran</th>
            <th className="px-4 py-4">Karyawan</th>
            <th className="px-4 py-4">Keuntungan Bersih</th>
          </tr>
        </thead>

        <tbody>
          {data.map((item) => (
            <tr
              key={item.date}
              className="border-b border-white/5 transition hover:bg-white/[0.03]"
            >
              <td className="px-4 py-4 font-semibold text-white">
                {formatDateLong(item.date)}
              </td>

              <td className="px-4 py-4 text-zinc-300">
                {formatNumber(item.totalVehicles)}
              </td>

              <td className="px-4 py-4 font-bold text-emerald-300">
                {formatRupiah(item.revenue)}
              </td>

              <td className="px-4 py-4 font-bold text-orange-300">
                {formatRupiah(item.expenses)}
              </td>

              <td className="px-4 py-4 font-bold text-purple-300">
                {formatRupiah(item.employeeCompensation)}
              </td>

              <td className="px-4 py-4 font-bold text-red-300">
                {formatRupiah(item.netProfit)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}