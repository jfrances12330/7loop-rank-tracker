import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  change?: number | null;
  subtitle?: string;
}

export default function StatCard({
  label,
  value,
  icon: Icon,
  change,
  subtitle,
}: StatCardProps) {
  const changeColor =
    change === null || change === undefined
      ? ""
      : change > 0
        ? "text-emerald-600"
        : change < 0
          ? "text-red-500"
          : "text-neutral";

  const changeText =
    change === null || change === undefined
      ? null
      : change > 0
        ? `+${change.toFixed(1)}%`
        : change < 0
          ? `${change.toFixed(1)}%`
          : "0%";

  return (
    <div className="bg-white rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow duration-200 border border-gray-100">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-neutral">{label}</p>
          <p className="text-3xl font-bold text-gray-900 mt-1 font-[Outfit]">
            {value}
          </p>
          {changeText && (
            <p className={`text-sm font-semibold mt-1 ${changeColor}`}>
              {changeText}
            </p>
          )}
          {subtitle && (
            <p className="text-xs text-neutral mt-1">{subtitle}</p>
          )}
        </div>
        <div className="w-11 h-11 rounded-full bg-lavender/60 flex items-center justify-center flex-shrink-0">
          <Icon className="w-5 h-5 text-violet" />
        </div>
      </div>
    </div>
  );
}
