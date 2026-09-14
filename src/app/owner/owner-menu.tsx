import Link from "next/link";

export default function OwnerMenu() {
  return (
    <section className="mt-6">
      <p className="text-xs font-bold tracking-widest text-red-500">
        MENU OPERASIONAL
      </p>

      <div className="mt-3 grid grid-cols-2 gap-3">
        <Link
          href="/cuci"
          className="rounded-2xl bg-red-600 p-4 text-center font-black text-white"
        >
          CUCI
        </Link>

        <Link
          href="/riwayat"
          className="rounded-2xl bg-zinc-900 p-4 text-center font-black text-white"
        >
          RIWAYAT
        </Link>

        <Link
          href="/hasil"
          className="rounded-2xl bg-zinc-900 p-4 text-center font-black text-white"
        >
          HASIL
        </Link>

        <Link
          href="/owner/pengeluaran"
          className="rounded-2xl bg-zinc-900 p-4 text-center font-black text-white"
        >
          PENGELUARAN
        </Link>
      </div>
    </section>
  );
}