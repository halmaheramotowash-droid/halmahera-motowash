"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type UserAccount = {
  id: number;
  name: string;
  username: string;
  role: "OWNER" | "KARYAWAN";
  active: boolean;
};

export default function AkunKeamananPage() {
  const router = useRouter();

  const [user, setUser] = useState<UserAccount | null>(null);
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    loadAccount();
  }, []);

  async function loadAccount() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/owner/account", {
        method: "GET",
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.error || "Gagal mengambil data akun"
        );
      }

      setUser(data.user);
      setName(data.user.name);
      setUsername(data.user.username);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Gagal mengambil data akun"
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    setMessage("");
    setError("");

    const cleanName = name.trim();
    const cleanUsername = username.trim();

    if (!cleanName) {
      setError("Nama wajib diisi.");
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

    try {
      setSaving(true);

      const response = await fetch("/api/owner/account", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: cleanName,
          username: cleanUsername,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.error || "Gagal memperbarui akun"
        );
      }

      setUser(data.user);
      setName(data.user.name);
      setUsername(data.user.username);

      setMessage("Profil akun berhasil diperbarui.");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Gagal memperbarui akun"
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleChangePassword() {
    setMessage("");
    setError("");

    if (!currentPassword) {
      setError("Password lama wajib diisi.");
      return;
    }

    if (!newPassword) {
      setError("Password baru wajib diisi.");
      return;
    }

    if (newPassword.length < 6) {
      setError("Password baru minimal 6 karakter.");
      return;
    }

    if (!confirmPassword) {
      setError("Konfirmasi password wajib diisi.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Konfirmasi password tidak cocok.");
      return;
    }

    if (currentPassword === newPassword) {
      setError(
        "Password baru harus berbeda dari password lama."
      );
      return;
    }

    try {
      setChangingPassword(true);

      const response = await fetch(
        "/api/owner/account/password",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            currentPassword,
            newPassword,
            confirmPassword,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.error || "Gagal mengubah password"
        );
      }

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      setMessage(
        "Password berhasil diubah. Silakan login kembali."
      );

      /*
       * Password sudah berubah, tetapi session JWT
       * yang sekarang masih aktif. Kita sengaja belum
       * melakukan logout otomatis pada tahap ini.
       *
       * Mekanisme session akan kita rapikan pada tahap
       * keamanan berikutnya.
       */
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Gagal mengubah password"
      );
    } finally {
      setChangingPassword(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-black px-4 py-6 text-white">
        <div className="mx-auto max-w-md">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6 text-center">
            <p className="text-sm font-bold text-zinc-400">
              Memuat data akun...
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black px-4 py-6 text-white">
      <div className="mx-auto max-w-md">

        {/* HEADER */}
        <div className="mb-6 flex items-center justify-between">
          <button
            type="button"
            onClick={() =>
              router.push("/owner/pengaturan")
            }
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-600 text-xl font-black text-white shadow-lg transition active:scale-[0.95]"
          >
            ←
          </button>

          <div className="text-center">
            <h1 className="text-lg font-black tracking-wide">
              AKUN & KEAMANAN
            </h1>

            <p className="mt-1 text-[10px] font-bold text-zinc-500">
              HALMAHERA MOTOWASH
            </p>
          </div>

          <div className="w-10" />
        </div>

        {/* ERROR */}
        {error && (
          <div className="mb-4 rounded-2xl border border-red-900 bg-red-950/40 p-4">
            <p className="text-sm font-bold text-red-400">
              {error}
            </p>
          </div>
        )}

        {/* SUCCESS */}
        {message && (
          <div className="mb-4 rounded-2xl border border-green-900 bg-green-950/40 p-4">
            <p className="text-sm font-bold text-green-400">
              {message}
            </p>
          </div>
        )}

        {/* PROFIL AKUN */}
        <section className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5 shadow-lg">
          <div className="mb-5">
            <h2 className="text-sm font-black tracking-wide">
              PROFIL AKUN
            </h2>

            <p className="mt-1 text-xs text-zinc-500">
              Kelola informasi akun Owner.
            </p>
          </div>

          {/* NAMA */}
          <div className="mb-4">
            <label
              htmlFor="name"
              className="mb-2 block text-xs font-bold text-zinc-400"
            >
              Nama
            </label>

            <input
              id="name"
              type="text"
              value={name}
              onChange={(event) =>
                setName(event.target.value)
              }
              className="w-full rounded-xl border border-zinc-800 bg-black px-4 py-3 text-sm text-white outline-none transition focus:border-red-600"
              placeholder="Nama Owner"
            />
          </div>

          {/* USERNAME */}
          <div className="mb-4">
            <label
              htmlFor="username"
              className="mb-2 block text-xs font-bold text-zinc-400"
            >
              Username
            </label>

            <input
              id="username"
              type="text"
              value={username}
              onChange={(event) =>
                setUsername(event.target.value)
              }
              className="w-full rounded-xl border border-zinc-800 bg-black px-4 py-3 text-sm text-white outline-none transition focus:border-red-600"
              placeholder="Username"
            />
          </div>

          {/* ROLE */}
          <div className="mb-5">
            <p className="mb-2 text-xs font-bold text-zinc-400">
              Role
            </p>

            <div className="rounded-xl border border-zinc-800 bg-black px-4 py-3">
              <span className="text-sm font-black text-red-500">
                {user?.role}
              </span>
            </div>
          </div>

          {/* STATUS */}
          <div className="mb-5">
            <p className="mb-2 text-xs font-bold text-zinc-400">
              Status Akun
            </p>

            <div className="rounded-xl border border-zinc-800 bg-black px-4 py-3">
              <span
                className={
                  user?.active
                    ? "text-sm font-bold text-green-500"
                    : "text-sm font-bold text-red-500"
                }
              >
                {user?.active ? "AKTIF" : "NONAKTIF"}
              </span>
            </div>
          </div>

          {/* SIMPAN PROFIL */}
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="w-full rounded-xl bg-red-600 px-4 py-3 text-sm font-black text-white shadow-lg transition hover:bg-red-500 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving
              ? "MENYIMPAN..."
              : "SIMPAN PERUBAHAN"}
          </button>
        </section>

        {/* KEAMANAN PASSWORD */}
        <section className="mt-4 rounded-2xl border border-zinc-800 bg-zinc-950 p-5 shadow-lg">
          <div className="mb-5">
            <h2 className="text-sm font-black tracking-wide">
              KEAMANAN PASSWORD
            </h2>

            <p className="mt-1 text-xs leading-relaxed text-zinc-500">
              Gunakan password lama untuk memverifikasi
              perubahan password.
            </p>
          </div>

          {/* PASSWORD LAMA */}
          <div className="mb-4">
            <label
              htmlFor="currentPassword"
              className="mb-2 block text-xs font-bold text-zinc-400"
            >
              Password Lama
            </label>

            <input
              id="currentPassword"
              type="password"
              value={currentPassword}
              onChange={(event) =>
                setCurrentPassword(event.target.value)
              }
              className="w-full rounded-xl border border-zinc-800 bg-black px-4 py-3 text-sm text-white outline-none transition focus:border-red-600"
              placeholder="Masukkan password lama"
              autoComplete="current-password"
            />
          </div>

          {/* PASSWORD BARU */}
          <div className="mb-4">
            <label
              htmlFor="newPassword"
              className="mb-2 block text-xs font-bold text-zinc-400"
            >
              Password Baru
            </label>

            <input
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={(event) =>
                setNewPassword(event.target.value)
              }
              className="w-full rounded-xl border border-zinc-800 bg-black px-4 py-3 text-sm text-white outline-none transition focus:border-red-600"
              placeholder="Minimal 6 karakter"
              autoComplete="new-password"
            />
          </div>

          {/* KONFIRMASI */}
          <div className="mb-5">
            <label
              htmlFor="confirmPassword"
              className="mb-2 block text-xs font-bold text-zinc-400"
            >
              Konfirmasi Password Baru
            </label>

            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(event) =>
                setConfirmPassword(event.target.value)
              }
              className="w-full rounded-xl border border-zinc-800 bg-black px-4 py-3 text-sm text-white outline-none transition focus:border-red-600"
              placeholder="Ulangi password baru"
              autoComplete="new-password"
            />
          </div>

          {/* UBAH PASSWORD */}
          <button
            type="button"
            onClick={handleChangePassword}
            disabled={changingPassword}
            className="w-full rounded-xl border border-red-600 bg-red-600 px-4 py-3 text-sm font-black text-white shadow-lg transition hover:bg-red-500 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {changingPassword
              ? "MENGUBAH PASSWORD..."
              : "UBAH PASSWORD"}
          </button>
        </section>

        {/* FOOTER */}
        <div className="mt-6 rounded-2xl border border-zinc-900 bg-zinc-950 p-4 text-center">
          <p className="text-[10px] font-bold tracking-widest text-zinc-600">
            HALMAHERA MOTOWASH
          </p>

          <p className="mt-1 text-[10px] text-zinc-700">
            Pengaturan Akun Owner
          </p>
        </div>

      </div>
    </main>
  );
}