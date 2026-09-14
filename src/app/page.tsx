"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type CurrentUser = {
  userId: number;
  username: string;
  role: "OWNER" | "KARYAWAN";
};

export default function HomePage() {
  const [currentUser, setCurrentUser] =
    useState<CurrentUser | null>(null);

  const [loadingUser, setLoadingUser] =
    useState(true);

  const [showLogoutModal, setShowLogoutModal] =
    useState(false);

  const [loggingOut, setLoggingOut] =
    useState(false);

  const goToOwner = () => {
    window.location.href = "/owner";
  };

  function openLogoutModal() {
    if (loggingOut) {
      return;
    }

    setShowLogoutModal(true);
  }

  function closeLogoutModal() {
    if (loggingOut) {
      return;
    }

    setShowLogoutModal(false);
  }

  const handleLogout = async () => {
    if (loggingOut) {
      return;
    }

    setLoggingOut(true);

    try {
      await fetch("/api/logout", {
        method: "POST",
      });
    } catch (error) {
      console.error(
        "Logout error:",
        error
      );
    } finally {
      window.location.href = "/login";
    }
  };

    useEffect(() => {
    async function loadCurrentUser() {
      try {
        const response = await fetch("/api/me");

        if (!response.ok) {
          window.location.href = "/login";
          return;
        }

        const data = await response.json();

        if (data.user) {
          setCurrentUser(data.user);
        } else {
          window.location.href = "/login";
        }
      } catch (error) {
        console.error("Load current user error:", error);
        window.location.href = "/login";
      } finally {
        setLoadingUser(false);
      }
    }

    loadCurrentUser();
  }, []);

  const displayName =
    currentUser?.username || "Operator";

  return (
    <main className="min-h-screen bg-black text-white">

      <div className="mx-auto min-h-screen w-full max-w-md bg-[#080808] pb-24">

        {/* HEADER */}
        <header className="px-5 pb-5 pt-6">

          <div className="flex items-center justify-between">

            <div>

              <p className="text-xs font-bold tracking-[0.25em] text-red-500">
                HALMAHERA
              </p>

              <h1 className="mt-1 text-2xl font-black tracking-tight">
                MOTOWASH
              </h1>

            </div>

            {/* TOMBOL LOGOUT */}
            <button
              type="button"
              onClick={openLogoutModal}
              title="Logout"
              aria-label="Logout"
              className="flex h-11 w-11 items-center justify-center rounded-full border border-zinc-800 bg-zinc-950 text-xl transition hover:border-red-600 hover:bg-red-950/30 active:scale-95"
            >
              🚪
            </button>

          </div>

          <div className="mt-6">

            <p className="text-sm text-zinc-400">
              Selamat Datang
            </p>

            <div className="mt-1 flex items-center gap-2">

              <h2 className="max-w-[230px] truncate text-xl font-black">
                {loadingUser
                  ? "..."
                  : displayName}
              </h2>

              <span className="rounded-full bg-red-600 px-3 py-1 text-[10px] font-black">
                {currentUser?.role ===
                "OWNER"
                  ? "OWNER"
                  : "KASIR"}
              </span>

            </div>

            <p className="mt-2 text-sm leading-6 text-zinc-500">
              Siap melayani pelanggan dengan cepat dan akurat.
            </p>

          </div>

        </header>

        {/* SCAN KENDARAAN */}
        <section className="px-5">

          <Link
            href="/cuci"
            className="block rounded-3xl border border-red-900/70 bg-gradient-to-br from-red-950/80 to-zinc-950 p-5 transition active:scale-[0.98]"
          >

            <div className="flex items-start justify-between">

              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-red-600">
                <span className="text-3xl">
                  📷
                </span>
              </div>

              <span className="rounded-full bg-red-600 px-5 py-2 text-xs font-black">
                MULAI
              </span>

            </div>

            <p className="mt-5 text-xs font-black tracking-[0.25em] text-red-500">
              TRANSAKSI BARU
            </p>

            <h2 className="mt-2 text-2xl font-black">
              SCAN KENDARAAN
            </h2>

            <p className="mt-2 max-w-sm text-sm leading-6 text-zinc-400">
              Identifikasi motor atau mobil dan tampilkan harga rekomendasi.
            </p>

          </Link>

        </section>

        {/* MENU UTAMA */}
        <section className="px-5 pb-5 pt-5">

          <div className="grid grid-cols-2 gap-3">

            {/* CUCI */}
            <Link
              href="/cuci"
              className="rounded-3xl border border-zinc-800 bg-zinc-950 p-5 transition active:scale-[0.98]"
            >

              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-600/15">
                <span className="text-2xl">
                  🧼
                </span>
              </div>

              <h3 className="mt-4 font-black">
                CUCI
              </h3>

              <p className="mt-1 text-xs text-zinc-500">
                Transaksi kendaraan
              </p>

            </Link>

            {/* RIWAYAT */}
            <Link
              href="/riwayat"
              className="rounded-3xl border border-zinc-800 bg-zinc-950 p-5 transition active:scale-[0.98]"
            >

              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-600/15">
                <span className="text-2xl">
                  🧾
                </span>
              </div>

              <h3 className="mt-4 font-black">
                RIWAYAT
              </h3>

              <p className="mt-1 text-xs text-zinc-500">
                Transaksi sebelumnya
              </p>

            </Link>

            {/* HASIL */}
            <Link
              href="/hasil"
              className="rounded-3xl border border-zinc-800 bg-zinc-950 p-5 transition active:scale-[0.98]"
            >

              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-600/15">
                <span className="text-2xl">
                  💰
                </span>
              </div>

              <h3 className="mt-4 font-black">
                HASIL
              </h3>

              <p className="mt-1 text-xs text-zinc-500">
                Hasil karyawan
              </p>

            </Link>

            {/* OWNER */}
            <button
              type="button"
              onClick={goToOwner}
              className="w-full rounded-3xl border border-zinc-800 bg-zinc-950 p-5 text-left transition active:scale-[0.98]"
            >

              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-600/15">
                <span className="text-2xl">
                  📊
                </span>
              </div>

              <h3 className="mt-4 font-black">
                OWNER
              </h3>

              <p className="mt-1 text-xs text-zinc-500">
                Dashboard pemilik
              </p>

            </button>

          </div>

        </section>

        {/* BOTTOM NAVIGATION */}
        <nav className="fixed bottom-0 left-1/2 z-50 w-full max-w-md -translate-x-1/2 border-t border-zinc-800 bg-[#080808]/95 px-2 pb-2 pt-2 backdrop-blur">

          <div className="grid grid-cols-5">

            {/* BERANDA */}
            <Link
              href="/"
              className="flex flex-col items-center gap-1 px-1 py-2 text-red-500"
            >
              <span className="text-lg">
                ⌂
              </span>

              <span className="text-[10px] font-bold">
                BERANDA
              </span>
            </Link>

            {/* CUCI */}
            <Link
              href="/cuci"
              className="flex flex-col items-center gap-1 px-1 py-2 text-zinc-500"
            >
              <span className="text-lg">
                🧼
              </span>

              <span className="text-[10px] font-bold">
                CUCI
              </span>
            </Link>

            {/* RIWAYAT */}
            <Link
              href="/riwayat"
              className="flex flex-col items-center gap-1 px-1 py-2 text-zinc-500"
            >
              <span className="text-lg">
                🧾
              </span>

              <span className="text-[10px] font-bold">
                RIWAYAT
              </span>
            </Link>

            {/* HASIL */}
            <Link
              href="/hasil"
              className="flex flex-col items-center gap-1 px-1 py-2 text-zinc-500"
            >
              <span className="text-lg">
                💰
              </span>

              <span className="text-[10px] font-bold">
                HASIL
              </span>
            </Link>

            {/* MENU */}
            <Link
              href="/owner"
              className="flex flex-col items-center gap-1 px-1 py-2 text-zinc-500"
            >
              <span className="text-lg">
                ☰
              </span>

              <span className="text-[10px] font-bold">
                MENU
              </span>
            </Link>

          </div>

        </nav>

      </div>

      {/* LOGOUT CONFIRMATION MODAL */}
      {showLogoutModal && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 px-5 backdrop-blur-sm"
          onClick={closeLogoutModal}
        >

          <div
            className="w-full max-w-sm rounded-3xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            {/* ICON */}
            <div className="flex justify-center">

              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-600/15 text-3xl">
                🚪
              </div>

            </div>

            {/* TITLE */}
            <div className="mt-5 text-center">

              <h2 className="text-xl font-black text-white">
                KONFIRMASI LOGOUT
              </h2>

              <p className="mt-2 text-sm leading-6 text-zinc-400">
                Apakah Anda yakin ingin
                keluar dari aplikasi?
              </p>

            </div>

            {/* BUTTON */}
            <div className="mt-6 grid grid-cols-2 gap-3">

              <button
                type="button"
                onClick={closeLogoutModal}
                disabled={loggingOut}
                className="rounded-2xl border border-zinc-800 bg-zinc-900 px-4 py-4 text-sm font-black text-zinc-300 transition hover:bg-zinc-800 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-50"
              >
                BATAL
              </button>

              <button
                type="button"
                onClick={handleLogout}
                disabled={loggingOut}
                className="rounded-2xl bg-red-600 px-4 py-4 text-sm font-black text-white transition hover:bg-red-700 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loggingOut
                  ? "KELUAR..."
                  : "LOGOUT"}
              </button>

            </div>

          </div>

        </div>
      )}

    </main>
  );
}