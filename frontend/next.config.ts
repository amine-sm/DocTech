import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",

  trailingSlash: true,

  images: {
    unoptimized: true,

    qualities: [50, 75, 90, 92, 100],

    remotePatterns: [
      {
        protocol: "http",
        hostname: "**",
      },
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
};

export default nextConfig;