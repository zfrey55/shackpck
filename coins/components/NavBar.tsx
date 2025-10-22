"use client";
import Link from 'next/link';

export function NavBar() {
  return (
    <header className="border-b border-slate-800/70">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="text-lg font-semibold">Shackpack</Link>

        <nav className="flex items-center gap-6">
          <Link href="/" className="hover:text-gold">Home</Link>
          <Link href="/repacks" className="hover:text-gold">Packs</Link>
          <Link href="/checklist" className="hover:text-gold">Checklists</Link>
          <Link href="/policy" className="hover:text-gold">Policy</Link>
          <Link href="/contact" className="hover:text-gold">Contact</Link>
        </nav>
      </div>
    </header>
  );
}


