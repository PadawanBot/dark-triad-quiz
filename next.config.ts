import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Allow external font hostnames
  images: {
    domains: [],
  },
  experimental: {
    // nothing needed for Phase 1
  },
};

export default nextConfig;
