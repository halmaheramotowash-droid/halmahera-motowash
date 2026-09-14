"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function OwnerAutoRefresh() {
  const router = useRouter();

  useEffect(() => {
    const refreshPage = () => {
      if (document.visibilityState === "visible") {
        router.refresh();
      }
    };

    const interval = window.setInterval(refreshPage, 5000);

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        router.refresh();
      }
    };

    document.addEventListener(
      "visibilitychange",
      handleVisibilityChange
    );

    return () => {
      window.clearInterval(interval);

      document.removeEventListener(
        "visibilitychange",
        handleVisibilityChange
      );
    };
  }, [router]);

  return null;
}