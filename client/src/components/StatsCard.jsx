import React from 'react';

export default function StatsCard({ icon: Icon, label, value, loading }) {
  return (
    <div className="wb-card p-5">
      <div className="inline-flex p-2 rounded border-2 border-[#2b2b2b] mb-3 bg-[#f8f9ff]">
        <Icon size={24} className="text-[#2b2b2b]" />
      </div>
      <p className="text-[#2b2b2b] text-sm font-bold uppercase tracking-wider mb-1 font-hand">{label}</p>
      {loading ? (
        <div className="h-8 w-16 bg-[#e9ecef] animate-pulse border-2 border-[#2b2b2b] rounded" />
      ) : (
        <p className="text-3xl font-extrabold text-[#2b2b2b]">{value?.toLocaleString() || 0}</p>
      )}
    </div>
  );
}