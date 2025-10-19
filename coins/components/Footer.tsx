import Link from 'next/link';

export function Footer() {
  return (
    <footer className="border-t border-slate-800/70">
      <div className="container py-10">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-4">
          <div>
            <div className="text-lg font-semibold">Shackpck Coins</div>
            <p className="mt-2 text-sm text-slate-400">Premium coins. Verified quality.</p>
          </div>
          <div>
            <div className="font-medium">Company</div>
            <ul className="mt-2 space-y-1 text-sm text-slate-300">
              <li><Link href="/about" className="hover:text-gold">About</Link></li>
              <li><Link href="/contact" className="hover:text-gold">Contact</Link></li>
              <li><Link href="/faqs" className="hover:text-gold">FAQs</Link></li>
            </ul>
          </div>
          <div>
            <div className="font-medium">Policies</div>
            <ul className="mt-2 space-y-1 text-sm text-slate-300">
              <li><Link href="/policies/shipping" className="hover:text-gold">Shipping</Link></li>
              <li><Link href="/policies/returns" className="hover:text-gold">Returns</Link></li>
              <li><Link href="/policies/privacy" className="hover:text-gold">Privacy</Link></li>
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
        <div className="mt-8 text-xs text-slate-500">© {new Date().getFullYear()} Shackpck Coins. All rights reserved.</div>
      </div>
    </footer>
  );
}


