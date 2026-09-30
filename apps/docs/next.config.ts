import type { NextConfig } from "next";
import stylex from "@stylexjs/unplugin";

const config: NextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@lenso/ui", "@lenso/tokens"],
  webpack(config) {
    // Unplugin keeps extracted StyleX rules in memory, not Webpack's cached-module metadata.
    // Reusing transformed modules can emit class names without their CSS on a later build.
    config.cache = false;
    config.plugins.push(
      stylex.webpack({
        // Match precompiled package property keys so xstyle overrides work in development too.
        dev: false,
        useCSSLayers: false,
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
