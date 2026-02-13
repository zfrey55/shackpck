'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';

function AddressesList({ userId }: { userId?: string }) {
  const [addresses, setAddresses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userId) {
      fetch('/api/user/addresses')
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            setAddresses(data);
          }
        })
        .catch(err => console.error('Error fetching addresses:', err))
        .finally(() => setLoading(false));
    }
  }, [userId]);

  if (loading) {
    return <p className="text-slate-400">Loading addresses...</p>;
  }

  if (addresses.length === 0) {
    return (
      <div className="bg-slate-900/40 p-6 rounded-lg border border-slate-700">
        <p className="text-slate-400">No saved addresses. Your address will be saved after your first order.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {addresses.map((address) => (
        <div
          key={address.id}
          className="bg-slate-900/40 p-4 rounded-lg border border-slate-700"
        >
          <div className="flex items-start justify-between">
            <div>
              {address.isDefault && (
                <span className="inline-block px-2 py-1 text-xs bg-gold text-black rounded mb-2">
                  Default
                </span>
              )}
              <p className="font-medium">{address.fullName}</p>
              <p className="text-sm text-slate-400">
                {address.line1}
                {address.line2 && `, ${address.line2}`}
                <br />
                {address.city}, {address.state} {address.postalCode}
                {address.phone && <><br />{address.phone}</>}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function AccountPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
      return;
    }

    if (status === 'authenticated' && session?.user?.id) {
      fetchAccountData();
    }
  }, [status, session]);

  const fetchAccountData = async () => {
    try {
      const [ordersRes, userRes] = await Promise.all([
        fetch('/api/orders'),
        fetch('/api/user'),
      ]);

      if (ordersRes.ok) {
        const ordersData = await ordersRes.json();
        setOrders(ordersData);
      }

      if (userRes.ok) {
        const userData = await userRes.json();
        setUser(userData);
      }
    } catch (error) {
      console.error('Error fetching account data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <main className="container py-16">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-slate-400">Loading...</p>
        </div>
      </main>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <main className="container py-16">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">My Account</h1>

        {/* Account Summary */}
        <div className="bg-slate-900/40 p-6 rounded-lg border border-slate-700 mb-8">
          <h2 className="text-xl font-semibold mb-4">Account Information</h2>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-slate-400">Email</span>
              <span>{session.user?.email}</span>
            </div>
            {user && (
              <>
                <div className="flex justify-between">
                  <span className="text-slate-400">Name</span>
                  <span>{user.name || 'Not set'}</span>
                </div>
                <div className="flex justify-between text-gold">
                  <span>Loyalty Points</span>
                  <span className="font-semibold">{user.loyaltyPoints || 0}</span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Saved Addresses */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-semibold">Saved Addresses</h2>
            <button
              onClick={() => {
                // Simple prompt for now - can be enhanced with modal
                const fullName = prompt('Full Name:');
                const line1 = prompt('Address Line 1:');
                const city = prompt('City:');
                const state = prompt('State:');
                const postalCode = prompt('Postal Code:');
                const phone = prompt('Phone (optional):');
                
                if (fullName && line1 && city && state && postalCode) {
                  fetch('/api/user/addresses', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      fullName,
                      line1,
                      city,
                      state,
                      postalCode,
                      phone: phone || null,
                      isDefault: false,
                    }),
                  })
                    .then(res => res.json())
                    .then(() => {
                      // Refresh page to show new address
                      window.location.reload();
                    })
                    .catch(err => {
                      alert('Failed to save address');
                      console.error(err);
                    });
                }
              }}
              className="px-4 py-2 bg-gold text-black font-semibold rounded-lg hover:opacity-90 transition-opacity text-sm"
            >
              Add Address
            </button>
          </div>
          
          <AddressesList userId={session.user?.id} />
        </div>

        {/* Order History */}
        <div>
          <h2 className="text-2xl font-semibold mb-6">Order History</h2>
          {orders.length === 0 ? (
            <div className="bg-slate-900/40 p-8 rounded-lg border border-slate-700 text-center">
              <p className="text-slate-400 mb-4">You haven't placed any orders yet.</p>
              <Link
                href="/"
                className="inline-block px-6 py-3 bg-gold text-black font-semibold rounded-lg hover:opacity-90 transition-opacity"
              >
                Start Shopping
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className="bg-slate-900/40 p-6 rounded-lg border border-slate-700"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-semibold">Order #{order.id.slice(0, 8)}</h3>
                      <p className="text-sm text-slate-400">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-lg">
                        ${(order.total / 100).toFixed(2)}
                      </p>
                      <p className="text-sm text-slate-400 capitalize">
                        {order.paymentStatus.toLowerCase()}
                      </p>
                    </div>
                  </div>

                  <div className="border-t border-slate-700 pt-4">
                    <h4 className="font-medium mb-2">Items:</h4>
                    <ul className="space-y-1 text-sm">
                      {order.items.map((item: any) => (
                        <li key={item.id} className="flex justify-between">
                          <span>
                            {item.series.name} × {item.quantity}
                          </span>
                          <span>${(item.total / 100).toFixed(2)}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {order.fedexTrackingNumber && (
                    <div className="mt-4 pt-4 border-t border-slate-700">
                      <p className="text-sm">
                        <span className="text-slate-400">Tracking:</span>{' '}
                        <span className="font-mono">{order.fedexTrackingNumber}</span>
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
