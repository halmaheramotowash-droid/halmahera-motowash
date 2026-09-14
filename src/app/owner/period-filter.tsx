import Link from "next/link";

type Period = "today" | "yesterday" | "7days" | "month" | "lastmonth";

const filters: { value: Period; label: string }[] = [
  {
    value: "today",
    label: "Hari Ini",
  },
  {
    value: "yesterday",
    label: "Kemarin",
  },
  {
    value: "7days",
    label: "7 Hari",
  },
  {
    value: "month",
    label: "Bulan Ini",
  },
  {
    value: "lastmonth",
    label: "Bulan Lalu",
  },
];

export default function OwnerPeriodFilter({
  activePeriod,
}: {
  activePeriod: Period;
}) {
  return (
    <div className="mt-4 grid grid-cols-2 gap-2">
      {filters.map((filter) => {
        const active = activePeriod === filter.value;

        return (
          <Link
            key={filter.value}
            href={`/owner?period=${filter.value}`}
            className={[
              "rounded-2xl border px-3 py-3 text-center text-xs font-black transition active:scale-[0.98]",
              active
                ? "border-red-600 bg-red-600 text-white"
                : "border-zinc-800 bg-black text-zinc-400",
            ].join(" ")}
          >
            {filter.label}
          </Link>
        );
      })}
    </div>
  );
}
