import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Suppress Lit dev mode warning
  env: {
    LIT_DEV_MODE_SUPPRESS: "true",
  },
};

export default nextConfig;
