"use client";

// Adapted from HeroUI v3.2.6 design-theme.ts and DesignThemeSelector, Apache-2.0.
// Modified: one shared preference owner, guarded storage and model-generated scoped CSS.
import {
  createContext,
  useContext,
  useEffect,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import {
  builderVariables,
  getBuilderFont,
  themeIds,
  themeValuesById,
  type ThemeId,
} from "@/lib/theme-builder-model";

export const DESIGN_THEME_STORAGE_KEY = "lenso:docs:design-theme";
export const VIBRANT_STORAGE_KEY = "lenso:docs:vibrant-palette";

export function isDocsDesignTheme(value: unknown): value is ThemeId {
  return typeof value === "string" && themeIds.some((id) => id === value);
}

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
function designThemeCSS() {
  return themeIds
    .flatMap((id) =>
      (["light", "dark"] as const).flatMap((mode) =>
        [false, true].map((vibrant) => {
          if (id === "default" && !vibrant) return "";
          const settings = themeValuesById[id];
          const plain = builderVariables({ ...settings, vibrantPalette: false }, mode);
          const variables = builderVariables({ ...settings, vibrantPalette: vibrant }, mode);
          const declarations = Object.entries(variables)
            .filter(([key, value]) => id !== "default" || value !== plain[key])
            .map(([key, value]) => `${key}:${value};`)
            .join("");
          const preset =
            id === "default"
              ? ":not([data-lenso-design-theme])"
              : `[data-lenso-design-theme="${id}"]`;
          const palette = vibrant
            ? '[data-lenso-vibrant-palette="true"]'
            : ":not([data-lenso-vibrant-palette])";
          return `:root${preset}${mode === "dark" ? ".dark" : ":not(.dark)"}${palette}{${declarations}}`;
        }),
      ),
    )
    .join("\n");
}

const presetCSS = designThemeCSS();
interface DesignPreference {
  active: ThemeId;
  vibrant: boolean;
}
interface DocsDesignTheme extends DesignPreference {
  setActive: (id: ThemeId) => void;
  setVibrant: (value: boolean) => void;
}
const DesignThemeContext = createContext<DocsDesignTheme | null>(null);
const defaultPreference: DesignPreference = { active: "default", vibrant: false };

function createPreferenceStore() {
  let preference = defaultPreference;
  const listeners = new Set<() => void>();
  function update(next: DesignPreference) {
    if (next.active === preference.active && next.vibrant === preference.vibrant) return;
    preference = next;
    listeners.forEach((listener) => listener());
  }
  function readStored() {
    update({ active: storedTheme(), vibrant: readPreference(VIBRANT_STORAGE_KEY) === "true" });
  }
  function syncStorage(event: StorageEvent) {
    if (event.key === null) readStored();
    else if (event.key === DESIGN_THEME_STORAGE_KEY)
      update({
        ...preference,
        active: isDocsDesignTheme(event.newValue) ? event.newValue : "default",
      });
    else if (event.key === VIBRANT_STORAGE_KEY)
      update({ ...preference, vibrant: event.newValue === "true" });
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
    setActive(id: ThemeId) {
      if (!isDocsDesignTheme(id)) return;
      update({ ...preference, active: id });
      writePreference(DESIGN_THEME_STORAGE_KEY, id);
    },
    setVibrant(value: boolean) {
      update({ ...preference, vibrant: value });
      writePreference(VIBRANT_STORAGE_KEY, String(value));
    },
  };
}

export function DocsDesignThemeProvider({ children }: { children: ReactNode }) {
  const [store] = useState(createPreferenceStore);
  const { active, vibrant } = useSyncExternalStore(
    store.subscribe,
    store.getSnapshot,
    store.getServerSnapshot,
  );

  useEffect(() => {
    const root = document.documentElement;
    if (active === "default") root.removeAttribute("data-lenso-design-theme");
    else root.setAttribute("data-lenso-design-theme", active);
    if (vibrant) root.setAttribute("data-lenso-vibrant-palette", "true");
    else root.removeAttribute("data-lenso-vibrant-palette");
    return () => {
      root.removeAttribute("data-lenso-design-theme");
      root.removeAttribute("data-lenso-vibrant-palette");
    };
  }, [active, vibrant]);

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

  return (
    <DesignThemeContext
      value={{ active, vibrant, setActive: store.setActive, setVibrant: store.setVibrant }}
    >
      <style data-lenso-docs-design-theme="">{presetCSS}</style>
      {children}
    </DesignThemeContext>
  );
}

export function useDocsDesignTheme() {
  const context = useContext(DesignThemeContext);
  if (!context) throw new Error("DocsThemePicker requires DocsDesignThemeProvider");
  return context;
}
