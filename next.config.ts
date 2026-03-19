import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.pokemontcg.io" },
      { protocol: "https", hostname: "**.pokemontcg.io" },
      { protocol: "https", hostname: "**.tcgplayer.com" },
      { protocol: "https", hostname: "**.ebay.com" },
      { protocol: "https", hostname: "**.bulbagarden.net" },
      { protocol: "https", hostname: "**.cardmarket.com" },
    ],
  },
};

export default nextConfig;
