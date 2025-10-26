import React, { useState } from 'react';
import { Search, Play, Sparkles } from 'lucide-react';
import ScrapeLoadingAnimation from '../components/ScrapeLoadingAnimation';
import ErrorAlert from '../components/ErrorAlert';
import { api } from '../services/api';

export default function ScrapePage() {
  const [outletName, setOutletName] = useState('');
  const [targetCount, setTargetCount] = useState(30);
  const [scraping, setScraping] = useState(false);
  const [scrapeJobId, setScrapeJobId] = useState(null);
  const [scrapeData, setScrapeData] = useState(null);
  const [error, setError] = useState(null);

  const handleStartScrape = async () => {
    if (!outletName.trim()) {
      setError('Please enter an outlet name');
      return;
    }
    
    setScraping(true);
    setError(null);
    setScrapeData({
      outletName,
      targetCount,
      startTime: Date.now()
    });

    try {
      const response = await api.startScrape(outletName, targetCount);
      
      if (response.success) {
        setScrapeJobId(response.data.scrapeJobId);
      } else {
        throw new Error(response.error || 'Failed to start scrape');
      }
    } catch (err) {
      setError(err.message);
      setScraping(false);
      setScrapeData(null);
    }
  };

  const handleComplete = () => {
    setTimeout(() => {
      setScraping(false);
      setScrapeData(null);
      setScrapeJobId(null);
      setOutletName('');
    }, 2000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/20 border border-purple-500/30 rounded-full mb-4">
          <Sparkles className="text-purple-400" size={20} />
          <span className="text-purple-400 font-semibold">Start New Scrape</span>
        </div>
        <h1 className="text-4xl font-bold text-white mb-3">Scrape News Outlet</h1>
        <p className="text-slate-400 text-lg">
          Enter a news outlet name to discover journalists and their articles
        </p>
      </div>

      {/* Scrape Form */}
      <div className="bg-linear-to-br from-slate-800 to-slate-900 rounded-2xl border border-slate-700 p-8">
        {scraping ? (
          <ScrapeLoadingAnimation 
            scrapeData={scrapeData} 
            jobId={scrapeJobId}
            onComplete={handleComplete}
          />
        ) : (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">
                Outlet Name *
              </label>
              <input
                type="text"
                value={outletName}
                onChange={(e) => setOutletName(e.target.value)}
                placeholder="e.g., The Times of India, CNN, BBC News"
                className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
              />
              <p className="text-sm text-slate-500 mt-2">
                Enter the full name of the news outlet you want to scrape
              </p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">
                Target Count (10-100)
              </label>
              <input
                type="number"
                value={targetCount}
                onChange={(e) => setTargetCount(Number(e.target.value))}
                min={10}
                max={100}
                className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
              />
              <p className="text-sm text-slate-500 mt-2">
                Number of journalists to discover (recommended: 30-50)
              </p>
            </div>

            <button
              onClick={handleStartScrape}
              disabled={!outletName.trim()}
              className="w-full bg-linear-to-r from-blue-500 to-purple-600 text-white py-4 rounded-xl font-bold text-lg hover:from-blue-600 hover:to-purple-700 disabled:from-slate-700 disabled:to-slate-700 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl disabled:shadow-none"
            >
              <Play size={24} />
              Start Scraping
            </button>

            <div className="bg-blue-900/20 border border-blue-700/30 rounded-lg p-4">
              <p className="text-sm text-blue-300">
                <strong>Note:</strong> Scraping may take 5-15 minutes depending on the outlet size and target count. 
                You can monitor progress in real-time.
              </p>
            </div>
          </div>
        )}

        <ErrorAlert message={error} />
      </div>

      {/* Tips Section */}
      {!scraping && (
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
          <h3 className="text-lg font-bold text-white mb-4">💡 Tips for Best Results</h3>
          <ul className="space-y-2 text-slate-400">
            <li className="flex items-start gap-2">
              <span className="text-green-400 mt-1">✓</span>
              <span>Use the official name of the news outlet for better accuracy</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-400 mt-1">✓</span>
              <span>Start with a target count of 30 for faster results</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-400 mt-1">✓</span>
              <span>Check the Jobs page to monitor all scraping activities</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-400 mt-1">✓</span>
              <span>Results will be automatically saved to your database</span>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
}