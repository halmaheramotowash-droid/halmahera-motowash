"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Printer = {
  id: number;
  name: string;
  connectionType: "BLUETOOTH" | "USB" | "NETWORK";
  paperWidth: number;
  bluetoothDeviceId: string | null;
  bluetoothServiceUuid: string | null;
  bluetoothCharacteristicUuid: string | null;
  bluetoothWriteMode: string | null;
  isDefault: boolean;
  isActive: boolean;
};

type ReceiptSetting = {
  id: number;
  paperWidth: number;
  showBusinessName: boolean;
  showAddress: boolean;
  showPhone: boolean;
  footerText: string | null;
};

type BluetoothCharacteristicInfo = {
  uuid: string;
  properties: string[];
};

type BluetoothServiceInfo = {
  uuid: string;
  isPrimary: boolean;
  characteristics: BluetoothCharacteristicInfo[];
};

type BluetoothRemoteGATTCharacteristicLike = {
  uuid: string;
  properties: {
    broadcast: boolean;
    read: boolean;
    writeWithoutResponse: boolean;
    write: boolean;
    notify: boolean;
    indicate: boolean;
    authenticatedSignedWrites: boolean;
    reliableWrite: boolean;
    writableAuxiliaries: boolean;
  };
};

type BluetoothRemoteGATTServiceLike = {
  uuid: string;
  isPrimary: boolean;
  getCharacteristics: () => Promise<
    BluetoothRemoteGATTCharacteristicLike[]
  >;
};

type BluetoothRemoteGATTServerLike = {
  connected: boolean;
  connect: () => Promise<BluetoothRemoteGATTServerLike>;
  disconnect: () => void;
  getPrimaryServices: () => Promise<BluetoothRemoteGATTServiceLike[]>;
};

type BluetoothDeviceLike = {
  id: string;
  name?: string;
  gatt?: BluetoothRemoteGATTServerLike;
  addEventListener: (
    type: string,
    listener: () => void
  ) => void;
};

type BluetoothNavigator = Navigator & {
  bluetooth?: {
    requestDevice: (options: {
      acceptAllDevices?: boolean;
      optionalServices?: string[];
    }) => Promise<BluetoothDeviceLike>;
  };
};

