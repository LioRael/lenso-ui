module.exports = {
  plugins: {
    "@stylexjs/postcss-plugin": {
      babelConfig: {
        babelrc: false,
        parserOpts: {
          plugins: ["typescript", "jsx"],
        },
        plugins: [
          [
            "@stylexjs/babel-plugin",
            {
              enableInlinedConditionalMerge: true,
              runtimeInjection: false,
              treeshakeCompensation: true,
              unstable_moduleResolution: {
                type: "commonJS",
              },
            },
          ],
        ],
      },
      include: ["app/**/*.{js,jsx,ts,tsx}", "components/**/*.{js,jsx,ts,tsx}"],
      useCSSLayers: true,
    },
    autoprefixer: {},
  },
};
