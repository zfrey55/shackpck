'use client';

import { useState } from 'react';

export default function TestPage() {
  const [results, setResults] = useState<any>({});
  const [loading, setLoading] = useState<string | null>(null);
  const [testEmail, setTestEmail] = useState('');

  const testSendGrid = async () => {
    setLoading('sendgrid');
    try {
      const response = await fetch('/api/test-sendgrid');
      const data = await response.json();
      setResults({ ...results, sendgrid: data });
    } catch (error: any) {
      setResults({ ...results, sendgrid: { error: error.message } });
    } finally {
      setLoading(null);
    }
  };

  const testEmailSending = async () => {
    if (!testEmail) {
      alert('Please enter an email address first');
      return;
    }
    setLoading('email');
    try {
      const response = await fetch('/api/test-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ testEmail }),
      });
      const data = await response.json();
      setResults({ ...results, email: data });
      if (data.success) {
        alert('✅ Test emails sent! Check your inbox.');
      } else {
        alert('❌ Error: ' + data.error);
      }
    } catch (error: any) {
      setResults({ ...results, email: { error: error.message } });
      alert('❌ Error: ' + error.message);
    } finally {
      setLoading(null);
    }
  };

  const testFedExConfig = async () => {
    setLoading('fedex-config');
    try {
      const response = await fetch('/api/test-fedex');
      const data = await response.json();
      setResults({ ...results, fedexConfig: data });
    } catch (error: any) {
      setResults({ ...results, fedexConfig: { error: error.message } });
    } finally {
      setLoading(null);
    }
  };

  const testFedExLabel = async () => {
    setLoading('fedex-label');
    try {
      const response = await fetch('/api/test-fedex', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shippingAddress: {
            fullName: 'Test User',
            line1: '123 Test St',
            city: 'Test City',
            state: 'FL',
            postalCode: '12345',
            country: 'US',
            phone: '5551234567', // Required by FedEx
          },
        }),
      });
      const data = await response.json();
      setResults({ ...results, fedexLabel: data });
      if (data.success) {
        alert(`✅ FedEx label generated! Tracking: ${data.trackingNumber}`);
      } else {
        alert('❌ Error: ' + (data.error || 'Unknown error'));
      }
    } catch (error: any) {
      setResults({ ...results, fedexLabel: { error: error.message } });
      alert('❌ Error: ' + error.message);
    } finally {
      setLoading(null);
    }
  };

  return (
    <main className="container py-16">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Service Testing Dashboard</h1>
        <p className="text-slate-400 mb-8">
          Test each service individually. Results will appear below each button.
        </p>

        <div className="space-y-6">
          {/* SendGrid Configuration Test */}
          <div className="bg-slate-900/40 p-6 rounded-lg border border-slate-700">
            <h2 className="text-2xl font-semibold mb-4">1. SendGrid Configuration</h2>
            <button
              onClick={testSendGrid}
              disabled={loading === 'sendgrid'}
              className="px-6 py-3 bg-gold text-black font-semibold rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {loading === 'sendgrid' ? 'Testing...' : 'Test SendGrid Config'}
            </button>
            {results.sendgrid && (
              <div className="mt-4 p-4 bg-slate-800 rounded">
                <pre className="text-sm text-slate-300 overflow-auto">
                  {JSON.stringify(results.sendgrid, null, 2)}
                </pre>
              </div>
            )}
          </div>

          {/* Email Sending Test */}
          <div className="bg-slate-900/40 p-6 rounded-lg border border-slate-700">
            <h2 className="text-2xl font-semibold mb-4">2. Email Sending Test</h2>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Test Email Address:</label>
              <input
                type="email"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                placeholder="your_email@example.com"
                className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
              />
            </div>
            <button
              onClick={testEmailSending}
              disabled={loading === 'email' || !testEmail}
              className="px-6 py-3 bg-gold text-black font-semibold rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {loading === 'email' ? 'Sending...' : 'Send Test Emails'}
            </button>
            {results.email && (
              <div className="mt-4 p-4 bg-slate-800 rounded">
                <pre className="text-sm text-slate-300 overflow-auto">
                  {JSON.stringify(results.email, null, 2)}
                </pre>
              </div>
            )}
          </div>

          {/* FedEx Configuration Test */}
          <div className="bg-slate-900/40 p-6 rounded-lg border border-slate-700">
            <h2 className="text-2xl font-semibold mb-4">3. FedEx Configuration</h2>
            <button
              onClick={testFedExConfig}
              disabled={loading === 'fedex-config'}
              className="px-6 py-3 bg-gold text-black font-semibold rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {loading === 'fedex-config' ? 'Testing...' : 'Test FedEx Config'}
            </button>
            {results.fedexConfig && (
              <div className="mt-4 p-4 bg-slate-800 rounded">
                <pre className="text-sm text-slate-300 overflow-auto">
                  {JSON.stringify(results.fedexConfig, null, 2)}
                </pre>
              </div>
            )}
          </div>

          {/* FedEx Label Generation Test */}
          <div className="bg-slate-900/40 p-6 rounded-lg border border-slate-700">
            <h2 className="text-2xl font-semibold mb-4">4. FedEx Label Generation</h2>
            <button
              onClick={testFedExLabel}
              disabled={loading === 'fedex-label'}
              className="px-6 py-3 bg-gold text-black font-semibold rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {loading === 'fedex-label' ? 'Generating...' : 'Generate Test Label'}
            </button>
            {results.fedexLabel && (
              <div className="mt-4 p-4 bg-slate-800 rounded">
                <pre className="text-sm text-slate-300 overflow-auto">
                  {JSON.stringify(results.fedexLabel, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>

        <div className="mt-8 p-6 bg-blue-900/20 border border-blue-700 rounded-lg">
          <h3 className="text-xl font-semibold mb-2">Next Steps</h3>
          <ul className="list-disc list-inside space-y-2 text-slate-300">
            <li>Test account creation: <a href="/auth/register" className="text-gold hover:underline">Go to Registration</a></li>
            <li>Test Stripe checkout: <a href="/series" className="text-gold hover:underline">Browse Series</a> → Add to Cart → Checkout</li>
            <li>Check server logs in terminal for detailed information</li>
          </ul>
        </div>
      </div>
    </main>
  );
}
