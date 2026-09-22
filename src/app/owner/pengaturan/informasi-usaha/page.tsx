"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { apiGet, apiFetch } from "@/lib/api-client";

type BusinessProfile = {
  id: number;
  businessName: string;
  address: string;
  postalCode: string | null;
  phone: string;
  whatsapp: string | null;
  socialMedia: string | null;
  logo: string | null;
};

export default function InformasiUsahaPage() {
  const [profile, setProfile] = useState<BusinessProfile | null>(null);

  const [businessName, setBusinessName] = useState("");
  const [address, setAddress] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [phone, setPhone] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [socialMedia, setSocialMedia] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function loadProfile() {
    try {
      setLoading(true);
      setError("");
      setSuccess("");

      const response = await apiGet("/api/owner/business-profile");
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.error || "Gagal mengambil informasi usaha"
        );
      }

      const currentProfile = data.profile as BusinessProfile | null;

      setProfile(currentProfile);

      if (currentProfile) {
        setBusinessName(currentProfile.businessName ?? "");
        setAddress(currentProfile.address ?? "");
        setPostalCode(currentProfile.postalCode ?? "");
        setPhone(currentProfile.phone ?? "");
        setWhatsapp(currentProfile.whatsapp ?? "");
        setSocialMedia(currentProfile.socialMedia ?? "");
      }
    } catch (error) {
      console.error("loadProfile error:", error);

      setError(
        error instanceof Error
          ? error.message
          : "Gagal mengambil informasi usaha"
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProfile();
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!businessName.trim()) {
      setError("Nama usaha wajib diisi.");
      return;
    }

    if (!address.trim()) {
      setError("Alamat usaha wajib diisi.");
      return;
    }

    if (!phone.trim()) {
      setError("Nomor telepon wajib diisi.");
      return;
    }

    try {
      setSaving(true);

      const response = await apiFetch("/api/owner/business-profile", {
  method: "PUT",
  json: {
    // PERTAHANKAN SELURUH ISI object yang sekarang
  },
});

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.error || "Gagal menyimpan informasi usaha"
        );
      }

      setProfile(data.profile);
      setSuccess("Informasi usaha berhasil disimpan.");

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    } catch (error) {
      console.error("handleSubmit error:", error);

      setError(
        error instanceof Error
          ? error.message
          : "Gagal menyimpan informasi usaha"
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#070b12] px-4 py-6 text-white sm:px-6">
      <div className="mx-auto w-full max-w-4xl">
        {/* HEADER */}
        <header className="mb-7">
          <Link
            href="/owner/pengaturan"
            className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-slate-400 transition hover:text-red-500"
          >
            <span className="text-lg">←</span>
            Kembali ke Pengaturan
          </Link>

          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="mb-2 text-xs font-black uppercase tracking-[0.2em] text-red-500">
                Owner Panel
              </p>

              <h1 className="text-3xl font-black tracking-tight text-white sm:text-4xl">
                Informasi Usaha
              </h1>

              <p className="mt-3 max-w-xl text-sm leading-6 text-slate-400">
                Kelola identitas usaha yang digunakan pada aplikasi,
                laporan, dan struk pembayaran.
              </p>
            </div>

            <div className="hidden h-14 w-14 items-center justify-center rounded-2xl border border-red-500/30 bg-gradient-to-br from-red-600/30 to-slate-900 text-2xl shadow-lg shadow-red-950/30 sm:flex">
              🏪
            </div>
          </div>

          <div className="mt-6 h-px bg-gradient-to-r from-red-600/70 via-slate-700 to-transparent" />
        </header>

        {/* LOADING */}
        {loading && (
          <section className="rounded-3xl border border-slate-700/80 bg-gradient-to-br from-[#241017] to-[#0c1622] p-8 text-center shadow-xl shadow-black/20">
            <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-slate-700 border-t-red-500" />

            <p className="text-sm font-semibold text-slate-400">
              Memuat informasi usaha...
            </p>
          </section>
        )}

        {/* ERROR */}
        {!loading && error && (
          <section className="mb-5 rounded-3xl border border-red-500/40 bg-gradient-to-br from-red-950/80 to-[#101722] p-5">
            <div className="flex gap-3">
              <div className="text-xl">⚠️</div>

              <div className="flex-1">
                <h2 className="font-black text-red-400">
                  Terjadi Kesalahan
                </h2>

                <p className="mt-1 text-sm leading-6 text-red-200">
                  {error}
                </p>

                <button
                  type="button"
                  onClick={loadProfile}
                  className="mt-4 rounded-xl border border-red-500/50 bg-red-950/40 px-4 py-2 text-xs font-black uppercase tracking-wide text-red-300 transition hover:bg-red-900/60"
                >
                  Coba Lagi
                </button>
              </div>
            </div>
          </section>
        )}

        {/* SUCCESS */}
        {!loading && success && (
          <section className="mb-5 rounded-3xl border border-emerald-500/40 bg-gradient-to-br from-emerald-950/70 to-[#101722] p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
                ✓
              </div>

              <p className="text-sm font-bold text-emerald-300">
                {success}
              </p>
            </div>
          </section>
        )}

        {/* FORM */}
        {!loading && !error && (
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* IDENTITAS USAHA */}
            <section className="rounded-3xl border border-red-500/35 bg-gradient-to-br from-[#3a1118] via-[#1b121c] to-[#101b2a] p-5 shadow-xl shadow-black/20 sm:p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-red-500/60 bg-gradient-to-br from-red-600 to-red-900 text-xl shadow-lg shadow-red-950/40">
                  🏪
                </div>

                <div>
                  <h2 className="text-lg font-black text-white">
                    Identitas Usaha
                  </h2>

                  <p className="mt-1 text-xs text-slate-400">
                    Data utama usaha Anda.
                  </p>
                </div>
              </div>

              <div className="mt-6 space-y-5">
                {/* NAMA USAHA */}
                <div>
                  <label
                    htmlFor="businessName"
                    className="mb-2 block text-xs font-black uppercase tracking-wide text-slate-300"
                  >
                    Nama Usaha
                  </label>

                  <input
                    id="businessName"
                    type="text"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    placeholder="Contoh: Halmahera Motowash"
                    className="w-full rounded-2xl border border-slate-700 bg-[#0a111b] px-4 py-3.5 text-sm font-semibold text-white outline-none transition placeholder:text-slate-600 focus:border-red-500 focus:bg-[#0d1521] focus:ring-4 focus:ring-red-500/10"
                  />
                </div>

                {/* ALAMAT */}
                <div>
                  <label
                    htmlFor="address"
                    className="mb-2 block text-xs font-black uppercase tracking-wide text-slate-300"
                  >
                    Alamat Usaha
                  </label>

                  <textarea
                    id="address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Masukkan alamat lengkap usaha"
                    rows={4}
                    className="w-full resize-none rounded-2xl border border-slate-700 bg-[#0a111b] px-4 py-3.5 text-sm font-semibold leading-6 text-white outline-none transition placeholder:text-slate-600 focus:border-red-500 focus:bg-[#0d1521] focus:ring-4 focus:ring-red-500/10"
                  />
                </div>

                {/* KODE POS */}
                <div>
                  <label
                    htmlFor="postalCode"
                    className="mb-2 block text-xs font-black uppercase tracking-wide text-slate-300"
                  >
                    Kode Pos
                  </label>

                  <input
                    id="postalCode"
                    type="text"
                    inputMode="numeric"
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    placeholder="Contoh: 95111"
                    className="w-full rounded-2xl border border-slate-700 bg-[#0a111b] px-4 py-3.5 text-sm font-semibold text-white outline-none transition placeholder:text-slate-600 focus:border-red-500 focus:bg-[#0d1521] focus:ring-4 focus:ring-red-500/10"
                  />
                </div>
              </div>
            </section>

            {/* KONTAK USAHA */}
            <section className="rounded-3xl border border-red-500/35 bg-gradient-to-br from-[#321018] via-[#1a121b] to-[#101b2a] p-5 shadow-xl shadow-black/20 sm:p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-red-500/60 bg-gradient-to-br from-red-600 to-red-900 text-xl shadow-lg shadow-red-950/40">
                  📞
                </div>

                <div>
                  <h2 className="text-lg font-black text-white">
                    Kontak Usaha
                  </h2>

                  <p className="mt-1 text-xs text-slate-400">
                    Nomor kontak yang dapat ditampilkan pada struk.
                  </p>
                </div>
              </div>

              <div className="mt-6 space-y-5">
                {/* TELEPON */}
                <div>
                  <label
                    htmlFor="phone"
                    className="mb-2 block text-xs font-black uppercase tracking-wide text-slate-300"
                  >
                    Nomor Telepon
                  </label>

                  <input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Contoh: 08123456789"
                    className="w-full rounded-2xl border border-slate-700 bg-[#0a111b] px-4 py-3.5 text-sm font-semibold text-white outline-none transition placeholder:text-slate-600 focus:border-red-500 focus:bg-[#0d1521] focus:ring-4 focus:ring-red-500/10"
                  />
                </div>

                {/* WHATSAPP */}
                <div>
                  <label
                    htmlFor="whatsapp"
                    className="mb-2 block text-xs font-black uppercase tracking-wide text-slate-300"
                  >
                    Nomor WhatsApp
                  </label>

                  <input
                    id="whatsapp"
                    type="tel"
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    placeholder="Contoh: 08123456789"
                    className="w-full rounded-2xl border border-slate-700 bg-[#0a111b] px-4 py-3.5 text-sm font-semibold text-white outline-none transition placeholder:text-slate-600 focus:border-red-500 focus:bg-[#0d1521] focus:ring-4 focus:ring-red-500/10"
                  />
                </div>

                {/* MEDIA SOSIAL */}
                <div>
                  <label
                    htmlFor="socialMedia"
                    className="mb-2 block text-xs font-black uppercase tracking-wide text-slate-300"
                  >
                    Media Sosial
                  </label>

                  <input
                    id="socialMedia"
                    type="text"
                    value={socialMedia}
                    onChange={(e) => setSocialMedia(e.target.value)}
                    placeholder="Contoh: @halmaheramotowash"
                    className="w-full rounded-2xl border border-slate-700 bg-[#0a111b] px-4 py-3.5 text-sm font-semibold text-white outline-none transition placeholder:text-slate-600 focus:border-red-500 focus:bg-[#0d1521] focus:ring-4 focus:ring-red-500/10"
                  />
                </div>
              </div>
            </section>

            {/* LOGO USAHA */}
            <section className="rounded-3xl border border-red-500/35 bg-gradient-to-br from-[#321018] via-[#1a121b] to-[#101b2a] p-5 shadow-xl shadow-black/20 sm:p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-red-500/60 bg-gradient-to-br from-red-600 to-red-900 text-xl shadow-lg shadow-red-950/40">
                  🖼️
                </div>

                <div>
                  <h2 className="text-lg font-black text-white">
                    Logo Usaha
                  </h2>

                  <p className="mt-1 text-xs text-slate-400">
                    Logo digunakan untuk identitas usaha dan struk.
                  </p>
                </div>
              </div>

              <div className="mt-5 rounded-2xl border border-dashed border-slate-700 bg-[#0a111b]/80 p-5 text-center">
                {profile?.logo ? (
                  <div className="space-y-3">
                    <img
                      src={profile.logo}
                      alt="Logo usaha"
                      className="mx-auto max-h-28 max-w-full rounded-xl object-contain"
                    />

                    <p className="text-xs font-semibold text-slate-400">
                      Logo usaha sudah tersedia.
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl border border-red-500/30 bg-gradient-to-br from-red-900/60 to-slate-900 text-2xl">
                      🏪
                    </div>

                    <p className="text-sm font-bold text-slate-300">
                      Belum ada logo usaha
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      Fitur unggah logo akan ditambahkan pada tahap berikutnya.
                    </p>
                  </>
                )}
              </div>
            </section>

            {/* TOMBOL SIMPAN */}
            <button
              type="submit"
              disabled={saving}
              className="flex w-full items-center justify-center gap-2 rounded-2xl border border-red-500/60 bg-gradient-to-r from-red-600 via-red-700 to-red-900 px-4 py-4 text-sm font-black uppercase tracking-wide text-white shadow-xl shadow-red-950/40 transition hover:from-red-500 hover:via-red-600 hover:to-red-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-red-200 border-t-transparent" />
                  Menyimpan...
                </>
              ) : (
                <>
                  <span>✓</span>
                  Simpan Informasi Usaha
                </>
              )}
            </button>

            {profile && (
              <p className="pb-4 text-center text-[11px] font-semibold text-slate-600">
                Informasi usaha terhubung dengan database aplikasi.
              </p>
            )}
          </form>
        )}
      </div>
    </main>
  );
}