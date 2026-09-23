import { playwright } from "@vitest/browser-playwright";
import stylex from "@stylexjs/unplugin/vite";
import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: { dedupe: ["react", "react-dom"] },
  optimizeDeps: {
    include: [
      "react",
      "react-dom/client",
      "react/jsx-runtime",
      "@base-ui/react/merge-props",
      "@base-ui/react/use-render",
      "@base-ui/react/combobox",
      "@base-ui/react/select",
      "@base-ui/react/slider",
      "@base-ui/react/switch",
    ],
  },
  plugins: [stylex({ devMode: "full", useCSSLayers: true })],
  test: {
    browser: {
      enabled: true,
      expect: {
        toMatchScreenshot: {
          resolveScreenshotPath: ({
            arg,
            browserName,
            ext,
            root,
            screenshotDirectory,
            testFileDirectory,
            testFileName,
          }) =>
            path.resolve(
              root,
              testFileDirectory,
              screenshotDirectory,
              testFileName,
              `${arg}-${browserName}${ext}`,
            ),
        },
      },
      headless: true,
      instances: [{ browser: process.env.VITEST_BROWSER ?? "chromium" }],
      provider: playwright(),
      viewport: { height: 900, width: 1280 },
    },
    include: [
      "react",
      "react-dom/client",
      "react/jsx-runtime",
      "@base-ui/react/merge-props",
      "@base-ui/react/use-render",
      "src/**/*.browser.test.tsx",
    ],
  },
});
