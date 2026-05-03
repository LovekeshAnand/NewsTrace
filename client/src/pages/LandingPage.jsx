import React from 'react';
import { Newspaper, Users, ArrowRight, ShieldCheck, Zap, Sparkles } from 'lucide-react';

export default function LandingPage({ onLoginClick }) {
  return (
    <div className="min-h-[80vh] flex flex-col justify-center items-center text-center fade-in px-4">
      <div className="max-w-3xl space-y-6">
        <h1 className="text-5xl sm:text-6xl font-semibold tracking-tight text-[#111827] leading-tight">
          Where answers begin.
        </h1>
        <p className="text-xl text-[#6b7280] font-light max-w-2xl mx-auto leading-relaxed">
          NewsTrace is a research engine that synthesizes media intelligence. Scrape outlets, profile journalists, and discover stories in seconds.
        </p>
        
        <div className="pt-8">
          <button onClick={onLoginClick}
            className="ppx-btn px-8 py-3.5 text-lg inline-flex items-center justify-center gap-2">
            Start Researching <ArrowRight size={18} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl w-full mt-24">
        <div className="text-center p-6">
          <Sparkles size={24} className="text-[#2563eb] mx-auto mb-4" />
          <h3 className="font-medium text-lg text-[#111827] mb-2">Deep Synthesis</h3>
          <p className="text-sm text-[#6b7280] leading-relaxed">Ask any question and receive instant summaries backed by real journalistic sources.</p>
        </div>
        <div className="text-center p-6">
          <Zap size={24} className="text-[#2563eb] mx-auto mb-4" />
          <h3 className="font-medium text-lg text-[#111827] mb-2">Instant Scraping</h3>
          <p className="text-sm text-[#6b7280] leading-relaxed">Target any news outlet and extract thousands of articles and profiles instantly.</p>
        </div>
        <div className="text-center p-6">
          <ShieldCheck size={24} className="text-[#2563eb] mx-auto mb-4" />
          <h3 className="font-medium text-lg text-[#111827] mb-2">Enterprise Grade</h3>
          <p className="text-sm text-[#6b7280] leading-relaxed">Secure authentication, data persistence, and high-performance MongoDB architecture.</p>
        </div>
      </div>
    </div>
  );
}
