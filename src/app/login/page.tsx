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

  useEffect(() => {
    try {
      /*
       * Keamanan:
       * Password tidak lagi dibaca dari localStorage.
       * Password lama yang mungkin pernah tersimpan
       * akan langsung dihapus dari perangkat.
       */
      window.localStorage.removeItem(
        SAVED_PASSWORD_KEY
      );

      const savedUsername =
        window.localStorage.getItem(
          SAVED_USERNAME_KEY
        );

      const savedSetting =
        window.localStorage.getItem(
          SAVE_LOGIN_KEY
        );

      if (
        savedSetting === "true" &&
        savedUsername
      ) {
        setUsername(savedUsername);
        setSaveLogin(true);
      }
    } catch (error) {
      console.error(
        "Gagal membaca username tersimpan:",
        error
      );
    }
  }, []);

  async function handleLogin(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (loading) {
      return;
    }

    setLoading(true);
    setError("");

    try {
      const cleanUsername = username.trim();

      if (!cleanUsername || !password) {
        setError(
          "Username dan password wajib diisi"
        );
        return;
      }

      const response = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: cleanUsername,
          password,
        }),
      });

      let data: {
        success?: boolean;
        error?: string;
        user?: {
          id: number;
          name: string;
          username: string;
          role: "OWNER" | "KARYAWAN";
        };
      } = {};

      try {
        data = await response.json();
      } catch (error) {
        console.error(
          "Respons login bukan JSON:",
          error
        );

        setError(
          "Respons dari server tidak valid"
        );
        return;
      }

      if (!response.ok) {
        setError(
          data.error ?? "Username atau password salah"
        );
        return;
      }

      /*
       * Hanya username yang boleh disimpan.
       * Password tidak pernah disimpan di browser.
       */
      try {
        if (saveLogin) {
          window.localStorage.setItem(
            SAVED_USERNAME_KEY,
            cleanUsername
          );

          window.localStorage.setItem(
            SAVE_LOGIN_KEY,
            "true"
          );

          window.localStorage.removeItem(
            SAVED_PASSWORD_KEY
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
          "Gagal menyimpan username:",
          error
        );
      }

      /*
       * Password dibersihkan dari state setelah
       * login berhasil agar tidak tetap tersimpan
       * di memori halaman lebih lama dari diperlukan.
       */
      setPassword("");

      if (data.user?.role === "OWNER") {
        router.push("/owner");
      } else {
        router.push("/");
      }
    } catch (error) {
      console.error("Login error:", error);

      setError(
        "Tidak dapat terhubung ke server. Silakan coba lagi."
      );
    } finally {
      setLoading(false);
    }
  }

  function handleSaveLoginChange(
    checked: boolean
  ) {
    setSaveLogin(checked);

    try {
      if (checked) {
        /*
         * Username akan disimpan ketika login berhasil.
         * Password lama selalu dihapus.
         */
        window.localStorage.removeItem(
          SAVED_PASSWORD_KEY
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
        "Gagal memperbarui pengaturan username:",
        error
      );
    }
  }

  function handleRegister() {
    router.push("/daftar");
  }

  return (
    <main
      className="
        relative
        min-h-screen
        overflow-hidden
        bg-black
        bg-cover
        bg-center
        bg-no-repeat
        px-4
        py-6
        text-white
        sm:px-6
        sm:py-8
      "
      style={{
        backgroundImage:
          "url('/background-washapp.png')",
        backgroundSize: "cover",
        backgroundPosition: "center center",
      }}
    >
      {/* LAPISAN GELAP DI ATAS BACKGROUND */}
      <div className="pointer-events-none absolute inset-0 bg-black/45" />

      {/* KONTEN LOGIN */}
      <div
        className="
          relative
          z-10
          mx-auto
          flex
          min-h-[calc(100vh-3rem)]
          w-full
          max-w-md
          items-center
          justify-center
          sm:min-h-[calc(100vh-4rem)]
        "
      >
        <div className="w-full">
          {/* LOGO */}
          <div className="mb-6 text-center sm:mb-8">
            <div
              className="
                mx-auto
                mb-3
                flex
                h-28
                w-28
                items-center
                justify-center
                sm:h-40
                sm:w-40
              "
            >
              <img
                src="/logo-washapp.png"
                alt="Logo WashApp"
                className="
                  h-full
                  w-full
                  object-contain
                  drop-shadow-[0_0_30px_rgba(239,68,68,0.5)]
                "
              />
            </div>

            <h1 className="text-3xl font-black tracking-tight text-white sm:text-4xl">
              WASH<span className="text-red-500">APP</span>
            </h1>

            <p className="mt-2 text-[9px] font-bold tracking-[0.28em] text-zinc-200 sm:text-xs sm:tracking-[0.35em]">
              SMART WASH MANAGEMENT
            </p>

            <p className="mt-3 text-xs text-zinc-200 sm:mt-4 sm:text-sm">
              Kelola usaha cuci kendaraan dengan mudah
            </p>
          </div>

          {/* KARTU LOGIN */}
          <div
            className="
              rounded-[1.7rem]
              border
              border-white/20
              bg-black/75
              p-4
              shadow-2xl
              shadow-black/70
              backdrop-blur-md
              sm:rounded-[2rem]
              sm:p-7
            "
          >
            <div className="mb-5 sm:mb-6">
              <h2 className="text-xl font-black text-white sm:text-2xl">
                Selamat Datang
              </h2>

              <p className="mt-1 text-xs text-zinc-300 sm:text-sm">
                Silakan masuk ke akun Anda
              </p>
            </div>

            <form
              onSubmit={handleLogin}
              className="space-y-4 sm:space-y-5"
            >
              {/* USERNAME */}
              <div>
                <label className="mb-2 block text-[10px] font-black tracking-wider text-zinc-200 sm:text-xs">
                  USERNAME
                </label>

                <div
                  className="
                    flex
                    items-center
                    rounded-2xl
                    border
                    border-zinc-600
                    bg-black/80
                    transition
                    focus-within:border-red-500
                    focus-within:ring-1
                    focus-within:ring-red-500
                  "
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-zinc-800/90 text-lg sm:h-14 sm:w-14 sm:text-xl">
                    👤
                  </div>

                  <input
                    type="text"
                    value={username}
                    onChange={(event) =>
                      setUsername(event.target.value)
                    }
                    required
                    autoFocus
                    autoComplete="username"
                    placeholder="Masukkan username"
                    className="
                      min-w-0
                      flex-1
                      bg-transparent
                      px-3
                      py-3
                      text-sm
                      text-white
                      outline-none
                      placeholder:text-zinc-400
                      sm:px-4
                      sm:py-4
                      sm:text-base
                    "
                  />
                </div>
              </div>

              {/* PASSWORD */}
              <div>
                <label className="mb-2 block text-[10px] font-black tracking-wider text-zinc-200 sm:text-xs">
                  PASSWORD
                </label>

                <div
                  className="
                    flex
                    items-center
                    rounded-2xl
                    border
                    border-zinc-600
                    bg-black/80
                    transition
                    focus-within:border-red-500
                    focus-within:ring-1
                    focus-within:ring-red-500
                  "
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-zinc-800/90 text-lg sm:h-14 sm:w-14 sm:text-xl">
                    🔒
                  </div>

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
                    placeholder="Masukkan password"
                    className="
                      min-w-0
                      flex-1
                      bg-transparent
                      px-3
                      py-3
                      text-sm
                      text-white
                      outline-none
                      placeholder:text-zinc-400
                      sm:px-4
                      sm:py-4
                      sm:text-base
                    "
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword((value) => !value)
                    }
                    className="
                      mr-1
                      rounded-xl
                      px-2
                      py-2
                      text-[10px]
                      font-bold
                      text-red-400
                      transition
                      hover:bg-red-950/50
                      sm:mr-2
                      sm:px-3
                      sm:text-xs
                    "
                  >
                    {showPassword
                      ? "SEMBUNYIKAN"
                      : "LIHAT"}
                  </button>
                </div>
              </div>

              {/* INGAT USERNAME */}
              <label
                className="
                  flex
                  cursor-pointer
                  items-center
                  gap-3
                  rounded-2xl
                  border
                  border-zinc-600
                  bg-black/65
                  p-3
                  transition
                  hover:border-red-700
                  sm:p-4
                "
              >
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

                <div className="min-w-0">
                  <p className="text-xs font-bold text-zinc-200 sm:text-sm">
                    Ingat username
                  </p>

                  <p className="mt-1 text-[10px] text-zinc-400 sm:text-xs">
                    Hanya username yang akan diingat
                    di perangkat ini
                  </p>
                </div>
              </label>

              {/* ERROR */}
              {error && (
                <div className="rounded-2xl border border-red-800 bg-red-950/80 px-3 py-3 text-xs font-bold text-red-200 sm:px-4 sm:text-sm">
                  <div className="flex items-start gap-2">
                    <span>⚠️</span>

                    <span className="break-words">
                      {error}
                    </span>
                  </div>
                </div>
              )}

              {/* TOMBOL LOGIN */}
              <button
                type="submit"
                disabled={loading}
                className={[
                  "w-full rounded-2xl px-4 py-4 text-sm font-black tracking-wide transition active:scale-[0.98] sm:py-5 sm:text-base",
                  loading
                    ? "cursor-not-allowed bg-zinc-800 text-zinc-500"
                    : "bg-gradient-to-r from-red-600 via-red-500 to-red-600 text-white shadow-lg shadow-red-950/60 hover:from-red-500 hover:to-red-700",
                ].join(" ")}
              >
                {loading
                  ? "MEMPROSES..."
                  : "MASUK KE APLIKASI"}
              </button>

              {/* PEMISAH */}
              <div className="flex items-center gap-3">
                <div className="h-px flex-1 bg-zinc-700" />

                <span className="text-[10px] font-bold text-zinc-500">
                  ATAU
                </span>

                <div className="h-px flex-1 bg-zinc-700" />
              </div>

              {/* TOMBOL DAFTAR */}
              <button
                type="button"
                onClick={handleRegister}
                className="
                  w-full
                  rounded-2xl
                  border
                  border-red-500/70
                  bg-transparent
                  px-4
                  py-4
                  text-sm
                  font-black
                  tracking-wide
                  text-red-400
                  transition
                  hover:bg-red-950/50
                  active:scale-[0.98]
                  sm:py-5
                  sm:text-base
                "
              >
                DAFTAR AKUN BARU
              </button>
            </form>
          </div>

          {/* FITUR */}
          <div className="mt-6 grid grid-cols-3 gap-2 text-center sm:mt-7 sm:gap-3">
            <div>
              <div className="text-lg sm:text-xl">
                🛡️
              </div>

              <p className="mt-1 text-[10px] font-bold text-white sm:mt-2 sm:text-xs">
                Aman
              </p>

              <p className="mt-1 text-[9px] text-zinc-200 sm:text-[10px]">
                Data terlindungi
              </p>
            </div>

            <div>
              <div className="text-lg sm:text-xl">
                ⚡
              </div>

              <p className="mt-1 text-[10px] font-bold text-white sm:mt-2 sm:text-xs">
                Cepat
              </p>

              <p className="mt-1 text-[9px] text-zinc-200 sm:text-[10px]">
                Mudah digunakan
              </p>
            </div>

            <div>
              <div className="text-lg sm:text-xl">
                ⚙️
              </div>

              <p className="mt-1 text-[10px] font-bold text-white sm:mt-2 sm:text-xs">
                Terpercaya
              </p>

              <p className="mt-1 text-[9px] text-zinc-200 sm:text-[10px]">
                Untuk bisnis Anda
              </p>
            </div>
          </div>

          {/* FOOTER */}
          <div className="mt-6 text-center sm:mt-8">
            <p className="text-[9px] font-bold tracking-[0.25em] text-zinc-200 sm:text-[10px] sm:tracking-[0.3em]">
              SMART WASH MANAGEMENT
            </p>

            <div className="mx-auto mt-3 h-1 w-12 rounded-full bg-red-500" />
          </div>
        </div>
      </div>
    </main>
  );
}