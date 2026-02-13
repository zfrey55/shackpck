'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCart } from './CartProvider';
import { ShoppingCartIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';
import { isCheckoutEnabled, CONTACT_INFO } from '@/lib/feature-flags';

export function CartDropdown() {
  const { items, totalItems, subtotal, removeItem, updateQuantity } = useCart();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleContinueToCart = () => {
    setIsOpen(false);
    if (isCheckoutEnabled()) {
      router.push('/checkout');
    } else {
      router.push(CONTACT_INFO.contactPage);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative hover:text-gold flex items-center gap-1"
      >
        <ShoppingCartIcon className="w-5 h-5" />
        {totalItems > 0 && (
          <span className="absolute -top-2 -right-2 bg-gold text-black text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
            {totalItems}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-slate-900 border border-slate-700 rounded-lg shadow-xl z-50 max-h-[600px] flex flex-col">
          <div className="p-4 border-b border-slate-700 flex items-center justify-between">
            <h3 className="text-lg font-semibold">Shopping Cart</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-white"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>

          {items.length === 0 ? (
            <div className="p-8 text-center text-slate-400">
              <ShoppingCartIcon className="w-12 h-12 mx-auto mb-4 text-slate-600" />
              <p>Your cart is empty</p>
            </div>
          ) : (
            <>
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {items.map((item) => (
                  <div key={item.seriesId} className="flex gap-3 border-b border-slate-700 pb-4 last:border-0">
                    {item.image && (
                      <div className="relative w-16 h-16 bg-slate-800 rounded overflow-hidden flex-shrink-0">
                        <Image
                          src={item.image}
                          alt={item.seriesName}
                          fill
                          className="object-cover"
                          sizes="64px"
                        />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <Link
                        href={`/series/${item.seriesSlug}`}
                        onClick={() => setIsOpen(false)}
                        className="font-medium text-sm hover:text-gold line-clamp-2"
                      >
                        {item.seriesName}
                      </Link>
                      <p className="text-xs text-slate-400 mt-1">
                        ${(item.pricePerPack / 100).toFixed(2)} each
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <label className="text-xs text-slate-400">Qty:</label>
                        <input
                          type="number"
                          min="1"
                          max="5"
                          value={item.quantity}
                          onChange={(e) => {
                            const qty = parseInt(e.target.value) || 1;
                            updateQuantity(item.seriesId, Math.min(Math.max(1, qty), 5));
                          }}
                          className="w-16 px-2 py-1 bg-slate-800 border border-slate-600 rounded text-sm text-white"
                        />
                        <button
                          onClick={() => removeItem(item.seriesId)}
                          className="text-red-400 hover:text-red-300 text-xs ml-auto"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-4 border-t border-slate-700 bg-slate-800/50">
                <div className="flex items-center justify-between mb-4">
                  <span className="font-semibold">Subtotal:</span>
                  <span className="text-gold font-bold">
                    ${(subtotal / 100).toFixed(2)}
                  </span>
                </div>
                <button
                  onClick={handleContinueToCart}
                  className="w-full bg-gold text-black font-semibold py-2 rounded-lg hover:opacity-90 transition-opacity"
                >
                  {isCheckoutEnabled() ? 'Continue to Checkout' : 'Contact Us to Purchase'}
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
