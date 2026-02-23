// [1]
import type { NextConfig } from "next";

// Why: Next.js 15 clean setup. Removed the deprecated experimental block.
const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'cdn.discordapp.com' },
    ],
  },
// [11]
};

export default nextConfig;
// [14]