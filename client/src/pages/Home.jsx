import React, { useState, useEffect } from 'react';
import { Newspaper, Users, BarChart3, Activity } from 'lucide-react';
import { api } from '../services/api';

function StatsCard({ icon: Icon, label, value, loading }) {
  return (
    <div className="ppx-card p-5">
      <div className="flex items-center gap-3 mb-3">
        <Icon size={20} className="text-[#6b7280]" />
        <p className="text-[#4b5563] text-sm font-medium">{label}</p>
      </div>
      {loading ? (
        <div className="h-8 w-16 bg-[#f3f4f6] animate-pulse rounded" />
      ) : (
        <p className="text-3xl font-semibold tracking-tight text-[#111827]">{value?.toLocaleString() || 0}</p>
      )}
    </div>
  );
}

export default function HomePage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getGlobalStats().then(d => setStats(d.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-8 fade-in">
      <div className="flex justify-between items-end mb-6">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-[#111827] mb-1">Overview</h1>
          <p className="text-[#6b7280]">Database statistics and recent system activity.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatsCard icon={Newspaper} label="Tracked Outlets" value={stats?.totals?.outlets} loading={loading} />
        <StatsCard icon={Users} label="Journalist Profiles" value={stats?.totals?.journalists} loading={loading} />
        <StatsCard icon={BarChart3} label="Indexed Articles" value={stats?.totals?.articles} loading={loading} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-4">
        <div className="ppx-card p-6">
          <div className="flex items-center gap-2 mb-6">
            <Activity size={20} className="text-[#4b5563]" />
            <h2 className="text-lg font-medium text-[#111827]">Recent Scrapes</h2>
          </div>
          <div className="space-y-3">
            {loading ? <div className="text-sm text-[#6b7280]">Loading...</div> : stats?.recentActivity?.length > 0 ? (
              stats.recentActivity.slice(0, 5).map((job, i) => (
                <div key={i} className="flex justify-between items-center py-2 border-b border-[#f3f4f6] last:border-0">
                  <div>
                    <p className="font-medium text-[#111827]">{job.outlet}</p>
                    <p className="text-xs text-[#9ca3af]">{new Date(job.completedAt).toLocaleDateString()}</p>
                  </div>
                  <span className="text-[#059669] bg-[#ecfdf5] px-2 py-1 text-xs font-medium rounded-md">
                    +{job.journalistsFound} profiles
                  </span>
                </div>
              ))
            ) : (
              <p className="text-sm text-[#6b7280]">No recent activity.</p>
            )}
          </div>
        </div>

        <div className="ppx-card p-6">
          <div className="flex items-center gap-2 mb-6">
            <BarChart3 size={20} className="text-[#4b5563]" />
            <h2 className="text-lg font-medium text-[#111827]">Trending Topics</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {loading ? <div className="text-sm text-[#6b7280]">Loading...</div> : stats?.topTopics?.length > 0 ? (
              stats.topTopics.map((topic, i) => (
                <div key={i} className="flex items-center gap-2 bg-[#f9fafb] border border-[#e5e7eb] rounded-md px-3 py-1.5">
                  <span className="font-medium text-[#374151] text-sm capitalize">{topic.name}</span>
                  <span className="text-[#9ca3af] text-xs">{topic.articleCount}</span>
                </div>
              ))
            ) : (
              <p className="text-sm text-[#6b7280]">No topic data available.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}