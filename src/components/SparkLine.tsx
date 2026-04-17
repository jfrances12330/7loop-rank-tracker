"use client";

export default function SparkLine({ data }: { data?: number[] }) {
  if (!data || data.length < 2)
    return <span className="text-neutral/50 text-xs">&mdash;</span>;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const h = 24;
  const w = 64;
  const step = w / (data.length - 1);

  // For position: lower is better, so invert
  const points = data
    .map((v, i) => `${i * step},${((v - min) / range) * h}`)
    .join(" ");
  const improving = data[data.length - 1] < data[0];

  return (
    <svg width={w} height={h + 2} className="inline-block">
      <polyline
        points={points}
        fill="none"
        stroke={improving ? "#10b981" : "#ef4444"}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
