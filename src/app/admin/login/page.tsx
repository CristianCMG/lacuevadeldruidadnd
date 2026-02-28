'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Lock, Loader2 } from 'lucide-react';

function LoginForm() {
  const [secret, setSecret] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  const verifySecret = async (secretValue: string) => {
    setLoading(true);
    try {
      const res = await fetch('/api/auth/admin-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ secret: secretValue }),
      });

      if (res.ok) {
        router.push('/admin/dashboard');
      } else {
        setError('Invalid secret');
        setLoading(false);
      }
    } catch (err) {
      setError('Login failed');
      setLoading(false);
    }
  };

  useEffect(() => {
    const secretParam = searchParams.get('secret');
    if (secretParam) {
      setSecret(secretParam);
      verifySecret(secretParam);
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await verifySecret(secret);
  };

  return (
    <div className="w-full max-w-md p-8 space-y-8 bg-gray-800 rounded-lg shadow-lg">
      <div className="text-center">
        <Lock className="mx-auto h-12 w-12 text-primary" />
        <h2 className="mt-6 text-3xl font-bold tracking-tight">Admin Access</h2>
      </div>
      <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
        <div>
          <label htmlFor="secret" className="sr-only">Admin Secret</label>
          <input
            id="secret"
            name="secret"
            type="password"
            required
            disabled={loading}
            className="relative block w-full rounded-md border-0 bg-gray-700 py-1.5 text-white placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6 pl-3 disabled:opacity-50"
            placeholder="Enter Admin Secret"
            value={secret}
            onChange={(e) => setSecret(e.target.value)}
          />
        </div>
        {error && <p className="text-red-500 text-sm text-center">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="group relative flex w-full justify-center rounded-md bg-primary px-3 py-2 text-sm font-semibold text-white hover:bg-red-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:opacity-50"
        >
          {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Unlock Dashboard'}
        </button>
      </form>
    </div>
  );
}

export default function AdminLogin() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
      <Suspense fallback={<div className="text-center"><Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" /></div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
