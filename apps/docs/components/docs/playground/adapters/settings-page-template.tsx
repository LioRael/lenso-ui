"use client";

import { ThemeScope } from "@lenso/ui/theme-scope";

import { SettingsPage } from "../../../templates/settings-page";
import type { PlaygroundAdapter } from "../types";
import styles from "./template-pages.module.css";

export const settingsPageAdapter: PlaygroundAdapter = ({ theme }) => (
  <ThemeScope className={`stage-canvas ${styles.stage}`} theme={theme}>
    <div className={styles.frame}>
      <SettingsPage as="div" idPrefix="settings-template-preview" />
    </div>
  </ThemeScope>
);
