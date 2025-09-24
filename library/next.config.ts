import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    /* Disable optimization for external images to avoid 500 errors
    this should be fine for development and testing, but images might load slower
    Next.js Image components optimize images by default, but external images can sometimes cause issues
    especially if the external server does not support certain features
    this setting turns off that optimization and allows external images to load correctly */
    unoptimized: true,
  },

  // GitHub Codespaces configuration
  experimental: {
    // Allow Server Actions to work in Codespaces
    serverActions: {
      allowedOrigins: [
        'localhost:3001',
        '127.0.0.1:3001',
        // GitHub Codespaces domain pattern
        '*.app.github.dev',
        // Also allow the specific subdomain pattern
        'reimagined-potato-j969qq5xqqxhq6q9-3001.app.github.dev'
      ],
    },
  },

  // Additional headers for Codespaces
  async headers() {
    return [
      {
        // Apply to all routes
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
