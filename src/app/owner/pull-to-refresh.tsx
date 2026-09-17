"use client";

import { useEffect, useRef, useState } from "react";

export default function PullToRefresh() {
  const startY = useRef<number | null>(null);
  const refreshing = useRef(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    function handleTouchStart(event: TouchEvent) {
      if (window.scrollY === 0 && !refreshing.current) {
        startY.current = event.touches[0]?.clientY ?? null;
      }
    }

    function handleTouchMove(event: TouchEvent) {
      if (startY.current === null || refreshing.current) {
        return;
      }

      const currentY = event.touches[0]?.clientY ?? 0;
      const distance = currentY - startY.current;

      if (distance > 0 && window.scrollY === 0) {
        setPullDistance(Math.min(distance, 100));
      }
    }

    function handleTouchEnd() {
      if (startY.current === null || refreshing.current) {
        return;
      }

      if (pullDistance >= 70) {
        refreshing.current = true;
        setIsRefreshing(true);
        setPullDistance(0);

        window.location.reload();
        return;
      }

      startY.current = null;
      setPullDistance(0);
    }

    window.addEventListener("touchstart", handleTouchStart, {
      passive: true,
    });

    window.addEventListener("touchmove", handleTouchMove, {
      passive: true,
    });

    window.addEventListener("touchend", handleTouchEnd, {
      passive: true,
    });

    return () => {
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, [pullDistance]);

  if (pullDistance === 0 && !isRefreshing) {
    return null;
  }

  return (
    <div className="pointer-events-none fixed left-0 right-0 top-0 z-[100] flex justify-center pt-3">
      <div className="rounded-full border border-white/10 bg-[#111923] px-4 py-2 text-xs font-bold text-white shadow-xl">
        {isRefreshing
          ? "Memuat ulang..."
          : pullDistance >= 70
            ? "Lepaskan untuk refresh"
            : "Tarik ke bawah untuk refresh"}
      </div>
    </div>
  );
}