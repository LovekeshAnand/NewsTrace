import React, { useState } from 'react';
import Navigation from './components/Navigation';
import HomePage from './pages/Home';
import ScrapePage from './pages/ScrapePage';
import OutletsPage from './pages/OutletsPage';
import JournalistsPage from './pages/JournalistsPage';
import JobsPage from './pages/JobsPage';

export default function App() {
  const [activeTab, setActiveTab] = useState('home');

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Background Effects */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))] from-blue-900/20 via-slate-950 to-slate-950 -z-10"></div>
      <div className="fixed inset-0 -z-10">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>
      
      <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'home' && <HomePage setActiveTab={setActiveTab} />}
        {activeTab === 'scrape' && <ScrapePage />}
        {activeTab === 'outlets' && <OutletsPage />}
        {activeTab === 'journalists' && <JournalistsPage />}
        {activeTab === 'jobs' && <JobsPage />}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 mt-20 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-slate-400">
          <p>© 2025 NewsTrace. Built with AI-powered intelligence.</p>
        </div>
      </footer>
    </div>
  );
}