export default function StrukPrinterPage() {
  /*
   * =========================================================
   * PRINTER DATABASE
   * =========================================================
   */

  const [printers, setPrinters] = useState<Printer[]>([]);
  const [activePrinter, setActivePrinter] =
    useState<Printer | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showAddForm, setShowAddForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] =
    useState<number | null>(null);
  const [editingPrinterId, setEditingPrinterId] =
    useState<number | null>(null);

  const [name, setName] = useState("");
  const [connectionType, setConnectionType] =
    useState<"BLUETOOTH" | "USB" | "NETWORK">("USB");
  const [paperWidth, setPaperWidth] = useState("58");
  const [isDefault, setIsDefault] = useState(true);

  /*
   * =========================================================
   * RECEIPT SETTINGS
   * =========================================================
   */

  const [receiptSetting, setReceiptSetting] =
    useState<ReceiptSetting | null>(null);
  const [receiptLoading, setReceiptLoading] = useState(true);
  const [receiptSaving, setReceiptSaving] = useState(false);
  const [receiptError, setReceiptError] = useState("");

  const [receiptPaperWidth, setReceiptPaperWidth] =
    useState("58");
  const [showBusinessName, setShowBusinessName] = useState(true);
  const [showAddress, setShowAddress] = useState(true);
  const [showPhone, setShowPhone] = useState(true);
  const [footerText, setFooterText] = useState("");

  /*
   * =========================================================
   * BLUETOOTH STATE
   * =========================================================
   */

  const [bluetoothSupported, setBluetoothSupported] =
    useState(false);

  const [bluetoothStatus, setBluetoothStatus] = useState<
    | "CHECKING"
    | "UNSUPPORTED"
    | "DISCONNECTED"
    | "SEARCHING"
    | "CONNECTED"
    | "FAILED"
  >("CHECKING");

  const [bluetoothDevice, setBluetoothDevice] =
    useState<BluetoothDeviceLike | null>(null);
  const [bluetoothError, setBluetoothError] = useState("");

  /*
   * =========================================================
   * GATT INSPECTION STATE
   * =========================================================
   */

  const [gattServices, setGattServices] =
    useState<BluetoothServiceInfo[]>([]);
  const [gattLoading, setGattLoading] = useState(false);
  const [gattError, setGattError] = useState("");
  const [showGattDetails, setShowGattDetails] = useState(false);

  const [bluetoothServiceUuid, setBluetoothServiceUuid] =
    useState<string | null>(null);
  const [bluetoothCharacteristicUuid, setBluetoothCharacteristicUuid] =
    useState<string | null>(null);
  const [bluetoothWriteMode, setBluetoothWriteMode] =
    useState<string | null>(null);

  /*
   * =========================================================
   * CHECK WEB BLUETOOTH SUPPORT
   * =========================================================
   */

  useEffect(() => {
    const bluetoothNavigator =
      navigator as BluetoothNavigator;

    if (bluetoothNavigator.bluetooth) {
      setBluetoothSupported(true);
      setBluetoothStatus("DISCONNECTED");
    } else {
      setBluetoothSupported(false);
      setBluetoothStatus("UNSUPPORTED");
    }
  }, []);

  /*
   * =========================================================
   * INSPECT GATT
   * =========================================================
   */

  async function inspectGatt(device: BluetoothDeviceLike) {
    if (!device.gatt) {
      setGattError(
        "Perangkat tidak menyediakan koneksi GATT."
      );
      return;
    }

    try {
      setGattLoading(true);
      setGattError("");
      setGattServices([]);

      const server = device.gatt.connected
        ? device.gatt
        : await device.gatt.connect();

      const services = await server.getPrimaryServices();

      const serviceResults: BluetoothServiceInfo[] = [];

      for (const service of services) {
        const characteristics =
          await service.getCharacteristics();

        const characteristicResults: BluetoothCharacteristicInfo[] =
          [];

        for (const characteristic of characteristics) {
          const properties: string[] = [];

          if (characteristic.properties.read) {
            properties.push("READ");
          }

          if (characteristic.properties.write) {
            properties.push("WRITE");
          }

          if (
            characteristic.properties.writeWithoutResponse
          ) {
            properties.push("WRITE WITHOUT RESPONSE");
          }

          if (characteristic.properties.notify) {
            properties.push("NOTIFY");
          }

          if (characteristic.properties.indicate) {
            properties.push("INDICATE");
          }

          if (characteristic.properties.broadcast) {
            properties.push("BROADCAST");
          }

          if (
            characteristic.properties.authenticatedSignedWrites
          ) {
            properties.push("SIGNED WRITE");
          }

          if (characteristic.properties.reliableWrite) {
            properties.push("RELIABLE WRITE");
          }

          if (characteristic.properties.writableAuxiliaries) {
            properties.push("WRITABLE AUXILIARIES");
          }

          characteristicResults.push({
            uuid: characteristic.uuid,
            properties,
          });
        }

        serviceResults.push({
          uuid: service.uuid,
          isPrimary: service.isPrimary,
          characteristics: characteristicResults,
        });
      }

      setGattServices(serviceResults);

      let detectedServiceUuid: string | null = null;
      let detectedCharacteristicUuid: string | null = null;
      let detectedWriteMode: string | null = null;

      for (const service of services) {
        const characteristics =
          await service.getCharacteristics();

        for (const characteristic of characteristics) {
          if (
            characteristic.properties.writeWithoutResponse
          ) {
            detectedServiceUuid = service.uuid;
            detectedCharacteristicUuid = characteristic.uuid;
            detectedWriteMode = "writeWithoutResponse";
            break;
          }

          if (characteristic.properties.write) {
            detectedServiceUuid = service.uuid;
            detectedCharacteristicUuid = characteristic.uuid;
            detectedWriteMode = "write";
            break;
          }
        }

        if (detectedCharacteristicUuid) {
          break;
        }
      }

      setBluetoothServiceUuid(detectedServiceUuid);
      setBluetoothCharacteristicUuid(
        detectedCharacteristicUuid
      );
      setBluetoothWriteMode(detectedWriteMode);
    } catch (error) {
      console.error("inspectGatt error:", error);

      setGattError(
        error instanceof Error
          ? error.message
          : "Gagal membaca GATT service."
      );
    } finally {
      setGattLoading(false);
    }
  }

  /*
   * =========================================================
   * SEARCH BLUETOOTH
   * =========================================================
   */

  async function handleBluetoothSearch() {
    setBluetoothError("");
    setGattError("");
    setGattServices([]);
    setShowGattDetails(false);

    const bluetoothNavigator =
      navigator as BluetoothNavigator;

    if (!bluetoothNavigator.bluetooth) {
      setBluetoothSupported(false);
      setBluetoothStatus("UNSUPPORTED");

      alert(
        "Browser ini belum mendukung Web Bluetooth."
      );

      return;
    }

    try {
      setBluetoothStatus("SEARCHING");

      const device =
        await bluetoothNavigator.bluetooth.requestDevice({
          acceptAllDevices: true,
        });

      setBluetoothDevice(device);

      if (!device.gatt) {
        setBluetoothStatus("DISCONNECTED");

        setBluetoothError(
          "Perangkat ditemukan, tetapi tidak menyediakan koneksi GATT Web Bluetooth."
        );

        return;
      }

      const server = await device.gatt.connect();

      if (!server.connected) {
        throw new Error("Koneksi GATT gagal.");
      }

      setBluetoothStatus("CONNECTED");

      await inspectGatt(device);

      device.addEventListener(
        "gattserverdisconnected",
        () => {
          setBluetoothStatus("DISCONNECTED");
          setGattServices([]);
          setShowGattDetails(false);
          setBluetoothServiceUuid(null);
          setBluetoothCharacteristicUuid(null);
          setBluetoothWriteMode(null);
        }
      );
    } catch (error) {
      console.error("Bluetooth search error:", error);

      if (
        error instanceof DOMException &&
        error.name === "NotFoundError"
      ) {
        setBluetoothStatus(
          bluetoothDevice ? "CONNECTED" : "DISCONNECTED"
        );

        return;
      }

      setBluetoothStatus("FAILED");

      setBluetoothError(
        error instanceof Error
          ? error.message
          : "Gagal menghubungkan perangkat Bluetooth."
      );
    }
  }

  /*
   * =========================================================
   * DISCONNECT BLUETOOTH
   * =========================================================
   */

  function handleBluetoothDisconnect() {
    try {
      if (
        bluetoothDevice?.gatt &&
        bluetoothDevice.gatt.connected
      ) {
        bluetoothDevice.gatt.disconnect();
      }
    } catch (error) {
      console.error("Bluetooth disconnect error:", error);
    }

    setBluetoothDevice(null);
    setBluetoothError("");
    setGattError("");
    setGattServices([]);
    setShowGattDetails(false);
    setBluetoothServiceUuid(null);
    setBluetoothCharacteristicUuid(null);
    setBluetoothWriteMode(null);

    setBluetoothStatus(
      bluetoothSupported ? "DISCONNECTED" : "UNSUPPORTED"
    );
  }

  /*
   * =========================================================
   * BLUETOOTH STATUS LABEL
   * =========================================================
   */

  function bluetoothStatusLabel() {
    switch (bluetoothStatus) {
      case "CHECKING":
        return "MEMERIKSA...";
      case "UNSUPPORTED":
        return "TIDAK DIDUKUNG";
      case "DISCONNECTED":
        return "BELUM TERHUBUNG";
      case "SEARCHING":
        return "MENGHUBUNGKAN...";
      case "CONNECTED":
        return "TERHUBUNG";
      case "FAILED":
        return "GAGAL TERHUBUNG";
      default:
        return "BELUM TERHUBUNG";
    }
  }

  function bluetoothStatusClass() {
    switch (bluetoothStatus) {
      case "CONNECTED":
        return "border-green-700 bg-green-950/40 text-green-400";
      case "SEARCHING":
        return "border-yellow-700 bg-yellow-950/40 text-yellow-400";
      case "FAILED":
        return "border-red-700 bg-red-950/40 text-red-400";
      case "UNSUPPORTED":
        return "border-slate-700 bg-slate-900 text-slate-500";
      default:
        return "border-slate-700 bg-slate-900 text-slate-500";
    }
  }

  /*
   * =========================================================
   * LOAD PRINTERS
   * =========================================================
   */

  async function loadPrinters() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/owner/printers");
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.error || "Gagal mengambil data printer"
        );
      }

      const activePrinters = (data.printers ?? []).filter(
        (printer: Printer) => printer.isActive === true
      );

      setPrinters(activePrinters);

      const defaultPrinter =
        activePrinters.find(
          (printer: Printer) => printer.isDefault === true
        ) ?? null;

      setActivePrinter(defaultPrinter);
    } catch (error) {
      console.error("loadPrinters error:", error);

      setError(
        error instanceof Error
          ? error.message
          : "Gagal mengambil data printer"
      );
    } finally {
      setLoading(false);
    }
  }

  /*
   * =========================================================
   * LOAD RECEIPT SETTINGS
   * =========================================================
   */

  async function loadReceiptSettings() {
    try {
      setReceiptLoading(true);
      setReceiptError("");

      const response = await fetch(
        "/api/owner/receipt-settings"
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.error || "Gagal mengambil pengaturan struk"
        );
      }

      const setting = data.setting as ReceiptSetting;

      setReceiptSetting(setting);
      setReceiptPaperWidth(String(setting.paperWidth));
      setShowBusinessName(setting.showBusinessName);
      setShowAddress(setting.showAddress);
      setShowPhone(setting.showPhone);
      setFooterText(setting.footerText ?? "");
    } catch (error) {
      console.error("loadReceiptSettings error:", error);

      setReceiptError(
        error instanceof Error
          ? error.message
          : "Gagal mengambil pengaturan struk"
      );
    } finally {
      setReceiptLoading(false);
    }
  }

  useEffect(() => {
    loadPrinters();
    loadReceiptSettings();
  }, []);

  /*
   * =========================================================
   * PRINTER HELPERS
   * =========================================================
   */

  function connectionLabel(
    connectionType: Printer["connectionType"]
  ) {
    switch (connectionType) {
      case "BLUETOOTH":
        return "Bluetooth";
      case "USB":
        return "USB";
      case "NETWORK":
        return "Network";
      default:
        return connectionType;
    }
  }

  function resetForm() {
    setName("");
    setConnectionType("USB");
    setPaperWidth("58");
    setIsDefault(true);
  }

  function startAddPrinter() {
    setEditingPrinterId(null);
    resetForm();
    setShowAddForm(true);
  }

  function startEditPrinter(printer: Printer) {
    setEditingPrinterId(printer.id);
    setName(printer.name);
    setConnectionType(printer.connectionType);
    setPaperWidth(String(printer.paperWidth));
    setIsDefault(printer.isDefault);
    setShowAddForm(true);
  }

  function cancelForm() {
    setEditingPrinterId(null);
    setShowAddForm(false);
    resetForm();
  }

  /*
   * =========================================================
   * SAVE PRINTER
   * =========================================================
   */

  async function handleSavePrinter(
    e: React.FormEvent
  ) {
    e.preventDefault();

    if (!name.trim()) {
      alert("Nama printer wajib diisi.");
      return;
    }

    const width = Number(paperWidth);

    if (!Number.isInteger(width) || width <= 0) {
      alert(
        "Lebar kertas harus berupa angka lebih dari 0."
      );
      return;
    }

    try {
      setSaving(true);

      const isEditing = editingPrinterId !== null;

      const response = await fetch("/api/owner/printers", {
        method: isEditing ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...(isEditing ? { id: editingPrinterId } : {}),
          name: name.trim(),
          connectionType,
          paperWidth: width,
          isDefault,
          bluetoothDeviceId:
            connectionType === "BLUETOOTH"
              ? bluetoothDevice?.id ?? null
              : null,
          bluetoothServiceUuid:
            connectionType === "BLUETOOTH"
              ? bluetoothServiceUuid
              : null,
          bluetoothCharacteristicUuid:
            connectionType === "BLUETOOTH"
              ? bluetoothCharacteristicUuid
              : null,
          bluetoothWriteMode:
            connectionType === "BLUETOOTH"
              ? bluetoothWriteMode
              : null,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.error ||
            (isEditing
              ? "Gagal mengubah printer"
              : "Gagal menambahkan printer")
        );
      }

      alert(
        isEditing
          ? "Printer berhasil diubah."
          : "Printer berhasil ditambahkan."
      );

      cancelForm();
      await loadPrinters();
    } catch (error) {
      console.error("handleSavePrinter error:", error);

      alert(
        error instanceof Error
          ? error.message
          : "Gagal menyimpan printer"
      );
    } finally {
      setSaving(false);
    }
  }

  /*
   * =========================================================
   * DEACTIVATE PRINTER
   * =========================================================
   */

  async function handleDeactivatePrinter(
    printer: Printer
  ) {
    const confirmed = window.confirm(
      `Nonaktifkan printer "${printer.name}"?\n\nPrinter tidak akan dihapus dari database.`
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(printer.id);

      const response = await fetch("/api/owner/printers", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: printer.id,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.error || "Gagal menonaktifkan printer"
        );
      }

      alert("Printer berhasil dinonaktifkan.");

      if (editingPrinterId === printer.id) {
        cancelForm();
      }

      await loadPrinters();
    } catch (error) {
      console.error(
        "handleDeactivatePrinter error:",
        error
      );

      alert(
        error instanceof Error
          ? error.message
          : "Gagal menonaktifkan printer"
      );
    } finally {
      setDeletingId(null);
    }
  }

  /*
   * =========================================================
   * SAVE RECEIPT SETTINGS
   * =========================================================
   */

  async function handleSaveReceiptSettings(
    e: React.FormEvent
  ) {
    e.preventDefault();

    const width = Number(receiptPaperWidth);

    if (width !== 58 && width !== 80) {
      alert(
        "Ukuran kertas hanya boleh 58 mm atau 80 mm."
      );
      return;
    }

    try {
      setReceiptSaving(true);

      const response = await fetch(
        "/api/owner/receipt-settings",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            paperWidth: width,
            showBusinessName,
            showAddress,
            showPhone,
            footerText: footerText.trim(),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.error || "Gagal menyimpan pengaturan struk"
        );
      }

      setReceiptSetting(data.setting);

      alert("Pengaturan struk berhasil disimpan.");
    } catch (error) {
      console.error(
        "handleSaveReceiptSettings error:",
        error
      );

      alert(
        error instanceof Error
          ? error.message
          : "Gagal menyimpan pengaturan struk"
      );
    } finally {
      setReceiptSaving(false);
    }
  }

  /*
   * =========================================================
   * RENDER
   * =========================================================
   */

  return (
    <main className="min-h-screen bg-[#07111f] px-4 py-6 text-white">
      <div className="mx-auto max-w-md">
        {/* HEADER */}
        <div className="mb-6">
          <Link
            href="/owner/pengaturan"
            className="mb-4 inline-flex items-center text-sm font-bold text-slate-400 transition hover:text-white"
          >
            ← KEMBALI
          </Link>

          <p className="text-xs font-black tracking-[0.18em] text-red-500">
            OWNER
          </p>

          <h1 className="mt-2 text-2xl font-black tracking-tight">
            STRUK & PRINTER
          </h1>

          <p className="mt-1 text-sm text-slate-400">
            Kelola printer dan tampilan struk
          </p>

          <div className="mt-5 h-px bg-gradient-to-r from-red-700 via-red-500 to-transparent" />
        </div>

        {/* BLUETOOTH PRINTER */}
        <section className="mb-4 rounded-3xl border border-slate-700/70 bg-gradient-to-br from-[#17263d] to-[#0c1728] p-5 shadow-lg shadow-black/20">
          <div className="mb-4">
            <h2 className="text-lg font-black">
              BLUETOOTH PRINTER
            </h2>

            <p className="mt-1 text-xs text-slate-400">
              Persiapkan koneksi dan inspeksi perangkat Bluetooth
            </p>
          </div>

          <div className="rounded-2xl border border-slate-700/70 bg-[#081321] p-4">
            {/* STATUS */}
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-black text-slate-400">
                  STATUS BLUETOOTH
                </p>

                <p
                  className={`mt-2 inline-flex rounded-xl border px-3 py-1.5 text-[10px] font-black ${bluetoothStatusClass()}`}
                >
                  {bluetoothStatusLabel()}
                </p>
              </div>

              <div className="text-3xl">🟦</div>
            </div>

            {/* DEVICE */}
            {bluetoothDevice && (
              <div className="mt-4 rounded-2xl border border-slate-700/70 bg-[#101d30] p-3">
                <p className="text-[10px] font-black text-slate-400">
                  PERANGKAT
                </p>

                <p className="mt-1 truncate text-sm font-black text-white">
                  {bluetoothDevice.name || "Perangkat Bluetooth"}
                </p>

                <p className="mt-1 truncate text-[10px] text-slate-500">
                  ID: {bluetoothDevice.id}
                </p>
              </div>
            )}

            {/* BLUETOOTH ERROR */}
            {bluetoothError && (
              <div className="mt-4 rounded-2xl border border-red-800/70 bg-red-950/40 p-3">
                <p className="text-xs font-bold leading-relaxed text-red-400">
                  {bluetoothError}
                </p>
              </div>
            )}

            {/* UNSUPPORTED */}
            {!bluetoothSupported &&
              bluetoothStatus === "UNSUPPORTED" && (
                <div className="mt-4 rounded-2xl border border-yellow-800/70 bg-yellow-950/30 p-3">
                  <p className="text-xs font-bold leading-relaxed text-yellow-400">
                    Browser ini belum menyediakan Web Bluetooth.
                    Gunakan browser yang mendukung Web Bluetooth
                    dan koneksi HTTPS.
                  </p>
                </div>
              )}

            {/* BUTTON */}
            <div className="mt-4 flex gap-2">
              {bluetoothStatus === "CONNECTED" ? (
                <button
                  type="button"
                  onClick={handleBluetoothDisconnect}
                  className="w-full rounded-xl border border-red-800/70 bg-red-950/40 px-4 py-3 text-xs font-black text-red-400 transition hover:bg-red-950"
                >
                  PUTUSKAN
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleBluetoothSearch}
                  disabled={
                    !bluetoothSupported ||
                    bluetoothStatus === "SEARCHING" ||
                    bluetoothStatus === "CHECKING"
                  }
                  className="w-full rounded-xl bg-gradient-to-r from-red-600 to-red-700 px-4 py-3 text-xs font-black text-white transition hover:from-red-500 hover:to-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {bluetoothStatus === "SEARCHING"
                    ? "MENCARI..."
                    : "CARI PRINTER"}
                </button>
              )}
            </div>

            {/* GATT ERROR */}
            {gattError && (
              <div className="mt-4 rounded-2xl border border-red-800/70 bg-red-950/40 p-3">
                <p className="text-xs font-bold leading-relaxed text-red-400">
                  {gattError}
                </p>
              </div>
            )}

            {/* GATT DETAILS BUTTON */}
            {bluetoothDevice &&
              bluetoothStatus === "CONNECTED" && (
                <button
                  type="button"
                  onClick={() =>
                    setShowGattDetails(!showGattDetails)
                  }
                  className="mt-4 w-full rounded-xl border border-slate-600 bg-[#17263d] px-4 py-3 text-xs font-black text-slate-200 transition hover:border-red-600 hover:text-white"
                >
                  {showGattDetails
                    ? "SEMBUNYIKAN GATT"
                    : "LIHAT DETAIL GATT"}
                </button>
              )}

            {/* DETECTED BLUETOOTH WRITE CONFIG */}
            {bluetoothDevice &&
              bluetoothStatus === "CONNECTED" &&
              bluetoothCharacteristicUuid && (
                <div className="mt-4 rounded-2xl border border-green-800/70 bg-green-950/30 p-3">
                  <p className="text-[10px] font-black text-green-400">
                    KONFIGURASI PRINT BLUETOOTH
                  </p>

                  <div className="mt-3 space-y-2">
                    <div>
                      <p className="text-[9px] font-bold text-slate-500">
                        SERVICE UUID
                      </p>

                      <p className="mt-1 break-all text-[10px] font-black text-white">
                        {bluetoothServiceUuid}
                      </p>
                    </div>

                    <div>
                      <p className="text-[9px] font-bold text-slate-500">
                        CHARACTERISTIC UUID
                      </p>

                      <p className="mt-1 break-all text-[10px] font-black text-white">
                        {bluetoothCharacteristicUuid}
                      </p>
                    </div>

                    <div>
                      <p className="text-[9px] font-bold text-slate-500">
                        WRITE MODE
                      </p>

                      <p className="mt-1 text-[10px] font-black text-green-400">
                        {bluetoothWriteMode || "TIDAK TERDETEKSI"}
                      </p>
                    </div>
                  </div>
                </div>
              )}

            {/* GATT DETAILS */}
            {showGattDetails && (
              <div className="mt-4 rounded-2xl border border-slate-700/70 bg-[#081321] p-3">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-black text-white">
                      GATT SERVICES
                    </p>

                    <p className="mt-1 text-[10px] text-slate-500">
                      Struktur Bluetooth perangkat
                    </p>
                  </div>

                  {gattLoading && (
                    <span className="text-[10px] font-black text-yellow-400">
                      MEMBACA...
                    </span>
                  )}
                </div>

                {gattLoading ? (
                  <div className="rounded-xl border border-slate-700 bg-[#07111f] p-4 text-center">
                    <p className="text-xs font-bold text-slate-400">
                      MEMBACA GATT SERVICE...
                    </p>
                  </div>
                ) : gattServices.length === 0 ? (
                  <div className="rounded-xl border border-slate-700 bg-[#07111f] p-4 text-center">
                    <p className="text-xs font-bold text-slate-400">
                      TIDAK ADA PRIMARY SERVICE YANG TERBACA
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {gattServices.map((service, serviceIndex) => (
                      <div
                        key={`${service.uuid}-${serviceIndex}`}
                        className="rounded-xl border border-slate-700 bg-[#07111f] p-3"
                      >
                        <p className="text-[9px] font-black text-slate-400">
                          SERVICE {serviceIndex + 1}
                        </p>

                        <p className="mt-1 break-all text-[10px] font-black text-white">
                          {service.uuid}
                        </p>

                        <p className="mt-1 text-[9px] font-bold text-slate-500">
                          {service.isPrimary
                            ? "PRIMARY SERVICE"
                            : "SECONDARY SERVICE"}
                        </p>

                        <div className="mt-3 space-y-2">
                          {service.characteristics.length === 0 ? (
                            <p className="text-[9px] text-slate-500">
                              Tidak ada characteristic.
                            </p>
                          ) : (
                            service.characteristics.map(
                              (characteristic, characteristicIndex) => (
                                <div
                                  key={`${characteristic.uuid}-${characteristicIndex}`}
                                  className="rounded-xl border border-slate-700 bg-[#101d30] p-3"
                                >
                                  <p className="text-[9px] font-black text-slate-400">
                                    CHARACTERISTIC{" "}
                                    {characteristicIndex + 1}
                                  </p>

                                  <p className="mt-1 break-all text-[10px] font-black text-white">
                                    {characteristic.uuid}
                                  </p>

                                  <div className="mt-2 flex flex-wrap gap-1">
                                    {characteristic.properties.length ===
                                    0 ? (
                                      <span className="rounded-md border border-slate-700 px-2 py-1 text-[8px] font-black text-slate-500">
                                        NO PROPERTY
                                      </span>
                                    ) : (
                                      characteristic.properties.map(
                                        (property) => (
                                          <span
                                            key={property}
                                            className={`rounded-md border px-2 py-1 text-[8px] font-black ${
                                              property === "WRITE" ||
                                              property ===
                                                "WRITE WITHOUT RESPONSE"
                                                ? "border-green-800 bg-green-950/40 text-green-400"
                                                : "border-slate-600 bg-slate-800 text-slate-300"
                                            }`}
                                          >
                                            {property}
                                          </span>
                                        )
                                      )
                                    )}
                                  </div>
                                </div>
                              )
                            )
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* NOTE */}
            <p className="mt-4 text-[10px] leading-relaxed text-slate-500">
              Tahap ini hanya membaca struktur GATT. Aplikasi
              belum mengirim data cetak apa pun ke perangkat.
            </p>
          </div>
        </section>

        {/* PENGATURAN STRUK */}
        <section className="mb-4 rounded-3xl border border-slate-700/70 bg-gradient-to-br from-[#17263d] to-[#0c1728] p-5 shadow-lg shadow-black/20">
          <h2 className="text-lg font-black">
            PENGATURAN STRUK
          </h2>

          <p className="mt-1 text-xs text-slate-400">
            Atur tampilan dasar struk
          </p>

          {receiptLoading ? (
            <div className="mt-4 rounded-2xl border border-slate-700 bg-[#07111f] p-5 text-center">
              <p className="text-sm font-bold text-slate-400">
                MEMUAT PENGATURAN STRUK...
              </p>
            </div>
          ) : receiptError ? (
            <div className="mt-4 rounded-2xl border border-red-800/70 bg-red-950/40 p-4">
              <p className="text-sm font-bold text-red-400">
                {receiptError}
              </p>

              <button
                type="button"
                onClick={loadReceiptSettings}
                className="mt-3 rounded-xl border border-red-700 px-4 py-2 text-xs font-black text-red-400 transition hover:bg-red-950"
              >
                COBA LAGI
              </button>
            </div>
          ) : (
            <form
              onSubmit={handleSaveReceiptSettings}
              className="mt-4 space-y-4"
            >
              <div>
                <label className="mb-2 block text-xs font-black text-slate-300">
                  UKURAN KERTAS
                </label>

                <select
                  value={receiptPaperWidth}
                  onChange={(e) =>
                    setReceiptPaperWidth(e.target.value)
                  }
                  className="w-full rounded-xl border border-slate-600 bg-[#101d30] px-4 py-3 text-sm font-bold text-white outline-none focus:border-red-500"
                >
                  <option value="58">58 mm</option>
                  <option value="80">80 mm</option>
                </select>
              </div>

              <label className="flex cursor-pointer items-center justify-between gap-3 rounded-2xl border border-slate-700 bg-[#07111f] p-4">
                <div>
                  <p className="text-sm font-black">
                    TAMPILKAN NAMA USAHA
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    Nama usaha ditampilkan pada bagian atas struk.
                  </p>
                </div>

                <input
                  type="checkbox"
                  checked={showBusinessName}
                  onChange={(e) =>
                    setShowBusinessName(e.target.checked)
                  }
                  className="h-5 w-5 accent-red-600"
                />
              </label>

              <label className="flex cursor-pointer items-center justify-between gap-3 rounded-2xl border border-slate-700 bg-[#07111f] p-4">
                <div>
                  <p className="text-sm font-black">
                    TAMPILKAN ALAMAT
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    Alamat usaha ditampilkan pada struk.
                  </p>
                </div>

                <input
                  type="checkbox"
                  checked={showAddress}
                  onChange={(e) =>
                    setShowAddress(e.target.checked)
                  }
                  className="h-5 w-5 accent-red-600"
                />
              </label>

              <label className="flex cursor-pointer items-center justify-between gap-3 rounded-2xl border border-slate-700 bg-[#07111f] p-4">
                <div>
                  <p className="text-sm font-black">
                    TAMPILKAN TELEPON
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    Nomor telepon usaha ditampilkan pada struk.
                  </p>
                </div>

                <input
                  type="checkbox"
                  checked={showPhone}
                  onChange={(e) =>
                    setShowPhone(e.target.checked)
                  }
                  className="h-5 w-5 accent-red-600"
                />
              </label>

              <div>
                <label className="mb-2 block text-xs font-black text-slate-300">
                  CATATAN / FOOTER STRUK
                </label>

                <textarea
                  value={footerText}
                  onChange={(e) => setFooterText(e.target.value)}
                  rows={3}
                  placeholder="Contoh: Terima kasih telah menggunakan layanan kami."
                  className="w-full resize-none rounded-xl border border-slate-600 bg-[#101d30] px-4 py-3 text-sm font-bold text-white outline-none placeholder:text-slate-500 focus:border-red-500"
                />
              </div>

              <button
                type="submit"
                disabled={receiptSaving}
                className="w-full rounded-xl bg-gradient-to-r from-red-600 to-red-700 px-4 py-3 text-sm font-black text-white transition hover:from-red-500 hover:to-red-600 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {receiptSaving
                  ? "MENYIMPAN..."
                  : "SIMPAN PENGATURAN STRUK"}
              </button>

              {receiptSetting && (
                <p className="text-center text-[11px] font-bold text-slate-500">
                  Pengaturan tersimpan di database.
                </p>
              )}
            </form>
          )}
        </section>

        {/* PRINTER */}
        <section className="rounded-3xl border border-slate-700/70 bg-gradient-to-br from-[#17263d] to-[#0c1728] p-5 shadow-lg shadow-black/20">
          <div className="mb-4 flex items-start justify-between gap-3">
            <div>
              <h2 className="text-lg font-black">PRINTER</h2>

              <p className="text-xs text-slate-400">
                Printer aktif yang tersedia
              </p>
            </div>

            {!showAddForm && (
              <button
                type="button"
                onClick={startAddPrinter}
                className="shrink-0 rounded-xl bg-gradient-to-r from-red-600 to-red-700 px-3 py-2 text-[11px] font-black text-white transition hover:from-red-500 hover:to-red-600"
              >
                + TAMBAH
              </button>
            )}
          </div>

          {/* ACTIVE DEFAULT PRINTER */}
          {!loading && (
            <div className="mb-4 rounded-2xl border border-slate-700 bg-[#07111f] p-4">
              <p className="text-[10px] font-black text-slate-400">
                PRINTER DEFAULT AKTIF
              </p>

              {activePrinter ? (
                <>
                  <p className="mt-2 text-sm font-black text-green-400">
                    {activePrinter.name}
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    {connectionLabel(activePrinter.connectionType)}{" "}
                    • {activePrinter.paperWidth} mm
                  </p>

                  {activePrinter.connectionType === "BLUETOOTH" && (
                    <div className="mt-3 space-y-2">
                      <div>
                        <p className="text-[9px] font-bold text-slate-500">
                          DEVICE ID
                        </p>

                        <p className="mt-1 break-all text-[10px] text-slate-300">
                          {activePrinter.bluetoothDeviceId ||
                            "Belum tersimpan"}
                        </p>
                      </div>

                      <div>
                        <p className="text-[9px] font-bold text-slate-500">
                          SERVICE UUID
                        </p>

                        <p className="mt-1 break-all text-[10px] text-slate-300">
                          {activePrinter.bluetoothServiceUuid ||
                            "Belum tersimpan"}
                        </p>
                      </div>

                      <div>
                        <p className="text-[9px] font-bold text-slate-500">
                          CHARACTERISTIC UUID
                        </p>

                        <p className="mt-1 break-all text-[10px] text-slate-300">
                          {activePrinter.bluetoothCharacteristicUuid ||
                            "Belum tersimpan"}
                        </p>
                      </div>

                      <div>
                        <p className="text-[9px] font-bold text-slate-500">
                          WRITE MODE
                        </p>

                        <p className="mt-1 text-[10px] font-black text-green-400">
                          {activePrinter.bluetoothWriteMode ||
                            "Belum tersimpan"}
                        </p>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <>
                  <p className="mt-2 text-sm font-black text-slate-400">
                    BELUM ADA
                  </p>

                  <p className="mt-1 text-xs leading-relaxed text-slate-500">
                    Belum ada printer aktif yang ditetapkan sebagai
                    default.
                  </p>
                </>
              )}
            </div>
          )}

          {/* ADD / EDIT FORM */}
          {showAddForm && (
            <form
              onSubmit={handleSavePrinter}
              className="mb-4 rounded-2xl border border-red-800/70 bg-[#07111f] p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-sm font-black text-white">
                    {editingPrinterId !== null
                      ? "EDIT PRINTER"
                      : "TAMBAH PRINTER"}
                  </h3>

                  <p className="mt-1 text-xs text-slate-400">
                    {editingPrinterId !== null
                      ? "Ubah informasi printer"
                      : "Masukkan informasi printer"}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={cancelForm}
                  className="rounded-lg border border-slate-700 px-2 py-1 text-[10px] font-black text-slate-400 transition hover:text-white"
                >
                  BATAL
                </button>
              </div>

              <div className="mt-4 space-y-4">
                <div>
                  <label className="mb-2 block text-xs font-black text-slate-300">
                    NAMA PRINTER
                  </label>

                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Contoh: Printer Kasir"
                    className="w-full rounded-xl border border-slate-600 bg-[#101d30] px-4 py-3 text-sm font-bold text-white outline-none placeholder:text-slate-500 focus:border-red-500"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-xs font-black text-slate-300">
                    JENIS KONEKSI
                  </label>

                  <select
                    value={connectionType}
                    onChange={(e) =>
                      setConnectionType(
                        e.target.value as Printer["connectionType"]
                      )
                    }
                    className="w-full rounded-xl border border-slate-600 bg-[#101d30] px-4 py-3 text-sm font-bold text-white outline-none focus:border-red-500"
                  >
                    <option value="USB">USB</option>
                    <option value="BLUETOOTH">Bluetooth</option>
                    <option value="NETWORK">Network</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-xs font-black text-slate-300">
                    LEBAR KERTAS
                  </label>

                  <select
                    value={paperWidth}
                    onChange={(e) => setPaperWidth(e.target.value)}
                    className="w-full rounded-xl border border-slate-600 bg-[#101d30] px-4 py-3 text-sm font-bold text-white outline-none focus:border-red-500"
                  >
                    <option value="58">58 mm</option>
                    <option value="80">80 mm</option>
                  </select>
                </div>

                <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-700 bg-[#101d30] p-3">
                  <input
                    type="checkbox"
                    checked={isDefault}
                    onChange={(e) => setIsDefault(e.target.checked)}
                    className="h-5 w-5 accent-red-600"
                  />

                  <div>
                    <p className="text-sm font-black text-white">
                      JADIKAN DEFAULT
                    </p>

                    <p className="text-xs text-slate-400">
                      Printer ini digunakan sebagai printer utama.
                    </p>
                  </div>
                </label>

                <button
                  type="submit"
                  disabled={saving}
                  className="w-full rounded-xl bg-gradient-to-r from-red-600 to-red-700 px-4 py-3 text-sm font-black text-white transition hover:from-red-500 hover:to-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {saving
                    ? "MENYIMPAN..."
                    : editingPrinterId !== null
                      ? "SIMPAN PERUBAHAN"
                      : "SIMPAN PRINTER"}
                </button>
              </div>
            </form>
          )}

          {/* PRINTER LIST */}
          {loading ? (
            <div className="rounded-2xl border border-slate-700 bg-[#07111f] p-5 text-center">
              <p className="text-sm font-bold text-slate-400">
                MEMUAT PRINTER...
              </p>
            </div>
          ) : error ? (
            <div className="rounded-2xl border border-red-800/70 bg-red-950/40 p-4">
              <p className="text-sm font-bold text-red-400">
                {error}
              </p>

              <button
                type="button"
                onClick={loadPrinters}
                className="mt-3 rounded-xl border border-red-700 px-4 py-2 text-xs font-black text-red-400 transition hover:bg-red-950"
              >
                COBA LAGI
              </button>
            </div>
          ) : printers.length === 0 ? (
            <div className="rounded-2xl border border-slate-700 bg-[#07111f] p-5 text-center">
              <p className="text-sm font-black text-slate-300">
                BELUM ADA PRINTER AKTIF
              </p>

              <p className="mt-1 text-xs text-slate-500">
                Tambahkan printer untuk menggunakan fitur cetak struk.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {printers.map((printer) => (
                <div
                  key={printer.id}
                  className="rounded-2xl border border-slate-700 bg-[#07111f] p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="truncate text-sm font-black text-white">
                        {printer.name}
                      </h3>

                      <p className="mt-1 text-xs text-slate-400">
                        {connectionLabel(printer.connectionType)} •{" "}
                        {printer.paperWidth} mm
                      </p>

                      {printer.connectionType === "BLUETOOTH" &&
                        printer.bluetoothCharacteristicUuid && (
                          <p className="mt-2 text-[9px] font-bold text-green-400">
                            Bluetooth siap untuk konfigurasi print
                          </p>
                        )}
                    </div>

                    <div className="flex shrink-0 items-center gap-2">
                      {printer.isDefault && (
                        <span className="rounded-lg border border-green-800 bg-green-950/40 px-2 py-1 text-[9px] font-black text-green-400">
                          DEFAULT
                        </span>
                      )}

                      <button
                        type="button"
                        onClick={() => startEditPrinter(printer)}
                        className="rounded-lg border border-slate-600 px-3 py-2 text-[10px] font-black text-slate-300 transition hover:border-red-600 hover:text-white"
                      >
                        EDIT
                      </button>

                      <button
                        type="button"
                        disabled={deletingId === printer.id}
                        onClick={() =>
                          handleDeactivatePrinter(printer)
                        }
                        className="rounded-lg border border-red-800 px-3 py-2 text-[10px] font-black text-red-400 transition hover:bg-red-950 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {deletingId === printer.id
                          ? "MEMPROSES..."
                          : "NONAKTIFKAN"}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}