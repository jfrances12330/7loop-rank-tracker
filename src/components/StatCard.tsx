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
    <div className="bg-white rounded-xl p-3 md:p-5 shadow-sm hover:shadow-md transition-shadow duration-200 border border-gray-100">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-xs md:text-sm font-medium text-neutral truncate">{label}</p>
          <p className="text-2xl md:text-3xl font-bold text-gray-900 mt-0.5 md:mt-1 font-[Outfit]">
            {value}
          </p>
          {changeText && (
            <p className={`text-xs md:text-sm font-semibold mt-0.5 md:mt-1 ${changeColor}`}>
              {changeText}
            </p>
          )}
          {subtitle && (
            <p className="text-[10px] md:text-xs text-neutral mt-0.5 md:mt-1 hidden md:block">{subtitle}</p>
          )}
        </div>
        <div className="w-8 h-8 md:w-11 md:h-11 rounded-full bg-lavender/60 flex items-center justify-center flex-shrink-0">
          <Icon className="w-4 h-4 md:w-5 md:h-5 text-violet" />
        </div>
      </div>
    </div>
  );
}
