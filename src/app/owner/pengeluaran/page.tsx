"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

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
      const response = await fetch("/api/expenses");
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
      const response = await fetch("/api/expenses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          expenseDate,
          category,
          description,
          amount: nominal,
        }),
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
    0
  );

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="mx-auto min-h-screen max-w-md bg-black px-5 pb-10">

        <header className="border-b border-red-900/40 py-6">
          <div className="flex items-center gap-3">
            <Link
              href="/owner"
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-900 text-xl"
            >
              ←
            </Link>

            <div>
              <p className="text-xs font-bold tracking-widest text-red-500">
                OWNER
              </p>

              <h1 className="text-xl font-black">
                PENGELUARAN
              </h1>
            </div>
          </div>
        </header>

        <section className="mt-5 rounded-2xl border border-zinc-800 bg-zinc-950 p-5">
          <p className="text-xs font-bold tracking-widest text-red-500">
            TAMBAH PENGELUARAN
          </p>

          <h2 className="mt-1 text-xl font-black">
            Catat Pengeluaran
          </h2>

          <label className="mt-5 block text-xs font-bold text-zinc-400">
            TANGGAL
          </label>

          <input
            type="date"
            value={expenseDate}
            onChange={(e) => setExpenseDate(e.target.value)}
            className="mt-2 w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-white outline-none focus:border-red-600"
          />

          <label className="mt-4 block text-xs font-bold text-zinc-400">
            KATEGORI
          </label>

          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="mt-2 w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-white outline-none focus:border-red-600"
          >
            {categories.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>

          <label className="mt-4 block text-xs font-bold text-zinc-400">
            NOMINAL
          </label>

          <input
            type="number"
            min="1"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Contoh: 50000"
            className="mt-2 w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-white outline-none placeholder:text-zinc-600 focus:border-red-600"
          />

          <label className="mt-4 block text-xs font-bold text-zinc-400">
            KETERANGAN
          </label>

          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Contoh: Beli sabun cuci"
            rows={3}
            className="mt-2 w-full resize-none rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-white outline-none placeholder:text-zinc-600 focus:border-red-600"
          />

          <button
            type="button"
            onClick={saveExpense}
            disabled={saving}
            className="mt-5 w-full rounded-xl bg-red-600 px-5 py-4 font-black text-white transition hover:bg-red-500 disabled:bg-zinc-800 disabled:text-zinc-500"
          >
            {saving ? "MENYIMPAN..." : "SIMPAN PENGELUARAN"}
          </button>
        </section>

        <section className="mt-5 rounded-2xl border border-zinc-800 bg-zinc-950 p-5">
          <p className="text-xs font-bold tracking-widest text-red-500">
            RINGKASAN
          </p>

          <p className="mt-2 text-sm text-zinc-500">
            Total 100 pengeluaran terakhir
          </p>

          <p className="mt-1 text-3xl font-black text-red-500">
            {rupiah(total)}
          </p>
        </section>

        <section className="mt-5">
          <p className="text-xs font-bold tracking-widest text-red-500">
            RIWAYAT PENGELUARAN
          </p>

          {loading ? (
            <div className="mt-3 rounded-2xl bg-zinc-950 p-5 text-center text-sm text-zinc-500">
              MEMUAT...
            </div>
          ) : expenses.length === 0 ? (
            <div className="mt-3 rounded-2xl border border-dashed border-zinc-800 bg-zinc-950 p-5 text-center">
              <p className="font-bold">
                BELUM ADA PENGELUARAN
              </p>

              <p className="mt-1 text-sm text-zinc-500">
                Belum ada data pengeluaran.
              </p>
            </div>
          ) : (
            <div className="mt-3 space-y-3">
              {expenses.map((expense) => (
                <div
                  key={expense.id}
                  className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-bold text-red-500">
                        {expense.category}
                      </p>

                      <p className="mt-1 font-bold">
                        {expense.description || "-"}
                      </p>

                      <p className="mt-1 text-xs text-zinc-500">
                        {expense.expenseNumber}
                      </p>

                      <p className="text-xs text-zinc-500">
                        {new Date(
                          expense.expenseDate
                        ).toLocaleDateString("id-ID")}
                      </p>
                    </div>

                    <p className="whitespace-nowrap font-black text-red-500">
                      {rupiah(expense.amount)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

      </div>
    </main>
  );
}