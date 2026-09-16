import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: [
    "172.20.10.9",
    "192.168.10.174",
  ],
};

export default nextConfig;