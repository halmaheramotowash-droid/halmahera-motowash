"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { apiPost } from "@/lib/api-client";

export default function TambahKaryawanPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!name.trim()) {
      setError("Nama karyawan wajib diisi.");
      return;
    }

    if (!username.trim()) {
      setError("Username wajib diisi.");
      return;
    }

    if (!password) {
      setError("Password wajib diisi.");
      return;
    }

    setLoading(true);

    try {
      const response = await apiPost("/api/karyawan", {
  // PERTAHANKAN SEMUA ISI OBJECT YANG SEKARANG
});

      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(data.error ?? "Gagal menambahkan karyawan.");
        return;
      }

      setSuccess(
        `Karyawan berhasil ditambahkan.\n\n${data.employee.name}\n@${data.employee.username}`
      );

      setName("");
      setUsername("");
      setPassword("");

      /*
       * Kembali ke daftar karyawan setelah
       * notifikasi sukses ditampilkan.
       */
      setTimeout(() => {
        router.push("/owner/karyawan");
        router.refresh();
      }, 1500);
    } catch (error) {
      console.error("Tambah karyawan error:", error);

      setError("Tidak dapat terhubung ke server.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#05080d] text-white">
      <div className="mx-auto min-h-screen w-full max-w-4xl px-4 pb-10 sm:px-6 lg:px-8">
        {/* Header */}
        <header className="flex items-center justify-between border-b border-white/10 py-5 sm:py-6">
          <div className="flex items-center gap-3">
            <Link
              href="/owner/karyawan"
              aria-label="Kembali ke daftar karyawan"
              className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-xl text-zinc-200 transition hover:border-red-500/50 hover:bg-red-500/10 hover:text-white active:scale-95"
            >
              ←
            </Link>

            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.25em] text-red-500 sm:text-xs">
                Owner Panel
              </p>

              <h1 className="mt-1 text-lg font-black tracking-tight sm:text-2xl">
                Tambah Karyawan
              </h1>
            </div>
          </div>

          <div className="hidden h-11 w-11 items-center justify-center rounded-2xl bg-red-600 text-lg font-black shadow-lg shadow-red-950/30 sm:flex">
            D
          </div>
        </header>

        {/* Intro */}
        <section className="mt-6">
          <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-red-950/40 via-zinc-950 to-zinc-950 p-5 sm:p-7">
            <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-red-600/10 blur-3xl" />

            <div className="relative">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-red-500/20 bg-red-600/15 text-2xl">
                👤
              </div>

              <p className="text-[10px] font-black uppercase tracking-[0.25em] text-red-500 sm:text-xs">
                Akun Baru
              </p>

              <h2 className="mt-2 text-2xl font-black tracking-tight sm:text-3xl">
                Buat Akun Karyawan
              </h2>

              <p className="mt-2 max-w-xl text-sm leading-6 text-zinc-400">
                Masukkan data karyawan untuk membuat akun baru yang dapat
                digunakan untuk masuk ke dalam sistem kasir.
              </p>
            </div>
          </div>
        </section>

        {/* Success notification */}
        {success && (
          <section
            role="status"
            className="mt-5 rounded-3xl border border-emerald-500/25 bg-emerald-950/25 p-5"
          >
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-emerald-500/15 text-lg text-emerald-400">
                ✓
              </div>

              <div className="min-w-0">
                <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-400">
                  Berhasil
                </p>

                <p className="mt-2 whitespace-pre-line text-sm font-bold leading-6 text-emerald-200">
                  {success}
                </p>

                <p className="mt-3 text-xs text-emerald-400/80">
                  Mengarahkan ke daftar karyawan...
                </p>
              </div>
            </div>
          </section>
        )}

        {/* Form card */}
        <section className="mt-5 rounded-3xl border border-white/10 bg-zinc-950/80 p-5 shadow-2xl shadow-black/20 sm:p-7">
          <div className="mb-6">
            <p className="text-[10px] font-black uppercase tracking-[0.25em] text-red-500 sm:text-xs">
              Informasi Login
            </p>

            <h3 className="mt-2 text-xl font-black tracking-tight sm:text-2xl">
              Data Akun
            </h3>

            <p className="mt-2 text-sm leading-6 text-zinc-500">
              Pastikan data yang dimasukkan benar sebelum menyimpan akun.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name */}
            <div>
              <label
                htmlFor="name"
                className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-zinc-300"
              >
                <span className="text-red-500">01</span>
                Nama Karyawan
              </label>

              <input
                id="name"
                name="name"
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Contoh: Andi Saputra"
                autoComplete="name"
                disabled={loading || !!success}
                className="mt-2 w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-4 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-red-500 focus:bg-black/60 focus:ring-4 focus:ring-red-500/10 disabled:cursor-not-allowed disabled:opacity-50"
                required
              />

              <p className="mt-2 text-xs text-zinc-600">
                Gunakan nama lengkap karyawan.
              </p>
            </div>

            {/* Username */}
            <div>
              <label
                htmlFor="username"
                className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-zinc-300"
              >
                <span className="text-red-500">02</span>
                Username
              </label>

              <div className="relative mt-2">
                <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm text-zinc-600">
                  @
                </span>

                <input
                  id="username"
                  name="username"
                  type="text"
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  placeholder="Contoh: andi"
                  autoComplete="username"
                  disabled={loading || !!success}
                  className="w-full rounded-2xl border border-white/10 bg-black/40 py-4 pl-9 pr-4 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-red-500 focus:bg-black/60 focus:ring-4 focus:ring-red-500/10 disabled:cursor-not-allowed disabled:opacity-50"
                  required
                />
              </div>

              <p className="mt-2 text-xs text-zinc-600">
                Username digunakan saat karyawan login.
              </p>
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-zinc-300"
              >
                <span className="text-red-500">03</span>
                Password
              </label>

              <input
                id="password"
                name="password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Minimal 6 karakter"
                autoComplete="new-password"
                disabled={loading || !!success}
                className="mt-2 w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-4 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-red-500 focus:bg-black/60 focus:ring-4 focus:ring-red-500/10 disabled:cursor-not-allowed disabled:opacity-50"
                required
              />

              <p className="mt-2 text-xs text-zinc-600">
                Gunakan password yang mudah diingat oleh karyawan tetapi
                tidak mudah ditebak orang lain.
              </p>
            </div>

            {/* Error notification */}
            {error && (
              <div
                role="alert"
                className="rounded-2xl border border-red-500/25 bg-red-950/30 p-4"
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-red-500/15 text-red-400">
                    !
                  </div>

                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.2em] text-red-500">
                      Gagal
                    </p>

                    <p className="mt-1 text-sm font-bold leading-6 text-red-300">
                      {error}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col gap-3 pt-2 sm:flex-row-reverse">
              <button
                type="submit"
                disabled={loading || !!success}
                className="flex min-h-[56px] w-full items-center justify-center rounded-2xl bg-red-600 px-5 text-sm font-black tracking-wide text-white shadow-lg shadow-red-950/30 transition hover:bg-red-500 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 sm:flex-1"
              >
                {loading ? (
                  <span className="flex items-center gap-3">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    MENYIMPAN...
                  </span>
                ) : (
                  "SIMPAN KARYAWAN"
                )}
              </button>

              <Link
                href="/owner/karyawan"
                className="flex min-h-[56px] w-full items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] px-5 text-sm font-black tracking-wide text-zinc-300 transition hover:border-white/20 hover:bg-white/[0.08] hover:text-white active:scale-[0.98] sm:w-40"
              >
                BATAL
              </Link>
            </div>
          </form>
        </section>

        {/* Footer note */}
        <div className="mt-5 flex items-center justify-center gap-2 text-center text-xs text-zinc-600">
          <span>🔒</span>
          <span>Data akun diproses melalui sistem Halmahera Motowash.</span>
        </div>
      </div>
    </main>
  );
}