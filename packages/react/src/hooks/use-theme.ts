"use client";
import { useCallback, useRef, useState, useSyncExternalStore } from "react";
import { useIsomorphicLayoutEffect } from "./use-isomorphic-layout-effect.js";

export type Theme = string;
export interface UseThemeReturn {
  theme: Theme;
  resolvedTheme: string | undefined;
  setTheme(theme: Theme): void;
}
const storageKey = "heroui-theme";
const query = "(prefers-color-scheme: dark)";
function subscribe(callback: () => void): () => void {
  if (typeof window === "undefined" || !window.matchMedia) return () => {};
  const media = window.matchMedia(query);
  if (media.addEventListener) media.addEventListener("change", callback);
  else media.addListener(callback);
  return () => {
    if (media.removeEventListener) media.removeEventListener("change", callback);
    else media.removeListener(callback);
  };
}
const snapshot = (): "light" | "dark" => (window.matchMedia?.(query).matches ? "dark" : "light");
const serverSnapshot = (): undefined => undefined;

/** HeroUI v3.2.6 theme intent/system model; unavailable storage never prevents switching. */
export function useTheme(defaultTheme: Theme = "system"): UseThemeReturn {
  const [theme, setState] = useState<Theme>(() => {
    if (typeof window === "undefined") return defaultTheme;
    try {
      return window.localStorage.getItem(storageKey) ?? defaultTheme;
    } catch {
      return defaultTheme;
    }
  });
  const system = useSyncExternalStore(subscribe, snapshot, serverSnapshot);
  const resolvedTheme = theme === "system" ? system : theme;
  const previous = useRef<string | undefined>(undefined);
  useIsomorphicLayoutEffect(() => {
    if (!resolvedTheme || previous.current === resolvedTheme) return;
    if (previous.current) document.documentElement.classList.remove(previous.current);
    document.documentElement.classList.add(resolvedTheme);
    document.documentElement.setAttribute("data-theme", resolvedTheme);
    previous.current = resolvedTheme;
  }, [resolvedTheme]);
  const setTheme = useCallback((next: Theme) => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(storageKey, next);
    } catch {
      // Sandboxed documents and privacy settings may deny storage, but not local theme changes.
    }
    setState(next);
  }, []);
  return { theme, resolvedTheme, setTheme };
}
