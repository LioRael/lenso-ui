import { createParser, createSerializer } from "nuqs/server";

import {
  defaultThemeVariables,
  validateBuilderSettings,
  type BuilderSettings,
} from "./theme-builder-model";

// Query input has a different trust boundary from native controls. Validate each
// field against the same domain guard so a bad field does not discard good ones.
function settingParser<K extends keyof BuilderSettings>(key: K, numeric = false) {
  return createParser<NonNullable<BuilderSettings[K]>>({
    parse: (raw) => {
      if (raw.length > 2048 || raw.trim() !== raw || !raw.length) return null;
      if (numeric && !/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?$/i.test(raw)) return null;
      const value = numeric
        ? Number(raw)
        : key === "vibrantPalette"
          ? raw === "true"
            ? true
            : raw === "false"
              ? false
              : null
          : raw;
      if (value === null) return null;
      try {
        return validateBuilderSettings({ ...defaultThemeVariables, [key]: value })[
          key
        ] as NonNullable<BuilderSettings[K]>;
      } catch {
        return null;
      }
    },
    serialize: String,
  });
}

export const builderQueryParsers = {
  base: settingParser("base", true).withDefault(defaultThemeVariables.base),
  chroma: settingParser("chroma", true).withDefault(defaultThemeVariables.chroma),
  hue: settingParser("hue", true).withDefault(defaultThemeVariables.hue),
  lightness: settingParser("lightness", true).withDefault(defaultThemeVariables.lightness),
  fontFamily: settingParser("fontFamily").withDefault(defaultThemeVariables.fontFamily),
  radius: settingParser("radius").withDefault(defaultThemeVariables.radius),
  formRadius: settingParser("formRadius").withDefault(defaultThemeVariables.formRadius),
  vibrantPalette: settingParser("vibrantPalette"),
};

export function builderQueryValues(settings: BuilderSettings) {
  const validated = validateBuilderSettings(settings);
  return { ...validated, vibrantPalette: validated.vibrantPalette ?? null };
}

export function settingsFromQuery(query: ReturnType<typeof builderQueryValues>): BuilderSettings {
  const { vibrantPalette, ...settings } = query;
  return validateBuilderSettings({
    ...settings,
    ...(vibrantPalette === null ? {} : { vibrantPalette }),
  });
}

const serialize = createSerializer(builderQueryParsers);

/** Start fresh rather than propagating unrelated query keys or secrets. */
export function builderShareURL(origin: string, pathname: string, settings: BuilderSettings) {
  return new URL(`${pathname}${serialize(builderQueryValues(settings))}`, origin).href;
}
