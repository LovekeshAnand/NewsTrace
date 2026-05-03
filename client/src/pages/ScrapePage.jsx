import React, { useState, useEffect } from 'react';
import { Play, Loader2, Link } from 'lucide-react';
import ScrapeLoadingAnimation from '../components/ScrapeLoadingAnimation';
import ErrorAlert from '../components/ErrorAlert';
import { api } from '../services/api';

export default function ScrapePage({ user }) {
  const [name, setName] = useState('');
  const [count, setCount] = useState(30);
  const [scraping, setScraping] = useState(false);
  const [jobId, setJobId] = useState(null);
  const [scrapeData, setScrapingData] = useState(null);
  const [error, setError] = useState(null);
  const [initialCheck, setInitialCheck] = useState(true);

  useEffect(() => {
    const activeJobId = localStorage.getItem('nt_active_job');
    if (!activeJobId) {
      setInitialCheck(false);
      return;
    }

    api.getScrapeJobs(10).then(res => {
      const active = res.data?.find(j => 
        j._id === activeJobId && 
        (j.status === 'processing' || j.status === 'pending')
      );
      if (active) {
        setJobId(active._id);
        setScrapingData({ outletName: active.outlet?.name, targetCount: active.metadata?.targetCount });
        setScraping(true);
      } else {
        localStorage.removeItem('nt_active_job');
      }
    }).finally(() => setInitialCheck(false));
  }, []);

  const handleStart = async () => {
    if (!name.trim()) return setError('Enter an outlet name');
    setScraping(true); setError(null);
    setScrapingData({ outletName: name, targetCount: count, startTime: Date.now() });
    try {
      const res = await api.startScrape(name, count);
      if (res.success) {
        setJobId(res.data.scrapeJobId);
        localStorage.setItem('nt_active_job', res.data.scrapeJobId);
      } else throw new Error(res.error || 'Failed to start');
    } catch (err) {
      setError(err.message);
      setScraping(false);
    }
  };

  const handleComplete = () => {
    localStorage.removeItem('nt_active_job');
    setTimeout(() => { setScraping(false); setJobId(null); setName(''); }, 3000);
  };

  if (initialCheck) return <div className="text-center mt-20"><Loader2 className="animate-spin inline text-[#6b7280]" size={24} /></div>;

  return (
    <div className="max-w-2xl mx-auto space-y-8 fade-in">
      <div className="text-center pt-8 mb-4">
        <h1 className="text-3xl font-semibold tracking-tight text-[#111827] mb-2">Extract Intelligence</h1>
        <p className="text-[#6b7280]">Target a publication to scrape journalists, beats, and articles automatically.</p>
      </div>

      <div className="ppx-card p-8">
        {scraping ? (
          <ScrapeLoadingAnimation scrapeData={scrapeData} jobId={jobId} onComplete={handleComplete} />
        ) : (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-[#374151] mb-2">Target Publication</label>
              <div className="relative">
                <Link size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9ca3af]" />
                <input type="text" value={name} onChange={e => setName(e.target.value)}
                  placeholder="e.g. theverge.com or The New York Times"
                  className="ppx-input w-full pl-10 pr-4 py-3 text-[#111827]" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#374151] mb-2">Profile Extraction Limit</label>
              <input type="number" value={count} onChange={e => setCount(+e.target.value)} min={10} max={100}
                className="ppx-input w-full px-4 py-3 text-[#111827]" />
            </div>
            <button onClick={handleStart} disabled={!name.trim()}
              className="ppx-btn w-full py-3.5 mt-2 flex items-center justify-center gap-2">
              <Play size={18} /> Run Extractor
            </button>
            <div className="text-center pt-4">
              <p className="text-xs text-[#9ca3af]">Scraping takes approximately 2-5 minutes. You may safely navigate away.</p>
            </div>
          </div>
        )}
        <ErrorAlert message={error} />
      </div>
    </div>
  );
}