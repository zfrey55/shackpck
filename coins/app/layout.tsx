import './globals.css';
import type { Metadata } from 'next';
import { clsx } from 'clsx';

export const metadata: Metadata = {
  title: 'Shackpck Coins — Premium Gold & Silver Collectibles',
  description: 'Modern, premium e-commerce for collectible coins in gold and silver.',
  metadataBase: new URL('https://example.com')
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className={clsx('min-h-full bg-charcoal text-slate-200 antialiased')}>
        {children}
      </body>
    </html>
  );
}


