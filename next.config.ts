import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [{ source: "/opengraph-image", destination: "/opengraph-image.png" }];
  },
};

export default nextConfig;
