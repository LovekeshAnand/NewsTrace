import React, { useState, useEffect } from 'react';
import { Clock, Loader2, RefreshCw, Newspaper, ExternalLink } from 'lucide-react';
import { api } from '../services/api';

export default function OutletsPage() {
  const [outlets, setOutlets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadOutlets();
  }, []);

  const loadOutlets = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.getOutlets();
      if (response.success) {
        setOutlets(response.data || []);
      }
    } catch (err) {
      setError('Failed to load outlets');
      console.error('Error loading outlets:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="animate-spin text-blue-500" size={48} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12 bg-slate-800 rounded-xl border border-slate-700">
        <p className="text-red-400 mb-4">{error}</p>
        <button
          onClick={loadOutlets}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-white">News Outlets</h2>
          <p className="text-slate-400 mt-1">Browse all scraped news outlets</p>
        </div>
        <button
          onClick={loadOutlets}
          className="flex items-center gap-2 px-4 py-2 bg-slate-800 border border-slate-700 text-white rounded-lg hover:bg-slate-700 transition-all"
        >
          <RefreshCw size={18} />
          Refresh
        </button>
      </div>

      {outlets.length === 0 ? (
        <div className="text-center py-20 bg-slate-800 rounded-xl border border-slate-700">
          <Newspaper size={48} className="mx-auto text-slate-600 mb-4" />
          <p className="text-lg text-slate-300">No outlets found yet.</p>
          <p className="text-sm text-slate-500 mt-2">Start a scrape to add outlets!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {outlets.map((outlet) => (
            <div
              key={outlet.id}
              className="bg-linear-to-br from-slate-800 to-slate-900 rounded-xl border border-slate-700 p-6 hover:border-purple-500 transition-all group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-bold text-white mb-2 group-hover:text-purple-400 transition-colors">
                    {outlet.name}
                  </h3>

                  <a
                    href={outlet.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300 text-sm break-all flex items-center gap-1 group/link"
                  >
                    {outlet.domain}
                    <ExternalLink
                      size={14}
                      className="opacity-0 group-hover/link:opacity-100 transition-opacity"
                    />
                  </a>
                </div>

                <div className="px-3 py-1 bg-linear-to-r from-blue-500 to-purple-500 text-white rounded-full text-sm font-bold whitespace-nowrap ml-3">
                  {outlet._count?.journalists || 0}
                </div>
              </div>

              {outlet.lastScrapedAt && (
                <div className="flex items-center gap-2 text-sm text-slate-400 pt-3 border-t border-slate-700">
                  <Clock size={16} />
                  <span>Last: {new Date(outlet.lastScrapedAt).toLocaleDateString()}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
