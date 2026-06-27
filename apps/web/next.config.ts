import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Drink photos come from TheCocktailDB; allow next/image to optimize them.
    remotePatterns: [
      {
        protocol: "https",
        hostname: "www.thecocktaildb.com",
        pathname: "/images/media/drink/**",
      },
    ],
  },
};

export default nextConfig;
