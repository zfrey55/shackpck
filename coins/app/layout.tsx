import './globals.css';
import type { Metadata } from 'next';
import clsx from 'clsx';
import { NavBar } from '@/components/NavBar';
import { Footer } from '@/components/Footer';
import { CartProvider } from '@/components/CartProvider';
import { ToastProvider } from '@/components/ToastProvider';
import { Providers } from './providers';
import { StructuredData } from '@/components/StructuredData';
import {
  OG_IMAGE_ALT,
  OG_IMAGE_PATH,
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_TITLE,
  SITE_URL,
} from '@/lib/site-metadata';

export const metadata: Metadata = {
  title: SITE_TITLE,
  description: SITE_DESCRIPTION,
  metadataBase: new URL(SITE_URL),
  icons: {
    icon: '/shackpack-favicon.png',
    shortcut: '/shackpack-favicon.png',
    apple: '/shackpack-favicon.png',
  },
  // './' resolves per route, so every page declares itself canonical and the
  // query-string variants the tab navs produce (/repacks?line=, /checklist?
  // customer=) collapse onto the clean URL instead of competing with it.
  alternates: {
    canonical: './',
  },
  openGraph: {
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    siteName: SITE_NAME,
    type: 'website',
    locale: 'en_US',
    images: [
      {
        url: OG_IMAGE_PATH,
        width: 1200,
        height: 630,
        alt: OG_IMAGE_ALT,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: [OG_IMAGE_PATH],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className={clsx('min-h-full bg-charcoal text-slate-200 antialiased flex flex-col')}>
        <StructuredData />
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


