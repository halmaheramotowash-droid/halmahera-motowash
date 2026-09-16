"use client";

import { useEffect, useRef, useState } from "react";

type Transaction = {
  id?: number | string;
  transactionNumber?: string;
  invoiceNumber?: string;
  vehicle?: {
    plateNumber?: string;
    licensePlate?: string;
    type?: string;
  };
  vehicleType?: string;
  plateNumber?: string;
  price?: number;
  total?: number;
  totalAmount?: number;
  amount?: number;
  employee?: { name?: string };
  employeeName?: string;
  createdAt?: string;
  date?: string;
};

function formatRupiah(value: number) {
  return `Rp${Number(value || 0).toLocaleString("id-ID")}`;
}

function formatTime(value?: string) {
  if (!value) return "Baru saja";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Baru saja";
  return date.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function NotificationButton() {
  const [open, setOpen] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  async function loadNotifications() {
    try {
      setLoading(true);
      const response = await fetch("/api/transactions", {
        cache: "no-store",
      });
      if (!response.ok) throw new Error("Gagal mengambil transaksi terbaru");

      const result = await response.json();
      const list: Transaction[] = Array.isArray(result)
        ? result
        : result.transactions || result.data || [];
      const latest = list.slice(0, 5);
      setTransactions(latest);

      const latestKey = latest
        .map((item) => String(item.id ?? item.transactionNumber ?? ""))
        .join(",");
      const savedKey = sessionStorage.getItem("washapp-last-notification");
      if (!savedKey || savedKey !== latestKey) setUnread(latest.length);
    } catch (error) {
      console.error("Notification error:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadNotifications();
    const timer = window.setInterval(loadNotifications, 10000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    function handleOutsideClick(event: MouseEvent) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  function markAsRead() {
    const latestKey = transactions
      .map((item) => String(item.id ?? item.transactionNumber ?? ""))
      .join(",");
    sessionStorage.setItem("washapp-last-notification", latestKey);
    setUnread(0);
  }

  function getNumber(transaction: Transaction) {
    return (
      transaction.transactionNumber ||
      transaction.invoiceNumber ||
      `TRX-${transaction.id ?? "BARU"}`
    );
  }

  function getType(transaction: Transaction) {
    return transaction.vehicle?.type || transaction.vehicleType || "Kendaraan";
  }

  function getPlate(transaction: Transaction) {
    return (
      transaction.vehicle?.plateNumber ||
      transaction.vehicle?.licensePlate ||
      transaction.plateNumber ||
      "Plat belum tersedia"
    );
  }

  function getAmount(transaction: Transaction) {
    return transaction.price ?? transaction.total ?? transaction.totalAmount ?? transaction.amount ?? 0;
  }

  return (
    <div ref={wrapperRef} className="relative shrink-0">
      <button
        type="button"
        onClick={() => {
          if (!open) markAsRead();
          setOpen((value) => !value);
        }}
        aria-label="Notifikasi transaksi terbaru"
        className="relative flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-[#111923] text-2xl transition hover:border-red-500 sm:h-16 sm:w-16 sm:text-3xl"
      >
        🔔
        {unread > 0 && (
          <span className="absolute -right-1 -top-2 flex h-6 min-w-6 items-center justify-center rounded-full bg-red-600 px-1 text-xs font-black text-white">
            {unread > 99 ? "99+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="fixed left-1/2 top-20 z-[100] w-[calc(100vw-24px)] max-w-[430px] -translate-x-1/2 overflow-hidden rounded-3xl border border-slate-700 bg-[#030817] text-white shadow-2xl sm:absolute sm:left-auto sm:right-0 sm:top-20 sm:w-[430px] sm:translate-x-0">
          <div className="flex items-start justify-between gap-3 border-b border-slate-800 px-5 py-4">
            <div>
              <h2 className="text-xl font-bold sm:text-2xl">Notifikasi</h2>
              <p className="mt-1 text-sm text-slate-400">Transaksi terbaru</p>
            </div>
            <button
              type="button"
              onClick={markAsRead}
              className="text-right text-sm font-semibold text-sky-400 hover:text-sky-300"
            >
              Tandai semua dibaca
            </button>
          </div>

          <div className="max-h-[420px] overflow-y-auto">
            {loading && (
              <p className="px-5 py-8 text-center text-slate-400">Memuat transaksi terbaru...</p>
            )}
            {!loading && transactions.length === 0 && (
              <p className="px-5 py-8 text-center text-slate-400">Belum ada transaksi terbaru.</p>
            )}
            {!loading && transactions.map((transaction, index) => (
              <div key={transaction.id ?? transaction.transactionNumber ?? index} className="flex gap-3 border-b border-slate-800 px-4 py-4 hover:bg-slate-900">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-slate-800 text-xl">
                  {String(getType(transaction)).toUpperCase() === "MOBIL" ? "🚗" : "🏍️"}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <p className="truncate font-bold">{getNumber(transaction)}</p>
                    <span className="whitespace-nowrap text-xs text-slate-400">{formatTime(transaction.createdAt || transaction.date)}</span>
                  </div>
                  <p className="mt-1 text-sm text-slate-300">{getType(transaction)} • {getPlate(transaction)}</p>
                  <p className="text-sm text-slate-500">oleh {transaction.employee?.name || transaction.employeeName || "Karyawan"}</p>
                  <p className="mt-1 font-bold text-red-400">{formatRupiah(getAmount(transaction))}</p>
                </div>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={() => { window.location.href = "/riwayat"; }}
            className="flex w-full items-center justify-between bg-slate-800 px-5 py-4 font-semibold hover:bg-slate-700"
          >
            <span>☷ &nbsp; Lihat Semua Transaksi</span>
            <span className="text-xl">›</span>
          </button>
        </div>
      )}
    </div>
  );
}
