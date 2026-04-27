import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Ensure markdown files in /content/runs/ aren't treated as routes
  pageExtensions: ["tsx", "ts", "jsx", "js"],
};

export default nextConfig;
