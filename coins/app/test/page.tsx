'use client';

import { useState } from 'react';

export default function TestPage() {
  const [results, setResults] = useState<any>({});
  const [loading, setLoading] = useState<string | null>(null);
  const [testEmail, setTestEmail] = useState('');
  const [labelFormat, setLabelFormat] = useState<'PDF' | 'ZPLII'>('ZPLII'); // Default to ZPLII for Zebra printer

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
            city: 'Boca Raton',
            state: 'FL',
            postalCode: '33432', // Valid Florida ZIP code (matches shipper location)
            country: 'US',
            phone: '5551234567', // Required by FedEx
          },
          labelFormat: labelFormat, // PDF or ZPLII format
        }),
      });
      const data = await response.json();
      setResults({ ...results, fedexLabel: data });
      if (data.success) {
        // Download label immediately if available
        if (data.labelData) {
          const isZPLII = data.labelFormat === 'ZPLII';
          
          if (isZPLII) {
            // Show print dialog with options
            const printNow = confirm(
              `✅ FedEx ZPLII label generated! Tracking: ${data.trackingNumber}\n\n` +
              `Would you like to print now? (Like Whatnot)\n\n` +
              `Click OK to print directly to your Zebra printer\n` +
              `Click Cancel to download the .zpl file instead`
            );

            if (printNow) {
              // Try to print directly
              try {
                const printResponse = await fetch('/api/print-zpl', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    zplData: data.labelData,
                  }),
                });

                const printResult = await printResponse.json();
                
                if (printResult.success) {
                  alert(`✅ Label sent to printer: ${printResult.printer}\n\nYour label should print now!`);
                } else {
                  // Show instructions if direct print failed
                  alert(
                    `⚠️ Could not print directly.\n\n` +
                    `SETUP REQUIRED:\n` +
                    `1. Download Zebra Setup Utilities:\n` +
                    `   https://www.zebra.com/us/en/support-downloads/knowledge-articles/software/printers/zebra-setup-utilities.html\n\n` +
                    `2. Install and open Zebra Setup Utilities\n` +
                    `3. Select your Zebra printer\n` +
                    `4. Use "Send File" to print the .zpl file\n\n` +
                    `The .zpl file will be downloaded now.`
                  );
                  
                  // Download file as fallback
                  const zplText = atob(data.labelData);
                  const blob = new Blob([zplText], { type: 'text/plain' });
                  const downloadUrl = URL.createObjectURL(blob);
                  const downloadElement = document.createElement('a');
                  downloadElement.href = downloadUrl;
                  downloadElement.download = `fedex-label-${data.trackingNumber}.zpl`;
                  document.body.appendChild(downloadElement);
                  downloadElement.click();
                  document.body.removeChild(downloadElement);
                  URL.revokeObjectURL(downloadUrl);
                }
              } catch (printError: any) {
                alert(`❌ Print error: ${printError.message}\n\nThe .zpl file will be downloaded instead.`);
                
                // Download file as fallback
                const zplText = atob(data.labelData);
                const blob = new Blob([zplText], { type: 'text/plain' });
                const downloadUrl = URL.createObjectURL(blob);
                const downloadElement = document.createElement('a');
                downloadElement.href = downloadUrl;
                downloadElement.download = `fedex-label-${data.trackingNumber}.zpl`;
                document.body.appendChild(downloadElement);
                downloadElement.click();
                document.body.removeChild(downloadElement);
                URL.revokeObjectURL(downloadUrl);
              }
            } else {
              // Download file
              const zplText = atob(data.labelData);
              const blob = new Blob([zplText], { type: 'text/plain' });
              const downloadUrl = URL.createObjectURL(blob);
              const downloadElement = document.createElement('a');
              downloadElement.href = downloadUrl;
              downloadElement.download = `fedex-label-${data.trackingNumber}.zpl`;
              document.body.appendChild(downloadElement);
              downloadElement.click();
              document.body.removeChild(downloadElement);
              URL.revokeObjectURL(downloadUrl);
              
              alert(`📥 ZPL file downloaded!\n\nTo print:\n1. Install Zebra Setup Utilities\n2. Open the .zpl file with Zebra Setup Utilities\n3. Select your printer and click "Send"`);
            }
          } else {
            // PDF is binary format
            const byteCharacters = atob(data.labelData);
            const byteNumbers = new Array(byteCharacters.length);
            for (let i = 0; i < byteCharacters.length; i++) {
              byteNumbers[i] = byteCharacters.charCodeAt(i);
            }
            const byteArray = new Uint8Array(byteNumbers);
            const blob = new Blob([byteArray], { type: 'application/pdf' });
            const downloadUrl = URL.createObjectURL(blob);
            const downloadElement = document.createElement('a');
            downloadElement.href = downloadUrl;
            downloadElement.download = `fedex-label-${data.trackingNumber}.pdf`;
            document.body.appendChild(downloadElement);
            downloadElement.click();
            document.body.removeChild(downloadElement);
            URL.revokeObjectURL(downloadUrl);
            
            alert(`✅ FedEx PDF label generated! Tracking: ${data.trackingNumber}\n\n📋 LABEL SPECIFICATIONS:\n- Size: 4x6 inches\n- Format: PDF\n\n🖨️ PRINTING INSTRUCTIONS:\n1. Open the downloaded PDF\n2. Print settings:\n   - Paper size: 4x6 inches\n   - Scaling: 100% (actual size)\n   - Margins: 0\n   - Print quality: 600 DPI minimum\n3. Print and scan at 600 DPI for FedEx validation`);
          }
        } else if (data.labelUrl) {
          // Open URL in new tab for immediate download
          window.open(data.labelUrl, '_blank');
          alert(`✅ FedEx label generated! Tracking: ${data.trackingNumber}\n\n⚠️ IMPORTANT: Download the label immediately - the URL expires quickly!\n\nPrint at 600 DPI for FedEx submission.`);
        } else {
          alert(`✅ FedEx label generated! Tracking: ${data.trackingNumber}`);
        }
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
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Label Format:</label>
              <div className="flex gap-4 mb-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="ZPLII"
                    checked={labelFormat === 'ZPLII'}
                    onChange={(e) => setLabelFormat(e.target.value as 'PDF' | 'ZPLII')}
                    className="mr-2"
                  />
                  <span className="text-sm">ZPLII (Zebra Thermal Printer - Recommended)</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="PDF"
                    checked={labelFormat === 'PDF'}
                    onChange={(e) => setLabelFormat(e.target.value as 'PDF' | 'ZPLII')}
                    className="mr-2"
                  />
                  <span className="text-sm">PDF (Laser/Inkjet Printer)</span>
                </label>
              </div>
              {labelFormat === 'ZPLII' ? (
                <div className="bg-green-900/20 border border-green-600 p-3 rounded">
                  <p className="text-sm text-green-200 font-semibold mb-1">✅ ZPLII Format - 600 DPI Ready</p>
                  <p className="text-xs text-green-300 mb-2">
                    ZPLII format is optimized for Zebra thermal printers. Labels are generated at 600 DPI and ready for direct printing.
                  </p>
                  <p className="text-xs text-green-200 font-semibold mb-1">🖨️ Printing Instructions:</p>
                  <ul className="text-xs text-green-300 list-disc list-inside space-y-1">
                    <li>Send .zpl file directly to Zebra printer (do NOT convert to PDF)</li>
                    <li>Print at 600 DPI (already configured in ZPL)</li>
                    <li>Label size: 4x6 inches (automatic)</li>
                    <li>Scan printed label at 600 DPI minimum for FedEx validation</li>
                  </ul>
                </div>
              ) : (
                <div className="bg-blue-900/20 border border-blue-600 p-3 rounded">
                  <p className="text-sm text-blue-200 font-semibold mb-1">✅ PDF Format - 4x6 Inches</p>
                  <p className="text-xs text-blue-300 mb-2">
                    PDF format for laser/inkjet printers. Labels are automatically sized to 4x6 inches.
                  </p>
                  <p className="text-xs text-blue-200 font-semibold mb-1">🖨️ Printing Instructions:</p>
                  <ul className="text-xs text-blue-300 list-disc list-inside space-y-1">
                    <li>Paper size: <strong>4x6 inches</strong></li>
                    <li>Scaling: <strong>100%</strong> (actual size)</li>
                    <li>Margins: <strong>0</strong></li>
                    <li>Print quality: <strong>600 DPI minimum</strong></li>
                  </ul>
                </div>
              )}
            </div>
            <button
              onClick={testFedExLabel}
              disabled={loading === 'fedex-label'}
              className="px-6 py-3 bg-gold text-black font-semibold rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {loading === 'fedex-label' ? 'Generating...' : `Generate Test Label (${labelFormat})`}
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
