import React, { useState, useEffect } from 'react';
import { Search, Loader2, Users } from 'lucide-react';
import { api } from '../services/api';

export default function JournalistsPage() {
  const [journalists, setJournalists] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchJournalists();
  }, []);

  const fetchJournalists = async () => {
    setLoading(true);
    try {
      const data = await api.getJournalists(50);
      setJournalists(data.data || []);
    } catch (err) {
      console.error('Failed to fetch journalists:', err);
    } finally {
      setLoading(false);
    }
  };

  const searchJournalists = async () => {
    if (!searchQuery) {
      fetchJournalists();
      return;
    }
    setLoading(true);
    try {
      const data = await api.searchJournalists(searchQuery);
      setJournalists(data.data || []);
    } catch (err) {
      console.error('Search failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      searchJournalists();
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-white mb-2">Journalists</h2>
        <p className="text-slate-400">Search and explore journalist profiles</p>
      </div>

      <div className="flex gap-4">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Search journalists by name..."
          className="flex-1 px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
        />
        <button
          onClick={searchJournalists}
          className="px-6 py-3 bg-linear-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:shadow-xl transition-all flex items-center gap-2 font-semibold"
        >
          <Search size={20} />
          Search
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-blue-500" size={48} />
        </div>
      ) : journalists.length === 0 ? (
        <div className="text-center py-20 bg-slate-800 rounded-xl border border-slate-700">
          <Users size={48} className="mx-auto text-slate-600 mb-4" />
          <p className="text-lg text-slate-300">No journalists found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {journalists.map((journalist) => (
            <div 
              key={journalist.id} 
              className="bg-linear-to-br from-slate-800 to-slate-900 rounded-xl border border-slate-700 p-6 hover:border-purple-500 transition-all group"
            >
              <div className="flex items-start gap-4 mb-4">
                {journalist.imageUrl ? (
                  <img
                    src={journalist.imageUrl}
                    alt={journalist.name}
                    className="w-16 h-16 rounded-full object-cover border-2 border-slate-700 group-hover:border-purple-500 transition-colors"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-linear-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-xl shrink-0">
                    {journalist.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-white truncate group-hover:text-purple-400 transition-colors">
                    {journalist.name}
                  </h3>
                  <p className="text-sm text-slate-400 truncate">{journalist.outlet?.name}</p>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm mb-3 py-2 px-3 bg-slate-900 rounded-lg">
                <span className="text-slate-400">Articles</span>
                <span className="font-bold text-white">{journalist.articleCount}</span>
              </div>
              
              {journalist.beats && journalist.beats.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {journalist.beats.slice(0, 3).map((beat) => (
                    <span
                      key={beat.id}
                      className="px-2 py-1 bg-purple-500/20 text-purple-400 rounded-full text-xs border border-purple-500/30 font-medium"
                    >
                      {beat.topic.name}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}