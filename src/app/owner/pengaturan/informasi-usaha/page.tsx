"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

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

  async function loadProfile() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/owner/business-profile");
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.error || "Gagal mengambil informasi usaha"
        );
      }

      const currentProfile = data.profile as BusinessProfile | null;

      setProfile(currentProfile);

      if (currentProfile) {
        setBusinessName(currentProfile.businessName);
        setAddress(currentProfile.address);
        setPostalCode(currentProfile.postalCode ?? "");
        setPhone(currentProfile.phone);
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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!businessName.trim()) {
      alert("Nama usaha wajib diisi.");
      return;
    }

    if (!address.trim()) {
      alert("Alamat wajib diisi.");
      return;
    }

    if (!phone.trim()) {
      alert("Nomor telepon wajib diisi.");
      return;
    }

    try {
      setSaving(true);

      const response = await fetch("/api/owner/business-profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          businessName: businessName.trim(),
          address: address.trim(),
          postalCode: postalCode.trim(),
          phone: phone.trim(),
          whatsapp: whatsapp.trim(),
          socialMedia: socialMedia.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.error || "Gagal menyimpan informasi usaha"
        );
      }

      setProfile(data.profile);

      alert("Informasi usaha berhasil disimpan.");
    } catch (error) {
      console.error("handleSubmit error:", error);

      alert(
        error instanceof Error
          ? error.message
          : "Gagal menyimpan informasi usaha"
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="min-h-screen bg-black px-4 py-6 text-white">
      <div className="mx-auto max-w-md">

        {/* HEADER */}
        <div className="mb-7">
          <Link
            href="/owner/pengaturan"
            className="mb-5 inline-block text-sm font-bold text-zinc-400 transition hover:text-white"
          >
            {"\u2190"} KEMBALI
          </Link>

          <div className="text-xs font-black tracking-[0.18em] text-red-500">
            OWNER
          </div>

          <h1 className="mt-2 text-3xl font-black tracking-tight">
            INFORMASI USAHA
          </h1>

          <p className="mt-2 text-sm text-zinc-500">
            Kelola identitas usaha yang digunakan pada aplikasi dan struk
          </p>

          <div className="mt-6 h-px bg-red-950" />
        </div>

        {/* LOADING */}
        {loading ? (
          <section className="rounded-3xl border border-zinc-900 bg-zinc-950 p-5 text-center">
            <p className="text-sm font-bold text-zinc-500">
              MEMUAT INFORMASI USAHA...
            </p>
          </section>

        ) : error ? (

          /* ERROR */
          <section className="rounded-3xl border border-red-900 bg-red-950/40 p-5">
            <p className="text-sm font-bold text-red-400">
              {error}
            </p>

            <button
              type="button"
              onClick={loadProfile}
              className="mt-4 rounded-xl border border-red-800 px-4 py-2 text-xs font-black text-red-400 transition hover:bg-red-950"
            >
              COBA LAGI
            </button>
          </section>

        ) : (

          /* FORM */
          <form onSubmit={handleSubmit} className="space-y-4">

            {/* IDENTITAS USAHA */}
            <section className="rounded-3xl border border-zinc-900 bg-zinc-950 p-5">
              <h2 className="text-lg font-black">
                IDENTITAS USAHA
              </h2>

              <p className="mt-1 text-xs text-zinc-500">
                Informasi ini dapat digunakan pada struk.
              </p>

              <div className="mt-5 space-y-4">

                {/* NAMA USAHA */}
                <div>
                  <label className="mb-2 block text-xs font-black text-zinc-400">
                    NAMA USAHA
                  </label>

                  <input
                    type="text"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    placeholder="Contoh: Halmahera Motowash"
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm font-bold text-white outline-none placeholder:text-zinc-600 focus:border-red-600"
                  />
                </div>

                {/* ALAMAT */}
                <div>
                  <label className="mb-2 block text-xs font-black text-zinc-400">
                    ALAMAT
                  </label>

                  <textarea
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Masukkan alamat usaha"
                    rows={3}
                    className="w-full resize-none rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm font-bold text-white outline-none placeholder:text-zinc-600 focus:border-red-600"
                  />
                </div>

                {/* KODE POS */}
                <div>
                  <label className="mb-2 block text-xs font-black text-zinc-400">
                    KODE POS
                  </label>

                  <input
                    type="text"
                    inputMode="numeric"
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    placeholder="Contoh: 95111"
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm font-bold text-white outline-none placeholder:text-zinc-600 focus:border-red-600"
                  />
                </div>

                {/* TELEPON */}
                <div>
                  <label className="mb-2 block text-xs font-black text-zinc-400">
                    TELEPON
                  </label>

                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Contoh: 08123456789"
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm font-bold text-white outline-none placeholder:text-zinc-600 focus:border-red-600"
                  />
                </div>

                {/* WHATSAPP */}
                <div>
                  <label className="mb-2 block text-xs font-black text-zinc-400">
                    WHATSAPP
                  </label>

                  <input
                    type="tel"
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    placeholder="Contoh: 08123456789"
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm font-bold text-white outline-none placeholder:text-zinc-600 focus:border-red-600"
                  />
                </div>

                {/* MEDIA SOSIAL */}
                <div>
                  <label className="mb-2 block text-xs font-black text-zinc-400">
                    MEDIA SOSIAL
                  </label>

                  <input
                    type="text"
                    value={socialMedia}
                    onChange={(e) => setSocialMedia(e.target.value)}
                    placeholder="Contoh: @halmaheramotowash"
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm font-bold text-white outline-none placeholder:text-zinc-600 focus:border-red-600"
                  />
                </div>

              </div>
            </section>

            {/* LOGO USAHA */}
            <section className="rounded-3xl border border-zinc-900 bg-zinc-950 p-5">
              <h2 className="text-lg font-black">
                LOGO USAHA
              </h2>

              <p className="mt-1 text-xs text-zinc-500">
                Pengaturan logo akan kita kerjakan pada tahap berikutnya.
              </p>

              <div className="mt-4 rounded-xl border border-zinc-800 bg-black p-4">
                <p className="text-sm font-bold text-zinc-500">
                  Belum ada logo usaha.
                </p>
              </div>
            </section>

            {/* SIMPAN */}
            <button
              type="submit"
              disabled={saving}
              className="w-full rounded-2xl bg-red-600 px-4 py-4 text-sm font-black text-white transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving
                ? "MENYIMPAN..."
                : "SIMPAN INFORMASI USAHA"}
            </button>

            {/* STATUS DATABASE */}
            {profile && (
              <p className="text-center text-[11px] font-bold text-zinc-600">
                Data usaha sudah tersimpan di database.
              </p>
            )}

          </form>
        )}

      </div>
    </main>
  );
}