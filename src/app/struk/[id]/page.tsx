"use client";

import {
  useEffect,
  useRef,
  useState,
} from "react";
import { useParams, useRouter } from "next/navigation";

type Transaction = {
  id: number;
  transactionNumber: string;
  licensePlateSnapshot: string | null;
  brandSnapshot: string | null;
  modelSnapshot: string | null;
  categorySnapshot: string;
  vehicleType: "MOTOR" | "MOBIL";
  price: number;
  status: string;
  createdAt: string;
};

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

type ReceiptSetting = {
  id: number;
  paperWidth: number;
  showBusinessName: boolean;
  showAddress: boolean;
  showPhone: boolean;
  footerText: string | null;
};

export default function StrukPage() {
  const params = useParams();
  const router = useRouter();

  const transactionId = Array.isArray(params.id)
    ? params.id[0]
    : params.id;

  const [transaction, setTransaction] =
    useState<Transaction | null>(null);

  const [businessProfile, setBusinessProfile] =
    useState<BusinessProfile | null>(null);

  const [receiptSetting, setReceiptSetting] =
    useState<ReceiptSetting | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [printing, setPrinting] = useState(false);
  const [printMessage, setPrintMessage] = useState("");

  const printSuccessHandled = useRef(false);

  const printFallbackTimer = useRef<
    ReturnType<typeof setTimeout> | null
  >(null);

  /*
   * MEMUAT DATA STRUK
   */
  useEffect(() => {
    const controller = new AbortController();

    async function loadReceiptData() {
      try {
        setLoading(true);
        setError("");

        if (!transactionId) {
          setError("ID transaksi tidak tersedia.");
          return;
        }

        const response = await fetch(
          `/api/transactions/${transactionId}/receipt`,
          {
            method: "GET",
            cache: "no-store",
            signal: controller.signal,
          }
        );

        const contentType =
          response.headers.get("content-type") || "";

        if (!contentType.includes("application/json")) {
          throw new Error(
            `Server mengembalikan respons bukan JSON. Status: ${response.status}`
          );
        }

        const data = await response.json();

        if (!response.ok || !data.success) {
          setError(
            data.error || "Transaksi tidak ditemukan."
          );
          return;
        }

        if (!data.transaction) {
          setError("Data transaksi tidak tersedia.");
          return;
        }

        setTransaction(data.transaction);
        setBusinessProfile(
          data.businessProfile || null
        );
        setReceiptSetting(
          data.receiptSetting || null
        );
      } catch (error) {
        if (
          error instanceof DOMException &&
          error.name === "AbortError"
        ) {
          return;
        }

        console.error(
          "Struk transaksi error:",
          error
        );

        setError(
          error instanceof Error
            ? error.message
            : "Tidak dapat mengambil data struk."
        );
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    loadReceiptData();

    return () => {
      controller.abort();
    };
  }, [transactionId]);

  /*
   * MENANGANI EVENT SELESAI CETAK
   */
  useEffect(() => {
    async function handleAfterPrint() {
      if (!transaction) {
        setPrinting(false);
        return;
      }

      if (printSuccessHandled.current) {
        return;
      }

      printSuccessHandled.current = true;

      if (printFallbackTimer.current) {
        clearTimeout(printFallbackTimer.current);
        printFallbackTimer.current = null;
      }

      console.log("Dialog print browser selesai.");

      try {
        const response = await fetch(
          `/api/transactions/${transaction.id}/print`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              action: "SUCCESS",
            }),
          }
        );

        const contentType =
          response.headers.get("content-type") || "";

        if (!contentType.includes("application/json")) {
          throw new Error(
            "Respons server cetak bukan JSON."
          );
        }

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(
            data.error ||
              "Gagal menyimpan status cetak."
          );
        }

        console.log(
          "Status PRINTED berhasil disimpan:",
          data
        );

        setPrintMessage("Struk berhasil dicetak.");
      } catch (error) {
        console.error(
          "Gagal menyimpan status PRINTED:",
          error
        );

        setPrintMessage(
          "Dialog cetak selesai, tetapi status cetak belum dapat disimpan."
        );
      } finally {
        setPrinting(false);
      }
    }

    window.addEventListener(
      "afterprint",
      handleAfterPrint
    );

    return () => {
      window.removeEventListener(
        "afterprint",
        handleAfterPrint
      );

      if (printFallbackTimer.current) {
        clearTimeout(printFallbackTimer.current);
        printFallbackTimer.current = null;
      }
    };
  }, [transaction]);

  /*
   * FORMAT RUPIAH
   */
  function formatRupiah(value: number) {
    return `Rp${value.toLocaleString("id-ID")}`;
  }

  /*
   * FORMAT TANGGAL
   */
  function formatDate(value: string) {
    return new Date(value).toLocaleString("id-ID");
  }

  /*
   * PROSES CETAK STRUK
   */
  async function handlePrint() {
    if (!transaction) {
      alert("Data transaksi belum tersedia.");
      return;
    }

    if (printing) {
      return;
    }

    printSuccessHandled.current = false;

    if (printFallbackTimer.current) {
      clearTimeout(printFallbackTimer.current);
      printFallbackTimer.current = null;
    }

    setPrinting(true);
    setPrintMessage("");

    try {
      /*
       * 1. CATAT PROSES CETAK DIMULAI
       */
      const startResponse = await fetch(
        `/api/transactions/${transaction.id}/print`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            action: "START",
          }),
        }
      );

      const startContentType =
        startResponse.headers.get("content-type") || "";

      if (!startContentType.includes("application/json")) {
        throw new Error(
          "Respons server saat memulai cetak bukan JSON."
        );
      }

      const startData = await startResponse.json();

      if (
        !startResponse.ok ||
        !startData.success
      ) {
        alert(
          startData.error ||
            "Gagal memulai proses cetak."
        );

        setPrinting(false);
        return;
      }

      console.log(
        "Print START berhasil:",
        startData
      );

      /*
       * 2. BUKA DIALOG CETAK BROWSER
       */
      window.print();

      /*
       * 3. FALLBACK UNTUK ANDROID/BROWSER
       *
       * Beberapa browser/WebView tidak mengirim
       * event afterprint dengan benar.
       */
      printFallbackTimer.current = setTimeout(() => {
        if (!printSuccessHandled.current) {
          console.warn(
            "Event afterprint tidak diterima."
          );

          setPrinting(false);

          setPrintMessage(
            "Dialog cetak selesai. Status cetak akan diperbarui jika server tersedia."
          );
        }
      }, 1500);
    } catch (error) {
      console.error(
        "Print start error:",
        error
      );

      try {
        await fetch(
          `/api/transactions/${transaction.id}/print`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              action: "FAILED",
              error:
                error instanceof Error
                  ? error.message
                  : "Tidak dapat memulai proses cetak",
            }),
          }
        );
      } catch (statusError) {
        console.error(
          "Gagal menyimpan status print:",
          statusError
        );
      }

      setPrinting(false);

      alert(
        "Tidak dapat memulai proses cetak."
      );
    }
  }

  /*
   * TAMPILAN LOADING
   */
  if (loading) {
    return (
      <main className="min-h-screen bg-black px-4 py-6 text-white">
        <div className="mx-auto max-w-md">
          <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6 text-center">
            <p className="text-sm font-bold text-zinc-400">
              MEMUAT STRUK...
            </p>
          </div>
        </div>
      </main>
    );
  }

  /*
   * TAMPILAN ERROR
   */
  if (error || !transaction) {
    return (
      <main className="min-h-screen bg-black px-4 py-6 text-white">
        <div className="mx-auto max-w-md">
          <button
            type="button"
            onClick={() => router.push("/riwayat")}
            className="mb-6 flex h-10 w-10 items-center justify-center rounded-xl bg-red-600 text-xl font-black text-white shadow-lg transition active:scale-[0.95]"
          >
            ←
          </button>

          <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6 text-center">
            <div className="text-4xl font-black text-red-500">
              !
            </div>

            <h1 className="mt-3 text-lg font-black">
              STRUK TIDAK DITEMUKAN
            </h1>

            <p className="mt-2 text-sm text-zinc-500">
              {error ||
                "Data transaksi tidak tersedia."}
            </p>
          </div>
        </div>
      </main>
    );
  }

  const modelName =
    transaction.modelSnapshot?.trim() || "";

  const brandName =
    transaction.brandSnapshot?.trim() || "";

  const licensePlate =
    transaction.licensePlateSnapshot?.trim() || "";

  const vehicleName =
    modelName ||
    brandName ||
    "Model tidak diisi";

  const paperWidth =
    receiptSetting?.paperWidth === 80
      ? 80
      : 58;

  const businessName =
    businessProfile?.businessName?.trim() ||
    "HALMAHERA MOTOWASH";

  const businessAddress =
    businessProfile?.address?.trim() || "";

  const businessPhone =
    businessProfile?.phone?.trim() || "";

  const businessSocialMedia =
    businessProfile?.socialMedia?.trim() || "";

  const footerText =
    receiptSetting?.footerText?.trim() || "";

  return (
    <>
      <main className="min-h-screen bg-zinc-100 px-4 py-6 text-black">
        <div className="mx-auto max-w-md">
          {/* HEADER PREVIEW */}
          <div className="mb-5 flex items-center justify-between print:hidden">
            <button
              type="button"
              onClick={() =>
                router.push(
                  `/detail/${transaction.id}`
                )
              }
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-600 text-xl font-black text-white shadow-lg transition active:scale-[0.95]"
            >
              ←
            </button>

            <h1 className="text-lg font-black">
              PREVIEW STRUK
            </h1>

            <div className="w-10" />
          </div>

          {/* STRUK */}
          <section className="rounded-2xl bg-white p-6 shadow-xl">
            {/* INFORMASI USAHA */}
            <div className="border-b-2 border-dashed border-zinc-300 pb-5 text-center">
              {receiptSetting?.showBusinessName && (
                <h2 className="text-2xl font-black tracking-wide">
                  {businessName}
                </h2>
              )}

              {receiptSetting?.showAddress &&
                businessAddress && (
                  <div className="mt-3 whitespace-pre-line text-[10px] font-bold leading-relaxed text-zinc-600">
                    {businessAddress}
                  </div>
                )}

              {receiptSetting?.showPhone &&
                (businessPhone ||
                  businessSocialMedia) && (
                  <div className="mt-3 text-[10px] font-black leading-relaxed text-zinc-700">
                    {businessSocialMedia && (
                      <p>{businessSocialMedia}</p>
                    )}

                    {businessPhone && (
                      <p
                        className={
                          businessSocialMedia
                            ? "mt-1"
                            : ""
                        }
                      >
                        HP: {businessPhone}
                      </p>
                    )}
                  </div>
                )}

              <p className="mt-3 text-xs font-black tracking-widest text-zinc-500">
                STRUK PEMBAYARAN
              </p>
            </div>

            {/* NOMOR TRANSAKSI */}
            <div className="border-b border-dashed border-zinc-300 py-4">
              <div className="flex items-start justify-between gap-4">
                <span className="text-xs font-bold text-zinc-500">
                  NO. TRANSAKSI
                </span>

                <span className="break-all text-right text-xs font-black">
                  {transaction.transactionNumber}
                </span>
              </div>

              <div className="mt-2 flex items-center justify-between">
                <span className="text-xs font-bold text-zinc-500">
                  STATUS
                </span>

                <span className="rounded-full bg-green-600 px-2 py-1 text-[10px] font-black text-white">
                  {transaction.status}
                </span>
              </div>
            </div>

            {/* KENDARAAN */}
            <div className="border-b border-dashed border-zinc-300 py-4">
              <p className="text-xs font-black text-zinc-500">
                KENDARAAN
              </p>

              <div className="mt-2 flex items-start justify-between gap-4">
                <div>
                  <p className="text-base font-black">
                    {transaction.vehicleType === "MOTOR"
                      ? "🏍️ MOTOR"
                      : "🚗 MOBIL"}
                  </p>

                  <p className="mt-1 text-sm font-bold">
                    {vehicleName}
                  </p>

                  {brandName &&
                    modelName &&
                    brandName !== modelName && (
                      <p className="mt-1 text-xs text-zinc-500">
                        {brandName}
                      </p>
                    )}

                  {licensePlate && (
                    <p className="mt-2 text-sm font-black tracking-wider">
                      {licensePlate}
                    </p>
                  )}
                </div>

                <div className="text-right">
                  <p className="text-xs font-bold text-zinc-500">
                    KATEGORI
                  </p>

                  <p className="mt-1 text-sm font-black">
                    {transaction.categorySnapshot}
                  </p>
                </div>
              </div>
            </div>

            {/* TOTAL */}
            <div className="border-b border-dashed border-zinc-300 py-5">
              <div className="flex items-center justify-between gap-4">
                <span className="text-base font-black">
                  TOTAL CUCI
                </span>

                <span className="text-2xl font-black text-red-600">
                  {formatRupiah(transaction.price)}
                </span>
              </div>
            </div>

            {/* TANGGAL */}
            <div className="py-4 text-center">
              <p className="text-xs font-bold text-zinc-500">
                TANGGAL TRANSAKSI
              </p>

              <p className="mt-1 text-xs font-bold">
                {formatDate(transaction.createdAt)}
              </p>
            </div>

            {/* FOOTER */}
            <div className="border-t-2 border-dashed border-zinc-300 pt-5 text-center">
              <p className="text-lg font-black">
                TERIMA KASIH
              </p>

              <p className="mt-1 text-sm font-black">
                ATAS KUNJUNGANNYA
              </p>

              {footerText && (
                <p className="mt-3 whitespace-pre-line text-[10px] font-bold text-zinc-500">
                  {footerText}
                </p>
              )}

              <p className="mt-3 text-[10px] font-bold text-zinc-400">
                {businessName}
              </p>
            </div>
          </section>

          {/* STATUS CETAK */}
          {printMessage && (
            <div className="mt-4 rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-center text-xs font-bold text-green-700 print:hidden">
              {printMessage}
            </div>
          )}

          {/* CETAK */}
          <button
            type="button"
            onClick={handlePrint}
            disabled={printing}
            className="mt-5 w-full rounded-2xl bg-red-600 px-4 py-5 text-base font-black text-white shadow-lg transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 print:hidden"
          >
            {printing
              ? "⏳ MENYIAPKAN CETAK..."
              : "🖨️ CETAK STRUK"}
          </button>

          {/* KEMBALI */}
          <button
            type="button"
            onClick={() =>
              router.push(
                `/detail/${transaction.id}`
              )
            }
            className="mt-3 w-full rounded-2xl bg-zinc-900 px-4 py-4 text-sm font-black text-white transition active:scale-[0.98] print:hidden"
          >
            ← KEMBALI KE DETAIL
          </button>

          <p className="mt-4 text-center text-xs text-zinc-500 print:hidden">
            Tekan CETAK STRUK untuk membuka
            dialog cetak browser.
          </p>
        </div>
      </main>

      {/* PRINT STYLE */}
      <style jsx global>{`
        @media print {
          @page {
            size: ${paperWidth}mm 180mm;
            margin: 0;
          }

          html,
          body {
            margin: 0;
            padding: 0;
            background: white !important;
          }

          body {
            width: ${paperWidth}mm;
          }

          main {
            min-height: auto !important;
            width: ${paperWidth}mm !important;
            padding: 0 !important;
            margin: 0 !important;
            background: white !important;
          }

          main > div {
            width: ${paperWidth}mm !important;
            max-width: ${paperWidth}mm !important;
            margin: 0 !important;
            padding: 0 !important;
          }

          section {
            width: ${paperWidth}mm !important;
            max-width: ${paperWidth}mm !important;
            min-height: 180mm !important;
            border-radius: 0 !important;
            box-shadow: none !important;
            padding: 6mm !important;
            margin: 0 !important;
          }

          .print\\:hidden {
            display: none !important;
          }
        }
      `}</style>
    </>
  );
}