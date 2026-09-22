"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Capacitor } from "@capacitor/core";
import { apiGet, apiPost } from "@/lib/api-client";
import {
  Camera,
  CameraDirection,
  CameraResultType,
  CameraSource,
} from "@capacitor/camera";

type Category = {
  id: number;
  name: string;
  price: number;
  vehicleType: "MOTOR" | "MOBIL";
  active: boolean;
};

type VehicleModel = {
  id: number;
  name: string;
  vehicleType: "MOTOR" | "MOBIL";
};

type NotificationType = "success" | "error" | "info";

type SuccessTransaction = {
  id: number;
  transactionNumber: string;
  vehicleType: "MOTOR" | "MOBIL" | string;
  category: string;
  price: number;
};

type CurrentUser = {
  userId: number;
  username: string;
  role: "OWNER" | "KARYAWAN";
};
export default function CuciPage() {
  const router = useRouter();

const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);

  const [model, setModel] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState(0);

  const [vehicleType, setVehicleType] = useState<
    "MOTOR" | "MOBIL" | ""
  >("");

  const [modelSuggestions, setModelSuggestions] =
    useState<VehicleModel[]>([]);

  const [modelLoading, setModelLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisMessage, setAnalysisMessage] = useState("");

  const [notification, setNotification] = useState<{
    type: NotificationType;
    message: string;
  } | null>(null);

  const [successTransaction, setSuccessTransaction] =
    useState<SuccessTransaction | null>(null);

  const cameraInputRef = useRef<HTMLInputElement>(null);

  const selectedCategory = categories.find(
    (item) => item.name === category,
  );

  function formatRupiah(value: number) {
    return `Rp${value.toLocaleString("id-ID")}`;
  }

  function showNotification(
    type: NotificationType,
    message: string,
  ) {
    setNotification({
      type,
      message,
    });

    setTimeout(() => {
      setNotification(null);
    }, 3000);
  }

  useEffect(() => {
    async function loadCategories() {
      try {
        setCategoriesLoading(true);

        const response = await apiGet("/api/wash-prices");
        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(
            data.error || "Gagal mengambil harga cuci",
          );
        }

        const categoryOrder = [
          "Motor Kecil",
          "Motor Sedang",
          "Motor Besar",
          "Mobil Kecil",
          "Mobil Besar",
        ];

        const dbPrices = data.prices ?? [];

        const loadedCategories: Category[] = categoryOrder
          .map((categoryName, index) => {
            const found = dbPrices.find(
              (item: {
                id?: number;
                category: string;
                price: number;
                active?: boolean;
              }) => item.category === categoryName,
            );

            if (!found) {
              return null;
            }

            return {
              id: found.id ?? index + 1,
              name: found.category,
              price: found.price,
              vehicleType: categoryName.startsWith("Motor")
                ? "MOTOR"
                : "MOBIL",
              active: found.active ?? true,
            };
          })
          .filter(
            (item): item is Category => item !== null,
          );

        if (loadedCategories.length === 0) {
          throw new Error(
            "Data harga cuci tidak ditemukan.",
          );
        }

        setCategories(loadedCategories);
      } catch (error) {
        console.error(
          "Gagal mengambil harga cuci:",
          error,
        );

        setCategories([
          {
            id: 1,
            name: "Motor Kecil",
            price: 15000,
            vehicleType: "MOTOR",
            active: true,
          },
          {
            id: 2,
            name: "Motor Sedang",
            price: 20000,
            vehicleType: "MOTOR",
            active: true,
          },
          {
            id: 3,
            name: "Motor Besar",
            price: 25000,
            vehicleType: "MOTOR",
            active: true,
          },
          {
            id: 4,
            name: "Mobil Kecil",
            price: 40000,
            vehicleType: "MOBIL",
            active: true,
          },
          {
            id: 5,
            name: "Mobil Besar",
            price: 50000,
            vehicleType: "MOBIL",
            active: true,
          },
        ]);

        showNotification(
          "error",
          "Harga database tidak dapat dimuat. Harga standar digunakan.",
        );
      } finally {
        setCategoriesLoading(false);
      }
    }

    loadCategories();
  }, []);

  useEffect(() => {
    if (!vehicleType || !model.trim()) {
      setModelSuggestions([]);
      setModelLoading(false);
      return;
    }

    const controller = new AbortController();

    const timer = setTimeout(async () => {
      try {
        setModelLoading(true);

        const params = new URLSearchParams({
          q: model.trim(),
          vehicleType,
        });

        const response = await apiGet(
          `/api/vehicle-models?${params.toString()}`,
          {
            signal: controller.signal,
          },
        );

        const data = await response.json();

        if (!response.ok || !data.success) {
          setModelSuggestions([]);
          return;
        }

        setModelSuggestions(data.models ?? []);
      } catch (error) {
        if (
          error instanceof DOMException &&
          error.name === "AbortError"
        ) {
          return;
        }

        console.error(
          "Pencarian model error:",
          error,
        );

        setModelSuggestions([]);
      } finally {
        if (!controller.signal.aborted) {
          setModelLoading(false);
        }
      }
    }, 250);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [model, vehicleType]);

  async function startCamera() {
    setCapturedPhoto(null);
    setAnalysisMessage("");

    if (!Capacitor.isNativePlatform()) {
      cameraInputRef.current?.click();
      return;
    }

    let photo;

    try {
      const currentPermissions =
        await Camera.checkPermissions();

      if (currentPermissions.camera !== "granted") {
        const requestedPermissions =
          await Camera.requestPermissions({
            permissions: ["camera"],
          });

        if (requestedPermissions.camera !== "granted") {
          showNotification(
            "error",
            "Izin kamera ditolak. Silakan izinkan kamera di pengaturan aplikasi.",
          );

          return;
        }
      }

      photo = await Camera.getPhoto({
        quality: 70,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Camera,
        direction: CameraDirection.Rear,
      });
    } catch (error) {
      console.error(
        "Native camera error:",
        error,
      );

      const detail =
        error instanceof Error
          ? error.message
          : JSON.stringify(error);

      showNotification(
        "error",
        `Kamera gagal: ${detail}`,
      );

      return;
    }

    if (!photo.dataUrl) {
      showNotification(
        "error",
        "Foto kendaraan tidak berhasil diambil.",
      );

      return;
    }

    setCapturedPhoto(photo.dataUrl);
    await analyzeMotor(photo.dataUrl);
  }

  async function handlePhotoSelected(
    event: React.ChangeEvent<HTMLInputElement>,
  ) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    try {
      setAnalyzing(true);
      setAnalysisMessage("Foto sedang diproses...");

      const reader = new FileReader();

      reader.onload = async () => {
        const result = reader.result;

        if (typeof result !== "string") {
          showNotification(
            "error",
            "Foto tidak dapat dibaca.",
          );

          setAnalyzing(false);
          return;
        }

        setCapturedPhoto(result);
        await analyzeMotor(result);
      };

      reader.onerror = () => {
        showNotification(
          "error",
          "Gagal membaca foto.",
        );

        setAnalyzing(false);
      };

      reader.readAsDataURL(file);
    } catch (error) {
      console.error(
        "Browser camera error:",
        error,
      );

      showNotification(
        "error",
        "Foto tidak dapat diproses.",
      );

      setAnalyzing(false);
    } finally {
      event.target.value = "";
    }
  }

  function retakePhoto() {
    setCapturedPhoto(null);
    setAnalysisMessage("");
    startCamera();
  }

  async function analyzeMotor(photo: string) {
    setAnalyzing(true);
    setAnalysisMessage(
      "AI sedang menganalisis kendaraan...",
    );

    try {
      const response = await fetch(photo);
      const blob = await response.blob();

      const formData = new FormData();

      formData.append(
        "image",
        new File(
          [blob],
          "kendaraan.jpg",
          {
            type: "image/jpeg",
          },
        ),
      );

      const analyzeResponse = await apiPost(
  "/api/vehicle/analyze-gemini",
  formData,
);

      const data = await analyzeResponse.json();

      if (!analyzeResponse.ok || !data.success) {
        throw new Error(
          data.error ||
            "Gagal menganalisis kendaraan.",
        );
      }

      const result = data.result;

      const aiModel =
        typeof result?.model === "string"
          ? result.model.trim()
          : "";

      const aiVehicleType =
        result?.vehicleType === "MOTOR" ||
        result?.vehicleType === "MOBIL"
          ? result.vehicleType
          : "";

      const aiCategory =
        typeof result?.category === "string"
          ? result.category.trim()
          : "";

      const matchedCategory = categories.find(
        (item) =>
          item.name.toLowerCase() ===
          aiCategory.toLowerCase(),
      );

      if (aiModel) {
        setModel(aiModel);
      }

      if (aiVehicleType) {
        setVehicleType(aiVehicleType);
      }

      if (matchedCategory) {
        setCategory(matchedCategory.name);
        setPrice(matchedCategory.price);
      } else {
        setCategory("");
        setPrice(0);
      }

      const confidence =
        typeof result?.confidence === "number"
          ? Math.round(result.confidence)
          : 0;

      setAnalysisMessage(
        confidence > 0
          ? `Analisis selesai • tingkat keyakinan ${confidence}%`
          : "Analisis selesai. Silakan periksa hasilnya.",
      );

      showNotification(
        "success",
        matchedCategory
          ? `AI mengenali ${
              aiModel || "kendaraan"
            } sebagai ${matchedCategory.name}.`
          : "Analisis selesai. Silakan periksa hasil kendaraan.",
      );
    } catch (error) {
      console.error(
        "Analisis kendaraan error:",
        error,
      );

      setAnalysisMessage(
        "AI tidak dapat mengenali kendaraan. Silakan isi atau koreksi secara manual.",
      );

      showNotification(
        "error",
        "AI tidak dapat mengenali kendaraan. Silakan koreksi secara manual.",
      );
    } finally {
      setAnalyzing(false);
    }
  }

  function handleCategorySelect(item: Category) {
    setCategory(item.name);
    setPrice(item.price);
    setVehicleType(item.vehicleType);
    setModelSuggestions([]);

    showNotification(
      "info",
      `${item.name} dipilih • ${formatRupiah(item.price)}`,
    );
  }

  function handleModelSelect(
    selectedModel: VehicleModel,
  ) {
    setModel(selectedModel.name);
    setModelSuggestions([]);

    showNotification(
      "info",
      `Model ${selectedModel.name} dipilih.`,
    );
  }

  async function handleBayar() {
    console.log("HANDLE BAYAR DIJALANKAN");

    console.log("DATA TRANSAKSI:", {
      category,
      vehicleType,
      price,
      model,
      saving,
    });

    if (!category || !vehicleType || price <= 0) {
      showNotification(
        "error",
        "Pilih kategori kendaraan dan pastikan harga sudah diisi.",
      );

      return;
    }

    if (saving) {
      return;
    }

    setSaving(true);

    try {
      const response = await apiPost(
  "/api/transactions",
  {
    vehicleType,
    category,
    model: model.trim(),
    price,
  },
);

      const data = await response.json();

      if (!response.ok || !data.success) {
        showNotification(
          "error",
          data.error ||
            "Gagal menyimpan transaksi.",
        );

        return;
      }

      const transactionId =
        data.transaction?.id;

      if (!transactionId) {
        showNotification(
          "error",
          "Transaksi berhasil disimpan, tetapi ID transaksi tidak ditemukan.",
        );

        return;
      }

      setSuccessTransaction({
        id: transactionId,
        transactionNumber:
          data.transaction?.transactionNumber ||
          `TRX-${transactionId}`,
        vehicleType,
        category,
        price,
      });
    } catch (error) {
      console.error(
        "Simpan transaksi error:",
        error,
      );

      showNotification(
        "error",
        "Tidak dapat terhubung ke server.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#05080d] px-3 py-4 text-white sm:px-6 sm:py-6">
      {notification && (
        <div
          className={[
            "fixed left-1/2 top-5 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 rounded-2xl border px-4 py-3 shadow-2xl",
            notification.type === "success"
              ? "border-green-700 bg-green-950 text-green-300"
              : notification.type === "error"
                ? "border-red-700 bg-red-950 text-red-300"
                : "border-zinc-700 bg-zinc-900 text-zinc-300",
          ].join(" ")}
        >
          <div className="flex items-center gap-3">
            <div className="text-lg font-black">
              {notification.type === "success"
                ? "✓"
                : notification.type === "error"
                  ? "!"
                  : "i"}
            </div>

            <div className="text-sm font-bold">
              {notification.message}
            </div>
          </div>
        </div>
      )}

      {successTransaction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4 py-6 backdrop-blur-sm">
          <div className="max-h-[95vh] w-full max-w-2xl overflow-y-auto rounded-[2rem] border border-red-500/70 bg-[#07111f] p-5 text-white shadow-2xl shadow-red-900/40 sm:p-7">
            <div className="text-center">
              <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-red-600 text-6xl font-black text-white shadow-[0_0_35px_rgba(239,68,68,0.55)]">
                ✓
              </div>

              <h2 className="mt-5 text-3xl font-black tracking-tight sm:text-4xl">
                Transaksi <span className="text-red-500">Berhasil!</span>
              </h2>

              <p className="mt-3 text-sm leading-relaxed text-zinc-300 sm:text-base">
                Kendaraan berhasil dicuci dan transaksi telah disimpan.
                <br />
                Silakan cetak struk atau kembali ke owner.
              </p>
            </div>

            <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4 sm:p-5">
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-[1fr_auto]">
                <div>
                  <p className="text-[10px] font-black tracking-[0.16em] text-zinc-400">
                    NOMOR TRANSAKSI
                  </p>
                  <p className="mt-1 break-all text-sm font-black sm:text-base">
                    {successTransaction.transactionNumber}
                  </p>

                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-[10px] font-black tracking-wider text-zinc-500">
                        KENDARAAN
                      </p>
                      <p className="mt-1 text-sm font-black">
                        {successTransaction.vehicleType}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] font-black tracking-wider text-zinc-500">
                        KATEGORI
                      </p>
                      <p className="mt-1 text-sm font-black">
                        {successTransaction.category}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="border-t border-white/10 pt-4 sm:border-l sm:border-t-0 sm:pl-5 sm:pt-0">
                  <p className="text-[10px] font-black tracking-[0.16em] text-zinc-400">
                    TOTAL PEMBAYARAN
                  </p>
                  <p className="mt-1 text-2xl font-black text-red-500 sm:text-3xl">
                    {formatRupiah(successTransaction.price)}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-5 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-center text-sm font-bold text-zinc-300">
              ❤️ Terima kasih telah menggunakan Wash App
            </div>

            <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => router.push("/owner")}
                className="rounded-2xl border border-zinc-500 bg-zinc-900 px-4 py-4 text-sm font-black text-white transition hover:bg-zinc-800 active:scale-95"
              >
                🏠 Kembali ke Menu
              </button>

              <button
                type="button"
                onClick={() =>
                  router.push(`/struk/${successTransaction.id}`)
                }
                className="rounded-2xl bg-red-600 px-4 py-4 text-sm font-black text-white shadow-lg shadow-red-900/40 transition hover:bg-red-500 active:scale-95"
              >
                🖨️ Cetak Struk
              </button>
            </div>

            <p className="mt-5 text-center text-xs font-black tracking-[0.3em] text-zinc-500">
              WASH <span className="text-red-500">APP</span>
            </p>
          </div>
        </div>
      )}

      <div className="mx-auto max-w-6xl overflow-hidden rounded-3xl border border-white/10 bg-[#080d14] shadow-2xl">
        {/* HEADER */}
        <header className="relative overflow-hidden border-b border-white/10 bg-[#0b111b] px-4 py-4 sm:px-7 sm:py-5">
          <div className="absolute -right-20 -top-28 h-64 w-64 rounded-full border border-red-600/40 bg-red-600/10 blur-2xl" />

          <div className="relative flex items-center justify-between gap-3">
            <button
  	type="button"
  	onClick={() => router.push("/owner")}
 	 className="text-left transition active:scale-95"
  	aria-label="Kembali ke dashboard owner"
	>
              <div className="text-2xl font-black tracking-tight sm:text-3xl">
                WASH<span className="text-red-600">APP</span>
              </div>

              <div className="text-[10px] font-semibold tracking-[0.16em] text-zinc-400 sm:text-xs">
                SMART WASH MANAGEMENT
              </div>
            </button>

            <div className="flex items-center gap-2 sm:gap-3">
              <button
                type="button"
                onClick={() =>
                  showNotification(
                    "info",
                    "Tidak ada notifikasi baru.",
                  )
                }
                className="relative flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-[#111b28] text-xl transition hover:border-red-600 active:scale-95"
                aria-label="Notifikasi"
              >
                🔔

                <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-black text-white">
                  3
                </span>
              </button>

              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-900 text-lg font-black text-white">
                D
              </div>
            </div>
          </div>
        </header>

        {/* KONTEN */}
        <div className="px-3 py-5 sm:px-7 sm:py-7">
          <div className="mb-5 flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <button
  	type="button"
 	 onClick={() => router.push("/owner")}
 	 className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/10 bg-[#111b28] text-2xl transition hover:border-red-600 active:scale-95"
 	 aria-label="Kembali ke dashboard owner"
	>
                ←
              </button>

              <div>
                <h1 className="text-2xl font-black tracking-tight sm:text-3xl">
                  Tambah Cucian
                </h1>

                <p className="mt-1 text-xs text-zinc-400 sm:text-sm">
                  Input transaksi kendaraan
                </p>
              </div>
            </div>

            <div className="hidden rounded-2xl border border-red-900/70 bg-red-950/40 px-4 py-3 text-right sm:block">
              <div className="flex items-center justify-end gap-2 text-sm font-black">
                <span className="h-2.5 w-2.5 rounded-full bg-green-500" />
                Sistem Aktif
              </div>

              <div className="mt-1 text-[10px] text-zinc-400">
                Siap melayani
              </div>
            </div>
          </div>

          <p className="mb-5 text-xs text-zinc-500 sm:text-sm">
            Foto kendaraan untuk identifikasi otomatis dan harga.
          </p>

          <div className="grid grid-cols-1 gap-4 sm:gap-5 lg:grid-cols-[1.05fr_1fr]">
            {/* SCAN KENDARAAN */}
            <section className="rounded-3xl border border-white/10 bg-[#0d1621] p-3 shadow-xl sm:p-5">
              <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handlePhotoSelected}
                className="hidden"
              />

              {!capturedPhoto && (
                <button
                  type="button"
                  onClick={startCamera}
                  disabled={analyzing}
                  className="group flex min-h-[220px] w-full flex-col items-center justify-center rounded-2xl border border-red-700/80 bg-gradient-to-br from-red-950/70 via-[#18080d] to-[#0d1621] px-4 py-7 text-center transition hover:border-red-500 hover:shadow-[0_0_35px_rgba(239,68,68,0.18)] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50 sm:min-h-[285px] sm:px-5 sm:py-10"
                >
                  <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-600 text-3xl shadow-[0_0_30px_rgba(239,68,68,0.35)] transition group-hover:scale-105 sm:mb-5 sm:h-20 sm:w-20 sm:text-4xl">
                    📷
                  </div>

                  <div className="text-base font-black tracking-wide sm:text-xl">
                    SCAN KENDARAAN
                  </div>

                  <div className="mt-2 text-xs text-zinc-400">
                    Buka kamera untuk foto kendaraan
                  </div>
                </button>
              )}

              {capturedPhoto && (
                <div>
                  <img
                    src={capturedPhoto}
                    alt="Foto kendaraan"
                    className="max-h-[700px] w-full rounded-2xl object-cover"
                  />

                  <button
                    type="button"
                    onClick={retakePhoto}
                    disabled={analyzing}
                    className="mt-4 w-full rounded-2xl border border-white/10 bg-[#111b28] px-4 py-4 text-sm font-black text-zinc-200 transition hover:border-red-600 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    ULANGI FOTO
                  </button>

                  <div className="mt-3 rounded-2xl border border-white/10 bg-[#080d14] px-4 py-4 text-center text-xs font-bold text-zinc-400">
                    {analysisMessage ||
                      "Foto kendaraan siap diproses."}
                  </div>
                </div>
              )}
            </section>

            {/* FORM INPUT */}
            <section className="rounded-3xl border border-white/10 bg-[#0d1621] p-3 shadow-xl sm:p-5">
              <div className="mb-5">
                <label className="mb-2 block text-xs font-black tracking-wide text-zinc-300">
                  MODEL KENDARAAN
                </label>

                <div className="relative">
                  <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-xl text-zinc-400">
                    🔍
                  </div>

                  <input
                    type="text"
                    value={model}
                    onChange={(event) =>
                      setModel(event.target.value)
                    }
                    placeholder={
                      vehicleType
                        ? "Ketik nama model..."
                        : "Pilih kategori terlebih dahulu"
                    }
                    className="w-full rounded-2xl border border-white/10 bg-[#111b28] py-4 pl-12 pr-4 text-sm text-white outline-none placeholder:text-zinc-500 focus:border-red-600"
                  />

                  {modelLoading && (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-zinc-400">
                      MENCARI...
                    </div>
                  )}

                  {modelSuggestions.length > 0 && (
                    <div className="absolute left-0 right-0 top-full z-30 mt-2 overflow-hidden rounded-2xl border border-white/10 bg-[#111b28] shadow-2xl">
                      <div className="border-b border-white/10 px-4 py-3 text-[10px] font-black tracking-wider text-zinc-500">
                        PILIH MODEL
                      </div>

                      {modelSuggestions.map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() =>
                            handleModelSelect(item)
                          }
                          className="flex w-full items-center justify-between border-b border-white/10 px-4 py-3 text-left transition last:border-b-0 hover:bg-red-950/50 active:bg-red-600"
                        >
                          <span className="text-sm font-bold text-white">
                            {item.name}
                          </span>

                          <span className="text-[10px] font-bold text-zinc-500">
                            {item.vehicleType === "MOTOR"
                              ? "MOTOR"
                              : "MOBIL"}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="mt-2 text-[11px] text-zinc-500">
                  Ketik minimal 2 huruf untuk mendapatkan pilihan model.
                </div>
              </div>

              {/* KATEGORI */}
              <div className="mb-5">
                <label className="mb-3 block text-xs font-black tracking-wide text-zinc-300">
                  PILIH KATEGORI KENDARAAN
                </label>

                {categoriesLoading ? (
                  <div className="rounded-2xl border border-white/10 bg-[#111b28] px-4 py-5 text-center text-xs font-bold text-zinc-500">
                    MEMUAT HARGA CUCI...
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
                    {categories.map((item) => {
                      const active = category === item.name;

                      return (
                        <button
                          key={item.name}
                          type="button"
                          onClick={() =>
                            handleCategorySelect(item)
                          }
                          className={[
                            "rounded-2xl border p-3 text-left transition active:scale-[0.97] sm:p-4",
                            active
                              ? "border-red-500 bg-red-600 shadow-[0_0_20px_rgba(239,68,68,0.18)]"
                              : "border-white/10 bg-[#111b28] hover:border-red-700",
                          ].join(" ")}
                        >
                          <div className="mb-3 text-2xl sm:text-3xl">
                            {item.vehicleType === "MOTOR"
                              ? "🏍️"
                              : "🚗"}
                          </div>

                          <div className="text-xs font-black sm:text-sm">
                            {item.name}
                          </div>

                          <div
                            className={[
                              "mt-1 text-[11px] font-bold sm:text-xs",
                              active
                                ? "text-red-100"
                                : "text-zinc-400",
                            ].join(" ")}
                          >
                            {formatRupiah(item.price)}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* TIPE KENDARAAN */}
              {vehicleType && (
                <div className="mb-5 rounded-2xl border border-white/10 bg-[#111b28] px-4 py-4">
                  <div className="text-[10px] font-black tracking-wider text-zinc-500">
                    TIPE KENDARAAN
                  </div>

                  <div className="mt-2 text-sm font-black text-zinc-200">
                    {vehicleType === "MOTOR"
                      ? "🏍️ MOTOR"
                      : "🚗 MOBIL"}
                  </div>
                </div>
              )}

              {/* HARGA */}
              <div className="mb-5">
                <label className="mb-2 block text-xs font-black tracking-wide text-zinc-300">
                  HARGA CUCI
                </label>

                <div className="rounded-2xl border border-white/10 bg-[#111b28] p-4">
                  <div className="mb-2 text-xs text-zinc-400">
                    Harga dapat dikoreksi oleh operator
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-zinc-400">
                      Rp
                    </span>

                    <input
                      type="number"
                      min="0"
                      value={price === 0 ? "" : price}
                      onChange={(event) =>
                        setPrice(
                          Number(event.target.value),
                        )
                      }
                      placeholder="15000"
                      className="w-full bg-transparent text-2xl font-black text-red-500 outline-none"
                    />
                  </div>

                  {selectedCategory && (
                    <div className="mt-2 text-xs text-zinc-400">
                      Kategori: {selectedCategory.name}
                    </div>
                  )}
                </div>
              </div>

              {/* BAYAR DAN SIMPAN */}
              <button
                type="button"
                onClick={handleBayar}
                disabled={
                  !category ||
                  !vehicleType ||
                  price <= 0 ||
                  saving
                }
                className={[
                  "w-full rounded-2xl px-4 py-4 text-sm font-black tracking-wide transition active:scale-[0.98] sm:py-5 sm:text-base",
                  category &&
                  vehicleType &&
                  price > 0 &&
                  !saving
                    ? "bg-red-600 text-white shadow-[0_0_25px_rgba(239,68,68,0.25)] hover:bg-red-500"
                    : "cursor-not-allowed bg-zinc-800 text-zinc-600",
                ].join(" ")}
              >
                {saving
                  ? "MENYIMPAN..."
                  : "💾 BAYAR & SIMPAN"}
              </button>
            </section>
          </div>

          <div className="mt-5 rounded-2xl border border-white/10 bg-[#0d1621] px-4 py-4 text-center text-xs text-zinc-500">
            Hasil kamera hanya menjadi rekomendasi.
            <br />
            Operator tetap dapat mengoreksi kategori dan harga.
          </div>
        </div>

        {/* NAVIGASI BAWAH */}
        <nav className="border-t border-white/10 bg-[#080d14] px-2 py-4 sm:px-6">
          <div className="grid grid-cols-5 gap-1">
            <button
              type="button"
              onClick={() => router.push("/")}
              className="flex flex-col items-center gap-1 rounded-xl px-1 py-2 text-zinc-400 transition hover:bg-white/5 hover:text-white"
            >
              <span className="text-xl">⌂</span>
              <span className="text-[10px] font-bold sm:text-xs">
                Beranda
              </span>
            </button>

            <button
              type="button"
              onClick={() => router.push("/cuci")}
              className="flex flex-col items-center gap-1 rounded-xl bg-red-950/30 px-1 py-2 text-red-500"
            >
              <span className="text-xl">♨</span>
              <span className="text-[10px] font-black sm:text-xs">
                Cuci
              </span>
            </button>

            <button
              type="button"
              onClick={() => router.push("/riwayat")}
              className="flex flex-col items-center gap-1 rounded-xl px-1 py-2 text-zinc-400 transition hover:bg-white/5 hover:text-white"
            >
              <span className="text-xl">▤</span>
              <span className="text-[10px] font-bold sm:text-xs">
                Riwayat
              </span>
            </button>

            <button
              type="button"
              onClick={() => router.push("/hasil")}
              className="flex flex-col items-center gap-1 rounded-xl px-1 py-2 text-zinc-400 transition hover:bg-white/5 hover:text-white"
            >
              <span className="text-xl">▥</span>
              <span className="text-[10px] font-bold sm:text-xs">
                Hasil
              </span>
            </button>

            <button
              type="button"
              onClick={() => router.push("/pengaturan")}
              className="flex flex-col items-center gap-1 rounded-xl px-1 py-2 text-zinc-400 transition hover:bg-white/5 hover:text-white"
            >
              <span className="text-xl">⚙</span>
              <span className="text-[10px] font-bold sm:text-xs">
                Pengaturan
              </span>
            </button>
          </div>
        </nav>
      </div>
    </main>
  );
}