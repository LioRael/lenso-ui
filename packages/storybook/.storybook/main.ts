import type { StorybookConfig } from "@storybook/react-vite";
import stylex from "@lenso/stylex-build";
import { mergeConfig } from "vite";

const config: StorybookConfig = {
  stories: ["../stories/**/*.stories.tsx"],
  addons: ["@storybook/addon-docs", "@storybook/addon-a11y"],
  framework: "@storybook/react-vite",
  async viteFinal(config) {
    return mergeConfig(config, {
      plugins: [
        stylex.vite({
          metadata: [new URL(import.meta.resolve("@lenso/tokens/stylex-rules.json"))],
          // Preserve native :dir(): Lightning CSS's :lang() fallback misclassifies English RTL content.
          lightningcssOptions: { exclude: 4 },
          unstable_moduleResolution: { type: "commonJS", rootDir: process.cwd() },
        }),
      ],
    });
  },
};
export default config;
