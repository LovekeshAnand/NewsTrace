import React, { useState, useEffect } from 'react';
import { RefreshCw, Activity } from 'lucide-react';
import { api } from '../services/api';

export default function JobsPage() {
  const [scrapeJobs, setScrapeJobs] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchScrapeJobs();
    const interval = setInterval(fetchScrapeJobs, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchScrapeJobs = async () => {
    try {
      setLoading(true);
      const data = await api.getScrapeJobs(20);
      setScrapeJobs(data.data || []);
    } catch (err) {
      console.error('Error fetching jobs:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'processing':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'failed':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      default:
        return 'bg-slate-700 text-slate-400 border-slate-600';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-white">Scrape Jobs</h2>
          <p className="text-slate-400 mt-1">Monitor all scraping activities</p>
        </div>
        <button
          onClick={fetchScrapeJobs}
          disabled={loading}
          className="px-4 py-2 bg-slate-800 border border-slate-700 text-white rounded-lg hover:bg-slate-700 transition-all flex items-center gap-2 disabled:opacity-50"
        >
          <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {scrapeJobs.length === 0 ? (
        <div className="text-center py-20 bg-slate-800 rounded-xl border border-slate-700">
          <Activity size={48} className="mx-auto text-slate-600 mb-4" />
          <p className="text-lg text-slate-300">No scrape jobs yet.</p>
          <p className="text-sm text-slate-500 mt-2">Start one from the scrape page!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {scrapeJobs.map((job) => (
            <div 
              key={job.id} 
              className="bg-linear-to-br from-slate-800 to-slate-900 rounded-xl border border-slate-700 p-6 hover:border-slate-600 transition-all"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-white">{job.outlet.name}</h3>
                  <p className="text-sm text-slate-400 break-all">{job.outlet.website}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap ml-4 border ${getStatusColor(job.status)}`}>
                  {job.status}
                </span>
              </div>

              {job.status === 'processing' && (
                <div className="mb-4">
                  <div className="w-full bg-slate-700 rounded-full h-2">
                    <div
                      className="bg-linear-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${job.progress || 0}%` }}
                    ></div>
                  </div>
                  <p className="text-sm text-slate-400 mt-2">Progress: {job.progress || 0}%</p>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-slate-400">Started: </span>
                  <span className="text-white font-medium">
                    {new Date(job.startedAt).toLocaleString()}
                  </span>
                </div>
                {job.completedAt && (
                  <div>
                    <span className="text-slate-400">Completed: </span>
                    <span className="text-white font-medium">
                      {new Date(job.completedAt).toLocaleString()}
                    </span>
                  </div>
                )}
                {job.totalFound > 0 && (
                  <div>
                    <span className="text-slate-400">Found: </span>
                    <span className="text-green-400 font-medium">
                      {job.totalFound} journalists
                    </span>
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