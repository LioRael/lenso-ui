const path = require("node:path");
const babelConfig = require("./babel.config.json");

module.exports = {
  plugins: {
    "@stylexjs/postcss-plugin": {
      // One union includes server-only declarations and the canonical library sources.
      include: [
        path.join(__dirname, "src/**/*.{js,jsx,ts,tsx}"),
        path.join(__dirname, "../../packages/styles/src/**/*.{js,jsx,ts,tsx}"),
      ],
      babelConfig: {
        babelrc: false,
        configFile: false,
        parserOpts: { plugins: ["typescript", "jsx"] },
        plugins: babelConfig.plugins,
      },
      useCSSLayers: false,
    },
  },
};
