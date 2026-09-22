"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { apiGet, apiFetch } from "@/lib/api-client";

type WashPrice = {
  id: number;
  category: string;
  price: number;
  active: boolean;
};

const categoryOrder = [
  "Motor Kecil",
  "Motor Sedang",
  "Motor Besar",
  "Mobil Kecil",
  "Mobil Besar",
];

const descriptions: Record<string, string> = {
  "Motor Kecil": "Beat, Scoopy, Mio, Vario, dan sejenisnya",
  "Motor Sedang": "Vixion, MegaPro, CBR, NMAX, PCX, dan sejenisnya",
  "Motor Besar": "KLX, XMAX, Ninja 250, Harley-Davidson, dan sejenisnya",
  "Mobil Kecil": "Mobil kecil",
  "Mobil Besar": "Mobil besar",
};

function formatRupiah(value: number) {
  return `Rp${value.toLocaleString("id-ID")}`;
}

export default function HargaCuciPage() {
  const [categories, setCategories] = useState<WashPrice[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editPrice, setEditPrice] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadPrices() {
      try {
        setLoading(true);
        setError("");

        const response = await apiGet("/api/owner/wash-prices", {
          method: "GET",
          cache: "no-store",
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(
            data.error || "Gagal mengambil harga cuci"
          );
        }

        const prices: WashPrice[] = data.prices ?? [];

        const sortedPrices = [...prices].sort(
          (a, b) =>
            categoryOrder.indexOf(a.category) -
            categoryOrder.indexOf(b.category)
        );

        setCategories(sortedPrices);
      } catch (error) {
        console.error("Gagal mengambil harga:", error);

        setError(
          error instanceof Error
            ? error.message
            : "Gagal mengambil harga cuci"
        );
      } finally {
        setLoading(false);
      }
    }

    loadPrices();
  }, []);

  function startEdit(id: number, price: number) {
    setEditingId(id);
    setEditPrice(String(price));
  }

  function cancelEdit() {
    setEditingId(null);
    setEditPrice("");
  }

  async function saveEdit() {
    if (editingId === null) {
      return;
    }

    const category = categories.find(
      (item) => item.id === editingId
    );

    if (!category) {
      alert("Kategori harga tidak ditemukan.");
      return;
    }

    const numericPrice = Number(editPrice);

    if (!Number.isInteger(numericPrice) || numericPrice <= 0) {
      alert("Harga harus berupa angka bulat lebih dari Rp0.");
      return;
    }

    try {
      const response = await apiFetch("/api/owner/wash-prices", {
  method: "PUT",
  json: {
    // PERTAHANKAN SELURUH ISI object yang sekarang
  },
});

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.error || "Gagal menyimpan harga cuci"
        );
      }

      setCategories((current) =>
        current.map((item) =>
          item.id === editingId
            ? {
                ...item,
                price: numericPrice,
              }
            : item
        )
      );

      setEditingId(null);
      setEditPrice("");

      alert(`Harga ${category.category} berhasil disimpan.`);
    } catch (error) {
      console.error("Gagal menyimpan harga:", error);

      alert(
        error instanceof Error
          ? error.message
          : "Gagal menyimpan harga cuci."
      );
    }
  }

  return (
    <main className="min-h-screen bg-[#070b12] text-white">
      <div className="mx-auto min-h-screen max-w-md bg-[#070b12] px-5 pb-10">
        {/* HEADER */}
        <header className="border-b border-red-500/30 py-6">
          <div className="flex items-center gap-3">
            <Link
              href="/owner/pengaturan"
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-red-500/30 bg-gradient-to-br from-[#35121b] to-[#101a29] text-xl text-white shadow-lg shadow-black/20 transition hover:border-red-500/70 active:scale-[0.95]"
              aria-label="Kembali ke pengaturan Owner"
            >
              ←
            </Link>

            <div>
              <p className="text-xs font-bold tracking-widest text-red-500">
                OWNER
              </p>

              <h1 className="text-2xl font-black text-white">
                HARGA CUCI
              </h1>

              <p className="mt-1 text-xs text-slate-400">
                Pengaturan harga 5 kategori kendaraan
              </p>
            </div>
          </div>
        </header>

        <section className="mt-5">
          <div className="mb-3">
            <p className="text-xs font-bold tracking-widest text-red-500">
              TARIF CUCI
            </p>

            <h2 className="mt-1 text-xl font-black text-white">
              Harga Saat Ini
            </h2>

            <p className="mt-1 text-xs leading-5 text-slate-400">
              Harga di bawah ini adalah kategori utama yang digunakan
              pada kasir CUCI.
            </p>
          </div>

          {/* LOADING */}
          {loading && (
            <div className="rounded-2xl border border-red-500/30 bg-gradient-to-br from-[#321018] to-[#101b2a] p-5 text-center shadow-xl shadow-black/20">
              <div className="mx-auto mb-3 h-7 w-7 animate-spin rounded-full border-2 border-slate-700 border-t-red-500" />

              <p className="text-sm font-bold text-slate-400">
                Memuat harga...
              </p>
            </div>
          )}

          {/* ERROR */}
          {!loading && error && (
            <div className="rounded-2xl border border-red-500/50 bg-gradient-to-br from-red-950/70 to-[#101722] p-5">
              <p className="text-xs font-bold tracking-widest text-red-500">
                ERROR
              </p>

              <p className="mt-2 text-sm font-bold text-red-300">
                {error}
              </p>
            </div>
          )}

          {/* EMPTY */}
          {!loading && !error && categories.length === 0 && (
            <div className="rounded-2xl border border-red-500/30 bg-gradient-to-br from-[#321018] to-[#101b2a] p-5 text-center">
              <p className="text-sm font-bold text-slate-400">
                Data harga belum tersedia.
              </p>
            </div>
          )}

          {/* PRICE CARDS */}
          {!loading && !error && categories.length > 0 && (
            <div className="space-y-3">
              {categories.map((category) => {
                const isEditing = editingId === category.id;

                return (
                  <div
                    key={category.id}
                    className="rounded-2xl border border-red-500/35 bg-gradient-to-br from-[#3a1118] via-[#1b121c] to-[#101b2a] p-5 shadow-xl shadow-black/20"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <p className="text-sm font-black text-white">
                          {category.category.toUpperCase()}
                        </p>

                        <p className="mt-1 text-xs leading-5 text-slate-400">
                          {descriptions[category.category] ??
                            "Kategori kendaraan"}
                        </p>
                      </div>

                      {!isEditing && (
                        <div className="shrink-0 text-right">
                          <p className="text-lg font-black text-red-500">
                            {formatRupiah(category.price)}
                          </p>
                        </div>
                      )}
                    </div>

                    {isEditing ? (
                      <div className="mt-4">
                        <label
                          htmlFor={`price-${category.id}`}
                          className="mb-2 block text-xs font-bold tracking-widest text-slate-400"
                        >
                          HARGA BARU
                        </label>

                        <div className="flex items-center rounded-xl border border-red-500/40 bg-[#080d15] px-4 focus-within:border-red-500">
                          <span className="mr-2 text-sm font-bold text-slate-500">
                            Rp
                          </span>

                          <input
                            id={`price-${category.id}`}
                            type="number"
                            min="1"
                            step="1000"
                            value={editPrice}
                            onChange={(event) =>
                              setEditPrice(event.target.value)
                            }
                            className="w-full bg-transparent py-3 text-lg font-black text-white outline-none"
                            autoFocus
                          />
                        </div>

                        <div className="mt-3 grid grid-cols-2 gap-3">
                          <button
                            type="button"
                            onClick={cancelEdit}
                            className="rounded-xl border border-slate-700 bg-[#111925] px-4 py-3 text-xs font-black text-slate-300 transition hover:border-slate-500 hover:bg-[#182333] active:scale-[0.98]"
                          >
                            BATAL
                          </button>

                          <button
                            type="button"
                            onClick={saveEdit}
                            className="rounded-xl border border-red-500/60 bg-gradient-to-r from-red-600 to-red-900 px-4 py-3 text-xs font-black text-white shadow-lg shadow-red-950/30 transition hover:from-red-500 hover:to-red-800 active:scale-[0.98]"
                          >
                            SIMPAN
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="mt-4">
                        <button
                          type="button"
                          onClick={() =>
                            startEdit(category.id, category.price)
                          }
                          className="w-full rounded-xl border border-red-500/30 bg-[#101925] px-4 py-3 text-xs font-black text-white transition hover:border-red-500/70 hover:bg-[#182333] active:scale-[0.98]"
                        >
                          EDIT HARGA
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* NOTE */}
        <section className="mt-5">
          <div className="rounded-2xl border border-red-500/30 bg-gradient-to-br from-[#321018] to-[#101b2a] p-5">
            <p className="text-xs font-bold tracking-widest text-red-500">
              CATATAN
            </p>

            <p className="mt-2 text-xs leading-5 text-slate-400">
              Harga ditampilkan langsung dari database. Perubahan harga
              akan disimpan ke database setelah tombol SIMPAN digunakan.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}