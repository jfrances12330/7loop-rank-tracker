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
    getHistory(siteUrl, selected, 30)
      .then(setData)
      .catch(() => setData([]))
      .finally(() => setLoading(false));
  }, [siteUrl, selected]);

  if (keywords.length === 0) return null;

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h3 className="text-lg font-bold text-white font-[Outfit]">Evolucion de posicion</h3>
        <select
          value={selected}
          onChange={(e) => setSelected(e.target.value)}
          className="bg-white/10 border border-white/20 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-violet"
        >
          {keywords.map((k) => (
            <option key={k.keyword} value={k.keyword} className="bg-midnight text-white">
              {k.keyword} {k.position !== null ? `(pos ${k.position})` : ""}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="h-64 flex items-center justify-center text-lavender/40">Cargando...</div>
      ) : data.length === 0 ? (
        <div className="h-64 flex items-center justify-center text-lavender/40">Sin datos historicos</div>
      ) : (
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis
              dataKey="date"
              tick={{ fill: "#6B7280", fontSize: 11 }}
              tickFormatter={(v: string) => v.slice(5)}
            />
            <YAxis
              reversed
              domain={["dataMin - 2", "dataMax + 2"]}
              tick={{ fill: "#6B7280", fontSize: 11 }}
              label={{ value: "Posicion", angle: -90, position: "insideLeft", fill: "#6B7280", fontSize: 12 }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#1a0b3e",
                border: "1px solid rgba(124,58,237,0.3)",
                borderRadius: "12px",
                color: "#EDE9FE",
              }}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              formatter={(value: any) => [`Pos ${value}`, "Posicion"]}
              labelFormatter={(label: any) => `Fecha: ${label}`}
            />
            <Line
              type="monotone"
              dataKey="position"
              stroke="#7C3AED"
              strokeWidth={2.5}
              dot={{ fill: "#7C3AED", r: 3 }}
              activeDot={{ fill: "#EDE9FE", r: 5, stroke: "#7C3AED", strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
