// Shared TypeScript types for the application

export interface Series {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  images: string[];
  totalPacks: number;
  packsSold: number;
  packsRemaining: number;
  pricePerPack: number;
  isActive: boolean;
  earlyAccessStart: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CartItem {
  seriesId: string;
  seriesName: string;
  seriesSlug: string;
  quantity: number;
  pricePerPack: number;
  image?: string;
}

export interface ShippingAddress {
  fullName: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone?: string;
}

export interface OrderSummary {
  items: CartItem[];
  subtotal: number;
  shippingCost: number;
  total: number;
  hasAccount: boolean;
}
