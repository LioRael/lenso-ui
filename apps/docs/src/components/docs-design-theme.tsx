"use client";
import { themeToCSS } from "@lenso/tokens";
import { GlassProvider } from "@lenso/ui";

// Modified: one shared preference owner, guarded storage and model-generated scoped CSS.
import { useEffect, useState, useSyncExternalStore, type ReactNode } from "react";
import { docsPresetTheme, type ThemeId } from "@/lib/docs-theme-presets";

import {
  DesignThemeContext,
  DESIGN_THEME_STORAGE_KEY,
  GLASS_TINT_STORAGE_KEY,
  isDocsDesignTheme,
  type DesignPreference,
} from "./docs-design-theme-context";

const validTint = (value: string | number | null): number => {
  const number = value === null || value === "" ? NaN : Number(value);
  return Number.isFinite(number) ? Math.max(0, Math.min(1, number)) : 0.5;
};

function readPreference(key: string) {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function writePreference(key: string, value: string) {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // The current session remains usable when persistence is blocked.
  }
}

function storedTheme() {
  const value = readPreference(DESIGN_THEME_STORAGE_KEY);
  return isDocsDesignTheme(value) ? value : "default";
}

/** Only trusted catalog entries reach CSS; user preferences select an existing rule. */
function designThemeCSS(active: ThemeId) {
  if (active === "default") return "";
  const theme = docsPresetTheme(active);
  return themeToCSS(theme)
    .replaceAll(`[data-lenso-theme="${theme.name}"]`, `[data-lenso-design-theme="${active}"]`)
    .replace(
      /\[data-theme="(light|dark)"\]/g,
      (_, mode: string) => `:is(.${mode}, [data-theme="${mode}"])`,
    );
}

const presetCSS = new Map<ThemeId, string>();
function activePresetCSS(active: ThemeId) {
  let css = presetCSS.get(active);
  if (css === undefined) {
    css = designThemeCSS(active);
    presetCSS.set(active, css);
  }
  return css;
}
const defaultPreference: DesignPreference = {
  active: "default",
  glassTint: 0.5,
};

function createPreferenceStore() {
  let preference = defaultPreference;
  const listeners = new Set<() => void>();
  function update(next: DesignPreference) {
    if (next.active === preference.active && next.glassTint === preference.glassTint) return;
    preference = next;
    listeners.forEach((listener) => listener());
  }
  function readStored() {
    update({
      active: storedTheme(),
      glassTint: validTint(readPreference(GLASS_TINT_STORAGE_KEY)),
    });
  }
  function syncStorage(event: StorageEvent) {
    if (event.key === null) readStored();
    else if (event.key === GLASS_TINT_STORAGE_KEY)
      update({ ...preference, glassTint: validTint(event.newValue) });
    else if (event.key === DESIGN_THEME_STORAGE_KEY)
      update({
        ...preference,
        active: isDocsDesignTheme(event.newValue) ? event.newValue : "default",
      });
  }
  return {
    getSnapshot: () => preference,
    getServerSnapshot: () => defaultPreference,
    subscribe(listener: () => void) {
      listeners.add(listener);
      if (listeners.size === 1) {
        readStored();
        window.addEventListener("storage", syncStorage);
      }
      return () => {
        listeners.delete(listener);
        if (!listeners.size) window.removeEventListener("storage", syncStorage);
      };
    },
    setGlassTint(value: number) {
      const glassTint = validTint(value);
      update({ ...preference, glassTint });
      writePreference(GLASS_TINT_STORAGE_KEY, String(glassTint));
    },
    setActive(id: ThemeId) {
      if (!isDocsDesignTheme(id)) return;
      update({ ...preference, active: id });
      writePreference(DESIGN_THEME_STORAGE_KEY, id);
    },
  };
}

export function DocsDesignThemeProvider({ children }: { children: ReactNode }) {
  const [store] = useState(createPreferenceStore);
  const { active, glassTint } = useSyncExternalStore(
    store.subscribe,
    store.getSnapshot,
    store.getServerSnapshot,
  );

  useEffect(() => {
    const root = document.documentElement;
    if (active === "default") root.removeAttribute("data-lenso-design-theme");
    else root.setAttribute("data-lenso-design-theme", active);
    return () => {
      root.removeAttribute("data-lenso-design-theme");
    };
  }, [active]);

  return (
    <DesignThemeContext
      value={{
        active,
        setActive: store.setActive,
        glassTint,
        setGlassTint: store.setGlassTint,
      }}
    >
      <GlassProvider tint={glassTint} onTintChange={store.setGlassTint}>
        <style data-lenso-docs-design-theme="">{activePresetCSS(active)}</style>
        {children}
      </GlassProvider>
    </DesignThemeContext>
  );
}
