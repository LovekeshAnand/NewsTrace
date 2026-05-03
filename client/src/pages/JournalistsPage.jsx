import React, { useState, useEffect } from 'react';
import { Search, Loader2, Users, FileText, Hash } from 'lucide-react';
import { api } from '../services/api';

export default function JournalistsPage() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState('');

  const fetch = async () => {
    setLoading(true);
    try {
      const d = query ? await api.searchJournalists(query) : await api.getJournalists(50);
      setList(d.data || []);
    } catch {} finally { setLoading(false); }
  };

  useEffect(() => { fetch(); }, []);

  return (
    <div className="space-y-6 fade-in max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-[#e5e7eb] pb-4 mb-6">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-[#111827] mb-1">Journalist Roster</h2>
          <p className="text-sm text-[#6b7280]">Explore profiles, coverage beats, and indexed articles.</p>
        </div>
        <div className="flex w-full md:w-auto relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9ca3af]" />
          <input type="text" value={query} onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && fetch()} placeholder="Search names or beats..."
            className="ppx-input w-full md:w-64 pl-9 pr-4 py-2 text-sm" />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="animate-spin text-[#6b7280]" size={24} /></div>
      ) : list.length === 0 ? (
        <div className="text-center py-16">
          <Users size={32} className="mx-auto text-[#d1d5db] mb-4" />
          <p className="text-[#6b7280] font-medium">No profiles match your criteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {list.map(j => (
            <div key={j._id} className="ppx-card p-5 group">
              <div className="flex items-start gap-4 mb-4">
                {j.imageUrl ? (
                  <img src={j.imageUrl} alt={j.name} className="w-12 h-12 rounded-full object-cover border border-[#e5e7eb]" />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-[#f3f4f6] border border-[#e5e7eb] flex items-center justify-center text-[#4b5563] font-medium text-lg shrink-0">
                    {j.name.charAt(0)}
                  </div>
                )}
                <div className="flex-1 min-w-0 pt-0.5">
                  <h3 className="font-medium text-[#111827] truncate group-hover:text-[#2563eb] transition-colors">{j.name}</h3>
                  <p className="text-sm text-[#6b7280] truncate">{j.outlet?.name}</p>
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t border-[#f3f4f6] flex items-center justify-between text-sm">
                <span className="flex items-center gap-1.5 text-[#4b5563]"><FileText size={14} className="text-[#9ca3af]"/> Articles</span>
                <span className="font-medium text-[#111827]">{j.articleCount || 0}</span>
              </div>
              
              {j.beats?.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {j.beats.slice(0, 3).map((b, i) => (
                    <span key={i} className="flex items-center text-[11px] font-medium text-[#4b5563] bg-[#f3f4f6] px-1.5 py-0.5 rounded">
                      <Hash size={10} className="mr-0.5 opacity-50"/> {b.topic}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}