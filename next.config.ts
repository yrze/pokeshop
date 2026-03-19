import path from "path";
import type { NextConfig } from "next";
import { fileURLToPath } from "url";

const projectDir = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  output: "standalone",
  outputFileTracingRoot: projectDir,
  turbopack: {
    root: projectDir,
  },
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
