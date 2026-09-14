"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function TambahKaryawanPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
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
      const response = await fetch(
        "/api/karyawan",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name,
            username,
            password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(
          data.error ??
            "Gagal menambahkan karyawan."
        );
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
      console.error(
        "Tambah karyawan error:",
        error
      );

      setError(
        "Tidak dapat terhubung ke server."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="mx-auto min-h-screen max-w-md bg-black px-5 pb-10">

        <header className="border-b border-red-900/40 py-6">
          <div className="flex items-center gap-3">

            <Link
              href="/owner/karyawan"
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-900 text-xl"
            >
              ←
            </Link>

            <div>
              <p className="text-xs font-bold tracking-widest text-red-500">
                OWNER
              </p>

              <h1 className="text-xl font-black">
                TAMBAH KARYAWAN
              </h1>
            </div>

          </div>
        </header>

        <section className="mt-5">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5">

            <p className="text-xs font-bold tracking-widest text-red-500">
              AKUN BARU
            </p>

            <h2 className="mt-1 text-xl font-black">
              Data Karyawan
            </h2>

            <p className="mt-1 text-sm text-zinc-500">
              Masukkan data akun karyawan baru.
            </p>

          </div>
        </section>

        {success && (
          <div className="mt-4 rounded-2xl border border-green-900/60 bg-green-950/30 p-5">
            <p className="text-xs font-black tracking-widest text-green-400">
              BERHASIL
            </p>

            <p className="mt-2 whitespace-pre-line text-sm font-bold text-green-300">
              {success}
            </p>

            <p className="mt-3 text-xs text-green-500">
              Mengarahkan ke daftar karyawan...
            </p>
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="mt-4 space-y-4"
        >

          <div>
            <label
              htmlFor="name"
              className="text-sm font-bold text-zinc-300"
            >
              NAMA
            </label>

            <input
              id="name"
              name="name"
              type="text"
              value={name}
              onChange={(event) =>
                setName(event.target.value)
              }
              placeholder="Contoh: Andi Saputra"
              autoComplete="name"
              disabled={loading || !!success}
              className="mt-2 w-full rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-4 text-white outline-none placeholder:text-zinc-600 focus:border-red-600 disabled:cursor-not-allowed disabled:opacity-50"
              required
            />
          </div>

          <div>
            <label
              htmlFor="username"
              className="text-sm font-bold text-zinc-300"
            >
              USERNAME
            </label>

            <input
              id="username"
              name="username"
              type="text"
              value={username}
              onChange={(event) =>
                setUsername(
                  event.target.value
                )
              }
              placeholder="Contoh: andi"
              autoComplete="username"
              disabled={loading || !!success}
              className="mt-2 w-full rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-4 text-white outline-none placeholder:text-zinc-600 focus:border-red-600 disabled:cursor-not-allowed disabled:opacity-50"
              required
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="text-sm font-bold text-zinc-300"
            >
              PASSWORD
            </label>

            <input
              id="password"
              name="password"
              type="password"
              value={password}
              onChange={(event) =>
                setPassword(
                  event.target.value
                )
              }
              placeholder="Minimal 6 karakter"
              autoComplete="new-password"
              disabled={loading || !!success}
              className="mt-2 w-full rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-4 text-white outline-none placeholder:text-zinc-600 focus:border-red-600 disabled:cursor-not-allowed disabled:opacity-50"
              required
            />
          </div>

          {error && (
            <div className="rounded-2xl border border-red-900/50 bg-red-950/30 p-4">
              <p className="text-xs font-black tracking-widest text-red-500">
                GAGAL
              </p>

              <p className="mt-1 text-sm font-bold text-red-400">
                {error}
              </p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !!success}
            className="w-full rounded-2xl bg-red-600 px-5 py-4 text-sm font-black text-white transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading
              ? "MENYIMPAN..."
              : "SIMPAN KARYAWAN"}
          </button>

        </form>

      </div>
    </main>
  );
}