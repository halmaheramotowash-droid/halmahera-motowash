"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Capacitor } from "@capacitor/core";
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

export default function CuciPage() {
  const router = useRouter();

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
    type: "success" | "error" | "info";
    message: string;
  } | null>(null);

  const selectedCategory = categories.find(
    (item) => item.name === category
  );

  function showNotification(
    type: "success" | "error" | "info",
    message: string
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

        const response = await fetch("/api/wash-prices");
        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(
            data.error || "Gagal mengambil harga cuci"
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
              }) => item.category === categoryName
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
            (item): item is Category => item !== null
          );

        if (loadedCategories.length === 0) {
          throw new Error(
            "Data harga cuci tidak ditemukan."
          );
        }

        setCategories(loadedCategories);
      } catch (error) {
        console.error(
          "Gagal mengambil harga cuci:",
          error
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
          "Harga database tidak dapat dimuat. Harga standar digunakan."
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

        const response = await fetch(
          `/api/vehicle-models?${params.toString()}`,
          {
            signal: controller.signal,
          }
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
          error
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

    const cameraInputRef = useRef<HTMLInputElement>(null);

  async function startCamera() {
    if (analyzing) {
      return;
    }

    if (!Capacitor.isNativePlatform()) {
      cameraInputRef.current?.click();
      return;
    }

    try {
      const currentPermissions = await Camera.checkPermissions();

      if (currentPermissions.camera !== "granted") {
        const requestedPermissions = await Camera.requestPermissions({
          permissions: ["camera"],
        });

        if (requestedPermissions.camera !== "granted") {
          showNotification(
            "error",
            "Izin kamera ditolak. Silakan izinkan kamera di pengaturan aplikasi."
          );
          return;
        }
      }

      const photo = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Camera,
        direction: CameraDirection.Rear,
      });

      if (!photo.dataUrl) {
        showNotification(
          "error",
          "Foto kendaraan tidak berhasil diambil."
        );
        return;
      }

      setCapturedPhoto(photo.dataUrl);
      await analyzeMotor(photo.dataUrl);
    } catch (error) {
      console.error("Native camera error:", error);

      const detail =
        error instanceof Error
          ? error.message
          : JSON.stringify(error);

      showNotification("error", `Kamera gagal: ${detail}`);
    }
  }

  async function handlePhotoSelected(
    event: React.ChangeEvent<HTMLInputElement>
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
          showNotification("error", "Foto tidak dapat dibaca.");
          setAnalyzing(false);
          return;
        }

        setCapturedPhoto(result);
        await analyzeMotor(result);
      };

      reader.onerror = () => {
        showNotification("error", "Gagal membaca foto.");
        setAnalyzing(false);
      };

      reader.readAsDataURL(file);
    } catch (error) {
      console.error("Browser camera error:", error);

      showNotification(
        "error",
        "Foto tidak dapat diproses."
      );

      setAnalyzing(false);
    } finally {
      event.target.value = "";
    }
  }

  function stopCamera() {
    // Kamera native otomatis ditutup setelah foto
    // diambil atau ketika pengguna menekan kembali.
    return;
  }

  function retakePhoto() {
    setCapturedPhoto(null);
    setAnalysisMessage("");
    startCamera();
  }

  async function analyzeMotor(photo: string) {
    setAnalyzing(true);
    setAnalysisMessage(
      "AI sedang menganalisis kendaraan..."
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
          }
        )
      );

      const analyzeResponse = await fetch(
        "/api/vehicle/analyze-gemini",
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await analyzeResponse.json();

      if (!analyzeResponse.ok || !data.success) {
        throw new Error(
          data.error ||
            "Gagal menganalisis kendaraan."
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
          aiCategory.toLowerCase()
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
          : "Analisis selesai. Silakan periksa hasilnya."
      );

      showNotification(
        "success",
        matchedCategory
          ? `AI mengenali ${
              aiModel || "kendaraan"
            } sebagai ${matchedCategory.name}.`
          : "Analisis selesai. Silakan periksa hasil kendaraan."
      );
    } catch (error) {
      console.error(
        "Analisis kendaraan error:",
        error
      );

      setAnalysisMessage(
        "AI tidak dapat mengenali kendaraan. Silakan isi atau koreksi secara manual."
      );

      showNotification(
        "error",
        "AI tidak dapat mengenali kendaraan. Silakan koreksi secara manual."
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
      `${item.name} dipilih • Rp${item.price.toLocaleString(
        "id-ID"
      )}`
    );
  }

  function handleModelSelect(
    selectedModel: VehicleModel
  ) {
    setModel(selectedModel.name);
    setModelSuggestions([]);

    showNotification(
      "info",
      `Model ${selectedModel.name} dipilih.`
    );
  }

  async function handleBayar() {
    if (!category || !vehicleType || price <= 0) {
      showNotification(
        "error",
        "Pilih kategori kendaraan dan pastikan harga sudah diisi."
      );
      return;
    }

    if (saving) {
      return;
    }

    setSaving(true);

    try {
      const response = await fetch(
        "/api/transactions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            vehicleType,
            category,
            model: model.trim(),
            price,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        showNotification(
          "error",
          data.error ||
            "Gagal menyimpan transaksi."
        );
        return;
      }

      const transactionId = data.transaction?.id;

      if (!transactionId) {
        showNotification(
          "error",
          "Transaksi berhasil disimpan, tetapi ID transaksi tidak ditemukan."
        );
        return;
      }

      showNotification(
        "success",
        "Transaksi berhasil disimpan."
      );

      router.push(`/struk/${transactionId}`);
    } catch (error) {
      console.error(
        "Simpan transaksi error:",
        error
      );

      showNotification(
        "error",
        "Tidak dapat terhubung ke server."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="min-h-screen bg-zinc-950 px-4 py-6 text-white">
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

      <div className="mx-auto max-w-2xl">
        <div className="mb-6">
          <div className="mb-5 flex items-center gap-3">
            <button
              type="button"
              onClick={() => router.push("/")}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900 text-xl text-white transition active:scale-[0.95]"
              aria-label="Kembali ke halaman utama"
            >
              ←
            </button>

            <div>
              <h1 className="text-2xl font-black">
                Tambah Cucian
              </h1>

              <p className="mt-1 text-xs text-zinc-500">
                Input transaksi kendaraan
              </p>
            </div>
          </div>

          <p className="text-sm text-zinc-500">
            Foto kendaraan untuk identifikasi
            otomatis dan harga
          </p>
        </div>

        <section className="mb-6 w-full rounded-3xl border border-zinc-800 bg-black p-2 sm:p-4">
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
              className="flex w-full flex-col items-center justify-center rounded-2xl border border-red-900 bg-red-950/30 px-6 py-10 transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-600 text-3xl">
                📷
              </div>

              <div className="text-lg font-black">
                SCAN KENDARAAN
              </div>

              <div className="mt-1 text-xs text-zinc-500">
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

              <div className="mt-4">
                <button
                  type="button"
                  onClick={retakePhoto}
                  disabled={analyzing}
                  className="w-full rounded-2xl border border-zinc-800 bg-zinc-900 px-4 py-4 text-sm font-black text-zinc-300 transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  ULANGI FOTO
                </button>
              </div>

              <div className="mt-3 rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-center text-xs font-bold text-zinc-400">
                {analysisMessage ||
                  "Foto kendaraan siap diproses."}
              </div>
            </div>
          )}
        </section>

        <div className="mx-auto w-full max-w-md">
          <section className="rounded-3xl border border-zinc-800 bg-black p-4">
            <div className="mb-5">
              <h2 className="text-lg font-black">
                Input Manual
              </h2>

              <p className="mt-1 text-xs text-zinc-500">
                Model kendaraan boleh dikosongkan.
              </p>
            </div>

            <div className="mb-5">
              <label className="mb-2 block text-xs font-black text-zinc-400">
                MODEL KENDARAAN
              </label>

              <div className="relative">
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
                  className="w-full rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-4 text-sm text-white outline-none placeholder:text-zinc-700 focus:border-red-600"
                />

                {modelLoading && (
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-zinc-500">
                    MENCARI...
                  </div>
                )}

                {modelSuggestions.length > 0 && (
                  <div className="absolute left-0 right-0 top-full z-30 mt-2 overflow-hidden rounded-2xl border border-zinc-700 bg-zinc-900 shadow-2xl">
                    <div className="border-b border-zinc-800 px-4 py-2 text-[10px] font-black tracking-wider text-zinc-500">
                      PILIH MODEL
                    </div>

                    {modelSuggestions.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() =>
                          handleModelSelect(item)
                        }
                        className="flex w-full items-center justify-between border-b border-zinc-800 px-4 py-3 text-left transition last:border-b-0 hover:bg-zinc-800 active:bg-red-600"
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

              <div className="mt-2 text-[11px] text-zinc-600">
                Ketik huruf awal untuk mendapatkan
                pilihan model
              </div>
            </div>

            <div className="mb-5">
              <label className="mb-3 block text-xs font-black text-zinc-400">
                PILIH KATEGORI KENDARAAN
              </label>

              {categoriesLoading ? (
                <div className="rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-5 text-center text-xs font-bold text-zinc-500">
                  MEMUAT HARGA CUCI...
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
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
                          "rounded-2xl border p-4 text-left transition active:scale-[0.97]",
                          active
                            ? "border-red-600 bg-red-600"
                            : "border-zinc-800 bg-zinc-950",
                        ].join(" ")}
                      >
                        <div className="mb-2 text-2xl">
                          {item.vehicleType === "MOTOR"
                            ? "🏍️"
                            : "🚗"}
                        </div>

                        <div className="text-sm font-black">
                          {item.name}
                        </div>

                        <div
                          className={[
                            "mt-1 text-xs font-bold",
                            active
                              ? "text-red-100"
                              : "text-zinc-500",
                          ].join(" ")}
                        >
                          Rp
                          {item.price.toLocaleString(
                            "id-ID"
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {vehicleType && (
              <div className="mb-5 rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-3">
                <div className="text-[11px] font-black text-zinc-600">
                  TIPE KENDARAAN
                </div>

                <div className="mt-1 text-sm font-black text-zinc-300">
                  {vehicleType === "MOTOR"
                    ? "🏍️ MOTOR"
                    : "🚗 MOBIL"}
                </div>
              </div>
            )}

            <div className="mb-5">
              <label className="mb-2 block text-xs font-black text-zinc-400">
                HARGA CUCI
              </label>

              <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
                <div className="mb-2 text-xs text-zinc-600">
                  Harga dapat dikoreksi oleh operator
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-zinc-500">
                    Rp
                  </span>

                  <input
                    type="number"
                    min="0"
                    value={price === 0 ? "" : price}
                    onChange={(event) =>
                      setPrice(
                        Number(event.target.value)
                      )
                    }
                    placeholder="15000"
                    className="w-full bg-transparent text-2xl font-black text-red-500 outline-none"
                  />
                </div>

                {selectedCategory && (
                  <div className="mt-2 text-xs text-zinc-500">
                    Kategori: {selectedCategory.name}
                  </div>
                )}
              </div>
            </div>

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
                "w-full rounded-2xl px-4 py-5 text-base font-black transition active:scale-[0.98]",
                category &&
                vehicleType &&
                price > 0 &&
                !saving
                  ? "bg-red-600 text-white"
                  : "cursor-not-allowed bg-zinc-800 text-zinc-600",
              ].join(" ")}
            >
              {saving ? "MENYIMPAN..." : "BAYAR & SIMPAN"}
            </button>
          </section>
        </div>

        <div className="mt-5 rounded-2xl border border-zinc-900 bg-zinc-950 p-4 text-center text-xs text-zinc-600">
          Hasil kamera hanya menjadi rekomendasi.
          <br />
          Operator tetap dapat mengoreksi kategori
          dan harga.
        </div>
      </div>
    </main>
  );
}