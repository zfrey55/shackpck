import './globals.css';
import type { Metadata } from 'next';
import clsx from 'clsx';
import { NavBar } from '@/components/NavBar';
import { Footer } from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Shackpack — Premium Trading Card Repacks',
  description: 'Premium trading card repacks featuring curated selections of sports cards and collectibles.',
  metadataBase: new URL('https://example.com')
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className={clsx('min-h-full bg-charcoal text-slate-200 antialiased flex flex-col')}>
        <NavBar />
        <div className="flex-1">
          {children}
        </div>
        <Footer />
      </body>
    </html>
  );
}


