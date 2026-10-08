import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow the sandbox live-preview domains to load dev assets and HMR.
  allowedDevOrigins: ["*.e2b.app"],
};

export default nextConfig;
