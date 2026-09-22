"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiGet, apiPost } from "@/lib/api-client";

type Expense = {
  id: number;
  expenseNumber: string;
  expenseDate: string;
  category: string;
  description: string | null;
  amount: number;
  createdBy?: {
    name: string;
    username: string;
  };
};

const categories = [
  ["LISTRIK", "Listrik"],
  ["AIR", "Air"],
  ["CHEMICAL_SABUN", "Chemical / Sabun"],
  ["PERAWATAN_ALAT", "Perawatan Alat"],
  ["PERLENGKAPAN", "Perlengkapan"],
  ["SEWA", "Sewa"],
  ["GAJI_UPAH", "Gaji / Upah"],
  ["OPERASIONAL", "Operasional"],
  ["LAINNYA", "Lainnya"],
];

function rupiah(value: number) {
  return `Rp${value.toLocaleString("id-ID")}`;
}

function categoryLabel(category: string) {
  const found = categories.find(([value]) => value === category);

  return found?.[1] ?? category;
}

export default function PengeluaranPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [expenseDate, setExpenseDate] = useState("");
  const [category, setCategory] = useState("OPERASIONAL");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");

  async function loadExpenses() {
    try {
      const response = await apiGet("/api/expenses");
      const data = await response.json();

      if (data.success) {
        setExpenses(data.expenses);
      } else {
        alert(data.error ?? "Gagal mengambil pengeluaran");
      }
    } catch {
      alert("Gagal menghubungi server");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadExpenses();
  }, []);

  async function saveExpense() {
    const nominal = Number(amount);

    if (!expenseDate) {
      alert("Tanggal wajib diisi");
      return;
    }

    if (!Number.isInteger(nominal) || nominal <= 0) {
      alert("Nominal harus lebih dari Rp0");
      return;
    }

    setSaving(true);

    try {
      const response = await apiPost("/api/expenses", {
  // PERTAHANKAN SELURUH ISI object yang sekarang
});

      const data = await response.json();

      if (!response.ok || !data.success) {
        alert(data.error ?? "Gagal menyimpan pengeluaran");
        return;
      }

      alert("Pengeluaran berhasil disimpan");

      setDescription("");
      setAmount("");

      await loadExpenses();
    } catch {
      alert("Gagal menghubungi server");
    } finally {
      setSaving(false);
    }
  }

  const total = expenses.reduce(
    (sum, expense) => sum + expense.amount,
    0,
  );

  return (
    <main className="min-h-screen bg-[#05080d] text-white">
      <div className="mx-auto min-h-screen max-w-3xl px-4 pb-10 sm:px-6 lg:px-8">
        {/* HEADER */}
        <header className="border-b border-white/10 py-5">
          <div className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <Link
                href="/owner"
                aria-label="Kembali ke menu Owner"
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-[#111923] text-2xl text-white transition hover:border-red-500 hover:bg-red-950/30"
              >
                ←
              </Link>

              <div className="min-w-0">
                <p className="text-[10px] font-black tracking-[0.25em] text-red-500 sm:text-xs">
                  OWNER
                </p>

                <h1 className="truncate text-xl font-black tracking-tight sm:text-2xl">
                  PENGELUARAN
                </h1>
              </div>
            </div>

            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-slate-500 to-slate-800 text-lg font-black">
              D
            </div>
          </div>
        </header>

        {/* JUDUL HALAMAN */}
        <section className="mt-6">
          <p className="text-xs font-black tracking-[0.25em] text-red-500">
            KEUANGAN USAHA
          </p>

          <h2 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">
            Kelola Pengeluaran
          </h2>

          <p className="mt-2 text-sm leading-6 text-zinc-400 sm:text-base">
            Catat dan pantau seluruh pengeluaran operasional usaha
            .
          </p>
        </section>

        {/* RINGKASAN TOTAL */}
        <section className="mt-6 rounded-[2rem] border border-red-900/60 bg-gradient-to-br from-[#3b0b13] via-[#220b13] to-[#10151e] p-5 shadow-xl shadow-red-950/20 sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-black tracking-[0.2em] text-red-200">
                TOTAL PENGELUARAN
              </p>

              <p className="mt-3 break-words text-3xl font-black text-white sm:text-4xl">
                {rupiah(total)}
              </p>

              <p className="mt-2 text-sm text-red-100/70">
                Akumulasi 100 pengeluaran terakhir
              </p>
            </div>

            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-red-500/20 text-3xl sm:h-16 sm:w-16">
              💰
            </div>
          </div>
        </section>

        {/* FORM TAMBAH PENGELUARAN */}
        <section className="mt-5 rounded-[2rem] border border-white/10 bg-[#10161e] p-5 sm:p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-950/80 text-2xl">
              🧾
            </div>

            <div>
              <p className="text-xs font-black tracking-[0.2em] text-red-500">
                TAMBAH DATA
              </p>

              <h3 className="mt-1 text-xl font-black sm:text-2xl">
                Catat Pengeluaran
              </h3>
            </div>
          </div>

          <div className="mt-6">
            <label className="block text-xs font-black tracking-widest text-zinc-400">
              TANGGAL
            </label>

            <input
              type="date"
              value={expenseDate}
              onChange={(e) => setExpenseDate(e.target.value)}
              className="mt-2 w-full rounded-2xl border border-white/10 bg-[#070a0e] px-4 py-3.5 text-white outline-none transition focus:border-red-500 focus:ring-1 focus:ring-red-500"
            />
          </div>

          <div className="mt-4">
            <label className="block text-xs font-black tracking-widest text-zinc-400">
              KATEGORI
            </label>

            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="mt-2 w-full rounded-2xl border border-white/10 bg-[#070a0e] px-4 py-3.5 text-white outline-none transition focus:border-red-500 focus:ring-1 focus:ring-red-500"
            >
              {categories.map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <div className="mt-4">
            <label className="block text-xs font-black tracking-widest text-zinc-400">
              NOMINAL
            </label>

            <div className="relative mt-2">
              <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-zinc-500">
                Rp
              </span>

              <input
                type="number"
                min="1"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Contoh: 50000"
                className="w-full rounded-2xl border border-white/10 bg-[#070a0e] py-3.5 pl-11 pr-4 text-white outline-none transition placeholder:text-zinc-600 focus:border-red-500 focus:ring-1 focus:ring-red-500"
              />
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-xs font-black tracking-widest text-zinc-400">
              KETERANGAN
            </label>

            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Contoh: Beli sabun cuci"
              rows={3}
              className="mt-2 w-full resize-none rounded-2xl border border-white/10 bg-[#070a0e] px-4 py-3.5 text-white outline-none transition placeholder:text-zinc-600 focus:border-red-500 focus:ring-1 focus:ring-red-500"
            />
          </div>

          <button
            type="button"
            onClick={saveExpense}
            disabled={saving}
            className="mt-5 flex w-full items-center justify-center gap-3 rounded-2xl bg-red-600 px-5 py-4 text-sm font-black text-white transition hover:bg-red-500 disabled:cursor-not-allowed disabled:bg-zinc-800 disabled:text-zinc-500 sm:text-base"
          >
            {saving ? (
              <>
                <span className="animate-pulse">●</span>
                MENYIMPAN...
              </>
            ) : (
              <>
                SIMPAN PENGELUARAN
                <span className="text-xl">→</span>
              </>
            )}
          </button>
        </section>

        {/* RIWAYAT PENGELUARAN */}
        <section className="mt-6">
          <div className="flex items-end justify-between gap-3">
            <div>
              <p className="text-xs font-black tracking-[0.25em] text-red-500">
                DATA TRANSAKSI
              </p>

              <h3 className="mt-1 text-2xl font-black sm:text-3xl">
                Riwayat Pengeluaran
              </h3>
            </div>

            <span className="rounded-full border border-white/10 bg-[#111923] px-3 py-1 text-xs font-bold text-zinc-400">
              {expenses.length} Data
            </span>
          </div>

          {loading ? (
            <div className="mt-4 rounded-3xl border border-white/10 bg-[#10161e] p-8 text-center">
              <div className="text-3xl">⏳</div>

              <p className="mt-3 text-sm font-bold text-zinc-400">
                MEMUAT DATA PENGELUARAN...
              </p>
            </div>
          ) : expenses.length === 0 ? (
            <div className="mt-4 rounded-3xl border border-dashed border-white/15 bg-[#10161e] p-8 text-center">
              <div className="text-4xl">🧾</div>

              <p className="mt-3 font-black">
                BELUM ADA PENGELUARAN
              </p>

              <p className="mt-2 text-sm text-zinc-500">
                Data pengeluaran yang disimpan akan muncul di sini.
              </p>
            </div>
          ) : (
            <div className="mt-4 space-y-3">
              {expenses.map((expense) => (
                <div
                  key={expense.id}
                  className="rounded-3xl border border-white/10 bg-[#10161e] p-4 transition hover:border-red-900/70 sm:p-5"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-red-950/80 text-2xl">
                      💸
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="text-xs font-black tracking-wider text-red-400">
                          {categoryLabel(expense.category).toUpperCase()}
                        </p>

                        <p className="whitespace-nowrap text-base font-black text-red-400 sm:text-lg">
                          {rupiah(expense.amount)}
                        </p>
                      </div>

                      <p className="mt-2 break-words font-bold text-white">
                        {expense.description || "-"}
                      </p>

                      <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-zinc-500">
                        <span>{expense.expenseNumber}</span>

                        <span>
                          {new Date(
                            expense.expenseDate,
                          ).toLocaleDateString("id-ID")}
                        </span>
                      </div>

                      {expense.createdBy && (
                        <p className="mt-2 text-xs text-zinc-600">
                          Dicatat oleh: {expense.createdBy.name}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* KEMBALI KE OWNER */}
        <div className="mt-8">
          <Link
            href="/owner"
            className="flex w-full items-center justify-center gap-2 rounded-2xl border border-white/10 bg-[#111923] px-5 py-4 text-sm font-black text-zinc-300 transition hover:border-red-500 hover:bg-red-950/20 hover:text-white"
          >
            ← KEMBALI KE MENU OWNER
          </Link>
        </div>
      </div>
    </main>
  );
}