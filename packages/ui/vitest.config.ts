import { playwright } from "@vitest/browser-playwright";
import stylex from "@stylexjs/unplugin/vite";
import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
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
      instances: [{ browser: "chromium" }],
      provider: playwright(),
      viewport: { height: 900, width: 1280 },
    },
    include: ["src/**/*.browser.test.tsx"],
  },
});
