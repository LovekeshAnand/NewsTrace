import React, { useState, useEffect } from 'react';
import { RefreshCw, Activity, User, CheckCircle, XCircle } from 'lucide-react';
import { api } from '../services/api';

export default function JobsPage() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try { const d = await api.getScrapeJobs(20); setJobs(d.data || []); }
    catch {} finally { setLoading(false); }
  };

  useEffect(() => {
    load();
    const id = setInterval(load, 15000); // 15 seconds instead of 8 to reduce load
    return () => clearInterval(id);
  }, []);

  return (
    <div className="space-y-6 fade-in max-w-4xl mx-auto">
      <div className="flex justify-between items-end border-b border-[#e5e7eb] pb-4 mb-6">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-[#111827] mb-1">Task History</h2>
          <p className="text-sm text-[#6b7280]">Log of all intelligence extraction jobs.</p>
        </div>
        <button onClick={load} disabled={loading}
          className="ppx-btn ppx-btn-secondary px-3 py-1.5 flex items-center gap-1.5 text-xs">
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh
        </button>
      </div>

      {jobs.length === 0 ? (
        <div className="text-center py-16">
          <Activity size={32} className="mx-auto text-[#d1d5db] mb-4" />
          <p className="text-[#6b7280] font-medium">No tasks found.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {jobs.map(j => (
            <div key={j._id} className="ppx-card p-4 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1.5">
                  <h3 className="font-medium text-[#111827]">{j.outlet?.name || 'Unknown Target'}</h3>
                  {j.status === 'processing' && <span className="text-[#2563eb] text-xs font-semibold bg-[#eff6ff] px-2 py-0.5 rounded uppercase">Processing</span>}
                  {j.status === 'completed' && <span className="text-[#059669] text-xs font-semibold bg-[#ecfdf5] px-2 py-0.5 rounded uppercase">Completed</span>}
                  {j.status === 'failed' && <span className="text-[#dc2626] text-xs font-semibold bg-[#fef2f2] px-2 py-0.5 rounded uppercase">Failed</span>}
                </div>
                <div className="flex items-center gap-3 text-xs text-[#6b7280]">
                  <span className="flex items-center gap-1">
                    <User size={12} /> {j.user?.name || 'System'}
                  </span>
                  <span>•</span>
                  <span>{new Date(j.startedAt).toLocaleString()}</span>
                </div>
              </div>

              {j.status === 'processing' && (
                <div className="w-full sm:w-48">
                  <div className="w-full bg-[#f3f4f6] rounded-full h-1.5 mb-1">
                    <div className="bg-[#2563eb] h-1.5 transition-all duration-500 rounded-full"
                      style={{ width: `${j.progress || 0}%` }} />
                  </div>
                  <p className="text-[11px] font-medium text-[#6b7280] text-right">{j.progress || 0}%</p>
                </div>
              )}

              {j.status === 'completed' && (
                <div className="text-right flex items-center gap-2">
                  <CheckCircle size={16} className="text-[#059669]" />
                  <div>
                    <span className="font-semibold text-[#111827]">{j.totalFound}</span>
                    <span className="text-xs text-[#6b7280] ml-1">profiles</span>
                  </div>
                </div>
              )}
              {j.status === 'failed' && (
                <div className="flex items-center gap-1.5 text-xs text-[#dc2626] max-w-[200px] truncate" title={j.errorLog?.message}>
                  <XCircle size={14} /> {j.errorLog?.message || 'Error'}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}