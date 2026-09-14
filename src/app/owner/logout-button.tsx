"use client";

export default function LogoutButton() {
  const handleLogout = async () => {
    try {
      await fetch("/api/logout", {
        method: "POST",
      });
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      window.location.href = "/login";
    }
  };

  return (
    <button
      type="button"
      onClick={handleLogout}
      className="mt-6 w-full rounded-2xl bg-red-600 px-4 py-4 text-sm font-black text-white transition active:scale-[0.98]"
    >
      LOGOUT
    </button>
  );
}
