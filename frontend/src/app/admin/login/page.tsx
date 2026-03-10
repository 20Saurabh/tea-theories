'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';

export default function AdminLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Redirect if already logged in
  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (token) router.push('/admin');
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.login(username, password);
      localStorage.setItem('admin_token', res.token);
      localStorage.setItem('admin_user', res.username);
      router.push('/admin');
    } catch {
      setError('Invalid username or password');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#fafaf8] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-10 text-center">
          <h1 className="font-serif text-2xl font-bold text-[#0a0a0a] mb-1">Tea and Theories</h1>
          <p className="text-sm text-[#9b9b9b]">Admin sign in</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={e => setUsername(e.target.value)}
            required
            autoFocus
            autoComplete="username"
            className="w-full border border-[#e5e5e3] bg-transparent px-4 py-3 text-sm text-[#0a0a0a] placeholder-[#b0b0b0] focus:outline-none focus:border-[#0a0a0a] transition-colors"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            autoComplete="current-password"
            className="w-full border border-[#e5e5e3] bg-transparent px-4 py-3 text-sm text-[#0a0a0a] placeholder-[#b0b0b0] focus:outline-none focus:border-[#0a0a0a] transition-colors"
          />

          {error && (
            <p className="text-xs text-red-600 py-1">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading || !username || !password}
            className="w-full bg-[#0a0a0a] text-[#fafaf8] py-3 text-sm font-medium hover:bg-[#333] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="text-center mt-6">
          <a href="/" className="text-xs text-[#9b9b9b] hover:text-[#0a0a0a] transition-colors">
            ← Back to site
          </a>
        </p>
      </div>
    </div>
  );
}
