'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { CartItem } from '@/lib/types';

interface CartContextType {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (seriesId: string) => void;
  updateQuantity: (seriesId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  subtotal: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  // Load cart from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('cart');
    if (saved) {
      try {
        setItems(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to load cart from localStorage', e);
      }
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(items));
  }, [items]);

  const addItem = (item: CartItem) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.seriesId === item.seriesId);
      if (existing) {
        // Update quantity if item already exists
        return prev.map((i) =>
          i.seriesId === item.seriesId
            ? { ...i, quantity: Math.min(i.quantity + item.quantity, 5) }
            : i
        );
      }
      return [...prev, item];
    });
  };

  const removeItem = (seriesId: string) => {
    setItems((prev) => prev.filter((i) => i.seriesId !== seriesId));
  };

  const updateQuantity = (seriesId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(seriesId);
      return;
    }
    setItems((prev) =>
      prev.map((i) =>
        i.seriesId === seriesId ? { ...i, quantity: Math.min(quantity, 5) } : i
      )
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce(
    (sum, item) => sum + item.pricePerPack * item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        totalItems,
        subtotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
