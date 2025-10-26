import React, { useState, useEffect } from 'react';
import { Globe, Search, Users, Newspaper, Database, CheckCircle, Loader2 } from 'lucide-react';
import { api } from '../services/api';

export default function ScrapeLoadingAnimation({ scrapeData, jobId, onComplete }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [jobStatus, setJobStatus] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);

  const steps = [
    { icon: Globe, text: 'Discovering website...', duration: 3000 },
    { icon: Search, text: 'Finding journalist pages...', duration: 5000 },
    { icon: Users, text: 'Extracting profiles...', duration: 8000 },
    { icon: Newspaper, text: 'Scraping articles...', duration: 10000 },
    { icon: Database, text: 'Saving to database...', duration: 2000 }
  ];

  // Poll job status
  useEffect(() => {
    if (!jobId) return;

    const pollStatus = async () => {
      try {
        const jobs = await api.getScrapeJobs(50);
        const job = jobs.data?.find(j => j.id === jobId);
        if (job) {
          setJobStatus(job);
          
          // Update step based on progress or status
          if (job.status === 'completed') {
            setCurrentStep(4);
            if (onComplete) {
              setTimeout(() => onComplete(), 2000);
            }
          } else if (job.progress >= 80) setCurrentStep(4);
          else if (job.progress >= 60) setCurrentStep(3);
          else if (job.progress >= 40) setCurrentStep(2);
          else if (job.progress >= 20) setCurrentStep(1);
          else setCurrentStep(0);
        }
      } catch (err) {
        console.error('Failed to poll status:', err);
      }
    };

    pollStatus();
    const interval = setInterval(pollStatus, 3000);
    return () => clearInterval(interval);
  }, [jobId, onComplete]);

  // Track elapsed time
  useEffect(() => {
    const interval = setInterval(() => {
      setElapsedTime(prev => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      <div className="bg-linear-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm opacity-90 mb-1">Scraping in progress</p>
            <p className="text-2xl font-bold">{scrapeData?.outletName || 'Processing...'}</p>
          </div>
          <div className="text-right">
            <p className="text-sm opacity-90">Elapsed</p>
            <p className="text-2xl font-bold">{formatTime(elapsedTime)}</p>
          </div>
        </div>
        <div className="w-full bg-white/20 rounded-full h-3 mb-2">
          <div 
            className="bg-white h-3 rounded-full transition-all duration-500 shadow-lg" 
            style={{ width: `${jobStatus?.progress || (currentStep / steps.length * 100)}%` }}
          ></div>
        </div>
        <p className="text-sm opacity-90">
          {jobStatus?.status === 'completed' ? '100' : (jobStatus?.progress || Math.round((currentStep / steps.length) * 100))}% complete
        </p>
      </div>

      <div className="space-y-3">
        {steps.map((step, idx) => {
          const Icon = step.icon;
          const isActive = idx === currentStep && jobStatus?.status !== 'completed';
          const isPast = idx < currentStep || jobStatus?.status === 'completed';
          
          return (
            <div
              key={idx}
              className={`flex items-center gap-4 p-4 rounded-xl transition-all duration-500 ${
                isActive 
                  ? 'bg-blue-500/20 border-2 border-blue-500 scale-105' 
                  : isPast 
                  ? 'bg-slate-800 border border-slate-700 opacity-60' 
                  : 'bg-slate-800 border border-slate-700 opacity-40'
              }`}
            >
              <div className={`p-2.5 rounded-lg transition-all ${
                isActive 
                  ? 'bg-blue-500 text-white animate-pulse' 
                  : isPast 
                  ? 'bg-green-500 text-white' 
                  : 'bg-slate-700 text-slate-400'
              }`}>
                {isPast ? <CheckCircle size={20} /> : <Icon size={20} />}
              </div>
              <span className={`font-semibold flex-1 ${isActive ? 'text-white' : 'text-slate-400'}`}>
                {step.text}
              </span>
              {isActive && (
                <Loader2 className="animate-spin text-blue-400" size={20} />
              )}
              {isPast && (
                <CheckCircle className="text-green-400" size={20} />
              )}
            </div>
          );
        })}
      </div>

      {jobStatus?.totalFound > 0 && (
        <div className="bg-green-900/30 border border-green-700 rounded-xl p-4 flex items-center gap-3">
          <CheckCircle className="text-green-400" size={24} />
          <div>
            <p className="text-white font-semibold">Found {jobStatus.totalFound} journalists</p>
            <p className="text-sm text-slate-400">Data is being saved to database</p>
          </div>
        </div>
      )}

      {jobStatus?.status === 'completed' && (
        <div className="bg-linear-to-r from-green-600 to-emerald-600 rounded-xl p-6 text-white text-center">
          <CheckCircle size={48} className="mx-auto mb-3" />
          <p className="text-2xl font-bold mb-2">Scraping Complete!</p>
          <p className="opacity-90">Successfully scraped {jobStatus.totalFound} journalists</p>
        </div>
      )}

      {jobStatus?.status === 'failed' && (
        <div className="bg-red-900/30 border border-red-700 rounded-xl p-4 text-red-400">
          <p className="font-semibold">Scraping failed. Please try again.</p>
        </div>
      )}
    </div>
  );
}