import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Optimize for limited resource environments (Hostinger Shared/Cloud)
  poweredByHeader: false,
  compress: false, // Disable compression to save CPU (let Cloudflare/Hostinger handle it if possible)
  generateEtags: false, // Disable ETag generation to save CPU
  reactStrictMode: true,
  experimental: {
    // Limit workers to avoid hitting process limits (120 max)
    cpus: 1,
    workerThreads: false,
    optimizePackageImports: ['lucide-react', 'date-fns', 'framer-motion'],
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
    unoptimized: true, // Optional: Set to true if image optimization causes 503s
  },
};

export default nextConfig;
