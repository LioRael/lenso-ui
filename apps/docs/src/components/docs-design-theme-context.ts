"use client";

import { createContext, useContext } from "react";
import { themeIds, type ThemeId } from "@/lib/docs-theme-presets";

export const DESIGN_THEME_STORAGE_KEY = "lenso:docs:design-theme";
export const GLASS_TINT_STORAGE_KEY = "lenso:docs:glass-tint";
export function isDocsDesignTheme(value: unknown): value is ThemeId {
  return typeof value === "string" && themeIds.some((id) => id === value);
}

export interface DesignPreference {
  active: ThemeId;
  glassTint: number;
}
interface DocsDesignTheme extends DesignPreference {
  setActive: (id: ThemeId) => void;
  setGlassTint: (value: number) => void;
}
export const DesignThemeContext = createContext<DocsDesignTheme | null>(null);

export function useDocsDesignTheme() {
  const context = useContext(DesignThemeContext);
  if (!context) throw new Error("DocsThemePicker requires DocsDesignThemeProvider");
  return context;
}
