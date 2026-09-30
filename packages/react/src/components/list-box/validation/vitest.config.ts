import { defineConfig } from "vitest/config";
import { playwright } from "@vitest/browser-playwright";
import stylex from "@stylexjs/unplugin";
import path from "node:path";
export default defineConfig({
  plugins: [
    stylex.vite({
      useCSSLayers: false,
      unstable_moduleResolution: { type: "commonJS", rootDir: process.cwd() },
    }),
  ],
  resolve: {
    alias: Object.fromEntries(
      ["list-box", "list-box-item", "list-box-section", "tag", "tag-group", "table"].map(
        (family) => [
          `@lenso/tokens/${family}`,
          path.resolve(`packages/styles/src/components/${family}/index.ts`),
        ],
      ),
    ),
  },
  test: {
    include: ["packages/react/src/components/**/*.browser.test.tsx"],
    browser: {
      enabled: true,
      provider: playwright(),
      headless: true,
      instances: [{ browser: "chromium" }],
    },
  },
});
