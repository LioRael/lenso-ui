"use client";

import { createContext, useContext } from "react";
import { themeIds, type ThemeId } from "@/lib/theme-builder-model";

export const MATERIAL_VERSION_STORAGE_KEY = "lenso:docs:material-version";
export type DocsMaterialVersion = "ios26" | "ios27";
export function isDocsMaterialVersion(value: unknown): value is DocsMaterialVersion {
  return value === "ios26" || value === "ios27";
}

export const DESIGN_THEME_STORAGE_KEY = "lenso:docs:design-theme";
export const GLASS_TINT_STORAGE_KEY = "lenso:docs:glass-tint";
export function isDocsDesignTheme(value: unknown): value is ThemeId {
  return typeof value === "string" && themeIds.some((id) => id === value);
}

export interface DesignPreference {
  active: ThemeId;
  materialVersion: DocsMaterialVersion;
  glassTint: number;
}
interface DocsDesignTheme extends DesignPreference {
  setActive: (id: ThemeId) => void;
  setMaterialVersion: (version: DocsMaterialVersion) => void;
  setGlassTint: (value: number) => void;
}
export const DesignThemeContext = createContext<DocsDesignTheme | null>(null);

export function useDocsDesignTheme() {
  const context = useContext(DesignThemeContext);
  if (!context) throw new Error("DocsThemePicker requires DocsDesignThemeProvider");
  return context;
}
