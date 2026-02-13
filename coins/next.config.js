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
  // Enable experimental features if needed
  experimental: {
    serverActions: true,
  }
};

module.exports = nextConfig;


