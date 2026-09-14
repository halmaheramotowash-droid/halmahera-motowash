"use client";

import { useState } from "react";

type Employee = {
  id: number;
  name: string;
  username: string;
  role: "KARYAWAN";
  active: boolean;
  createdAt: string;
};

type Props = {
  employees: Employee[];
};

export default function KaryawanClient({
  employees: initialEmployees,
}: Props) {
  const [employees, setEmployees] =
    useState<Employee[]>(initialEmployees);

  const [loadingId, setLoadingId] =
    useState<number | null>(null);

  const [deletingId, setDeletingId] =
    useState<number | null>(null);

  const [deleteEmployeeTarget, setDeleteEmployeeTarget] =
    useState<Employee | null>(null);

  const [passwordEmployee, setPasswordEmployee] =
    useState<Employee | null>(null);

  const [newPassword, setNewPassword] =
    useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [savingPassword, setSavingPassword] =
    useState(false);

  const [successMessage, setSuccessMessage] =
    useState<string | null>(null);

  async function changeStatus(employee: Employee) {
    const action = employee.active
      ? "menonaktifkan"
      : "mengaktifkan";

    const confirmed = window.confirm(
      `Yakin ingin ${action} akun ${employee.name}?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setLoadingId(employee.id);

      const response = await fetch(
        "/api/karyawan",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            employeeId: employee.id,
            active: !employee.active,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.error ||
            "Gagal mengubah status karyawan"
        );
      }

      setEmployees((current) =>
        current.map((item) =>
          item.id === employee.id
            ? data.employee
            : item
        )
      );

      setSuccessMessage(
        employee.active
          ? "Karyawan berhasil dinonaktifkan"
          : "Karyawan berhasil diaktifkan"
      );
    } catch (error) {
      console.error(error);

      alert(
        error instanceof Error
          ? error.message
          : "Terjadi kesalahan"
      );
    } finally {
      setLoadingId(null);
    }
  }

  function openPasswordModal(employee: Employee) {
    setPasswordEmployee(employee);
    setNewPassword("");
    setShowPassword(false);
  }

  function closePasswordModal() {
    if (savingPassword) {
      return;
    }

    setPasswordEmployee(null);
    setNewPassword("");
    setShowPassword(false);
  }

  async function changePassword() {
    if (!passwordEmployee) {
      return;
    }

    if (newPassword.length < 6) {
      alert("Password minimal 6 karakter");
      return;
    }

    try {
      setSavingPassword(true);

      const response = await fetch(
        "/api/karyawan",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            employeeId:
              passwordEmployee.id,
            password: newPassword,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.error ||
            "Gagal mengubah password"
        );
      }

      setEmployees((current) =>
        current.map((item) =>
          item.id === passwordEmployee.id
            ? data.employee
            : item
        )
      );

      setSuccessMessage(
        "Password karyawan berhasil diubah"
      );

      closePasswordModal();
    } catch (error) {
      console.error(error);

      alert(
        error instanceof Error
          ? error.message
          : "Terjadi kesalahan"
      );
    } finally {
      setSavingPassword(false);
    }
  }

  function openDeleteModal(employee: Employee) {
    setDeleteEmployeeTarget(employee);
  }

  function closeDeleteModal() {
    if (deletingId !== null) {
      return;
    }

    setDeleteEmployeeTarget(null);
  }

  async function confirmDeleteEmployee() {
    if (!deleteEmployeeTarget) {
      return;
    }

    const employee = deleteEmployeeTarget;

    try {
      setDeletingId(employee.id);

      const response = await fetch(
        "/api/karyawan",
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            employeeId: employee.id,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.error ||
            "Gagal menghapus akun karyawan"
        );
      }

      setEmployees((current) =>
        current.filter(
          (item) =>
            item.id !== employee.id
        )
      );

      setDeleteEmployeeTarget(null);

      setSuccessMessage(
        data.softDeleted
          ? `Akun ${employee.name} dinonaktifkan dan ditandai terhapus. Histori transaksi tetap aman.`
          : `Akun ${employee.name} berhasil dihapus permanen.`
      );
    } catch (error) {
      console.error(error);

      alert(
        error instanceof Error
          ? error.message
          : "Terjadi kesalahan"
      );
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <>
      {/* NOTIFIKASI BERHASIL */}
      {successMessage && (
        <div className="fixed left-4 right-4 top-4 z-[100]">
          <div className="mx-auto flex max-w-md items-start gap-3 rounded-2xl border border-green-800 bg-green-950 p-4 shadow-2xl">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-green-500 text-black font-black">
              ✓
            </div>

            <div className="flex-1">
              <p className="text-xs font-black tracking-widest text-green-400">
                BERHASIL
              </p>

              <p className="mt-1 text-sm font-bold text-white">
                {successMessage}
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                setSuccessMessage(null)
              }
              className="text-lg font-black text-green-400"
            >
              ×
            </button>
          </div>
        </div>
      )}

      <section className="mt-4 space-y-3">
        {employees.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-zinc-800 bg-zinc-950 p-5 text-center">
            <p className="font-bold">
              BELUM ADA KARYAWAN
            </p>

            <p className="mt-1 text-sm text-zinc-500">
              Belum ada akun karyawan.
            </p>
          </div>
        ) : (
          employees.map((employee) => (
            <div
              key={employee.id}
              className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-lg font-black">
                    {employee.name}
                  </p>

                  <p className="mt-1 text-sm text-zinc-500">
                    @{employee.username}
                  </p>

                  <p className="mt-1 text-xs text-zinc-600">
                    ID Karyawan: {employee.id}
                  </p>
                </div>

                <span
                  className={[
                    "rounded-full px-3 py-1 text-[10px] font-black",
                    employee.active
                      ? "bg-green-950 text-green-400"
                      : "bg-red-950 text-red-400",
                  ].join(" ")}
                >
                  {employee.active
                    ? "AKTIF"
                    : "NONAKTIF"}
                </span>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() =>
                    openPasswordModal(employee)
                  }
                  className="min-h-[48px] rounded-xl border border-zinc-700 bg-zinc-900 px-3 text-xs font-black text-white transition active:scale-[0.98]"
                >
                  🔑 UBAH PASSWORD
                </button>

                <button
                  type="button"
                  onClick={() =>
                    changeStatus(employee)
                  }
                  disabled={
                    loadingId === employee.id ||
                    deletingId === employee.id
                  }
                  className={[
                    "min-h-[48px] rounded-xl px-3 text-xs font-black transition active:scale-[0.98]",
                    employee.active
                      ? "bg-red-950 text-red-400"
                      : "bg-green-950 text-green-400",
                    loadingId === employee.id
                      ? "cursor-not-allowed opacity-50"
                      : "",
                  ].join(" ")}
                >
                  {loadingId === employee.id
                    ? "MEMPROSES..."
                    : employee.active
                      ? "NONAKTIFKAN"
                      : "AKTIFKAN"}
                </button>
              </div>

              <button
                type="button"
                onClick={() =>
                  openDeleteModal(employee)
                }
                disabled={
                  deletingId === employee.id ||
                  loadingId === employee.id
                }
                className={[
                  "mt-2 min-h-[48px] w-full rounded-xl border border-red-900/60 bg-red-950/40 px-3 text-xs font-black text-red-400 transition active:scale-[0.98]",
                  deletingId === employee.id ||
                  loadingId === employee.id
                    ? "cursor-not-allowed opacity-50"
                    : "",
                ].join(" ")}
              >
                {deletingId === employee.id
                  ? "MENGHAPUS..."
                  : "🗑️ HAPUS AKUN"}
              </button>
            </div>
          ))
        )}
      </section>

      {/* MODAL UBAH PASSWORD */}
      {passwordEmployee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-5 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-950 p-5 shadow-2xl">
            <p className="text-xs font-bold tracking-widest text-red-500">
              OWNER
            </p>

            <h2 className="mt-1 text-xl font-black">
              UBAH PASSWORD
            </h2>

            <p className="mt-2 text-sm text-zinc-400">
              Ubah password untuk:
            </p>

            <p className="mt-1 font-black">
              {passwordEmployee.name}
            </p>

            <p className="text-sm text-zinc-500">
              @{passwordEmployee.username}
            </p>

            <div className="mt-5">
              <label className="text-xs font-bold text-zinc-400">
                PASSWORD BARU
              </label>

              <div className="mt-2 flex gap-2">
                <input
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  value={newPassword}
                  onChange={(event) =>
                    setNewPassword(
                      event.target.value
                    )
                  }
                  placeholder="Minimal 6 karakter"
                  className="min-h-[50px] flex-1 rounded-xl border border-zinc-700 bg-black px-4 text-sm text-white outline-none focus:border-red-600"
                  autoFocus
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword(
                      (current) => !current
                    )
                  }
                  className="min-h-[50px] rounded-xl bg-zinc-900 px-4 text-sm"
                >
                  {showPassword
                    ? "🙈"
                    : "👁️"}
                </button>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={closePasswordModal}
                disabled={savingPassword}
                className="min-h-[52px] rounded-xl bg-zinc-800 text-sm font-black"
              >
                BATAL
              </button>

              <button
                type="button"
                onClick={changePassword}
                disabled={
                  savingPassword ||
                  newPassword.length < 6
                }
                className="min-h-[52px] rounded-xl bg-red-600 text-sm font-black disabled:cursor-not-allowed disabled:opacity-50"
              >
                {savingPassword
                  ? "MENYIMPAN..."
                  : "SIMPAN PASSWORD"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL KONFIRMASI HAPUS */}
      {deleteEmployeeTarget && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/80 px-5 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-950 text-3xl">
              ⚠️
            </div>

            <h2 className="mt-5 text-center text-xl font-black text-white">
              HAPUS AKUN?
            </h2>

            <p className="mt-3 text-center text-sm leading-6 text-zinc-400">
              Apakah Anda yakin ingin menghapus
              akun karyawan berikut?
            </p>

            <div className="mt-4 rounded-2xl border border-zinc-800 bg-black p-4 text-center">
              <p className="text-lg font-black text-white">
                {deleteEmployeeTarget.name}
              </p>

              <p className="mt-1 text-sm text-zinc-500">
                @{deleteEmployeeTarget.username}
              </p>
            </div>

            <div className="mt-4 rounded-2xl border border-yellow-900/50 bg-yellow-950/30 p-4">
              <p className="text-xs font-bold leading-5 text-yellow-400">
                ⚠️ PERHATIAN
              </p>

              <p className="mt-1 text-xs leading-5 text-zinc-400">
                Jika akun sudah memiliki transaksi,
                akun akan dinonaktifkan dan histori
                transaksi tetap aman.
              </p>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={closeDeleteModal}
                disabled={deletingId !== null}
                className="min-h-[52px] rounded-xl bg-zinc-800 text-sm font-black text-white transition active:scale-[0.98] disabled:opacity-50"
              >
                BATAL
              </button>

              <button
                type="button"
                onClick={confirmDeleteEmployee}
                disabled={deletingId !== null}
                className="min-h-[52px] rounded-xl bg-red-600 text-sm font-black text-white transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {deletingId !== null
                  ? "MENGHAPUS..."
                  : "YA, HAPUS"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}