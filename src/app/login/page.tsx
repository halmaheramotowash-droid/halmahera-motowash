"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const SAVED_USERNAME_KEY =
  "halmahera_motowash_saved_username";

const SAVED_PASSWORD_KEY =
  "halmahera_motowash_saved_password";

const SAVE_LOGIN_KEY =
  "halmahera_motowash_save_login";

export default function LoginPage() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [saveLogin, setSaveLogin] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  /*
   * MEMBACA INFORMASI LOGIN YANG TERSIMPAN
   */
  useEffect(() => {
    try {
      const savedUsername =
        window.localStorage.getItem(
          SAVED_USERNAME_KEY
        );

      const savedPassword =
        window.localStorage.getItem(
          SAVED_PASSWORD_KEY
        );

      const savedSetting =
        window.localStorage.getItem(
          SAVE_LOGIN_KEY
        );

      if (
        savedSetting === "true" &&
        savedUsername &&
        savedPassword
      ) {
        setUsername(savedUsername);
        setPassword(savedPassword);
        setSaveLogin(true);
      }
    } catch (error) {
      console.error(
        "Gagal membaca informasi login:",
        error
      );
    }
  }, []);

  /*
   * PROSES LOGIN
   */
  async function handleLogin(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setLoading(true);
    setError("");

    try {
      const cleanUsername = username.trim();

      const response = await fetch(
        "/api/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: cleanUsername,
            password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.error ?? "Login gagal"
        );

        return;
      }

      /*
       * SIMPAN ATAU HAPUS INFORMASI LOGIN
       */
      try {
        if (saveLogin) {
          window.localStorage.setItem(
            SAVED_USERNAME_KEY,
            cleanUsername
          );

          window.localStorage.setItem(
            SAVED_PASSWORD_KEY,
            password
          );

          window.localStorage.setItem(
            SAVE_LOGIN_KEY,
            "true"
          );
        } else {
          window.localStorage.removeItem(
            SAVED_USERNAME_KEY
          );

          window.localStorage.removeItem(
            SAVED_PASSWORD_KEY
          );

          window.localStorage.removeItem(
            SAVE_LOGIN_KEY
          );
        }
      } catch (error) {
        console.error(
          "Gagal menyimpan informasi login:",
          error
        );
      }

      /*
       * REDIRECT SESUAI ROLE
       */
      if (data.user?.role === "OWNER") {
        router.push("/owner");
      } else {
        router.push("/");
      }
    } catch (error) {
      console.error(
        "Login error:",
        error
      );

      setError(
        "Terjadi kesalahan saat login"
      );
    } finally {
      setLoading(false);
    }
  }

  /*
   * JIKA CHECKBOX DIMATIKAN,
   * INFORMASI LOGIN LAMA LANGSUNG DIHAPUS
   */
  function handleSaveLoginChange(
    checked: boolean
  ) {
    setSaveLogin(checked);

    if (!checked) {
      try {
        window.localStorage.removeItem(
          SAVED_USERNAME_KEY
        );

        window.localStorage.removeItem(
          SAVED_PASSWORD_KEY
        );

        window.localStorage.removeItem(
          SAVE_LOGIN_KEY
        );
      } catch (error) {
        console.error(
          "Gagal menghapus informasi login:",
          error
        );
      }
    }
  }

  return (
    <main className="min-h-screen bg-black px-4 py-8 text-white">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-md items-center justify-center">
        <div className="w-full rounded-3xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl">
          {/* HEADER */}
          <div className="mb-8 text-center">
            <div className="mb-4 flex justify-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-red-600 text-4xl shadow-lg shadow-red-950/40">
                🚿
              </div>
            </div>

            <div className="text-3xl font-black tracking-wide text-white">
              HALMAHERA
            </div>

            <div className="mt-1 text-xl font-black tracking-widest text-red-500">
              MOTOWASH
            </div>

            <div className="mt-3 text-xs font-semibold tracking-widest text-zinc-500">
              WASH APP
            </div>

            <div className="mt-2 text-sm text-zinc-500">
              Silakan login untuk melanjutkan
            </div>
          </div>

          {/* FORM */}
          <form
            onSubmit={handleLogin}
            className="space-y-5"
          >
            {/* USERNAME */}
            <div>
              <label className="block text-xs font-black tracking-wider text-zinc-400">
                USERNAME
              </label>

              <input
                type="text"
                value={username}
                onChange={(event) =>
                  setUsername(event.target.value)
                }
                required
                autoFocus
                autoComplete="username"
                className="mt-2 w-full rounded-2xl border border-zinc-800 bg-black px-4 py-4 text-base text-white outline-none placeholder:text-zinc-700 transition focus:border-red-600 focus:ring-1 focus:ring-red-600"
                placeholder="Masukkan username"
              />
            </div>

            {/* PASSWORD */}
            <div>
              <label className="block text-xs font-black tracking-wider text-zinc-400">
                PASSWORD
              </label>

              <div className="relative mt-2">
                <input
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  value={password}
                  onChange={(event) =>
                    setPassword(event.target.value)
                  }
                  required
                  autoComplete="current-password"
                  className="w-full rounded-2xl border border-zinc-800 bg-black px-4 py-4 pr-28 text-base text-white outline-none placeholder:text-zinc-700 transition focus:border-red-600 focus:ring-1 focus:ring-red-600"
                  placeholder="Masukkan password"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword(
                      (value) => !value
                    )
                  }
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-xl px-3 py-2 text-xs font-black text-red-500 transition hover:bg-red-950/40 active:scale-[0.95]"
                >
                  {showPassword
                    ? "SEMBUNYIKAN"
                    : "TAMPILKAN"}
                </button>
              </div>
            </div>

            {/* SIMPAN INFORMASI LOGIN */}
            <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-zinc-800 bg-black px-4 py-4 transition hover:border-red-900">
              <input
                type="checkbox"
                checked={saveLogin}
                onChange={(event) =>
                  handleSaveLoginChange(
                    event.target.checked
                  )
                }
                className="h-5 w-5 cursor-pointer accent-red-600"
              />

              <span className="flex items-center gap-2">
                <span className="text-lg">
                  🔒
                </span>

                <span>
                  <span className="block text-sm font-bold text-zinc-300">
                    Simpan informasi login
                  </span>

                  <span className="mt-1 block text-[10px] text-zinc-600">
                    Username dan password akan
                    diingat di perangkat ini
                  </span>
                </span>
              </span>
            </label>

            {/* ERROR */}
            {error && (
              <div className="rounded-2xl border border-red-900/50 bg-red-950/40 px-4 py-3 text-sm font-bold text-red-400">
                <div className="flex items-start gap-2">
                  <span className="text-base">
                    ⚠️
                  </span>

                  <span className="break-words">
                    {error}
                  </span>
                </div>
              </div>
            )}

            {/* LOGIN */}
            <button
              type="submit"
              disabled={loading}
              className={[
                "w-full rounded-2xl px-4 py-5 text-base font-black transition active:scale-[0.98]",
                loading
                  ? "cursor-not-allowed bg-zinc-800 text-zinc-500"
                  : "bg-red-600 text-white shadow-lg shadow-red-950/40 hover:bg-red-700",
              ].join(" ")}
            >
              {loading
                ? "MEMPROSES..."
                : "LOGIN"}
            </button>
          </form>

          {/* FOOTER */}
          <div className="mt-8 border-t border-zinc-900 pt-5 text-center">
            <p className="text-[10px] font-bold tracking-widest text-zinc-700">
              HALMAHERA MOTOWASH
            </p>

            <p className="mt-1 text-[10px] text-zinc-700">
              Sistem Kasir Cuci Kendaraan
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}