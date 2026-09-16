"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type VehicleCategory = {
  id: number;
  name: string;
  vehicleType: "MOTOR" | "MOBIL";
  price: number;
  active: boolean;
  description: string | null;
};

type VehicleBrand = {
  id: number;
  name: string;
  active: boolean;
};

type VehicleModel = {
  id: number;
  brandId: number;
  name: string;
  vehicleType: "MOTOR" | "MOBIL";
  categoryId: number;
  active: boolean;
  brand: {
    id: number;
    name: string;
  };
  category: {
    id: number;
    name: string;
    vehicleType: "MOTOR" | "MOBIL";
    price: number;
  };
};

export default function KategoriModelPage() {
  const [categories, setCategories] = useState<VehicleCategory[]>([]);
  const [brands, setBrands] = useState<VehicleBrand[]>([]);
  const [models, setModels] = useState<VehicleModel[]>([]);

  const [loadingCategories, setLoadingCategories] = useState(true);
  const [loadingBrands, setLoadingBrands] = useState(true);
  const [loadingModels, setLoadingModels] = useState(true);

  const [categoryError, setCategoryError] = useState("");
  const [brandError, setBrandError] = useState("");
  const [modelError, setModelError] = useState("");

  const [showAddModel, setShowAddModel] = useState(false);
  const [editingModelId, setEditingModelId] = useState<number | null>(null);
  const [savingModel, setSavingModel] = useState(false);
  const [deletingModelId, setDeletingModelId] = useState<number | null>(null);

  const [formError, setFormError] = useState("");
  const [formVehicleType, setFormVehicleType] =
    useState<"MOTOR" | "MOBIL">("MOTOR");
  const [formBrandId, setFormBrandId] = useState("");
  const [formName, setFormName] = useState("");
  const [formCategoryId, setFormCategoryId] = useState("");

  async function loadCategories() {
    try {
      setLoadingCategories(true);
      setCategoryError("");

      const response = await fetch("/api/vehicle-categories");
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.error || "Gagal mengambil kategori kendaraan"
        );
      }

      setCategories(data.categories ?? []);
    } catch (error) {
      console.error("loadCategories error:", error);

      setCategoryError(
        error instanceof Error
          ? error.message
          : "Gagal mengambil kategori kendaraan"
      );
    } finally {
      setLoadingCategories(false);
    }
  }

  async function loadBrands() {
    try {
      setLoadingBrands(true);
      setBrandError("");

      const response = await fetch("/api/vehicle-brands");
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Gagal mengambil merek kendaraan");
      }

      setBrands(data.brands ?? []);
    } catch (error) {
      console.error("loadBrands error:", error);

      setBrandError(
        error instanceof Error
          ? error.message
          : "Gagal mengambil merek kendaraan"
      );
    } finally {
      setLoadingBrands(false);
    }
  }

  async function loadModels() {
    try {
      setLoadingModels(true);
      setModelError("");

      const response = await fetch("/api/vehicle-models");
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Gagal mengambil model kendaraan");
      }

      setModels(data.models ?? []);
    } catch (error) {
      console.error("loadModels error:", error);

      setModelError(
        error instanceof Error
          ? error.message
          : "Gagal mengambil model kendaraan"
      );
    } finally {
      setLoadingModels(false);
    }
  }

  useEffect(() => {
    loadCategories();
    loadBrands();
    loadModels();
  }, []);

  const motorCategories = categories.filter(
    (category) => category.vehicleType === "MOTOR"
  );

  const mobilCategories = categories.filter(
    (category) => category.vehicleType === "MOBIL"
  );

  const motorModels = models.filter(
    (model) => model.vehicleType === "MOTOR"
  );

  const mobilModels = models.filter(
    (model) => model.vehicleType === "MOBIL"
  );

  const formCategories =
    formVehicleType === "MOTOR" ? motorCategories : mobilCategories;

  function formatRupiah(value: number) {
    return `Rp${value.toLocaleString("id-ID")}`;
  }

  function resetModelForm() {
    setFormVehicleType("MOTOR");
    setFormBrandId("");
    setFormName("");
    setFormCategoryId("");
    setFormError("");
    setEditingModelId(null);
  }

  function openAddModel() {
    resetModelForm();
    setShowAddModel(true);
  }

  function openEditModel(model: VehicleModel) {
    setShowAddModel(false);
    setFormError("");

    setEditingModelId(model.id);
    setFormVehicleType(model.vehicleType);
    setFormBrandId(String(model.brandId));
    setFormName(model.name);
    setFormCategoryId(String(model.categoryId));
  }

  function closeModelForm() {
    if (savingModel) {
      return;
    }

    setShowAddModel(false);
    resetModelForm();
  }

  function handleVehicleTypeChange(value: "MOTOR" | "MOBIL") {
    setFormVehicleType(value);
    setFormCategoryId("");
  }

  async function saveModel() {
    try {
      setSavingModel(true);
      setFormError("");

      const brandId = Number(formBrandId);
      const categoryId = Number(formCategoryId);
      const name = formName.trim();

      if (!Number.isInteger(brandId) || brandId <= 0) {
        setFormError("Silakan pilih merek kendaraan");
        return;
      }

      if (!name) {
        setFormError("Nama model wajib diisi");
        return;
      }

      if (!Number.isInteger(categoryId) || categoryId <= 0) {
        setFormError("Silakan pilih kategori kendaraan");
        return;
      }

      const isEditing = editingModelId !== null;

      const response = await fetch("/api/vehicle-models", {
        method: isEditing ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...(isEditing ? { id: editingModelId } : {}),
          brandId,
          name,
          vehicleType: formVehicleType,
          categoryId,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.error ||
            (isEditing
              ? "Gagal memperbarui model kendaraan"
              : "Gagal menambahkan model kendaraan")
        );
      }

      await loadModels();

      setShowAddModel(false);
      resetModelForm();

      alert(
        data.message ||
          (isEditing
            ? "Model kendaraan berhasil diperbarui"
            : "Model kendaraan berhasil ditambahkan")
      );
    } catch (error) {
      console.error("saveModel error:", error);

      setFormError(
        error instanceof Error
          ? error.message
          : "Gagal menyimpan model kendaraan"
      );
    } finally {
      setSavingModel(false);
    }
  }

  async function deactivateModel(model: VehicleModel) {
    const confirmed = window.confirm(
      `Nonaktifkan model "${model.brand.name} ${model.name}"?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingModelId(model.id);
      setModelError("");

      const response = await fetch("/api/vehicle-models", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: model.id,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.error || "Gagal menonaktifkan model kendaraan"
        );
      }

      await loadModels();

      alert(data.message || "Model kendaraan berhasil dinonaktifkan");
    } catch (error) {
      console.error("deactivateModel error:", error);

      setModelError(
        error instanceof Error
          ? error.message
          : "Gagal menonaktifkan model kendaraan"
      );
    } finally {
      setDeletingModelId(null);
    }
  }

  function CategoryCard({ category }: { category: VehicleCategory }) {
    return (
      <div className="rounded-xl border border-red-950/60 bg-gradient-to-r from-[#3a1118] via-[#1b121c] to-[#101b2a] p-4 shadow-lg shadow-black/20">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="text-sm font-black text-white">
              {category.name}
            </h3>

            {category.description && (
              <p className="mt-1 text-xs leading-5 text-zinc-400">
                {category.description}
              </p>
            )}
          </div>

          <div className="shrink-0 text-right">
            <p className="text-sm font-black text-red-400">
              {formatRupiah(category.price)}
            </p>

            <p className="mt-1 text-[10px] font-bold text-green-400">
              AKTIF
            </p>
          </div>
        </div>
      </div>
    );
  }

  function ModelCard({ model }: { model: VehicleModel }) {
    const isDeleting = deletingModelId === model.id;

    return (
      <div className="rounded-xl border border-red-950/60 bg-gradient-to-r from-[#3a1118] via-[#1b121c] to-[#101b2a] p-4 shadow-lg shadow-black/20">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="text-sm font-black text-white">
              {model.brand.name} {" • "} {model.name}
            </h3>

            <p className="mt-1 text-xs font-bold text-zinc-400">
              {model.category.name}
            </p>

            <p className="mt-1 text-sm font-black text-red-400">
              {formatRupiah(model.category.price)}
            </p>
          </div>

          <div className="shrink-0 text-right">
            <p className="text-[10px] font-bold text-green-400">AKTIF</p>

            <div className="mt-2 flex gap-2">
              <button
                type="button"
                onClick={() => openEditModel(model)}
                disabled={isDeleting}
                className="rounded-lg border border-zinc-700 bg-black/30 px-3 py-1.5 text-[10px] font-black text-zinc-300 transition hover:border-red-500 hover:text-red-400 disabled:opacity-50"
              >
                EDIT
              </button>

              <button
                type="button"
                onClick={() => deactivateModel(model)}
                disabled={isDeleting}
                className="rounded-lg border border-red-900 bg-red-950/20 px-3 py-1.5 text-[10px] font-black text-red-400 transition hover:bg-red-950 disabled:opacity-50"
              >
                {isDeleting ? "..." : "NONAKTIFKAN"}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#070b12] px-4 py-6 text-white">
      <div className="mx-auto max-w-md">
        {/* HEADER */}
        <div className="mb-6">
          <Link
            href="/owner/pengaturan"
            className="mb-4 inline-flex items-center text-sm font-bold text-zinc-400 transition hover:text-white"
          >
            ← KEMBALI
          </Link>

          <h1 className="text-2xl font-black tracking-tight">
            KATEGORI & MODEL
          </h1>

          <p className="mt-1 text-sm text-zinc-500">
            Kelola kategori dan model kendaraan
          </p>
        </div>

        {/* KATEGORI */}
        <section className="mb-4 rounded-2xl border border-red-950/60 bg-gradient-to-br from-[#17101a] via-[#101522] to-[#0c1420] p-4 shadow-xl shadow-black/20">
          <div className="mb-4">
            <h2 className="text-lg font-black">KATEGORI KENDARAAN</h2>

            <p className="text-xs text-zinc-500">
              Data kategori aktif dari database
            </p>
          </div>

          {loadingCategories ? (
            <div className="rounded-xl border border-zinc-800 bg-black/30 p-5 text-center">
              <p className="text-sm font-bold text-zinc-500">
                MEMUAT KATEGORI...
              </p>
            </div>
          ) : categoryError ? (
            <div className="rounded-xl border border-red-900 bg-red-950/40 p-4">
              <p className="text-sm font-bold text-red-400">
                {categoryError}
              </p>

              <button
                type="button"
                onClick={loadCategories}
                className="mt-3 rounded-xl border border-red-800 px-4 py-2 text-xs font-black text-red-400"
              >
                COBA LAGI
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* MOTOR */}
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <h3 className="text-xs font-black tracking-wider text-zinc-400">
                    MOTOR
                  </h3>

                  <span className="text-[10px] font-bold text-zinc-600">
                    {motorCategories.length} KATEGORI
                  </span>
                </div>

                <div className="space-y-2">
                  {motorCategories.length > 0 ? (
                    motorCategories.map((category) => (
                      <CategoryCard key={category.id} category={category} />
                    ))
                  ) : (
                    <div className="rounded-xl border border-zinc-800 bg-black/30 p-4 text-center">
                      <p className="text-xs font-bold text-zinc-600">
                        BELUM ADA KATEGORI MOTOR
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* MOBIL */}
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <h3 className="text-xs font-black tracking-wider text-zinc-400">
                    MOBIL
                  </h3>

                  <span className="text-[10px] font-bold text-zinc-600">
                    {mobilCategories.length} KATEGORI
                  </span>
                </div>

                <div className="space-y-2">
                  {mobilCategories.length > 0 ? (
                    mobilCategories.map((category) => (
                      <CategoryCard key={category.id} category={category} />
                    ))
                  ) : (
                    <div className="rounded-xl border border-zinc-800 bg-black/30 p-4 text-center">
                      <p className="text-xs font-bold text-zinc-600">
                        BELUM ADA KATEGORI MOBIL
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </section>

        {/* MODEL */}
        <section className="rounded-2xl border border-red-950/60 bg-gradient-to-br from-[#17101a] via-[#101522] to-[#0c1420] p-4 shadow-xl shadow-black/20">
          <div className="mb-4 flex items-start justify-between gap-3">
            <div>
              <h2 className="text-lg font-black">MODEL KENDARAAN</h2>

              <p className="text-xs text-zinc-500">
                Model kendaraan aktif dari database
              </p>
            </div>

            <button
              type="button"
              onClick={openAddModel}
              className="shrink-0 rounded-xl bg-gradient-to-r from-red-700 to-red-500 px-3 py-2 text-[11px] font-black text-white transition hover:from-red-600 hover:to-red-400"
            >
              + TAMBAH
            </button>
          </div>

          {/* FORM MODEL */}
          {(showAddModel || editingModelId !== null) && (
            <div className="mb-5 rounded-xl border border-red-900/70 bg-black/30 p-4">
              <div className="mb-4">
                <h3 className="text-base font-black text-white">
                  {editingModelId !== null
                    ? "EDIT MODEL KENDARAAN"
                    : "TAMBAH MODEL KENDARAAN"}
                </h3>

                <p className="mt-1 text-xs text-zinc-500">
                  {editingModelId !== null
                    ? "Perbarui data model kendaraan"
                    : "Tambahkan model kendaraan baru"}
                </p>
              </div>

              {formError && (
                <div className="mb-4 rounded-xl border border-red-900 bg-red-950/40 p-3">
                  <p className="text-xs font-bold text-red-400">
                    {formError}
                  </p>
                </div>
              )}

              {brandError && (
                <div className="mb-4 rounded-xl border border-red-900 bg-red-950/40 p-3">
                  <p className="text-xs font-bold text-red-400">
                    {brandError}
                  </p>
                </div>
              )}

              {/* TIPE */}
              <div className="mb-4">
                <label className="mb-2 block text-xs font-black text-zinc-400">
                  TIPE KENDARAAN
                </label>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleVehicleTypeChange("MOTOR")}
                    disabled={savingModel}
                    className={`rounded-xl border px-4 py-3 text-sm font-black transition ${
                      formVehicleType === "MOTOR"
                        ? "border-red-600 bg-red-600 text-white"
                        : "border-zinc-800 bg-zinc-950 text-zinc-500"
                    }`}
                  >
                    MOTOR
                  </button>

                  <button
                    type="button"
                    onClick={() => handleVehicleTypeChange("MOBIL")}
                    disabled={savingModel}
                    className={`rounded-xl border px-4 py-3 text-sm font-black transition ${
                      formVehicleType === "MOBIL"
                        ? "border-red-600 bg-red-600 text-white"
                        : "border-zinc-800 bg-zinc-950 text-zinc-500"
                    }`}
                  >
                    MOBIL
                  </button>
                </div>
              </div>

              {/* MEREK */}
              <div className="mb-4">
                <label
                  htmlFor="model-brand"
                  className="mb-2 block text-xs font-black text-zinc-400"
                >
                  MEREK
                </label>

                <select
                  id="model-brand"
                  value={formBrandId}
                  onChange={(event) => setFormBrandId(event.target.value)}
                  disabled={loadingBrands || savingModel}
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-3 text-sm font-bold text-white outline-none focus:border-red-600 disabled:opacity-50"
                >
                  <option value="">
                    {loadingBrands ? "MEMUAT MEREK..." : "PILIH MEREK"}
                  </option>

                  {brands.map((brand) => (
                    <option key={brand.id} value={brand.id}>
                      {brand.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* NAMA MODEL */}
              <div className="mb-4">
                <label
                  htmlFor="model-name"
                  className="mb-2 block text-xs font-black text-zinc-400"
                >
                  NAMA MODEL
                </label>

                <input
                  id="model-name"
                  type="text"
                  value={formName}
                  onChange={(event) => setFormName(event.target.value)}
                  disabled={savingModel}
                  placeholder={
                    formVehicleType === "MOTOR"
                      ? "Contoh: Vario 160"
                      : "Contoh: Innova Zenix"
                  }
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-3 text-sm font-bold text-white outline-none placeholder:text-zinc-700 focus:border-red-600 disabled:opacity-50"
                />
              </div>

              {/* KATEGORI */}
              <div className="mb-5">
                <label
                  htmlFor="model-category"
                  className="mb-2 block text-xs font-black text-zinc-400"
                >
                  KATEGORI
                </label>

                <select
                  id="model-category"
                  value={formCategoryId}
                  onChange={(event) => setFormCategoryId(event.target.value)}
                  disabled={savingModel}
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-3 text-sm font-bold text-white outline-none focus:border-red-600 disabled:opacity-50"
                >
                  <option value="">PILIH KATEGORI</option>

                  {formCategories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name} — {formatRupiah(category.price)}
                    </option>
                  ))}
                </select>
              </div>

              {/* BUTTON */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={closeModelForm}
                  disabled={savingModel}
                  className="rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-xs font-black text-zinc-400 transition hover:text-white disabled:opacity-50"
                >
                  BATAL
                </button>

                <button
                  type="button"
                  onClick={saveModel}
                  disabled={savingModel}
                  className="rounded-xl bg-gradient-to-r from-red-700 to-red-500 px-4 py-3 text-xs font-black text-white transition hover:from-red-600 hover:to-red-400 disabled:opacity-50"
                >
                  {savingModel ? "MENYIMPAN..." : "SIMPAN"}
                </button>
              </div>
            </div>
          )}

          {/* ERROR MODEL */}
          {modelError && (
            <div className="mb-4 rounded-xl border border-red-900 bg-red-950/40 p-4">
              <p className="text-sm font-bold text-red-400">{modelError}</p>

              <button
                type="button"
                onClick={loadModels}
                className="mt-3 rounded-xl border border-red-800 px-4 py-2 text-xs font-black text-red-400"
              >
                COBA LAGI
              </button>
            </div>
          )}

          {/* DAFTAR MODEL */}
          {loadingModels ? (
            <div className="rounded-xl border border-zinc-800 bg-black/30 p-5 text-center">
              <p className="text-sm font-bold text-zinc-500">
                MEMUAT MODEL...
              </p>
            </div>
          ) : (
            <div className="space-y-5">
              {/* MOTOR */}
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <h3 className="text-xs font-black tracking-wider text-zinc-400">
                    MOTOR
                  </h3>

                  <span className="text-[10px] font-bold text-zinc-600">
                    {motorModels.length} MODEL
                  </span>
                </div>

                <div className="space-y-2">
                  {motorModels.length > 0 ? (
                    motorModels.map((model) => (
                      <ModelCard key={model.id} model={model} />
                    ))
                  ) : (
                    <div className="rounded-xl border border-zinc-800 bg-black/30 p-4 text-center">
                      <p className="text-xs font-bold text-zinc-600">
                        BELUM ADA MODEL MOTOR
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* MOBIL */}
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <h3 className="text-xs font-black tracking-wider text-zinc-400">
                    MOBIL
                  </h3>

                  <span className="text-[10px] font-bold text-zinc-600">
                    {mobilModels.length} MODEL
                  </span>
                </div>

                <div className="space-y-2">
                  {mobilModels.length > 0 ? (
                    mobilModels.map((model) => (
                      <ModelCard key={model.id} model={model} />
                    ))
                  ) : (
                    <div className="rounded-xl border border-zinc-800 bg-black/30 p-4 text-center">
                      <p className="text-xs font-bold text-zinc-600">
                        BELUM ADA MODEL MOBIL
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}