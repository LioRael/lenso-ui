import path from "node:path";

import stylex from "@stylexjs/unplugin/rolldown";
import { defineConfig } from "tsdown";

const source = (name: string): string => path.resolve(import.meta.dirname, `src/${name}/index.tsx`);

export default defineConfig({
  deps: {
    neverBundle: ["@base-ui/react", "react", "react-dom"],
  },
  dts: false,
  entry: {
    "avatar/index": source("avatar"),
    "breadcrumb/index": source("breadcrumb"),
    "button/index": source("button"),
    "checkbox/index": source("checkbox"),
    "combobox/index": source("combobox"),
    "command-menu/index": source("command-menu"),
    "csp-provider/index": source("csp-provider"),
    "dialog/index": source("dialog"),
    "disclosure/index": source("disclosure"),
    "icon-button/index": source("icon-button"),
    "label/index": source("label"),
    "menu/index": source("menu"),
    "page-header/index": source("page-header"),
    "popover/index": source("popover"),
    "quick-link/index": source("quick-link"),
    "radio/index": source("radio"),
    "select/index": source("select"),
    "settings-row/index": source("settings-row"),
    "sidebar/index": source("sidebar"),
    "switch/index": source("switch"),
    "tabs/index": source("tabs"),
    "text-field/index": source("text-field"),
    "theme-scope/index": source("theme-scope"),
    "tooltip/index": source("tooltip"),
    "toast/index": source("toast"),
  },
  format: "esm",
  outDir: path.resolve(import.meta.dirname, "dist"),
  platform: "browser",
  plugins: [
    stylex({
      devMode: "off",
      useCSSLayers: true,
    }),
  ],
  report: false,
  tsconfig: path.resolve(import.meta.dirname, "tsconfig.json"),
});
