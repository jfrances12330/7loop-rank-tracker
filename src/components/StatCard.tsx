interface StatCardProps {
  label: string;
  value: string | number;
  icon: string;
  color?: string;
  sub?: string;
}

export default function StatCard({ label, value, icon, color = "from-indigo to-violet", sub }: StatCardProps) {
  return (
    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-5 hover:bg-white/8 transition-all duration-300">
      <div className="flex items-start justify-between mb-3">
        <span className="text-2xl">{icon}</span>
        <div className={`w-8 h-1 rounded-full bg-gradient-to-r ${color}`} />
      </div>
      <p className="text-3xl font-bold text-white font-[Outfit]">{value}</p>
      <p className="text-sm text-lavender/60 mt-1">{label}</p>
      {sub && <p className="text-xs text-lavender/40 mt-0.5">{sub}</p>}
    </div>
  );
}
