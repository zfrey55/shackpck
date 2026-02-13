/** @type {import('next').NextConfig} */
const nextConfig = {
  // Removed static export to support API routes and dynamic features
  // For Netlify deployment, we'll use Netlify Functions for API routes
  images: {
    unoptimized: true,
    remotePatterns: [
      { protocol: 'https', hostname: '**' }
    ]
  },
  // Server Actions are enabled by default in Next.js 14
};

module.exports = nextConfig;


