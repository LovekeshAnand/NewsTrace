import React from 'react';
import { Newspaper, Users, Activity, Play, Home, LogOut, User, Sparkles } from 'lucide-react';

export default function Navigation({ activeTab, setActiveTab, user, onLogout }) {
  const tabs = [
    { id: 'home', label: 'Dashboard', icon: Home },
    { id: 'research', label: 'Research', icon: Sparkles },
    { id: 'scrape', label: 'Scrape', icon: Play },
    { id: 'outlets', label: 'Outlets', icon: Newspaper },
    { id: 'journalists', label: 'Journalists', icon: Users },
    { id: 'jobs', label: 'Tasks', icon: Activity }
  ];

  return (
    <nav className="bg-white border-b border-[#e5e7eb] sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-2 cursor-pointer select-none" onClick={() => setActiveTab('home')}>
            <Newspaper className="text-[#111827]" size={22} />
            <span className="text-xl font-bold tracking-tight text-[#111827]">NewsTrace</span>
          </div>

          <div className="flex items-center gap-1.5">
            {tabs.map(t => {
              const Icon = t.icon;
              const active = activeTab === t.id;
              return (
                <button key={t.id} onClick={() => setActiveTab(t.id)}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${
                    active ? 'bg-[#f3f4f6] text-[#111827]' 
                           : 'bg-transparent text-[#6b7280] hover:text-[#111827] hover:bg-[#f9fafb]'
                  }`}>
                  <Icon size={16} className={active ? "text-[#111827]" : "text-[#9ca3af]"} />
                  <span className="hidden sm:inline">{t.label}</span>
                </button>
              );
            })}
            <div className="w-px h-6 bg-[#e5e7eb] mx-2" />
            
            <div className="flex items-center gap-3">
              <div className="hidden md:flex items-center gap-1.5 text-sm font-medium text-[#4b5563]">
                <User size={16} className="text-[#9ca3af]" /> {user?.name}
              </div>
              <button onClick={onLogout} title="Logout"
                className="p-2 rounded-md text-[#6b7280] hover:bg-[#f3f4f6] hover:text-[#111827] transition-colors">
                <LogOut size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}