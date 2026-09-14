"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

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

        const response = await fetch("/api/owner/wash-prices", {
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
    const response = await fetch("/api/owner/wash-prices", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        category: category.category,
        price: numericPrice,
      }),
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
    <main className="min-h-screen bg-black text-white">
      <div className="mx-auto min-h-screen max-w-md bg-black px-5 pb-10">
        <header className="border-b border-red-900/40 py-6">
          <div className="flex items-center gap-3">
            <Link
              href="/owner/pengaturan"
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-800 bg-zinc-950 text-xl text-white transition active:scale-[0.95]"
              aria-label="Kembali ke pengaturan Owner"
            >
              ←
            </Link>

            <div>
              <p className="text-xs font-bold tracking-widest text-red-500">
                OWNER
              </p>

              <h1 className="text-2xl font-black">HARGA CUCI</h1>

              <p className="mt-1 text-xs text-zinc-500">
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

            <h2 className="mt-1 text-xl font-black">
              Harga Saat Ini
            </h2>

            <p className="mt-1 text-xs leading-5 text-zinc-500">
              Harga di bawah ini adalah kategori utama yang digunakan
              pada kasir CUCI.
            </p>
          </div>

          {loading && (
            <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5 text-center">
              <p className="text-sm font-bold text-zinc-400">
                Memuat harga...
              </p>
            </div>
          )}

          {!loading && error && (
            <div className="rounded-2xl border border-red-900/50 bg-red-950/20 p-5">
              <p className="text-xs font-bold tracking-widest text-red-500">
                ERROR
              </p>

              <p className="mt-2 text-sm font-bold text-red-400">
                {error}
              </p>
            </div>
          )}

          {!loading && !error && categories.length === 0 && (
            <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5 text-center">
              <p className="text-sm font-bold text-zinc-400">
                Data harga belum tersedia.
              </p>
            </div>
          )}

          {!loading && !error && categories.length > 0 && (
            <div className="space-y-3">
              {categories.map((category) => {
                const isEditing = editingId === category.id;

                return (
                  <div
                    key={category.id}
                    className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <p className="text-sm font-black text-white">
                          {category.category.toUpperCase()}
                        </p>

                        <p className="mt-1 text-xs leading-5 text-zinc-500">
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
                          className="mb-2 block text-xs font-bold tracking-widest text-zinc-500"
                        >
                          HARGA BARU
                        </label>

                        <div className="flex items-center rounded-xl border border-zinc-700 bg-black px-4">
                          <span className="mr-2 text-sm font-bold text-zinc-500">
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
                            className="rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-xs font-black text-zinc-400 transition active:scale-[0.98]"
                          >
                            BATAL
                          </button>

                          <button
                            type="button"
                            onClick={saveEdit}
                            className="rounded-xl border border-red-900/50 bg-red-950/20 px-4 py-3 text-xs font-black text-red-400 transition active:scale-[0.98]"
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
                          className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-xs font-black text-white transition active:scale-[0.98]"
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

        <section className="mt-5">
          <div className="rounded-2xl border border-red-900/40 bg-red-950/10 p-5">
            <p className="text-xs font-bold tracking-widest text-red-500">
              CATATAN
            </p>

            <p className="mt-2 text-xs leading-5 text-zinc-500">
              Harga ditampilkan langsung dari database. Penyimpanan
              perubahan harga akan diaktifkan pada tahap berikutnya.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}