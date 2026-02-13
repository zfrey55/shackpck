/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configured for Netlify deployment with @netlify/plugin-nextjs
  // The plugin handles all routing and serverless functions automatically
  images: {
    unoptimized: true,
    remotePatterns: [
      { protocol: 'https', hostname: '**' }
    ]
  },
  // Server Actions are enabled by default in Next.js 14
};

module.exports = nextConfig;


