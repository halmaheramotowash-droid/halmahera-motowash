import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/current-user";
import KaryawanClient from "./KaryawanClient";

import { PrismaClient } from "../../../../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

export const dynamic = "force-dynamic";

export default async function KaryawanPage() {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect("/login");
  }

  if (currentUser.role !== "OWNER") {
    redirect("/");
  }

  const employees = await prisma.user.findMany({
    where: {
      role: "KARYAWAN",
      deletedAt: null,
    },
    select: {
      id: true,
      name: true,
      username: true,
      role: true,
      active: true,
      deletedAt: true,
      createdAt: true,
    },
    orderBy: {
      id: "asc",
    },
  });

  const activeEmployees = employees.filter(
    (employee) => employee.active,
  ).length;

  const inactiveEmployees = employees.filter(
    (employee) => !employee.active,
  ).length;

  return (
    <main className="min-h-screen bg-[#05080d] text-white">
      <div className="mx-auto min-h-screen max-w-4xl px-4 pb-10 sm:px-6 lg:px-8">
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
                  KARYAWAN
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
            MANAJEMEN SDM
          </p>

          <h2 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">
            Kelola Karyawan
          </h2>

          <p className="mt-2 text-sm leading-6 text-zinc-400 sm:text-base">
            Kelola akun, status, dan akses karyawan yang terdaftar
            di sistem.
          </p>
        </section>

        {/* RINGKASAN KARYAWAN */}
        <section className="mt-6 grid grid-cols-3 gap-2 sm:gap-3">
          <div className="rounded-3xl border border-white/10 bg-[#111923] p-3 sm:p-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-red-950/80 text-xl sm:h-12 sm:w-12 sm:text-2xl">
              👥
            </div>

            <p className="mt-4 text-2xl font-black sm:text-3xl">
              {employees.length}
            </p>

            <p className="mt-1 text-[11px] leading-4 text-zinc-400 sm:text-sm">
              Total
              <br />
              Karyawan
            </p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-[#111923] p-3 sm:p-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-green-950/80 text-xl sm:h-12 sm:w-12 sm:text-2xl">
              ✓
            </div>

            <p className="mt-4 text-2xl font-black text-green-400 sm:text-3xl">
              {activeEmployees}
            </p>

            <p className="mt-1 text-[11px] leading-4 text-zinc-400 sm:text-sm">
              Akun
              <br />
              Aktif
            </p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-[#111923] p-3 sm:p-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-yellow-950/80 text-xl sm:h-12 sm:w-12 sm:text-2xl">
              !
            </div>

            <p className="mt-4 text-2xl font-black text-yellow-300 sm:text-3xl">
              {inactiveEmployees}
            </p>

            <p className="mt-1 text-[11px] leading-4 text-zinc-400 sm:text-sm">
              Akun
              <br />
              Nonaktif
            </p>
          </div>
        </section>

        {/* TOMBOL TAMBAH */}
        <section className="mt-5">
          <Link
            href="/owner/karyawan/tambah"
            className="group flex min-h-[64px] w-full items-center justify-between gap-4 rounded-3xl border border-red-500/60 bg-gradient-to-r from-red-700 to-red-600 px-5 py-4 text-white shadow-xl shadow-red-950/20 transition hover:from-red-600 hover:to-red-500 sm:px-6"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15 text-2xl">
                +
              </div>

              <div>
                <p className="text-xs font-black tracking-widest text-red-100">
                  DATA BARU
                </p>

                <p className="mt-1 text-sm font-black sm:text-base">
                  TAMBAH KARYAWAN
                </p>
              </div>
            </div>

            <span className="text-2xl transition group-hover:translate-x-1">
              →
            </span>
          </Link>
        </section>

        {/* DAFTAR KARYAWAN */}
        <section className="mt-7">
          <div className="flex items-end justify-between gap-3">
            <div>
              <p className="text-xs font-black tracking-[0.25em] text-red-500">
                DATA AKUN
              </p>

              <h3 className="mt-1 text-2xl font-black sm:text-3xl">
                Daftar Karyawan
              </h3>

              <p className="mt-1 text-sm text-zinc-500">
                Akun karyawan yang terdaftar di sistem.
              </p>
            </div>

            <span className="rounded-full border border-white/10 bg-[#111923] px-3 py-1 text-xs font-bold text-zinc-400">
              {employees.length} Data
            </span>
          </div>

          <div className="mt-4 rounded-[2rem] border border-white/10 bg-[#10161e] p-4 sm:p-6">
            <KaryawanClient
              employees={employees.map((employee) => ({
                id: employee.id,
                name: employee.name,
                username: employee.username,
                role: "KARYAWAN" as const,
                active: employee.active,
                createdAt: employee.createdAt.toISOString(),
                deletedAt:
                  employee.deletedAt?.toISOString() ?? null,
              }))}
            />
          </div>
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