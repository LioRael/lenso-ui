import type { NextConfig } from "next";
import createMDX from "@next/mdx";

const config: NextConfig = {
  output: "export",
  pageExtensions: ["js", "jsx", "md", "mdx", "ts", "tsx"],
  reactStrictMode: true,
  transpilePackages: ["@lenso/primitives", "@lenso/tokens", "@lenso/ui"],
};

export default createMDX()(config);
