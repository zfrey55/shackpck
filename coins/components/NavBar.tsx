"use client";
import Link from 'next/link';
import { Fragment } from 'react';
import { Menu, Transition } from '@headlessui/react';

export function NavBar() {
  return (
    <header className="border-b border-slate-800/70">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="text-lg font-semibold">Shackpck Coins</Link>

        <nav className="hidden items-center gap-6 sm:flex">
          <Link href="/" className="hover:text-gold">Home</Link>
          <Menu as="div" className="relative inline-block text-left">
            <Menu.Button className="hover:text-gold">Shop</Menu.Button>
            <Transition as={Fragment}
              enter="transition ease-out duration-100"
              enterFrom="transform opacity-0 scale-95"
              enterTo="transform opacity-100 scale-100"
              leave="transition ease-in duration-75"
              leaveFrom="transform opacity-100 scale-100"
              leaveTo="transform opacity-0 scale-95">
              <Menu.Items className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md border border-slate-800 bg-charcoal p-2 shadow-lg focus:outline-none">
                <Menu.Item>
                  {() => <Link href="/shop/gold" className="block rounded px-3 py-2 hover:bg-slate-800/60">Gold Coins</Link>}
                </Menu.Item>
                <Menu.Item>
                  {() => <Link href="/shop/silver" className="block rounded px-3 py-2 hover:bg-slate-800/60">Silver Coins</Link>}
                </Menu.Item>
                <Menu.Item>
                  {() => <Link href="/shop/rare" className="block rounded px-3 py-2 hover:bg-slate-800/60">Rare / Collectible</Link>}
                </Menu.Item>
              </Menu.Items>
            </Transition>
          </Menu>
          <Link href="/checklist" className="hover:text-gold">Checklist</Link>
          <Link href="/repacks" className="hover:text-gold">Repacks</Link>
          <Link href="/contact" className="hover:text-gold">Contact</Link>
        </nav>

        <div className="flex items-center gap-4">
          <Link href="/search" className="text-sm text-slate-300 hover:text-white">Search</Link>
          <Link href="/cart" className="rounded-md border border-slate-700 px-3 py-1.5 text-sm hover:border-slate-600">Cart</Link>
        </div>
      </div>
    </header>
  );
}


