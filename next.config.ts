import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.discordapp.com', // Allow Discord Avatars
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com', // (Optional) If you use Google Auth later
      }
    ],
  },
};