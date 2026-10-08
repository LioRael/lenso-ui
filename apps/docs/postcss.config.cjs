const path = require("node:path");

module.exports = {
  plugins: {
    "@lenso/stylex-build/postcss": {
      include: [path.join(__dirname, "src/**/*.{js,jsx,ts,tsx}")],
      metadata: [
        require.resolve("@lenso/tokens/stylex-rules.json"),
        require.resolve("@lenso/docs/stylex-rules.json"),
      ],
      unstable_moduleResolution: { type: "commonJS" },
    },
  },
};
