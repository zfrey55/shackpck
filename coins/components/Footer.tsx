import Link from 'next/link';

export function Footer() {
  return (
    <footer className="border-t border-slate-800/70">
      <div className="container py-10">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-4">
          <div>
            <div className="text-lg font-semibold">Shackpack</div>
            <p className="mt-2 text-sm text-slate-400">Premium Trading Card Repacks</p>
          </div>
          <div>
            <div className="font-medium">Explore</div>
            <ul className="mt-2 space-y-1 text-sm text-slate-300">
              <li><Link href="/repacks" className="hover:text-gold">Packs</Link></li>
              <li><Link href="/checklist" className="hover:text-gold">Checklists</Link></li>
              <li><Link href="/contact" className="hover:text-gold">Contact</Link></li>
            </ul>
          </div>
          <div>
            <div className="font-medium">Information</div>
            <ul className="mt-2 space-y-1 text-sm text-slate-300">
              <li><Link href="/policy" className="hover:text-gold">Policies</Link></li>
              <li><Link href="/policy#shipping" className="hover:text-gold">Shipping</Link></li>
              <li><Link href="/policy#returns" className="hover:text-gold">Returns</Link></li>
            </ul>
          </div>
          <div>
            <div className="font-medium">Follow</div>
            <div className="mt-2 flex gap-3 text-slate-300">
              <Link href="#" aria-label="Twitter" className="hover:text-gold">X</Link>
              <Link href="#" aria-label="Instagram" className="hover:text-gold">Instagram</Link>
              <Link href="#" aria-label="Facebook" className="hover:text-gold">Facebook</Link>
            </div>
          </div>
        </div>
        <div className="mt-8 text-xs text-slate-500">© {new Date().getFullYear()} Shackpack. All rights reserved.</div>
      </div>
    </footer>
  );
}


