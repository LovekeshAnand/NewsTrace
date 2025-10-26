import React from 'react';
import { TrendingUp } from 'lucide-react';

export default function StatsCard({ icon: Icon, label, value, color = 'blue', trend, loading }) {
  const colorClasses = {
    blue: 'from-blue-500 to-blue-600',
    purple: 'from-purple-500 to-purple-600',
    green: 'from-green-500 to-green-600',
    orange: 'from-orange-500 to-orange-600',
    pink: 'from-pink-500 to-pink-600'
  };

  return (
    <div className="bg-linear-to-br from-slate-800 to-slate-900 rounded-2xl border border-slate-700 p-6 hover:border-slate-600 transition-all group hover:shadow-xl">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className={`inline-flex p-3 rounded-xl bg-linear-to-br ${colorClasses[color]} mb-4 group-hover:scale-110 transition-transform`}>
            <Icon size={24} className="text-white" />
          </div>
          <p className="text-slate-400 text-sm mb-1 font-medium">{label}</p>
          {loading ? (
            <div className="h-8 w-20 bg-slate-700 animate-pulse rounded"></div>
          ) : (
            <p className="text-3xl font-bold text-white">{value?.toLocaleString() || 0}</p>
          )}
          {trend && (
            <p className="text-sm text-green-400 mt-2 flex items-center gap-1">
              <TrendingUp size={14} />
              {trend}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}