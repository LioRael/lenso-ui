import type { NextConfig } from "next";
import createMDX from "@next/mdx";
import { withContentCollections } from "@content-collections/next";

const config: NextConfig = {
  output: "export",
  pageExtensions: ["js", "jsx", "md", "mdx", "ts", "tsx"],
  reactStrictMode: true,
  experimental: {
    turbopackFileSystemCacheForBuild: false,
  },
  transpilePackages: ["@lenso/primitives", "@lenso/tokens", "@lenso/ui"],
};

const withMDX = createMDX({
  options: {
    remarkPlugins: ["remark-frontmatter"],
  },
});

export default withContentCollections(withMDX(config));
