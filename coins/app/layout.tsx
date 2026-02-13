import './globals.css';
import type { Metadata } from 'next';
import clsx from 'clsx';
import { NavBar } from '@/components/NavBar';
import { Footer } from '@/components/Footer';
import { CartProvider } from '@/components/CartProvider';
import { ToastProvider } from '@/components/ToastProvider';
import { Providers } from './providers';

export const metadata: Metadata = {
  title: 'Shackpack — Premium Gold & Silver Coin Repacks',
  description: 'Premium coin repacks featuring curated selections of gold, silver, and rare collectible coins.',
  metadataBase: new URL('https://example.com'),
  icons: {
    icon: '/coin-icon.svg',
    shortcut: '/coin-icon.svg',
    apple: '/coin-icon.svg',
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className={clsx('min-h-full bg-charcoal text-slate-200 antialiased flex flex-col')}>
        <Providers>
          <CartProvider>
            <ToastProvider>
              <NavBar />
              <div className="flex-1">
                {children}
              </div>
              <Footer />
            </ToastProvider>
          </CartProvider>
        </Providers>
      </body>
    </html>
  );
}


