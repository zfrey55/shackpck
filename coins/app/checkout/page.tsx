'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useCart } from '@/components/CartProvider';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { ShippingAddress } from '@/lib/types';
import { isCheckoutEnabled, CONTACT_INFO } from '@/lib/feature-flags';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

function CheckoutForm({ 
  onClientSecretReady,
  initialShippingAddress,
  initialEmail,
  initialName,
}: { 
  onClientSecretReady?: (secret: string) => void;
  initialShippingAddress?: ShippingAddress | null;
  initialEmail?: string;
  initialName?: string;
}) {
  const router = useRouter();
  const { data: session } = useSession();
  const { items, clearCart, subtotal } = useCart();
  const stripe = useStripe();
  const elements = useElements();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [clientSecret, setClientSecret] = useState('');
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>(
    initialShippingAddress || {
      fullName: '',
      line1: '',
      line2: '',
      city: '',
      state: '',
      postalCode: '',
      country: 'US',
      phone: '',
    }
  );
  const [email, setEmail] = useState(session?.user?.email || initialEmail || '');
  const [name, setName] = useState(session?.user?.name || initialName || '');
  const [savedAddresses, setSavedAddresses] = useState<any[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);

  // Fetch saved addresses for logged-in users
  useEffect(() => {
    if (session?.user?.id) {
      fetch('/api/user/addresses')
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            setSavedAddresses(data);
            // Auto-select default address if available
            const defaultAddress = data.find((addr: any) => addr.isDefault);
            if (defaultAddress) {
              setSelectedAddressId(defaultAddress.id);
              setShippingAddress({
                fullName: defaultAddress.fullName,
                line1: defaultAddress.line1,
                line2: defaultAddress.line2 || '',
                city: defaultAddress.city,
                state: defaultAddress.state,
                postalCode: defaultAddress.postalCode,
                country: defaultAddress.country || 'US',
                phone: defaultAddress.phone || '',
              });
            }
          }
        })
        .catch(err => console.error('Error fetching addresses:', err));
    }
  }, [session]);

  useEffect(() => {
    if (items.length === 0) {
      router.push('/');
      return;
    }

    // Create payment intent when shipping address is ready
    if (shippingAddress.line1 && shippingAddress.city) {
      createPaymentIntent();
    }
  }, [shippingAddress.line1, shippingAddress.city, items.length]);

  const createPaymentIntent = async () => {
    try {
      const response = await fetch('/api/checkout/create-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items,
          shippingAddress,
          email: session?.user?.email || email,
          name: session?.user?.name || name,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to create payment intent');
        return;
      }

      setClientSecret(data.clientSecret);
      // Notify parent component
      if (onClientSecretReady) {
        onClientSecretReady(data.clientSecret);
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setLoading(true);
    setError('');

    // Validate shipping address
    if (!shippingAddress.fullName || !shippingAddress.line1 || !shippingAddress.city || !shippingAddress.state || !shippingAddress.postalCode) {
      setError('Please fill in all required shipping address fields');
      setLoading(false);
      return;
    }

    if (!session && !email) {
      setError('Please provide your email address');
      setLoading(false);
      return;
    }

    // Ensure payment intent exists
    if (!clientSecret) {
      await createPaymentIntent();
      if (!clientSecret) {
        setError('Failed to initialize payment. Please try again.');
        setLoading(false);
        return;
      }
    }

    const { error: submitError } = await elements.submit();
    if (submitError) {
      setError(submitError.message || 'An error occurred');
      setLoading(false);
      return;
    }

    const { error: confirmError, paymentIntent } = await stripe.confirmPayment({
      elements,
      clientSecret,
      confirmParams: {
        return_url: `${window.location.origin}/checkout/success`,
      },
      redirect: 'if_required',
    });

    if (confirmError) {
      setError(confirmError.message || 'Payment failed');
      setLoading(false);
      return;
    }

    if (paymentIntent?.status === 'succeeded') {
      // Create order
      const orderResponse = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentIntentId: paymentIntent.id,
          items,
          shippingAddress,
          email: session?.user?.email || email,
          name: session?.user?.name || name,
        }),
      });

      if (orderResponse.ok) {
        clearCart();
        router.push(`/checkout/success?payment_intent=${paymentIntent.id}`);
      } else {
        setError('Payment succeeded but order creation failed. Please contact support.');
      }
    }
  };

  const shippingCost = session?.user ? 0 : 499; // Free for account holders, $4.99 for guests
  const total = subtotal + shippingCost;

  if (items.length === 0) {
    return null;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Shipping Address */}
      <div className="bg-slate-900/40 p-6 rounded-lg border border-slate-700">
        <h2 className="text-xl font-semibold mb-4">Shipping Address</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-2">Full Name *</label>
            <input
              type="text"
              value={shippingAddress.fullName}
              onChange={(e) => setShippingAddress({ ...shippingAddress, fullName: e.target.value })}
              required
              className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-gold"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-2">Address Line 1 *</label>
            <input
              type="text"
              value={shippingAddress.line1}
              onChange={(e) => setShippingAddress({ ...shippingAddress, line1: e.target.value })}
              required
              className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-gold"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-2">Address Line 2</label>
            <input
              type="text"
              value={shippingAddress.line2}
              onChange={(e) => setShippingAddress({ ...shippingAddress, line2: e.target.value })}
              className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-gold"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">City *</label>
            <input
              type="text"
              value={shippingAddress.city}
              onChange={(e) => setShippingAddress({ ...shippingAddress, city: e.target.value })}
              required
              className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-gold"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">State *</label>
            <input
              type="text"
              value={shippingAddress.state}
              onChange={(e) => setShippingAddress({ ...shippingAddress, state: e.target.value })}
              required
              className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-gold"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Postal Code *</label>
            <input
              type="text"
              value={shippingAddress.postalCode}
              onChange={(e) => setShippingAddress({ ...shippingAddress, postalCode: e.target.value })}
              required
              className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-gold"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Phone</label>
            <input
              type="tel"
              value={shippingAddress.phone}
              onChange={(e) => setShippingAddress({ ...shippingAddress, phone: e.target.value })}
              className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-gold"
            />
          </div>
        </div>
      </div>

      {/* Guest Email */}
      {!session && (
        <div className="bg-slate-900/40 p-6 rounded-lg border border-slate-700">
          <h2 className="text-xl font-semibold mb-4">Contact Information</h2>
          <div>
            <label className="block text-sm font-medium mb-2">Email *</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-gold"
            />
          </div>
          <div className="mt-4">
            <label className="block text-sm font-medium mb-2">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-gold"
            />
          </div>
          <p className="mt-4 text-sm text-slate-400">
            <Link href="/auth/register" className="text-gold hover:underline">
              Create an account
            </Link>{' '}
            to get free shipping and track your orders!
          </p>
        </div>
      )}

      {/* Payment */}
      {clientSecret && stripe && elements ? (
        <div className="bg-slate-900/40 p-6 rounded-lg border border-slate-700">
          <h2 className="text-xl font-semibold mb-4">Payment</h2>
          <PaymentElement 
            options={{
              // Pre-fill email and phone for logged-in users
              defaultValues: {
                billingDetails: {
                  email: session?.user?.email || email || undefined,
                  phone: shippingAddress.phone || undefined,
                  name: session?.user?.name || name || undefined,
                },
              },
            }}
          />
          {session?.user?.id && (
            <p className="mt-2 text-sm text-slate-400">
              Your payment method will be saved for faster checkout
            </p>
          )}
        </div>
      ) : (
        shippingAddress.line1 && shippingAddress.city && (
          <div className="bg-slate-900/40 p-6 rounded-lg border border-slate-700">
            <p className="text-slate-400">Loading payment form...</p>
          </div>
        )
      )}
      {!clientSecret && shippingAddress.line1 && shippingAddress.city && (
        <div className="bg-slate-900/40 p-6 rounded-lg border border-slate-700">
          <p className="text-slate-400">Loading payment form...</p>
        </div>
      )}

      {/* Order Summary */}
      <div className="bg-slate-900/40 p-6 rounded-lg border border-slate-700">
        <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
        <div className="space-y-2 mb-4">
          {items.map((item) => (
            <div key={item.seriesId} className="flex justify-between text-sm">
              <span>
                {item.seriesName} × {item.quantity}
              </span>
              <span>${((item.pricePerPack * item.quantity) / 100).toFixed(2)}</span>
            </div>
          ))}
        </div>
        <div className="border-t border-slate-700 pt-4 space-y-2">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>${(subtotal / 100).toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>Shipping</span>
            <span>
              {shippingCost === 0 ? (
                <span className="text-gold">FREE</span>
              ) : (
                `$${(shippingCost / 100).toFixed(2)}`
              )}
            </span>
          </div>
          <div className="flex justify-between text-lg font-semibold pt-2 border-t border-slate-700">
            <span>Total</span>
            <span>${(total / 100).toFixed(2)}</span>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-900/20 border border-red-700 rounded-lg text-red-200">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading || !stripe || !clientSecret}
        className="w-full bg-gold text-black font-semibold py-4 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
      >
        {loading ? 'Processing...' : `Pay $${(total / 100).toFixed(2)}`}
      </button>
    </form>
  );
}

