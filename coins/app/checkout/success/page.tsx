'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useSession } from 'next-auth/react';

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const paymentIntentId = searchParams.get('payment_intent');
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (paymentIntentId) {
      // Fetch order details
      fetch(`/api/orders?paymentIntentId=${paymentIntentId}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.order) {
            setOrder(data.order);
          }
        })
        .catch((err) => console.error('Error fetching order:', err))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [paymentIntentId]);

  return (
    <main className="container py-16">
      <div className="max-w-2xl mx-auto text-center">
        <div className="mb-8">
          <div className="text-6xl mb-4">✅</div>
          <h1 className="text-4xl font-bold mb-4">Order Confirmed!</h1>
          <p className="text-lg text-slate-400">
            Thank you for your purchase. Your order has been confirmed.
          </p>
        </div>

        {order && (
          <div className="bg-slate-900/40 p-6 rounded-lg border border-slate-700 mb-8 text-left">
            <h2 className="text-xl font-semibold mb-4">Order Details</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-400">Order ID</span>
                <span className="font-mono">{order.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Total</span>
                <span className="font-semibold">${(order.total / 100).toFixed(2)}</span>
              </div>
              {order.loyaltyPointsEarned > 0 && (
                <div className="flex justify-between text-gold">
                  <span>Loyalty Points Earned</span>
                  <span className="font-semibold">{order.loyaltyPointsEarned}</span>
                </div>
              )}
              {order.fedexTrackingNumber && (
                <div className="flex justify-between">
                  <span className="text-slate-400">Tracking Number</span>
                  <span className="font-mono">{order.fedexTrackingNumber}</span>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="space-y-4">
          {session ? (
            <Link
              href="/account"
              className="inline-block px-6 py-3 bg-gold text-black font-semibold rounded-lg hover:opacity-90 transition-opacity"
            >
              View Order History
            </Link>
          ) : (
            <div>
              <p className="text-slate-400 mb-4">
                Create an account to track your orders and earn loyalty points!
              </p>
              <Link
                href="/auth/register"
                className="inline-block px-6 py-3 bg-gold text-black font-semibold rounded-lg hover:opacity-90 transition-opacity"
              >
                Create Account
              </Link>
            </div>
          )}
          <div>
            <Link
              href="/"
              className="inline-block px-6 py-3 border border-slate-700 text-slate-300 font-semibold rounded-lg hover:bg-slate-800 transition-colors"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
