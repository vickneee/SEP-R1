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
};

export default nextConfig;
