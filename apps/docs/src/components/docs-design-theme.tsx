"use client";
import { themeToCSS } from "@lenso/tokens";

// Adapted from HeroUI v3.2.6 design-theme.ts and DesignThemeSelector, Apache-2.0.
// Modified: one shared preference owner, guarded storage and model-generated scoped CSS.
import { useEffect, useState, useSyncExternalStore, type ReactNode } from "react";
import {
  builderVariables,
  builderTheme,
  getBuilderFont,
  themeIds,
  themeValuesById,
  type ThemeId,
} from "@/lib/theme-builder-model";

import {
  DesignThemeContext,
  DESIGN_THEME_STORAGE_KEY,
  GLASS_TINT_STORAGE_KEY,
  MATERIAL_VERSION_STORAGE_KEY,
  isDocsDesignTheme,
  isDocsMaterialVersion,
  type DesignPreference,
  type DocsMaterialVersion,
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
  return themeIds
    .filter((id) => id !== "default" && id === active)
    .map((id) => {
      const settings = themeValuesById[id];
      const generated = builderTheme(settings);
      const colorAndFont = (values: typeof generated.light) =>
        Object.fromEntries(
          Object.entries(values ?? {}).filter(
            ([key]) => key !== "shape-content" && key !== "shape-field",
          ),
        );
      const theme = {
        ...generated,
        name: `docs-${id}`,
        light: colorAndFont(generated.light),
        dark: colorAndFont(generated.dark),
      };
      const font = getBuilderFont(settings.fontFamily);
      const css = themeToCSS(theme)
        .replaceAll(`[data-lenso-theme="${theme.name}"]`, `[data-lenso-design-theme="${id}"]`)
        .replace(
          /\[data-theme="(light|dark)"\]/g,
          (_, mode: string) => `:is(.${mode}, [data-theme="${mode}"])`,
        );
      return `[data-lenso-design-theme="${id}"] {${font.variable}:${builderVariables(settings, "light")[font.variable]};}\n${css}`;
    })
    .join("\n");
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
  materialVersion: "ios27",
  glassTint: 0.5,
};

function createPreferenceStore() {
  let preference = defaultPreference;
  const listeners = new Set<() => void>();
  function update(next: DesignPreference) {
    if (
      next.active === preference.active &&
      next.materialVersion === preference.materialVersion &&
      next.glassTint === preference.glassTint
    )
      return;
    preference = next;
    listeners.forEach((listener) => listener());
  }
  function readStored() {
    const value = readPreference(MATERIAL_VERSION_STORAGE_KEY);
    update({
      active: storedTheme(),
      materialVersion: isDocsMaterialVersion(value) ? value : "ios27",
      glassTint: validTint(readPreference(GLASS_TINT_STORAGE_KEY)),
    });
  }
  function syncStorage(event: StorageEvent) {
    if (event.key === null) readStored();
    else if (event.key === GLASS_TINT_STORAGE_KEY)
      update({ ...preference, glassTint: validTint(event.newValue) });
    else if (event.key === MATERIAL_VERSION_STORAGE_KEY)
      update({
        ...preference,
        materialVersion: isDocsMaterialVersion(event.newValue) ? event.newValue : "ios27",
      });
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
    setMaterialVersion(version: DocsMaterialVersion) {
      update({ ...preference, materialVersion: version });
      writePreference(MATERIAL_VERSION_STORAGE_KEY, version);
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
  const { active, materialVersion, glassTint } = useSyncExternalStore(
    store.subscribe,
    store.getSnapshot,
    store.getServerSnapshot,
  );

  useEffect(() => {
    document.documentElement.setAttribute("data-material-version", materialVersion);
    return () => document.documentElement.removeAttribute("data-material-version");
  }, [materialVersion]);

  useEffect(() => {
    const root = document.documentElement;
    if (active === "default") root.removeAttribute("data-lenso-design-theme");
    else root.setAttribute("data-lenso-design-theme", active);
    return () => {
      root.removeAttribute("data-lenso-design-theme");
    };
  }, [active]);

  useEffect(() => {
    if (active === "default") return;
    const font = getBuilderFont(themeValuesById[active].fontFamily);
    if (font.id === "inter") return;
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = font.cdnUrl;
    document.head.append(link);
    return () => link.remove();
  }, [active]);

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--lenso-glass-tint-amount", String(glassTint));
    return () => {
      root.style.removeProperty("--lenso-glass-tint-amount");
    };
  }, [glassTint]);

  return (
    <DesignThemeContext
      value={{
        active,
        setActive: store.setActive,
        materialVersion,
        setMaterialVersion: store.setMaterialVersion,
        glassTint,
        setGlassTint: store.setGlassTint,
      }}
    >
      <style data-lenso-docs-design-theme="">{activePresetCSS(active)}</style>
      {children}
    </DesignThemeContext>
  );
}
