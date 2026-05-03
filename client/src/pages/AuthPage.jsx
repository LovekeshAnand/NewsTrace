import React, { useState } from 'react';
import { LogIn, UserPlus, Mail, Lock, User } from 'lucide-react';
import ErrorAlert from '../components/ErrorAlert';
import { api } from '../services/api';

export default function AuthPage({ onAuth }) {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError(null);
    try {
      const res = mode === 'login'
        ? await api.login({ email: form.email, password: form.password })
        : await api.register(form);
      onAuth(res.data.user, res.data.token);
    } catch (err) { setError(err.message); } 
    finally { setLoading(false); }
  };

  return (
    <div className="max-w-md mx-auto mt-24 fade-in">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-semibold tracking-tight text-[#111827] mb-2">
          {mode === 'login' ? 'Welcome back' : 'Create an account'}
        </h1>
        <p className="text-[#6b7280]">
          {mode === 'login' ? 'Sign in to continue your research.' : 'Sign up to start extracting intelligence.'}
        </p>
      </div>

      <div className="ppx-card p-8">
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <div>
              <label className="block text-sm font-medium text-[#374151] mb-1.5">Full Name</label>
              <div className="relative">
                <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9ca3af]" />
                <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                  placeholder="John Doe" required className="ppx-input w-full pl-10 pr-3 py-2.5" />
              </div>
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-[#374151] mb-1.5">Email Address</label>
            <div className="relative">
              <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9ca3af]" />
              <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                placeholder="you@example.com" required className="ppx-input w-full pl-10 pr-3 py-2.5" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-[#374151] mb-1.5">Password</label>
            <div className="relative">
              <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9ca3af]" />
              <input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })}
                placeholder="••••••••" required minLength={6} className="ppx-input w-full pl-10 pr-3 py-2.5" />
            </div>
          </div>
          <button type="submit" disabled={loading}
            className="ppx-btn w-full py-2.5 flex items-center justify-center gap-2 mt-2">
            {loading ? <span className="animate-spin">⏳</span> : mode === 'login' ? <LogIn size={18} /> : <UserPlus size={18} />}
            {mode === 'login' ? 'Sign In' : 'Create Account'}
          </button>
        </form>
        <ErrorAlert message={error} />
        
        <div className="mt-6 pt-6 border-t border-[#e5e7eb] text-center">
          <button onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(null); }}
            className="text-sm font-medium text-[#4b5563] hover:text-[#111827]">
            {mode === 'login' ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
          </button>
        </div>
      </div>
    </div>
  );
}
