import React, { useState, useEffect } from 'react';
import Navigation from './components/Navigation';
import HomePage from './pages/Home';
import ScrapePage from './pages/ScrapePage';
import OutletsPage from './pages/OutletsPage';
import JournalistsPage from './pages/JournalistsPage';
import JobsPage from './pages/JobsPage';
import AuthPage from './pages/AuthPage';
import LandingPage from './pages/LandingPage';
import ResearchPage from './pages/ResearchPage';

export default function App() {
  const [tab, setTab] = useState('home');
  const [user, setUser] = useState(null);

  useEffect(() => {
    const saved = localStorage.getItem('nt_user');
    if (saved) setUser(JSON.parse(saved));
  }, []);

  const handleAuth = (userData, token) => {
    localStorage.setItem('nt_token', token);
    localStorage.setItem('nt_user', JSON.stringify(userData));
    setUser(userData);
    setTab('home');
  };

  const handleLogout = () => {
    localStorage.removeItem('nt_token');
    localStorage.removeItem('nt_user');
    setUser(null);
    setTab('home');
  };

  return (
    <div className="min-h-screen">
      {user && <Navigation activeTab={tab} setActiveTab={setTab} user={user} onLogout={handleLogout} />}
      {!user && tab !== 'auth' && (
        <header className="px-6 py-4 flex justify-between items-center max-w-6xl mx-auto border-b border-[#e5e7eb]">
          <div className="text-xl font-bold tracking-tight text-[#111827]">NewsTrace</div>
          <button onClick={() => setTab('auth')} className="ppx-btn ppx-btn-secondary px-4 py-2 text-sm">Sign In</button>
        </header>
      )}
      <main className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {!user ? (
          tab === 'auth' ? <AuthPage onAuth={handleAuth} /> : <LandingPage onLoginClick={() => setTab('auth')} />
        ) : (
          <>
            {tab === 'home' && <HomePage setActiveTab={setTab} />}
            {tab === 'research' && <ResearchPage />}
            {tab === 'scrape' && <ScrapePage user={user} />}
            {tab === 'outlets' && <OutletsPage />}
            {tab === 'journalists' && <JournalistsPage />}
            {tab === 'jobs' && <JobsPage />}
          </>
        )}
      </main>
      <footer className="mt-16 py-8 border-t border-[#e5e7eb]">
        <div className="max-w-6xl mx-auto px-4 text-center text-[#6b7280] text-sm">
          NewsTrace Intelligence Platform
        </div>
      </footer>
    </div>
  );
}