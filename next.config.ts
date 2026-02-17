import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // ... your existing config (images, etc)
  experimental: {
    // This fixes the 'TLS-related' error when downloading Google Fonts
    turbopackUseSystemTlsCerts: true,
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'cdn.discordapp.com' },
    ],
  },
};

export default nextConfig;