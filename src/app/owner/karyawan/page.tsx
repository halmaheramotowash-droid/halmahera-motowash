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
                KARYAWAN
              </h1>
            </div>
          </div>
        </header>

        <section className="mt-5">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5">
            <p className="text-xs font-bold tracking-widest text-red-500">
              DATA KARYAWAN
            </p>

            <h2 className="mt-1 text-xl font-black">
              Daftar Karyawan
            </h2>

            <p className="mt-1 text-sm text-zinc-500">
              Akun karyawan yang terdaftar di sistem.
            </p>
          </div>
        </section>

        <section className="mt-4">
          <Link
            href="/owner/karyawan/tambah"
            className="flex min-h-[60px] w-full items-center justify-center rounded-2xl bg-red-600 px-5 text-sm font-black text-white transition active:scale-[0.98]"
          >
            + TAMBAH KARYAWAN
          </Link>
        </section>

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
    </main>
  );
}