export default function CheckoutPage() {
  const { items } = useCart();
  const router = useRouter();
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [shippingAddressState, setShippingAddressState] = useState<ShippingAddress | null>(null);
  const [emailState, setEmailState] = useState<string>('');
  const [nameState, setNameState] = useState<string>('');

  useEffect(() => {
    // Redirect if checkout is disabled
    if (!isCheckoutEnabled()) {
      router.push(CONTACT_INFO.contactPage);
      return;
    }

    if (items.length === 0) {
      router.push('/');
    }
  }, [items, router]);

  // Show message if checkout is disabled
  if (!isCheckoutEnabled()) {
    return (
      <main className="container py-16">
        <div className="max-w-md mx-auto text-center">
          <h1 className="text-3xl font-bold mb-4">Checkout</h1>
          <p className="text-slate-400 mb-6">
            Online checkout is currently disabled. Please contact us to complete your purchase.
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

  if (items.length === 0) {
    return null;
  }

  return (
    <main className="container py-16">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Checkout</h1>
        {/* Only render Elements when clientSecret is ready */}
        {clientSecret ? (
          <Elements stripe={stripePromise} options={{ clientSecret }}>
            <CheckoutForm 
              onClientSecretReady={setClientSecret}
              initialShippingAddress={shippingAddressState}
              initialEmail={emailState}
              initialName={nameState}
            />
          </Elements>
        ) : (
          <CheckoutFormWrapper 
            onClientSecretReady={setClientSecret}
            onShippingAddressChange={setShippingAddressState}
            onEmailChange={setEmailState}
            onNameChange={setNameState}
          />
        )}
      </div>
    </main>
  );
}

// Wrapper component that doesn't use Stripe hooks until Elements is ready
function CheckoutFormWrapper({ 
  onClientSecretReady,
  onShippingAddressChange,
  onEmailChange,
  onNameChange,
}: { 
  onClientSecretReady: (secret: string) => void;
  onShippingAddressChange: (address: ShippingAddress) => void;
  onEmailChange: (email: string) => void;
  onNameChange: (name: string) => void;
}) {
  const router = useRouter();
  const { data: session } = useSession();
  const { items, subtotal } = useCart();

  const [error, setError] = useState('');
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>({
    fullName: '',
    line1: '',
    line2: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'US',
    phone: '',
  });
  const [email, setEmail] = useState(session?.user?.email || '');
  const [name, setName] = useState('');
  
  // Update parent state when local state changes
  useEffect(() => {
    if (onShippingAddressChange) {
      onShippingAddressChange(shippingAddress);
    }
  }, [shippingAddress, onShippingAddressChange]);
  
  useEffect(() => {
    if (onEmailChange) {
      onEmailChange(email);
    }
  }, [email, onEmailChange]);
  
  useEffect(() => {
    if (onNameChange) {
      onNameChange(name);
    }
  }, [name, onNameChange]);

  useEffect(() => {
    if (items.length === 0) {
      router.push('/');
      return;
    }

    // Create payment intent when shipping address is ready
    if (shippingAddress.line1 && shippingAddress.city) {
      createPaymentIntent();
    }
  }, [shippingAddress.line1, shippingAddress.city, items.length]);

  const createPaymentIntent = async () => {
    try {
      const response = await fetch('/api/checkout/create-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items,
          shippingAddress,
          email: session?.user?.email || email,
          name: session?.user?.name || name,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to create payment intent');
        return;
      }

      // Notify parent component
      if (onClientSecretReady) {
        onClientSecretReady(data.clientSecret);
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    }
  };

  const shippingCost = session?.user ? 0 : 499;
  const total = subtotal + shippingCost;

  return (
    <form className="space-y-8">
      {/* Shipping Address */}
      <div className="bg-slate-900/40 p-6 rounded-lg border border-slate-700">
        <h2 className="text-xl font-semibold mb-4">Shipping Address</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-2">Full Name *</label>
            <input
              type="text"
              value={shippingAddress.fullName}
              onChange={(e) => setShippingAddress({ ...shippingAddress, fullName: e.target.value })}
              required
              className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-gold"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-2">Address Line 1 *</label>
            <input
              type="text"
              value={shippingAddress.line1}
              onChange={(e) => setShippingAddress({ ...shippingAddress, line1: e.target.value })}
              required
              className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-gold"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-2">Address Line 2</label>
            <input
              type="text"
              value={shippingAddress.line2}
              onChange={(e) => setShippingAddress({ ...shippingAddress, line2: e.target.value })}
              className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-gold"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">City *</label>
            <input
              type="text"
              value={shippingAddress.city}
              onChange={(e) => setShippingAddress({ ...shippingAddress, city: e.target.value })}
              required
              className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-gold"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">State *</label>
            <input
              type="text"
              value={shippingAddress.state}
              onChange={(e) => setShippingAddress({ ...shippingAddress, state: e.target.value })}
              required
              className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-gold"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Postal Code *</label>
            <input
              type="text"
              value={shippingAddress.postalCode}
              onChange={(e) => setShippingAddress({ ...shippingAddress, postalCode: e.target.value })}
              required
              className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-gold"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Phone</label>
            <input
              type="tel"
              value={shippingAddress.phone}
              onChange={(e) => setShippingAddress({ ...shippingAddress, phone: e.target.value })}
              className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-gold"
            />
          </div>
        </div>
      </div>

      {/* Guest Email */}
      {!session && (
        <div className="bg-slate-900/40 p-6 rounded-lg border border-slate-700">
          <h2 className="text-xl font-semibold mb-4">Contact Information</h2>
          <div>
            <label className="block text-sm font-medium mb-2">Email *</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-gold"
            />
          </div>
          <div className="mt-4">
            <label className="block text-sm font-medium mb-2">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-gold"
            />
          </div>
          <p className="mt-4 text-sm text-slate-400">
            <Link href="/auth/register" className="text-gold hover:underline">
              Create an account
            </Link>{' '}
            to get free shipping and track your orders!
          </p>
        </div>
      )}

      {/* Loading Payment Form */}
      {shippingAddress.line1 && shippingAddress.city && (
        <div className="bg-slate-900/40 p-6 rounded-lg border border-slate-700">
          <p className="text-slate-400">Loading payment form...</p>
        </div>
      )}

      {/* Order Summary */}
      <div className="bg-slate-900/40 p-6 rounded-lg border border-slate-700">
        <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
        <div className="space-y-2 mb-4">
          {items.map((item) => (
            <div key={item.seriesId} className="flex justify-between text-sm">
              <span>
                {item.seriesName} × {item.quantity}
              </span>
              <span>${((item.pricePerPack * item.quantity) / 100).toFixed(2)}</span>
            </div>
          ))}
        </div>
        <div className="border-t border-slate-700 pt-4 space-y-2">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>${(subtotal / 100).toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>Shipping</span>
            <span>
              {shippingCost === 0 ? (
                <span className="text-gold">FREE</span>
              ) : (
                `$${(shippingCost / 100).toFixed(2)}`
              )}
            </span>
          </div>
          <div className="flex justify-between text-lg font-semibold pt-2 border-t border-slate-700">
            <span>Total</span>
            <span>${(total / 100).toFixed(2)}</span>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-900/20 border border-red-700 rounded-lg text-red-200">
          {error}
        </div>
      )}
    </form>
  );
}
