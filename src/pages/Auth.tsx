import { useState } from 'react';
import { Button, Card, Spinner } from '@/components/ui';
import { Recycle } from 'lucide-react';
import { signUp, signIn } from '@/services/authService';
import type { Role } from '@/types';

export function Auth({ onAuthed }: { onAuthed: (role: Role) => void }) {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setError('');
    if (!email || !password) {
      setError('Please enter email and password');
      return;
    }
    if (mode === 'register' && !name) {
      setError('Please enter your name');
      return;
    }

    setLoading(true);
    try {
      if (mode === 'register') {
        const { user, error: err } = await signUp(name, email, password, phone || undefined);
        if (err) { setError(err); setLoading(false); return; }
        if (user) { onAuthed('collector'); return; }
      } else {
        const { user, error: err } = await signIn(email, password);
        if (err) { setError(err); setLoading(false); return; }
        if (user) { onAuthed(user.role); return; }
      }
    } catch {
      setError('Something went wrong. Please try again.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#F8F3EA] flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur rounded-full px-4 py-1.5 mb-4 border border-stone-200">
            <Recycle size={16} className="text-[#C65D3B]" />
            <span className="text-sm font-semibold text-stone-700">ScrapSetu</span>
          </div>
          <h1 className="text-2xl font-bold text-[#242321]">
            {mode === 'login' ? 'Welcome Back' : 'Create Account'}
          </h1>
          <p className="text-sm text-stone-500 mt-1">
            {mode === 'login' ? 'Sign in to continue' : 'Register to start selling scrap'}
          </p>
        </div>

        <Card className="p-6 space-y-4">
          {mode === 'register' && (
            <div>
              <label className="text-sm text-stone-600 block mb-1">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your full name"
                className="w-full border border-stone-200 rounded-lg px-3 py-2.5 bg-white text-stone-700"
              />
            </div>
          )}
          <div>
            <label className="text-sm text-stone-600 block mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full border border-stone-200 rounded-lg px-3 py-2.5 bg-white text-stone-700"
            />
          </div>
          <div>
            <label className="text-sm text-stone-600 block mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full border border-stone-200 rounded-lg px-3 py-2.5 bg-white text-stone-700"
            />
          </div>
          {mode === 'register' && (
            <div>
              <label className="text-sm text-stone-600 block mb-1">Phone (optional)</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full border border-stone-200 rounded-lg px-3 py-2.5 bg-white text-stone-700"
              />
            </div>
          )}

          {error && (
            <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>
          )}

          <Button size="lg" className="w-full" onClick={handleSubmit} disabled={loading}>
            {loading ? <Spinner label="" /> : mode === 'login' ? 'Sign In' : 'Register'}
          </Button>

          <div className="text-center">
            <button
              onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); }}
              className="text-sm text-[#C65D3B] font-medium"
            >
              {mode === 'login' ? "Don't have an account? Register" : 'Already have an account? Sign In'}
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
}
