import React, { useState, useEffect } from 'react';
import { Sparkles, Play, ChevronRight, Newspaper, Users, BarChart3, Activity, Zap, Target, Database, TrendingUp } from 'lucide-react';
import StatsCard from '../components/StatsCard';
import FeatureCard from '../components/FeatureCard';
import { api } from '../services/api';

export default function HomePage({ setActiveTab }) {
  const [globalStats, setGlobalStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const data = await api.getGlobalStats();
      setGlobalStats(data.data);
    } catch (err) {
      console.error('Failed to load stats:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-linear-to-br from-blue-600 via-purple-600 to-pink-600 rounded-3xl p-12 text-white">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <Sparkles className="text-yellow-300" size={32} />
            <span className="px-4 py-1 bg-white/20 rounded-full text-sm font-semibold backdrop-blur-sm">
              AI-Powered Intelligence
            </span>
          </div>
          <h1 className="text-5xl font-bold mb-4 leading-tight">
            Discover Journalists.<br />Track Stories.<br />Build Relationships.
          </h1>
          <p className="text-xl opacity-90 mb-8 max-w-2xl">
            NewsTrace uses advanced web scraping and AI to help you find, analyze, and connect with journalists from news outlets worldwide.
          </p>
          <button
            onClick={() => setActiveTab('scrape')}
            className="bg-white text-purple-600 px-8 py-4 rounded-xl font-bold text-lg hover:bg-opacity-90 transition-all flex items-center gap-2 shadow-xl hover:scale-105"
          >
            <Play size={24} />
            Start Scraping
            <ChevronRight size={24} />
          </button>
        </div>
        <div className="absolute -right-20 -top-20 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute -left-20 -bottom-20 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
      </div>

      {/* Stats Grid */}
      <div>
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
          <TrendingUp size={28} />
          Platform Statistics
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard icon={Newspaper} label="Total Outlets" value={globalStats?.totals.outlets} color="blue" loading={loading} />
          <StatsCard icon={Users} label="Journalists" value={globalStats?.totals.journalists} color="purple" loading={loading} />
          <StatsCard icon={BarChart3} label="Articles Tracked" value={globalStats?.totals.articles} color="green" loading={loading} />
          <StatsCard icon={Activity} label="Active Outlets" value={globalStats?.totals.outlets} color="orange" loading={loading} />
        </div>
      </div>

      {/* Features Section */}
      <div>
        <h2 className="text-2xl font-bold text-white mb-6">Key Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <FeatureCard
            icon={Zap}
            title="Lightning Fast Scraping"
            description="Advanced web scraping technology extracts journalist data in minutes, not hours."
            color="blue"
          />
          <FeatureCard
            icon={Target}
            title="Precision Targeting"
            description="Find exactly the journalists you need with smart filtering and search capabilities."
            color="purple"
          />
          <FeatureCard
            icon={Database}
            title="Comprehensive Database"
            description="Store and organize journalist profiles, articles, and contact information in one place."
            color="green"
          />
          <FeatureCard
            icon={BarChart3}
            title="Advanced Analytics"
            description="Gain insights into journalist beats, article trends, and publication patterns."
            color="orange"
          />
          <FeatureCard
            icon={Users}
            title="Network Mapping"
            description="Visualize journalist networks and discover connections between reporters and topics."
            color="blue"
          />
          <FeatureCard
            icon={Activity}
            title="Real-time Monitoring"
            description="Track scraping jobs in real-time with detailed progress and status updates."
            color="purple"
          />
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-linear-to-r from-slate-800 to-slate-900 rounded-2xl border border-slate-700 p-8 text-center">
        <h2 className="text-3xl font-bold text-white mb-4">Ready to Get Started?</h2>
        <p className="text-slate-400 mb-6 max-w-2xl mx-auto">
          Start scraping your first news outlet and discover journalists in minutes.
        </p>
        <button
          onClick={() => setActiveTab('scrape')}
          className="bg-linear-to-r from-blue-500 to-purple-500 text-white px-8 py-4 rounded-xl font-bold text-lg hover:shadow-xl transition-all inline-flex items-center gap-2"
        >
          <Play size={24} />
          Launch Scraper
        </button>
      </div>
    </div>
  );
}