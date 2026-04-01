'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';

function PrintZPLContent() {
  const searchParams = useSearchParams();
  const zplData = searchParams.get('data');
  const [status, setStatus] = useState<'loading' | 'ready' | 'printing' | 'error'>('loading');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!zplData) {
      setError('No ZPL data provided');
      setStatus('error');
      return;
    }

    // Decode base64 ZPL data
    try {
      const zplText = atob(zplData);
      setStatus('ready');
      
      // Store ZPL text for printing
      (window as any).zplText = zplText;
    } catch (err) {
      setError('Failed to decode ZPL data');
      setStatus('error');
    }
  }, [zplData]);

  const handlePrint = async () => {
    if (!(window as any).zplText) {
      setError('No ZPL data available');
      return;
    }

    setStatus('printing');

    try {
      // Note: Browsers cannot directly send raw ZPL commands to printers for security reasons
      // We'll try to open a print dialog, but the user may need to use alternative methods
      
      // Create a hidden iframe with the ZPL content
      const iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      document.body.appendChild(iframe);
      
      // Write ZPL as plain text in a pre-formatted document
      const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
      if (iframeDoc) {
        iframeDoc.open();
        iframeDoc.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>ZPL Label - Print to Rollo X1040</title>
              <style>
                @page {
                  size: 4in 6in;
                  margin: 0;
                }
                body { 
                  margin: 0; 
                  padding: 0;
                  font-family: 'Courier New', monospace;
                  font-size: 8pt;
                  white-space: pre-wrap;
                  word-wrap: break-word;
                }
                @media print {
                  body { 
                    margin: 0;
                    padding: 0;
                  }
                }
              </style>
            </head>
            <body>
              <pre style="margin: 0; padding: 0;">${(window as any).zplText}</pre>
            </body>
          </html>
        `);
        iframeDoc.close();
        
        // Wait for content to load, then open print dialog
        setTimeout(() => {
          try {
            iframe.contentWindow?.focus();
            iframe.contentWindow?.print();
            setStatus('ready');
            
            // Show message about alternative methods
            setTimeout(() => {
              alert('⚠️ Browser printing may not work for ZPL files.\n\nIf the print dialog doesn\'t work or prints incorrectly:\n\n1. Use the "Download .zpl File" button\n2. Use Rollo Print Software to open and print\n3. Or use command line (see instructions below)');
            }, 1000);
            
            // Clean up after printing
            setTimeout(() => {
              if (document.body.contains(iframe)) {
                document.body.removeChild(iframe);
              }
            }, 5000);
          } catch (err) {
            console.error('Print error:', err);
            setError('Browser print dialog failed. Please use the download button and print with Rollo Print Software.');
            setStatus('error');
          }
        }, 500);
      } else {
        setError('Failed to create print preview');
        setStatus('error');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to print');
      setStatus('error');
    }
  };

  const handleDownload = () => {
    if (!(window as any).zplText) return;
    
    const blob = new Blob([(window as any).zplText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'fedex-label.zpl';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="text-white">Loading ZPL data...</div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="text-center text-white">
          <h1 className="text-2xl font-bold mb-4">Error</h1>
          <p className="text-red-400">{error}</p>
          <button
            onClick={() => window.close()}
            className="mt-4 px-4 py-2 bg-gold text-black rounded"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 p-8">
      <div className="max-w-2xl w-full bg-slate-800 rounded-lg p-8 text-white">
        <h1 className="text-3xl font-bold mb-6">Print ZPL Label</h1>
        
        <div className="mb-6 space-y-4">
          <div className="bg-slate-700 p-4 rounded">
            <h2 className="font-semibold mb-2">Instructions:</h2>
            <ol className="list-decimal list-inside space-y-2 text-sm">
              <li>Click "Print" below to open the print dialog</li>
              <li>Select your <strong>Rollo X1040</strong> printer</li>
              <li>In printer settings, set:
                <ul className="list-disc list-inside ml-4 mt-1">
                  <li>Paper size: <strong>4x6 inches</strong></li>
                  <li>Margins: <strong>0</strong></li>
                  <li>Scaling: <strong>100%</strong> (actual size)</li>
                  <li>Print quality: <strong>600 DPI minimum</strong></li>
                </ul>
              </li>
              <li>Click "Print"</li>
            </ol>
          </div>

          <div className="bg-yellow-900/30 border border-yellow-600 p-4 rounded">
            <p className="text-sm">
              <strong>⚠️ Important:</strong> If the print dialog doesn't work, you can:
            </p>
            <ol className="list-decimal list-inside space-y-1 text-sm mt-2 ml-4">
              <li>Download the .zpl file using the button below</li>
              <li>Use Rollo Print Software or another ZPL viewer to print</li>
              <li>Or send the ZPL directly to your printer using command line tools</li>
            </ol>
          </div>
        </div>

        <div className="flex gap-4">
          <button
            onClick={handlePrint}
            disabled={status === 'printing'}
            className="flex-1 px-6 py-3 bg-gold text-black font-semibold rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {status === 'printing' ? 'Opening Print Dialog...' : 'Print to Rollo X1040'}
          </button>
          
          <button
            onClick={handleDownload}
            className="px-6 py-3 bg-slate-700 text-white font-semibold rounded-lg hover:bg-slate-600 transition-colors"
          >
            Download .zpl File
          </button>
        </div>

        <div className="mt-6 space-y-4">
          <div className="bg-red-900/30 border border-red-600 p-4 rounded">
            <h3 className="font-semibold mb-2 text-red-300">⚠️ Browser Printing May Not Work</h3>
            <p className="text-sm text-red-200 mb-3">
              Browsers cannot directly send raw ZPL commands to printers. Use one of these methods:
            </p>
          </div>

          <div className="bg-slate-700 p-4 rounded">
            <h3 className="font-semibold mb-3">Working Methods (Choose One):</h3>
            
            <div className="mb-4 p-3 bg-green-900/20 border border-green-600 rounded">
              <h4 className="font-semibold text-sm mb-2 text-green-300">✅ Method 1: Batch File (Easiest)</h4>
              <ol className="list-decimal list-inside space-y-1 text-xs ml-2">
                <li>Download the .zpl file using the button above</li>
                <li>Right-click the .zpl file → Copy file path</li>
                <li>Open Command Prompt as Administrator</li>
                <li>Navigate to: <code className="bg-slate-900 px-1 rounded">cd C:\Users\zfrey\OneDrive\Desktop\Shackpck\coins\scripts</code></li>
                <li>Run: <code className="bg-slate-900 px-1 rounded">print-zpl-simple.bat "paste-file-path-here"</code></li>
              </ol>
            </div>

            <div className="mb-4 p-3 bg-blue-900/20 border border-blue-600 rounded">
              <h4 className="font-semibold text-sm mb-2 text-blue-300">✅ Method 2: Manual Copy Command</h4>
              <ol className="list-decimal list-inside space-y-1 text-xs ml-2">
                <li>Download the .zpl file</li>
                <li>Find your printer name: <code className="bg-slate-900 px-1 rounded">wmic printer get name</code></li>
                <li>Open Command Prompt as Administrator</li>
                <li>Run: <code className="bg-slate-900 px-1 rounded">copy /b "path\to\file.zpl" "\\localhost\Rollo X1040"</code></li>
                <li>Replace "Rollo X1040" with your actual printer name</li>
              </ol>
            </div>

            <div className="mb-4 p-3 bg-purple-900/20 border border-purple-600 rounded">
              <h4 className="font-semibold text-sm mb-2 text-purple-300">✅ Method 3: Drag & Drop (Windows)</h4>
              <ol className="list-decimal list-inside space-y-1 text-xs ml-2">
                <li>Download the .zpl file</li>
                <li>Open File Explorer</li>
                <li>Search: "Devices and Printers" in Windows search</li>
                <li>Find your Rollo X1040 printer</li>
                <li>Drag the .zpl file onto the printer icon</li>
              </ol>
            </div>

            <div className="p-3 bg-yellow-900/20 border border-yellow-600 rounded">
              <h4 className="font-semibold text-sm mb-2 text-yellow-300">📋 Method 4: PowerShell Script (Advanced)</h4>
              <ol className="list-decimal list-inside space-y-1 text-xs ml-2">
                <li>Download the .zpl file</li>
                <li>Open PowerShell as Administrator</li>
                <li>Navigate to: <code className="bg-slate-900 px-1 rounded">cd C:\Users\zfrey\OneDrive\Desktop\Shackpck\coins\scripts</code></li>
                <li>Run: <code className="bg-slate-900 px-1 rounded">.\print-zpl.ps1 -ZplFile "path\to\file.zpl"</code></li>
              </ol>
            </div>
          </div>

          <div className="bg-slate-700 p-4 rounded">
            <h3 className="font-semibold mb-2">📖 Full Instructions</h3>
            <p className="text-sm text-slate-300 mb-2">
              See <code className="bg-slate-900 px-1 rounded">PRINT_ZPL_INSTRUCTIONS.md</code> in your project folder for detailed step-by-step instructions.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PrintZPLPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-slate-900">
          <div className="text-white">Loading ZPL data...</div>
        </div>
      }
    >
      <PrintZPLContent />
    </Suspense>
  );
}
