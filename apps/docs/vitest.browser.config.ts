import { playwright } from "@vitest/browser-playwright";
import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

export default defineConfig({
  oxc: { jsx: { runtime: "automatic" } },
  optimizeDeps: {
    include: [
      "react",
      "react-dom",
      "react/jsx-dev-runtime",
      "react/jsx-runtime",
      "vitest-browser-react",
    ],
  },
  resolve: {
    alias: {
      "next/link": fileURLToPath(new URL("./test/mocks/next-link.tsx", import.meta.url)),
      "next/navigation": fileURLToPath(new URL("./test/mocks/next-navigation.ts", import.meta.url)),
    },
    dedupe: ["react", "react-dom"],
  },
  test: {
    browser: {
      enabled: true,
      fileParallelism: false,
      headless: true,
      instances: [{ browser: "chromium" }],
      provider: playwright(),
      viewport: { height: 812, width: 375 },
    },
    include: ["components/docs/**/*.browser.test.tsx"],
  },
});
