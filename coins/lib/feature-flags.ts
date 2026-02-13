// Feature flags for controlling site functionality
// Use environment variables to enable/disable features

export const FEATURES = {
  // Enable/disable checkout and cart functionality
  ENABLE_CHECKOUT: process.env.NEXT_PUBLIC_ENABLE_CHECKOUT === 'true',
  
  // Enable/disable account creation and login
  ENABLE_ACCOUNTS: process.env.NEXT_PUBLIC_ENABLE_ACCOUNTS === 'true',
  
  // Enable/disable direct purchasing (Buy Now buttons)
  ENABLE_DIRECT_PURCHASE: process.env.NEXT_PUBLIC_ENABLE_DIRECT_PURCHASE === 'true',
} as const;

// Helper function to check if checkout is enabled
export function isCheckoutEnabled(): boolean {
  return FEATURES.ENABLE_CHECKOUT;
}

// Helper function to check if accounts are enabled
export function isAccountsEnabled(): boolean {
  return FEATURES.ENABLE_ACCOUNTS;
}

// Helper function to check if direct purchase is enabled
export function isDirectPurchaseEnabled(): boolean {
  return FEATURES.ENABLE_DIRECT_PURCHASE;
}

// Contact information for when features are disabled
export const CONTACT_INFO = {
  email: process.env.NEXT_PUBLIC_CONTACT_EMAIL || 'info@shackpck.com',
  phone: process.env.NEXT_PUBLIC_CONTACT_PHONE || '(561) 870-4222',
  contactPage: '/contact',
} as const;
