import { browserConfig } from "./src/browser.js";

export default browserConfig({
  resolve: { dedupe: ["react", "react-dom"] },
  oxc: { jsx: { runtime: "automatic" } },
  optimizeDeps: {
    include: [
      "@lenso/ui",
      "react/jsx-runtime",
      "@base-ui/react/direction-provider",
      "@base-ui/react/field",
    ],
  },
  test: {
    include: ["integration/**/*.browser.test.tsx"],
    setupFiles: ["./setup/browser.ts"],
    fileParallelism: false,
    browser: {
      viewport: { width: 1280, height: 900 },
      locators: { exact: false },
    },
  },
});
