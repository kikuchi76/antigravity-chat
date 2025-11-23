import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  devIndicators: {
    // @ts-ignore
    appIsrStatus: false,
    // @ts-ignore
    buildActivity: false,
  },
};

export default nextConfig;
