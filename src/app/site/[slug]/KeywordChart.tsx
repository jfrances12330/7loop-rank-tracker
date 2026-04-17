"use client";
import { useState, useEffect } from "react";
import { getHistory, type HistoryPoint } from "@/lib/api";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { BarChart3 } from "lucide-react";

interface Props {
  siteUrl: string;
  keywords: { keyword: string; position: number | null }[];
}

export default function KeywordChart({ siteUrl, keywords }: Props) {
  const [selected, setSelected] = useState(keywords[0]?.keyword || "");
  const [data, setData] = useState<HistoryPoint[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!selected) return;
    setLoading(true);
    getHistory(siteUrl, selected, "30")
      .then(setData)
      .catch(() => setData([]))
      .finally(() => setLoading(false));
  }, [siteUrl, selected]);

  if (keywords.length === 0) return null;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-lavender/60 flex items-center justify-center">
            <BarChart3 className="w-5 h-5 text-violet" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 font-[Outfit]">
            Position History
          </h3>
        </div>
        <select
          value={selected}
          onChange={(e) => setSelected(e.target.value)}
          className="bg-white border border-gray-200 text-gray-900 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet/30 focus:border-violet"
        >
          {keywords.map((k) => (
            <option key={k.keyword} value={k.keyword}>
              {k.keyword}{" "}
              {k.position !== null ? `(pos ${k.position})` : ""}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="h-72 flex items-center justify-center text-neutral">
          <div className="animate-pulse">Loading chart data...</div>
        </div>
      ) : data.length === 0 ? (
        <div className="h-72 flex items-center justify-center text-neutral">
          No historical data available
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart
            data={data}
            margin={{ top: 10, right: 10, left: 0, bottom: 10 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#e5e7eb"
              vertical={false}
            />
            <XAxis
              dataKey="date"
              tick={{ fill: "#6B7280", fontSize: 11 }}
              tickFormatter={(v: string) => v.slice(5)}
              axisLine={{ stroke: "#e5e7eb" }}
              tickLine={false}
            />
            <YAxis
              reversed
              domain={["dataMin - 2", "dataMax + 2"]}
              tick={{ fill: "#6B7280", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              label={{
                value: "Position",
                angle: -90,
                position: "insideLeft",
                fill: "#6B7280",
                fontSize: 12,
              }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#ffffff",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
                color: "#1f2937",
                boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
              }}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              formatter={(value: any) => [
                `Position ${value}`,
                "Rank",
              ]}
              labelFormatter={(label: any) => `Date: ${label}`}
            />
            <Line
              type="monotone"
              dataKey="position"
              stroke="#7C3AED"
              strokeWidth={2.5}
              dot={{ fill: "#7C3AED", r: 3, strokeWidth: 0 }}
              activeDot={{
                fill: "#ffffff",
                r: 5,
                stroke: "#7C3AED",
                strokeWidth: 2,
              }}
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
