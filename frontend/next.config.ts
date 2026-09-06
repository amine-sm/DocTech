
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Génère le site statique dans le dossier /out
  output: "export",

  // Permet les URLs avec / à la fin
  trailingSlash: true,

  images: {
    // IMPORTANT pour un export statique :
    // Next/Image ne peut pas utiliser l'optimisation serveur
    unoptimized: true,

    formats: ["image/avif", "image/webp"],

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

