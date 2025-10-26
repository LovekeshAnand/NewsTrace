import React from 'react';
import { TrendingUp, Newspaper, Users, Activity, Globe, Play, Home } from 'lucide-react';

export default function Navigation({ activeTab, setActiveTab }) {
  const tabs = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'scrape', label: 'Scrape', icon: Play },
    { id: 'outlets', label: 'Outlets', icon: Newspaper },
    { id: 'journalists', label: 'Journalists', icon: Users },
    { id: 'jobs', label: 'Jobs', icon: Activity }
  ];

  return (
    <nav className="bg-linear-to-r from-slate-900 to-slate-800 border-b border-slate-700 sticky top-0 z-50 backdrop-blur-lg bg-opacity-90">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-3 shrink-0 cursor-pointer" onClick={() => setActiveTab('home')}>
            <div className="bg-linear-to-br from-blue-500 to-purple-500 p-2 rounded-xl">
              <Globe className="text-white" size={24} />
            </div>
            <span className="text-xl sm:text-2xl font-bold bg-linear-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              NewsTrace
            </span>
          </div>
          
          <div className="flex gap-2 flex-wrap">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3 sm:px-5 py-2 rounded-lg font-medium transition-all flex items-center gap-2 text-sm sm:text-base ${
                    activeTab === tab.id
                      ? 'bg-linear-to-r from-blue-500 to-purple-500 text-white shadow-lg shadow-blue-500/50'
                      : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                  }`}
                >
                  <Icon size={18} />
                  <span className="hidden md:inline">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}