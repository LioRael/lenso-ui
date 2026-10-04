import type { NextConfig } from "next";
import stylex from "@lenso/stylex-build";

const config: NextConfig = {
  reactStrictMode: true,
  output: "export",
  images: { unoptimized: true },
  transpilePackages: ["@lenso/ui", "@lenso/tokens"],
  webpack(config) {
    // Unplugin keeps extracted StyleX rules in memory, not Webpack's cached-module metadata.
    // Reusing transformed modules can emit class names without their CSS on a later build.
    config.cache = false;
    config.plugins.push(
      stylex.webpack({
        metadata: [import.meta.resolve("@lenso/tokens/stylex-rules.json")],
        // Native API tables render only on the server; their declaration is absent from the client graph.
        sources: [new URL("./src/styles/api-reference.stylex.ts", import.meta.url)],
        // Keep :dir(rtl) native; language inference breaks English-language RTL scopes.
        lightningcssOptions: { exclude: 4 },
        unstable_moduleResolution: {
          type: "commonJS",
          rootDir: import.meta.dirname,
        },
      }),
    );
    return config;
  },
};

export default config;
