import type { NextConfig } from "next";

const config: NextConfig = {
  output: "export",
  reactStrictMode: true,
  transpilePackages: ["@lenso/primitives", "@lenso/tokens", "@lenso/ui"],
};

export default config;
