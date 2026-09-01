"use client";

import * as stylex from "@stylexjs/stylex";
import { ThemeScope } from "@lenso/ui/theme-scope";

import { SettingsPage } from "../../../templates/settings-page";
import type { PlaygroundAdapter } from "../types";
import { styles } from "./template-pages.stylex";

export const settingsPageAdapter: PlaygroundAdapter = ({ theme }) => (
  <ThemeScope className={stylex.props(styles.stage).className} theme={theme}>
    <div {...stylex.props(styles.frame)}>
      <SettingsPage as="div" idPrefix="settings-template-preview" />
    </div>
  </ThemeScope>
);
