import React, { useState, useEffect } from 'react';
import { Globe, Search, Users, Newspaper, Database, CheckCircle, Loader2 } from 'lucide-react';
import { api } from '../services/api';

export default function ScrapeLoadingAnimation({ scrapeData, jobId, onComplete }) {
  const [step, setStep] = useState(0);
  const [job, setJob] = useState(null);
  const [elapsed, setElapsed] = useState(0);

  const steps = [
    { icon: Globe, text: 'Discovering website...' },
    { icon: Search, text: 'Finding journalist pages...' },
    { icon: Users, text: 'Extracting profiles...' },
    { icon: Newspaper, text: 'Scraping articles...' },
    { icon: Database, text: 'Saving to database...' }
  ];

  useEffect(() => {
    if (!jobId) return;
    const poll = async () => {
      try {
        const { data: jobs } = await api.getScrapeJobs(50);
        const found = jobs?.find(j => j._id === jobId);
        if (found) {
          setJob(found);
          if (found.status === 'completed') { 
            setStep(4); 
            if (id) clearInterval(id);
            onComplete?.(); 
          }
          else if (found.status === 'failed') {
            if (id) clearInterval(id);
            onComplete?.();
          }
          else if (found.progress >= 80) setStep(4);
          else if (found.progress >= 60) setStep(3);
          else if (found.progress >= 40) setStep(2);
          else if (found.progress >= 20) setStep(1);
          else setStep(0);
        }
      } catch {}
    };
    poll();
    const id = setInterval(poll, 3000);
    return () => clearInterval(id);
  }, [jobId, onComplete]);

  useEffect(() => {
    const id = setInterval(() => setElapsed(p => p + 1), 1000);
    return () => clearInterval(id);
  }, []);

  const fmt = (s) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

  return (
    <div className="space-y-6 fade-in">
      <div className="bg-[#f9fafb] border border-[#e5e7eb] rounded-xl p-6">
        <div className="flex justify-between items-start mb-5">
          <div>
            <p className="text-xs text-[#6b7280] uppercase tracking-wider mb-1 font-semibold">Current Task</p>
            <p className="text-xl font-semibold text-[#111827]">{scrapeData?.outletName || 'Processing...'}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-[#6b7280] uppercase tracking-wider font-semibold">Elapsed</p>
            <p className="text-lg font-medium text-[#111827] font-mono">{fmt(elapsed)}</p>
          </div>
        </div>
        <div className="w-full bg-[#e5e7eb] rounded-full h-1.5 mb-2 overflow-hidden">
          <div className="bg-[#2563eb] h-1.5 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${job?.progress || (step / steps.length * 100)}%` }} />
        </div>
        <p className="text-xs font-medium text-[#6b7280]">
          {job?.status === 'completed' ? '100' : (job?.progress || Math.round(step / steps.length * 100))}% complete
        </p>
      </div>

      <div className="space-y-3">
        {steps.map((s, i) => {
          const Icon = s.icon;
          const active = i === step && job?.status !== 'completed' && job?.status !== 'failed';
          const past = i < step || job?.status === 'completed';
          return (
            <div key={i} className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${
              active ? 'bg-white border-[#2563eb] shadow-sm' :
              past ? 'bg-white border-[#e5e7eb] opacity-70' : 'bg-[#f9fafb] border-transparent opacity-50'
            }`}>
              <div className={`p-2 rounded-lg ${
                active ? 'bg-[#eff6ff] text-[#2563eb]' :
                past ? 'bg-[#ecfdf5] text-[#059669]' : 'bg-[#f3f4f6] text-[#9ca3af]'
              }`}>
                {past ? <CheckCircle size={18} /> : <Icon size={18} />}
              </div>
              <span className={`text-sm font-medium flex-1 ${active ? 'text-[#111827]' : 'text-[#4b5563]'}`}>{s.text}</span>
              {active && <Loader2 className="animate-spin text-[#2563eb]" size={18} />}
            </div>
          );
        })}
      </div>

      {job?.status === 'failed' && (
        <div className="bg-[#fef2f2] border border-[#fecaca] rounded-xl p-4 text-[#b91c1c] text-sm font-medium">
          Task failed: {job.errorLog?.message || 'Unknown error occurred'}
        </div>
      )}
    </div>
  );
}