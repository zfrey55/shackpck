'use client';

import { useState, useEffect } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { isAccountsEnabled, CONTACT_INFO } from '@/lib/feature-flags';

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Redirect if accounts are disabled
  useEffect(() => {
    if (!isAccountsEnabled()) {
      router.push(CONTACT_INFO.contactPage);
    }
  }, [router]);

  // Redirect if accounts are disabled
  useEffect(() => {
    if (!isAccountsEnabled()) {
      router.push('/contact');
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError('Invalid email or password');
      } else {
        router.push('/account');
        router.refresh();
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Show message if accounts are disabled
  if (!isAccountsEnabled()) {
    return (
      <main className="container py-16">
        <div className="max-w-md mx-auto text-center">
          <h1 className="text-3xl font-bold mb-4">Sign In</h1>
          <p className="text-slate-400 mb-6">
            Account sign-in is currently disabled. Please contact us to make a purchase.
          </p>
          <Link
            href={CONTACT_INFO.contactPage}
            className="inline-block px-6 py-3 bg-gold text-black font-semibold rounded-lg hover:opacity-90 transition-opacity"
          >
            Contact Us
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="container py-16">
      <div className="max-w-md mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">Sign In</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-4 bg-red-900/20 border border-red-700 rounded-lg text-red-200">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-2">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-gold"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium mb-2">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-gold"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gold text-black font-semibold py-3 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="mt-6 text-center text-slate-400">
          Don't have an account?{' '}
          <Link href="/auth/register" className="text-gold hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </main>
  );
}
