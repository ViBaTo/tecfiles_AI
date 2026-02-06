import { TrendingUp, LucideIcon } from "lucide-react";

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string;
  trend?: string;
  color: string;
}

export function StatCard({ icon: Icon, label, value, trend, color }: StatCardProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5 hover:shadow-medium transition-all duration-300 group">
      <div className="flex items-start justify-between">
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-105"
          style={{ backgroundColor: `${color}10` }}
        >
          <Icon size={20} style={{ color }} strokeWidth={1.5} />
        </div>
        {trend && (
          <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full flex items-center gap-1">
            <TrendingUp size={12} /> {trend}
          </span>
        )}
      </div>
      <div className="mt-4">
        <div className="text-2xl font-bold text-gray-900">{value}</div>
        <div className="text-sm text-gray-500 mt-1 font-medium">{label}</div>
      </div>
    </div>
  );
}
