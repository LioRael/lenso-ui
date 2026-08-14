import type { NextConfig } from "next";

const config: NextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@lenso/primitives", "@lenso/tokens", "@lenso/ui"],
};

export default config;
