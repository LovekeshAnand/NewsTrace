import React from 'react';

export default function FeatureCard({ icon: Icon, title, description, color = 'blue' }) {
  const iconBg = {
    blue: 'bg-blue-100 text-blue-600', indigo: 'bg-indigo-100 text-indigo-600',
    green: 'bg-emerald-100 text-emerald-600', amber: 'bg-amber-100 text-amber-600'
  };

  return (
    <div className="bg-white border border-stone-200 rounded-xl p-5 hover:shadow-md hover:border-stone-300 transition-all group">
      <div className={`inline-flex p-2.5 rounded-lg mb-3 ${iconBg[color] || iconBg.blue} group-hover:scale-110 transition-transform`}>
        <Icon size={20} />
      </div>
      <h3 className="text-base font-semibold text-stone-900 mb-1.5">{title}</h3>
      <p className="text-sm text-stone-500 leading-relaxed">{description}</p>
    </div>
  );
}