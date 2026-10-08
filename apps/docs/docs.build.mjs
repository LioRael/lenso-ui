import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const stylexLoader = {
  loader: require.resolve("@lenso/stylex-build/webpack-loader"),
  options: { unstable_moduleResolution: { type: "commonJS" } },
};

export default {
  allowedDevOrigins: ["127.0.0.1"],
  experimental: {
    forceSwcTransforms: true,
    turbopackUseBuiltinBabel: false,
    optimizePackageImports: ["@lenso/ui"],
  },
  transpilePackages: ["@lenso/tokens", "@lenso/docs"],
  turbopack: {
    root: fileURLToPath(new URL("../../", import.meta.url)),
    rules: {
      "*": {
        condition: {
          all: ["development", { not: "foreign" }, { path: /^apps\/docs\/src\/.*\.[cm]?[jt]sx?$/ }],
        },
        // Keep the original TS/TSX type for Next's own SWC transform.
        loaders: [stylexLoader],
      },
    },
  },
  webpack(config) {
    config.module.rules.push({
      test: /\.[cm]?[jt]sx?$/,
      include: fileURLToPath(new URL("./src/", import.meta.url)),
      enforce: "pre",
      use: [stylexLoader],
    });
    return config;
  },
};
