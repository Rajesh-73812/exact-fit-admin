import type { NextConfig } from "next";

const nextConfig: NextConfig = {
 images: {
  domains: ['via.placeholder.com'],
    remotePatterns: [
      {
        // protocol: "https",
        // hostname: "via.placeholder.com",
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
};

export default nextConfig;
