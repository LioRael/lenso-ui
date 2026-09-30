import stylex from "@stylexjs/unplugin";
import { playwright } from "@vitest/browser-playwright";
import { defineConfig, mergeConfig, type ViteUserConfig } from "vitest/config";

export function browserConfig(overrides: ViteUserConfig = {}): ViteUserConfig {
  return mergeConfig(
    defineConfig({
      plugins: [
        stylex.vite({
          useCSSLayers: false,
          // Preserve native :dir(): Lightning CSS's :lang() fallback misclassifies English RTL content.
          lightningcssOptions: { exclude: 4 },
          unstable_moduleResolution: { type: "commonJS", rootDir: process.cwd() },
        }),
      ],
      test: {
        browser: {
          enabled: true,
          provider: playwright(),
          instances: [{ browser: "chromium" }],
          headless: true,
        },
      },
    }),
    overrides,
  );
}
