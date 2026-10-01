import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The game's first address was /paradise; keep it working.
  async redirects() {
    return [{ source: "/paradise", destination: "/create-your-world", permanent: false }];
  },
};

export default nextConfig;
