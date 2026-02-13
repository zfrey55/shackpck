"use client";
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { UserIcon } from '@heroicons/react/24/outline';
import { CartDropdown } from './CartDropdown';
import { isAccountsEnabled, isCheckoutEnabled } from '@/lib/feature-flags';

export function NavBar() {
  const { data: session } = useSession();

  return (
    <header className="border-b border-slate-800/70">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="text-lg font-semibold">Shackpack</Link>

        <nav className="flex items-center gap-6">
          <Link href="/" className="hover:text-gold">Home</Link>
          <Link href="/repacks" className="hover:text-gold">Packs</Link>
          <Link href="/series" className="hover:text-gold">Series</Link>
          <Link href="/checklist" className="hover:text-gold">Checklists</Link>
          <Link href="/policy" className="hover:text-gold">Policy</Link>
          <Link href="/contact" className="hover:text-gold">Contact</Link>
          
          {isCheckoutEnabled() && <CartDropdown />}

          {isAccountsEnabled() && (
            session ? (
              <div className="flex items-center gap-4">
                <Link href="/account" className="hover:text-gold flex items-center gap-1">
                  <UserIcon className="w-5 h-5" />
                  <span className="hidden sm:inline">Account</span>
                </Link>
                <button
                  onClick={() => signOut({ callbackUrl: '/' })}
                  className="text-slate-400 hover:text-gold text-sm"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <Link href="/auth/signin" className="hover:text-gold">
                Sign In
              </Link>
            )
          )}
        </nav>
      </div>
    </header>
  );
}


