import type { StorybookConfig } from "@storybook/react-vite";
import stylex from "@stylexjs/unplugin";
import { mergeConfig } from "vite";

const config: StorybookConfig = {
  stories: ["../stories/**/*.stories.tsx"],
  addons: ["@storybook/addon-docs", "@storybook/addon-a11y"],
  framework: "@storybook/react-vite",
  async viteFinal(config) {
    return mergeConfig(config, {
      plugins: [
        stylex.vite({
          // Match precompiled package keys when composing consumer xstyle overrides.
          dev: false,
          useCSSLayers: false,
          // Preserve native :dir(): Lightning CSS's :lang() fallback misclassifies English RTL content.
          lightningcssOptions: { exclude: 4 },
          unstable_moduleResolution: { type: "commonJS", rootDir: process.cwd() },
        }),
      ],
    });
  },
};
export default config;
