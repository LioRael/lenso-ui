import type { NextConfig } from "next";

const config: NextConfig = {
  reactStrictMode: true,
  output: "export",
  images: { unoptimized: true },
  transpilePackages: ["@lenso/ui", "@lenso/tokens"],
  webpack(config) {
    // Next 16.3's Babel loader rewrites a locally bound module.exports in this
    // published ESM helper to CJS and ignores Babel's file-level ignore option.
    // Bypass only that precompiled helper, not authored StyleX or component code.
    for (const rule of config.module.rules) {
      if (rule && typeof rule === "object" && Array.isArray(rule.oneOf)) {
        rule.oneOf.unshift({
          test: /fumadocs-core[\\/]dist[\\/]remove-markdown-[^\\/]+\.js$/,
          type: "javascript/esm",
        });
      }
    }
    return config;
  },
};

export default config;
