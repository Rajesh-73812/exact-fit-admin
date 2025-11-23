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
      { protocol: 'https', hostname: 'images.unsplash.com' },
    ],
  },
  // Optional: Temporarily ignore lint/type errors during build
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },

  async rewrites() {
    return [
      {
        source: "/upload-image",
        destination: "https://exact-fit-server.vercel.app/upload-image",
      },
      {
        source: "/api/delete-image",
        destination: "https://exact-fit-server.vercel.app/api/delete-image",
      },
    ];
  },
};

export default nextConfig;
