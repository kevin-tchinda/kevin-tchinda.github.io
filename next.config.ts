import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  "allowedDevOrigins": [
  '192.168.2.13',
  '192.168.2.13:3000',
  'localhost',
  'localhost:3000',
  ],
};

export default nextConfig;
