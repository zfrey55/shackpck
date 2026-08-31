/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configured for Netlify deployment with @netlify/plugin-nextjs
  // The plugin handles all routing and serverless functions automatically
  images: {
    // `unoptimized: true` used to live here and collapsed every next/image to
    // a raw <img> with no srcset, so every visitor downloaded the full-size
    // PNG — a ~2.5 MB source for a tile that is never wider than ~475 CSS px.
    //
    // It is gone because the optimizer DOES work on this deploy:
    // @netlify/plugin-nextjs v5 registers a redirect from `images.path`
    // (/_next/image) to /.netlify/images whenever `images.loader` is
    // 'default', which is our case. The redirect was already being installed
    // on every build and simply never hit.
    //
    // Remote hosts are allow-listed, not wildcarded. The previous
    // `hostname: '**'` permitted the optimizer to fetch and re-serve an image
    // from anywhere on the internet.
    remotePatterns: [
      // The only remote image the site renders: the home page hero.
      { protocol: 'https', hostname: 'images.unsplash.com' },
    ],
  },
  // Server Actions are enabled by default in Next.js 14
};

module.exports = nextConfig;
