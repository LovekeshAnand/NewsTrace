import React, { useState, useEffect } from 'react';
import { Clock, Loader2, ExternalLink, Globe } from 'lucide-react';
import { api } from '../services/api';

export default function OutletsPage() {
  const [outlets, setOutlets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = async () => {
    setLoading(true); setError(null);
    try {
      const res = await api.getOutlets();
      setOutlets(res.data || []);
    } catch { setError('Failed to load outlets'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-[#6b7280]" size={24} /></div>;

  return (
    <div className="space-y-6 fade-in max-w-5xl mx-auto">
      <div className="flex justify-between items-end border-b border-[#e5e7eb] pb-4 mb-6">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-[#111827] mb-1">Publications Directory</h2>
          <p className="text-sm text-[#6b7280]">All indexed news organizations and media outlets.</p>
        </div>
      </div>

      {error && <div className="bg-[#fef2f2] border border-[#fecaca] rounded-lg p-4 text-[#b91c1c] text-sm">{error}</div>}

      {!error && outlets.length === 0 ? (
        <div className="text-center py-16">
          <Globe size={32} className="mx-auto text-[#d1d5db] mb-4" />
          <p className="text-[#6b7280] font-medium">No publications indexed yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {outlets.map(o => (
            <div key={o._id} className="ppx-card p-5 group flex flex-col h-full">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-[#111827] mb-1 truncate">{o.name}</h3>
                  <a href={o.website} target="_blank" rel="noopener noreferrer"
                    className="text-sm text-[#6b7280] hover:text-[#2563eb] transition-colors flex items-center gap-1">
                    {o.domain} <ExternalLink size={12} />
                  </a>
                </div>
              </div>
              
              <div className="mt-auto pt-4 border-t border-[#f3f4f6] flex items-center justify-between">
                <div className="text-sm">
                  <span className="font-semibold text-[#111827]">{o.journalistCount || 0}</span>
                  <span className="text-[#6b7280] ml-1">profiles</span>
                </div>
                {o.lastScrapedAt && (
                  <div className="flex items-center gap-1.5 text-[11px] text-[#9ca3af]">
                    <Clock size={12} /> {new Date(o.lastScrapedAt).toLocaleDateString()}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
