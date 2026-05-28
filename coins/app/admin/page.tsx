'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function AdminPage() {
  const { data: session, status } = useSession();
  const [series, setSeries] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const role = (session?.user as { role?: string } | undefined)?.role;
  const isAdmin = status === 'authenticated' && role === 'ADMIN';

  useEffect(() => {
    if (isAdmin) {
      fetchAdminData();
    } else {
      setLoading(false);
    }
  }, [isAdmin]);

  const fetchAdminData = async () => {
    try {
      const [seriesRes, ordersRes] = await Promise.all([
        fetch('/api/series?active=false'),
        fetch('/api/admin/orders'),
      ]);

      if (seriesRes.ok) {
        const seriesData = await seriesRes.json();
        setSeries(seriesData);
      }

      if (ordersRes.ok) {
        const ordersData = await ordersRes.json();
        setOrders(ordersData);
      }
    } catch (error) {
      console.error('Error fetching admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading') {
    return (
      <main className="container py-16">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-slate-400">Loading...</p>
        </div>
      </main>
    );
  }

  if (status === 'unauthenticated') {
    return (
      <main className="container py-16">
        <div className="max-w-md mx-auto rounded-lg border border-slate-700 bg-slate-900/60 p-6 text-center">
          <h1 className="text-2xl font-bold text-gold">Admin sign-in required</h1>
          <p className="mt-2 text-sm text-slate-300">
            Sign in to your admin account to access the dashboard.
          </p>
          <Link
            href="/auth/signin?callbackUrl=/admin"
            className="mt-4 inline-block rounded-md bg-gold px-4 py-2 text-sm font-semibold text-black hover:opacity-90"
          >
            Sign in
          </Link>
        </div>
      </main>
    );
  }

  if (!isAdmin) {
    return (
      <main className="container py-16">
        <div className="max-w-2xl mx-auto rounded-lg border border-amber-700/60 bg-amber-900/20 p-6 text-amber-100">
          <h1 className="text-2xl font-bold">Your account isn't an admin yet</h1>
          <p className="mt-2 text-sm">
            You're signed in as <strong>{session?.user?.email}</strong>, but this account has
            role <code className="rounded bg-amber-950/40 px-1 py-0.5">{role ?? 'CUSTOMER'}</code>.
          </p>
          <p className="mt-3 text-sm">Promote it from your terminal with the production database URL:</p>
          <pre className="mt-2 overflow-x-auto rounded-md bg-slate-950 p-3 text-xs text-slate-200">
            <code>{`DATABASE_URL="postgresql://...prod url..." \\
  npx tsx scripts/promote-admin.ts ${session?.user?.email ?? 'you@example.com'}`}</code>
          </pre>
          <p className="mt-3 text-sm text-amber-200">
            Then <strong>sign out and sign back in</strong> so your session picks up the new role,
            and reload this page.
          </p>
        </div>
      </main>
    );
  }

  if (loading) {
    return (
      <main className="container py-16">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-slate-400">Loading admin data...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="container py-16">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-3">
          <h1 className="text-4xl font-bold">Admin Dashboard</h1>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/admin/builds"
              className="rounded-md border border-gold/50 bg-gold/10 px-3 py-2 text-sm font-semibold text-gold hover:bg-gold/20"
            >
              Builder inquiries →
            </Link>
            <Link
              href="/admin/orders"
              className="rounded-md border border-slate-700 px-3 py-2 text-sm text-slate-200 hover:border-gold/60"
            >
              All orders
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Series Management */}
          <div className="bg-slate-900/40 p-6 rounded-lg border border-slate-700">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-semibold">Series</h2>
              <Link
                href="/admin/series/new"
                className="px-4 py-2 bg-gold text-black font-semibold rounded-lg hover:opacity-90 transition-opacity text-sm"
              >
                New Series
              </Link>
            </div>
            {series.length === 0 ? (
              <p className="text-slate-400">No series yet</p>
            ) : (
              <div className="space-y-2">
                {series.map((s) => (
                  <div
                    key={s.id}
                    className="p-3 bg-slate-800 rounded border border-slate-700"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold">{s.name}</h3>
                        <p className="text-sm text-slate-400">
                          {s.packsRemaining} / {s.totalPacks} packs remaining
                        </p>
                      </div>
                      <Link
                        href={`/admin/series/${s.slug}`}
                        className="text-gold hover:underline text-sm"
                      >
                        Edit
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Orders */}
          <div className="bg-slate-900/40 p-6 rounded-lg border border-slate-700">
            <h2 className="text-2xl font-semibold mb-4">Recent Orders</h2>
            {orders.length === 0 ? (
              <p className="text-slate-400">No orders yet</p>
            ) : (
              <div className="space-y-2">
                {orders.slice(0, 5).map((order) => (
                  <div
                    key={order.id}
                    className="p-3 bg-slate-800 rounded border border-slate-700"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold">Order #{order.id.slice(0, 8)}</p>
                        <p className="text-sm text-slate-400">
                          ${(order.total / 100).toFixed(2)} • {new Date(order.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <span className="text-xs capitalize px-2 py-1 bg-slate-700 rounded">
                        {order.paymentStatus.toLowerCase()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <Link
              href="/admin/orders"
              className="mt-4 inline-block text-gold hover:underline text-sm"
            >
              View all orders →
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
