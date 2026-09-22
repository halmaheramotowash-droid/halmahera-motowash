"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { apiPost } from "@/lib/api-client";

export default function DaftarPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agree, setAgree] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setSuccess("");

    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();
    const cleanUsername = username.trim().toLowerCase();

    if (!cleanName) {
      setError("Nama lengkap wajib diisi.");
      return;
    }

    if (!cleanEmail) {
      setError("Email wajib diisi.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setError("Format email tidak valid.");
      return;
    }

    if (!cleanUsername) {
      setError("Username wajib diisi.");
      return;
    }

    if (cleanUsername.length < 3) {
      setError("Username minimal 3 karakter.");
      return;
    }

    if (!/^[a-z0-9._-]+$/.test(cleanUsername)) {
      setError(
        "Username hanya boleh menggunakan huruf kecil, angka, titik, garis bawah, atau minus.",
      );
      return;
    }

    if (password.length < 6) {
      setError("Password minimal 6 karakter.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Konfirmasi password tidak cocok.");
      return;
    }

    if (!agree) {
      setError("Anda harus menyetujui ketentuan penggunaan aplikasi.");
      return;
    }

    setLoading(true);

    try {
      const response = await apiPost("/api/daftar", {
  // PERTAHANKAN SELURUH ISI object yang sekarang
});

      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(data.error || "Pendaftaran akun gagal.");
        return;
      }

      setSuccess(
        "Akun OWNER berhasil dibuat. Anda akan diarahkan ke halaman login.",
      );

      setName("");
      setEmail("");
      setUsername("");
      setPassword("");
      setConfirmPassword("");
      setAgree(false);

      window.setTimeout(() => {
        router.push("/login?registered=1");
      }, 1800);
    } catch (error) {
      console.error("DAFTAR AKUN ERROR:", error);
      setError("Tidak dapat terhubung ke server.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main
      className="relative min-h-screen overflow-hidden bg-black text-white"
      style={{
        backgroundImage:
          "linear-gradient(90deg, rgba(0,0,0,0.12), rgba(0,0,0,0.84)), url('/background-washapp.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundAttachment: "fixed",
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-red-950/35 via-black/55 to-black/90" />

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-5xl flex-col items-center px-4 py-8 sm:px-6">
        {/* LOGO DAN BRAND */}
        <div className="mb-6 flex flex-col items-center text-center">
          <img
            src="/logo-washapp.png"
            alt="Wash App"
            className="mb-2 h-20 w-20 object-contain drop-shadow-[0_0_18px_rgba(239,68,68,0.65)] sm:h-24 sm:w-24"
          />

          <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
            <span className="text-white">WASH</span>
            <span className="text-red-500">APP</span>
          </h1>

          <p className="mt-1 text-[10px] font-bold tracking-[0.35em] text-white/85 sm:text-xs">
            SMART WASH MANAGEMENT
          </p>

          <p className="mt-2 text-xs text-white/70 sm:text-sm">
            Kelola usaha cuci kendaraan dengan mudah
          </p>
        </div>

        {/* KARTU PENDAFTARAN */}
        <section className="w-full max-w-xl rounded-[26px] border border-red-500/70 bg-black/75 p-5 shadow-[0_0_35px_rgba(239,68,68,0.2)] backdrop-blur-xl sm:p-8">
          <div className="mb-6">
            <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
              DAFTAR AKUN BARU
            </h2>

            <p className="mt-2 text-sm text-white/70">
              Buat akun{" "}
              <span className="font-bold text-white">OWNER</span> pertama
              Wash App
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* NAMA LENGKAP */}
            <div>
              <label
                htmlFor="name"
                className="mb-2 block text-xs font-extrabold uppercase tracking-wide text-white"
              >
                Nama Lengkap
              </label>

              <div className="flex overflow-hidden rounded-xl border border-red-500/70 bg-black/65 transition focus-within:border-red-400 focus-within:ring-1 focus-within:ring-red-500">
                <div className="flex w-14 shrink-0 items-center justify-center bg-white/10 text-xl text-red-400">
                  👤
                </div>

                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Masukkan nama lengkap"
                  required
                  minLength={2}
                  autoComplete="name"
                  disabled={loading}
                  className="min-w-0 flex-1 bg-transparent px-4 py-3 text-sm text-white outline-none placeholder:text-white/40"
                />
              </div>
            </div>

            {/* EMAIL */}
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-xs font-extrabold uppercase tracking-wide text-white"
              >
                Email
              </label>

              <div className="flex overflow-hidden rounded-xl border border-white/25 bg-black/65 transition focus-within:border-red-400 focus-within:ring-1 focus-within:ring-red-500">
                <div className="flex w-14 shrink-0 items-center justify-center bg-white/10 text-xl text-red-400">
                  ✉️
                </div>

                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="Masukkan email aktif"
                  required
                  autoComplete="email"
                  disabled={loading}
                  className="min-w-0 flex-1 bg-transparent px-4 py-3 text-sm text-white outline-none placeholder:text-white/40"
                />
              </div>

              <p className="mt-2 text-xs text-white/50">
                Gunakan email aktif untuk keamanan dan pemulihan akun.
              </p>
            </div>

            {/* USERNAME */}
            <div>
              <label
                htmlFor="username"
                className="mb-2 block text-xs font-extrabold uppercase tracking-wide text-white"
              >
                Username
              </label>

              <div className="flex overflow-hidden rounded-xl border border-white/25 bg-black/65 transition focus-within:border-red-400 focus-within:ring-1 focus-within:ring-red-500">
                <div className="flex w-14 shrink-0 items-center justify-center bg-white/10 text-xl font-bold text-red-400">
                  @
                </div>

                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(event) =>
                    setUsername(event.target.value.toLowerCase())
                  }
                  placeholder="Masukkan username"
                  required
                  minLength={3}
                  autoComplete="username"
                  disabled={loading}
                  className="min-w-0 flex-1 bg-transparent px-4 py-3 text-sm text-white outline-none placeholder:text-white/40"
                />
              </div>

              <p className="mt-2 text-xs text-white/50">
                Gunakan huruf kecil, angka, titik, garis bawah, atau minus.
              </p>
            </div>

            {/* PASSWORD */}
            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-xs font-extrabold uppercase tracking-wide text-white"
              >
                Password
              </label>

              <div className="flex overflow-hidden rounded-xl border border-white/25 bg-black/65 transition focus-within:border-red-400 focus-within:ring-1 focus-within:ring-red-500">
                <div className="flex w-14 shrink-0 items-center justify-center bg-white/10 text-xl">
                  🔒
                </div>

                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Minimal 6 karakter"
                  required
                  minLength={6}
                  autoComplete="new-password"
                  disabled={loading}
                  className="min-w-0 flex-1 bg-transparent px-4 py-3 text-sm text-white outline-none placeholder:text-white/40"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  disabled={loading}
                  className="px-4 text-xs font-bold text-red-400 transition hover:text-red-300"
                >
                  {showPassword ? "TUTUP" : "LIHAT"}
                </button>
              </div>
            </div>

            {/* KONFIRMASI PASSWORD */}
            <div>
              <label
                htmlFor="confirmPassword"
                className="mb-2 block text-xs font-extrabold uppercase tracking-wide text-white"
              >
                Konfirmasi Password
              </label>

              <div className="flex overflow-hidden rounded-xl border border-white/25 bg-black/65 transition focus-within:border-red-400 focus-within:ring-1 focus-within:ring-red-500">
                <div className="flex w-14 shrink-0 items-center justify-center bg-white/10 text-xl">
                  🔒
                </div>

                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(event) =>
                    setConfirmPassword(event.target.value)
                  }
                  placeholder="Ulangi password"
                  required
                  minLength={6}
                  autoComplete="new-password"
                  disabled={loading}
                  className="min-w-0 flex-1 bg-transparent px-4 py-3 text-sm text-white outline-none placeholder:text-white/40"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowConfirmPassword((value) => !value)
                  }
                  disabled={loading}
                  className="px-4 text-xs font-bold text-red-400 transition hover:text-red-300"
                >
                  {showConfirmPassword ? "TUTUP" : "LIHAT"}
                </button>
              </div>
            </div>

            {/* PERSETUJUAN */}
            <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-white/10 bg-white/5 p-3">
              <input
                type="checkbox"
                checked={agree}
                onChange={(event) => setAgree(event.target.checked)}
                disabled={loading}
                className="mt-1 h-4 w-4 shrink-0 accent-red-500"
              />

              <span className="text-xs leading-relaxed text-white/75">
                Saya setuju dengan{" "}
                <span className="font-bold text-red-400">
                  ketentuan penggunaan
                </span>{" "}
                aplikasi Wash App.
                <span className="mt-1 block text-white/45">
                  Dengan mendaftar, Anda menyetujui kebijakan aplikasi ini.
                </span>
              </span>
            </label>

            {/* PESAN ERROR */}
            {error && (
              <div className="rounded-xl border border-red-500/50 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                {error}
              </div>
            )}

            {/* PESAN SUKSES */}
            {success && (
              <div className="rounded-xl border border-emerald-500/50 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
                {success}
              </div>
            )}

            {/* TOMBOL DAFTAR */}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-gradient-to-r from-red-600 to-red-500 px-4 py-4 text-sm font-extrabold tracking-wide text-white shadow-[0_0_20px_rgba(239,68,68,0.35)] transition hover:from-red-500 hover:to-red-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "MEMBUAT AKUN..." : "DAFTAR AKUN"}
            </button>

            {/* PEMISAH */}
            <div className="flex items-center gap-4">
              <div className="h-px flex-1 bg-white/20" />
              <span className="text-xs font-bold text-white/45">ATAU</span>
              <div className="h-px flex-1 bg-white/20" />
            </div>

            {/* KEMBALI LOGIN */}
            <button
              type="button"
              onClick={() => router.push("/login")}
              disabled={loading}
              className="w-full rounded-xl border border-red-500/70 bg-black/30 px-4 py-3 text-sm font-bold text-red-400 transition hover:bg-red-500/10 hover:text-red-300 disabled:opacity-50"
            >
              KEMBALI KE LOGIN
            </button>
          </form>
        </section>

        {/* FITUR */}
        <div className="mt-8 grid w-full max-w-xl grid-cols-3 gap-3 text-center">
          <div>
            <div className="text-2xl">🛡️</div>
            <p className="mt-1 text-xs font-bold text-white">Aman</p>
            <p className="text-[10px] text-white/50">Data terlindungi</p>
          </div>

          <div>
            <div className="text-2xl">⚡</div>
            <p className="mt-1 text-xs font-bold text-white">Cepat</p>
            <p className="text-[10px] text-white/50">Mudah digunakan</p>
          </div>

          <div>
            <div className="text-2xl">⚙️</div>
            <p className="mt-1 text-xs font-bold text-white">Terpercaya</p>
            <p className="text-[10px] text-white/50">Untuk bisnis Anda</p>
          </div>
        </div>

        {/* FOOTER */}
        <div className="mt-7 text-center">
          <p className="text-[9px] font-bold tracking-[0.35em] text-white/60">
            SMART WASH MANAGEMENT
          </p>

          <div className="mx-auto mt-3 h-1 w-16 rounded-full bg-red-500 shadow-[0_0_12px_rgba(239,68,68,0.8)]" />
        </div>
      </div>
    </main>
  );
}