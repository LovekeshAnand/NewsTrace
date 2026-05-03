import React, { useState } from 'react';
import { Search, Loader2, Sparkles, BookOpen, Clock } from 'lucide-react';
import { api } from '../services/api';

export default function ResearchPage() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    try {
      const res = await api.research(query);
      setResult(res.data);
    } catch {
      setResult({ summary: 'Failed to fetch research data. Try again.', articles: [] });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 fade-in">
      <div className="text-center pt-8">
        <h1 className="text-4xl font-semibold tracking-tight text-[#111827] mb-3">Research Mode</h1>
        <p className="text-[#6b7280]">Ask anything. Discover articles, sources, and journalists instantly.</p>
      </div>

      <form onSubmit={handleSearch} className="relative max-w-2xl mx-auto">
        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
          <Search size={20} className="text-[#9ca3af]" />
        </div>
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Ask a question or enter a topic..."
          className="ppx-input w-full pl-12 pr-12 py-4 text-lg shadow-sm"
        />
        <button
          type="submit"
          disabled={loading || !query.trim()}
          className="absolute inset-y-2 right-2 p-2 bg-[#f3f4f6] text-[#4b5563] rounded-md hover:bg-[#e5e7eb] disabled:opacity-50 transition-colors"
        >
          {loading ? <Loader2 size={20} className="animate-spin" /> : <Sparkles size={20} />}
        </button>
      </form>

      {result && (
        <div className="space-y-6 fade-in pt-8">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles size={18} className="text-[#2563eb]" />
            <h2 className="text-xl font-semibold text-[#111827]">Synthesis</h2>
          </div>
          <div className="bg-[#f9fafb] border border-[#e5e7eb] rounded-xl p-6 text-[#374151] leading-relaxed text-lg">
            {result.summary}
          </div>

          <div className="pt-6 border-t border-[#e5e7eb]">
            <div className="flex items-center gap-2 mb-4">
              <BookOpen size={18} className="text-[#6b7280]" />
              <h3 className="text-lg font-medium text-[#111827]">Sources</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {result.articles.map((article, i) => (
                <a key={i} href={article.link} target="_blank" rel="noopener noreferrer" 
                   className="ppx-card p-4 flex flex-col justify-between hover:-translate-y-1">
                  <div>
                    <h4 className="font-medium text-[#111827] line-clamp-2 mb-2">{article.title}</h4>
                    <p className="text-sm text-[#6b7280] line-clamp-3 mb-3">{article.snippet}</p>
                  </div>
                  <div className="flex items-center justify-between text-xs font-medium text-[#9ca3af]">
                    <span className="flex items-center gap-1"><BookOpen size={12}/> {article.source}</span>
                    <span className="flex items-center gap-1"><Clock size={12}/> {article.date || 'Recent'}</span>
                  </div>
                </a>
              ))}
            </div>
            {result.articles.length === 0 && <p className="text-[#6b7280]">No sources found.</p>}
          </div>
        </div>
      )}
    </div>
  );
}
