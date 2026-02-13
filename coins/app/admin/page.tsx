'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [series, setSeries] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
      return;
    }

    if (status === 'authenticated') {
      // Check if user is admin
      if ((session?.user as any)?.role !== 'ADMIN') {
        router.push('/');
        return;
      }

      fetchAdminData();
    }
  }, [status, session]);

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

  if (status === 'loading' || loading) {
    return (
      <main className="container py-16">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-slate-400">Loading...</p>
        </div>
      </main>
    );
  }

  if (!session || (session.user as any)?.role !== 'ADMIN') {
    return null;
  }

  return (
    <main className="container py-16">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Admin Dashboard</h1>

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
