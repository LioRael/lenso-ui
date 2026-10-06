/*
 * Copyright 2025 NextUI Inc.
 * SPDX-License-Identifier: Apache-2.0
 * Licensed under the Apache License, Version 2.0.
 * See third-party/heroui/LICENSE.txt for the full license.
 *
 * Adapted for Lenso from HeroUI v3.2.6, commit
 * e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e:
 * apps/docs/src/app/[lang]/themes/{constants.ts,theme-values.ts,
 * utils/generate-theme-colors.ts,utils/calculate-foreground.ts,
 * hooks/use-computed-theme-vars.ts}.
 * Changes: pure typed settings model; consolidate palette generation; validate
 * base overrides through @lenso/tokens; omit Tailwind aliases and CSS-owned
 * derivations. Fonts are selected from the source catalog, not arbitrary URLs.
 */
import {
  defineTheme,
  themeToVariables,
  type Theme,
  type ThemeMode,
  type ThemeOverrides,
  type ThemeToken,
} from "@lenso/tokens";

export const fontIds = [
  "inter",
  "figtree",
  "hanken-grotesk",
  "geist",
  "dm-sans",
  "public-sans",
  "google-sans",
  "bricolage-grotesque",
  "varela-round",
  "fraunces",
  "ibm-plex-mono",
  "fredoka",
  "jetbrains-mono",
  "instrument-sans",
] as const;
export type FontId = (typeof fontIds)[number];
export interface FontConfig {
  id: FontId;
  label: string;
  variable: string;
  cdnUrl: string;
}

export const fonts: readonly FontConfig[] = [
  {
    id: "inter",
    label: "Inter",
    variable: "--font-inter",
    cdnUrl: "https://fonts.googleapis.com/css2?family=Inter:wght@100..900&display=swap",
  },
  {
    id: "figtree",
    label: "Figtree",
    variable: "--font-figtree",
    cdnUrl: "https://fonts.googleapis.com/css2?family=Figtree:wght@300..900&display=swap",
  },
  {
    id: "hanken-grotesk",
    label: "Hanken Grotesk",
    variable: "--font-hanken-grotesk",
    cdnUrl: "https://fonts.googleapis.com/css2?family=Hanken+Grotesk:wght@100..900&display=swap",
  },
  {
    id: "geist",
    label: "Geist",
    variable: "--font-geist",
    cdnUrl: "https://fonts.googleapis.com/css2?family=Geist:wght@100..900&display=swap",
  },
  {
    id: "dm-sans",
    label: "DM Sans",
    variable: "--font-dm-sans",
    cdnUrl: "https://fonts.googleapis.com/css2?family=DM+Sans:wght@100..900&display=swap",
  },
  {
    id: "public-sans",
    label: "Public Sans",
    variable: "--font-public-sans",
    cdnUrl: "https://fonts.googleapis.com/css2?family=Public+Sans:wght@100..900&display=swap",
  },
  {
    id: "google-sans",
    label: "Google Sans",
    variable: "--font-google-sans",
    cdnUrl: "https://fonts.googleapis.com/css2?family=Google+Sans:wght@100..900&display=swap",
  },
  {
    id: "bricolage-grotesque",
    label: "Bricolage Grotesque",
    variable: "--font-bricolage-grotesque",
    cdnUrl:
      "https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@200..800&display=swap",
  },
  {
    id: "varela-round",
    label: "Varela Round",
    variable: "--font-varela-round",
    cdnUrl: "https://fonts.googleapis.com/css2?family=Varela+Round&display=swap",
  },
  {
    id: "fraunces",
    label: "Fraunces",
    variable: "--font-fraunces",
    cdnUrl: "https://fonts.googleapis.com/css2?family=Fraunces:wght@100..900&display=swap",
  },
  {
    id: "ibm-plex-mono",
    label: "IBM Plex Mono",
    variable: "--font-ibm-plex-mono",
    cdnUrl:
      "https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500;1,600;1,700&display=swap",
  },
  {
    id: "fredoka",
    label: "Fredoka",
    variable: "--font-fredoka",
    cdnUrl: "https://fonts.googleapis.com/css2?family=Fredoka:wght@300..700&display=swap",
  },
  {
    id: "jetbrains-mono",
    label: "JetBrains Mono",
    variable: "--font-jetbrains-mono",
    cdnUrl: "https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@100..800&display=swap",
  },
  {
    id: "instrument-sans",
    label: "Instrument Sans",
    variable: "--font-instrument-sans",
    cdnUrl: "https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@400..700&display=swap",
  },
];
export const fontMap = Object.fromEntries(fonts.map((font) => [font.id, font])) as Record<
  FontId,
  FontConfig
>;

/** Custom fonts stay on the source's public Google Fonts CDN; no arbitrary URL requests. */
export function getBuilderFont(id: string): Omit<FontConfig, "id"> & { id: string } {
  if (Object.hasOwn(fontMap, id)) return fontMap[id as FontId];
  const url = new URL(id);
  const familyQuery = url.searchParams.get("family");
  const family = familyQuery?.split(":")[0];
  if (
    url.protocol !== "https:" ||
    url.hostname !== "fonts.googleapis.com" ||
    !["/css", "/css2"].includes(url.pathname) ||
    url.username ||
    url.password ||
    url.hash ||
    url.port ||
    [...url.searchParams.keys()].some((key) => key !== "family" && key !== "display") ||
    (url.searchParams.has("display") &&
      !["auto", "block", "swap", "fallback", "optional"].includes(
        url.searchParams.get("display")!,
      )) ||
    url.searchParams.getAll("family").length !== 1 ||
    !familyQuery ||
    !/^[A-Za-z][A-Za-z0-9 -]{0,63}(?::[A-Za-z0-9@.,;+-]+)?$/.test(familyQuery) ||
    !family ||
    !/^[A-Za-z][A-Za-z0-9 -]{0,63}$/.test(family)
  )
    throw new TypeError("Use a public Google Fonts stylesheet URL with one font family");
  return {
    id,
    label: family,
    variable: `--font-${family.toLowerCase().replaceAll(" ", "-")}`,
    cdnUrl: url.href,
  };
}

export const radiusIds = [
  "none",
  "extra-small",
  "small",
  "medium",
  "large",
  "extra-large",
] as const;
export type RadiusId = (typeof radiusIds)[number];
export interface RadiusOption {
  id: RadiusId;
  label: string;
  description: string;
  cssValue: string;
}
export const formRadiusOptions: readonly RadiusOption[] = [
  { cssValue: "0", description: "none", id: "none", label: "-" },
  { cssValue: "0.125rem", description: "extra small", id: "extra-small", label: "XS" },
  { cssValue: "0.25rem", description: "small", id: "small", label: "S" },
  { cssValue: "0.5rem", description: "medium", id: "medium", label: "M" },
  { cssValue: "0.75rem", description: "large", id: "large", label: "L" },
  { cssValue: "1rem", description: "extra large", id: "extra-large", label: "XL" },
];
export const radiusOptions = formRadiusOptions.filter((option) => option.id !== "extra-large");
export const radiusCssMap = Object.fromEntries(
  formRadiusOptions.map((option) => [option.id, option.cssValue]),
) as Record<RadiusId, string>;

export interface BuilderSettings {
  /** Neutral palette chroma (upstream grayChroma). */
  base: number;
  chroma: number;
  hue: number;
  lightness: number;
  fontFamily: FontId | `https://fonts.googleapis.com/${string}`;
  radius: RadiusId;
  formRadius: RadiusId;
  vibrantPalette?: boolean;
}
export const DEFAULT_BASE = 0.0015;
export const defaultThemeVariables: BuilderSettings = {
  base: DEFAULT_BASE,
  chroma: 0.195,
  hue: 253.83,
  lightness: 0.6204,
  fontFamily: "inter",
  radius: "medium",
  formRadius: "large",
};
export const themeIds = [
  "default",
  "sky",
  "lavender",
  "mint",
  "netflix",
  "uber",
  "spotify",
  "coinbase",
  "airbnb",
  "discord",
  "rabbit",
] as const;
export type ThemeId = (typeof themeIds)[number];
export const themeValuesById: Record<ThemeId, BuilderSettings> = {
  default: { ...defaultThemeVariables },
  sky: { ...defaultThemeVariables, chroma: 0.16, hue: 225, lightness: 0.78 },
  lavender: { ...defaultThemeVariables, chroma: 0.13, hue: 305, lightness: 0.77 },
  mint: { ...defaultThemeVariables, chroma: 0.12, hue: 155, lightness: 0.82 },
  netflix: {
    base: 0,
    chroma: 0.2349,
    hue: 27.99,
    lightness: 0.5814,
    fontFamily: "inter",
    radius: "extra-small",
    formRadius: "extra-small",
  },
  uber: {
    base: 0,
    chroma: 0,
    hue: 0,
    lightness: 0,
    fontFamily: "inter",
    radius: "small",
    formRadius: "small",
  },
  spotify: {
    base: 0.002,
    chroma: 0.2124,
    hue: 148.67,
    lightness: 0.7697,
    fontFamily: "inter",
    radius: "medium",
    formRadius: "extra-small",
  },
  coinbase: {
    base: 0.002,
    chroma: 0.2628,
    hue: 262.87,
    lightness: 0.5282,
    fontFamily: "inter",
    radius: "medium",
    formRadius: "extra-small",
  },
  airbnb: {
    base: 0,
    chroma: 0.2309,
    hue: 17.07,
    lightness: 0.6579,
    fontFamily: "inter",
    radius: "medium",
    formRadius: "large",
  },
  discord: {
    base: 0.01,
    chroma: 0.2091,
    hue: 273.85,
    lightness: 0.5774,
    fontFamily: "inter",
    radius: "small",
    formRadius: "large",
  },
  rabbit: {
    base: 0.01,
    chroma: 0.2232,
    hue: 36.66,
    lightness: 0.6678,
    fontFamily: "inter",
    radius: "medium",
    formRadius: "extra-large",
  },
};
const presetLabels: Record<ThemeId, string> = {
  default: "Default",
  sky: "Sky",
  lavender: "Lavender",
  mint: "Mint",
  netflix: "Netflix",
  uber: "Uber",
  spotify: "Spotify",
  coinbase: "Coinbase",
  airbnb: "Airbnb",
  discord: "Discord",
  rabbit: "Rabbit",
};
export const themes = themeIds.map((id) => ({
  id,
  label: presetLabels[id],
  variables: themeValuesById[id],
}));
export const themeComparisonKeys = [
  "base",
  "chroma",
  "fontFamily",
  "formRadius",
  "hue",
  "lightness",
  "radius",
] as const;
export function findMatchingTheme(settings: BuilderSettings): ThemeId | undefined {
  return themeIds.find((id) =>
    themeComparisonKeys.every((key) => {
      const current = settings[key];
      const preset = themeValuesById[id][key];
      return typeof current === "number" && typeof preset === "number"
        ? Math.abs(current - preset) < 0.0001
        : current === preset;
    }),
  );
}

type SemanticName = "success" | "warning" | "danger";
interface SemanticColorOverride {
  color: string;
  foreground?: string;
}
type SemanticOverrides = Partial<
  Record<
    ThemeMode,
    Partial<Record<SemanticName, SemanticColorOverride>> & { accentForeground?: string }
  >
>;
const presetSemanticOverrides: Partial<Record<ThemeId, SemanticOverrides>> = {
  netflix: {
    light: {
      danger: { color: "oklch(0.4823 0.1938 27.64)" },
      success: { color: "oklch(0.5148 0.1337 146.82)" },
      warning: { color: "oklch(0.561 0.116571 78.9352)" },
    },
    dark: {
      danger: { color: "oklch(0.4964 0.1994 28.56)" },
      success: { color: "oklch(0.7677 0.1899 148.1)" },
      warning: { color: "oklch(0.8239 0.153 74.6)" },
    },
  },
  uber: {
    light: {
      danger: { color: "oklch(0.573 0.2249 21.97)" },
      success: { color: "oklch(0.6277 0.1604 153.06)" },
      warning: { color: "oklch(0.8446 0.1525 80.6)" },
    },
    dark: {
      danger: { color: "oklch(0.7044 0.1872 23.19)" },
      success: { color: "oklch(0.6514 0.1321 156.22)" },
      warning: { color: "oklch(0.8803 0.1348 86.06)" },
    },
  },
  spotify: {
    light: {
      danger: { color: "oklch(0.5509 0.2166 25.29)" },
      success: { color: "oklch(0.6072 0.1647 149.02)" },
      warning: { color: "oklch(0.6972 0.1687 54.22)" },
    },
    dark: {
      danger: { color: "oklch(0.5931 0.2338 25.42)" },
      success: { color: "oklch(0.7697 0.2124 148.67)" },
      warning: { color: "oklch(0.7921 0.1626 67.42)" },
    },
  },
  coinbase: {
    light: {
      danger: { color: "oklch(0.5507 0.2062 24)" },
      success: { color: "oklch(0.5438 0.1268 157.17)" },
      warning: { color: "oklch(0.8095 0.1119 61.69)" },
    },
    dark: {
      danger: { color: "oklch(0.6545 0.2145 22.31)" },
      success: { color: "oklch(0.7574 0.180554 156.931)" },
      warning: { color: "oklch(0.8095 0.1119 61.69)" },
    },
  },
  airbnb: {
    light: {
      accentForeground: "oklch(0.9911 0 0)",
      danger: { color: "oklch(0.5392 0.1816 33.72)", foreground: "oklch(0.9911 0 0)" },
      success: { color: "oklch(0.5573 0.0947 199.48)", foreground: "oklch(0.9911 0 0)" },
      warning: { color: "oklch(0.6904 0.1972 38.75)", foreground: "oklch(0.9911 0 0)" },
    },
    dark: {
      accentForeground: "oklch(0.9911 0 0)",
      danger: { color: "oklch(0.5392 0.1816 33.72)", foreground: "oklch(0.9911 0 0)" },
      success: { color: "oklch(0.652 0.114864 185.0749)", foreground: "oklch(0.9911 0 0)" },
      warning: { color: "oklch(0.8197 0.170602 78.4658)" },
    },
  },
  discord: {
    light: {
      danger: { color: "oklch(0.5884 0.1993 24.39)" },
      success: { color: "oklch(0.532 0.1238 151.57)" },
      warning: { color: "oklch(0.9218 0.1571 99.87)" },
    },
    dark: {
      danger: { color: "oklch(0.6318 0.2075 24.57)" },
      success: { color: "oklch(0.8548 0.1967 150.16)" },
      warning: { color: "oklch(0.9218 0.1571 99.87)" },
    },
  },
  rabbit: {
    light: {
      danger: { color: "oklch(0.6291 0.2565 29.09)" },
      success: { color: "oklch(0.7113 0.2043 140.81)" },
    },
    dark: {
      danger: { color: "oklch(0.6291 0.2565 29.09)" },
      success: { color: "oklch(0.7113 0.2043 140.81)" },
    },
  },
};

function oklch(lightness: number, chroma: number, hue: number): string {
  return `oklch(${(lightness * 100).toFixed(2)}% ${chroma.toFixed(4)} ${hue.toFixed(2)})`;
}
function accentForeground(lightness: number, chroma: number, hue: number): string {
  return lightness > 0.65
    ? `oklch(15% ${Math.min(chroma * 0.2, 0.03).toFixed(4)} ${hue.toFixed(2)})`
    : "oklch(99.11% 0 0)";
}
// The generator's formatted foreground calculation (not the standalone utility's
// unrounded decimal serialization) is the one computeThemeVars actually uses.
function semanticForeground(color: string): string {
  const match = /oklch\(([0-9.]+)%?\s+([0-9.]+)\s+([0-9.]+|none)\)/.exec(color);
  if (!match) return "oklch(99.11% 0 0)";
  const l = Number(match[1]);
  const c = Number(match[2]);
  const h = match[3] === "none" ? 0 : Number(match[3]);
  return (l > 1 ? l / 100 : l) > 0.65
    ? `oklch(15% ${Math.min(c * 0.3, 0.05).toFixed(4)} ${h.toFixed(2)})`
    : `oklch(98% ${Math.min(c * 0.1, 0.02).toFixed(4)} ${h.toFixed(2)})`;
}

// Source lightness and neutral-chroma multipliers, ordered [light, dark].
const neutrals = {
  background: [0.9702, 0.12, 1, 1],
  foreground: [0.2103, 0.9911, 1, 1],
  muted: [0.5517, 0.705, 2, 2],
  default: [0.94, 0.274, 1, 1],
  surface: [1, 0.2103, 0.5, 2],
  "surface-secondary": [0.9524, 0.257, 0.8, 1.5],
  "surface-tertiary": [0.9373, 0.2721, 0.8, 1.5],
  overlay: [1, 0.2103, 0.3, 2],
  segment: [1, 0.3964, 1, 1],
  border: [0.9, 0.28, 1, 1],
  separator: [0.92, 0.25, 1, 1],
} as const satisfies Partial<Record<ThemeToken, readonly [number, number, number, number]>>;
const semanticDefaults = {
  success: { light: [0.7329, 0.1935, 150.81], dark: [0.7329, 0.1935, 150.81] },
  warning: { light: [0.7819, 0.1585, 72.33], dark: [0.8203, 0.1388, 76.34] },
  danger: { light: [0.6532, 0.2328, 25.74], dark: [0.594, 0.1967, 24.63] },
} as const;

function adaptive(settings: BuilderSettings): boolean {
  return settings.lightness === 0 && settings.chroma === 0 && settings.hue === 0;
}
function grayChroma(settings: BuilderSettings): number {
  // The source adaptive branch deliberately omits grayChroma.
  return adaptive(settings) ? Math.min(settings.chroma * 0.05, 0.015) : settings.base;
}
function modeOverrides(
  settings: BuilderSettings,
  mode: ThemeMode,
  semantic?: SemanticOverrides,
): ThemeOverrides {
  const light = mode === "light";
  const base = grayChroma(settings);
  const { hue, chroma, lightness } = settings;
  const result: Partial<Record<ThemeToken, string>> = {
    radius: radiusCssMap[settings.radius],
    "field-radius": radiusCssMap[settings.formRadius],
    "font-sans": `var(${getBuilderFont(settings.fontFamily).variable})`,
    accent: oklch(lightness, chroma, hue),
    "accent-foreground":
      semantic?.[mode]?.accentForeground ?? accentForeground(lightness, chroma, hue),
    focus: oklch(lightness, chroma, hue),
    "default-foreground": light ? oklch(0.2103, 0.0059, hue) : "oklch(99.11% 0 0)",
    "field-border": "transparent",
  };
  for (const [token, values] of Object.entries(neutrals)) {
    result[token as keyof typeof neutrals] = oklch(
      values[light ? 0 : 1],
      Math.max(0, base * values[light ? 2 : 3]),
      hue,
    );
  }
  for (const token of [
    "surface",
    "surface-secondary",
    "surface-tertiary",
    "overlay",
    "segment",
  ] as const) {
    result[`${token}-foreground`] = result.foreground;
  }
  result["field-background"] = result.surface;
  result["field-foreground"] = result.foreground;
  result["field-placeholder"] = result.muted;
  for (const token of ["success", "warning", "danger"] as const) {
    const [l, c, h] = semanticDefaults[token][mode];
    let adjustedHue = h + (hue - 253.83) * 0.12;
    while (adjustedHue < 0) adjustedHue += 360;
    while (adjustedHue >= 360) adjustedHue -= 360;
    const generated = oklch(l, Math.min(c * (1 + base * 2), 0.35), adjustedHue);
    const override = semantic?.[mode]?.[token];
    result[token] = override?.color ?? generated;
    const hasOverride = semantic?.light?.[token] || semantic?.dark?.[token];
    result[`${token}-foreground`] = hasOverride
      ? (override?.foreground ?? semanticForeground(result[token]!))
      : l > 0.67
        ? oklch(0.2103, 0.0059, adjustedHue)
        : "oklch(99.11% 0 0)";
  }
  if (adaptive(settings)) {
    result.accent = light ? "oklch(0 0 0)" : "oklch(0.9848 0 0)";
    result.focus = result.accent;
    result["accent-foreground"] = accentForeground(light ? 0 : 0.9848, 0, 0);
  }
  return result;
}

const settingRanges = {
  base: [0, 0.02],
  chroma: [0, 0.4],
  hue: [0, 360],
  lightness: [0, 1],
} as const;
const builderSettingKeys = new Set<string>([...themeComparisonKeys, "vibrantPalette"]);

function validateSettings(value: unknown): asserts value is BuilderSettings {
  if (
    typeof value !== "object" ||
    value === null ||
    Array.isArray(value) ||
    (Object.getPrototypeOf(value) !== Object.prototype && Object.getPrototypeOf(value) !== null)
  ) {
    throw new TypeError("Theme builder settings must be a plain object");
  }
  if (
    Reflect.ownKeys(value).some((key) => typeof key !== "string" || !builderSettingKeys.has(key))
  ) {
    throw new TypeError("Unknown theme builder setting");
  }
  const settings = value as Record<string, unknown>;
  for (const key of ["base", "chroma", "hue", "lightness"] as const) {
    const input = settings[key];
    const [min, max] = settingRanges[key];
    if (typeof input !== "number" || !Number.isFinite(input) || input < min || input > max) {
      throw new TypeError(`Theme builder ${key} must be between ${min} and ${max}`);
    }
  }
  if (
    typeof settings["fontFamily"] !== "string" ||
    !radiusOptions.some((option) => option.id === settings["radius"]) ||
    !radiusIds.includes(settings["formRadius"] as RadiusId)
  ) {
    throw new TypeError("Unknown theme builder font or radius");
  }
  getBuilderFont(settings["fontFamily"]);
  if (
    Object.hasOwn(settings, "vibrantPalette") &&
    typeof settings["vibrantPalette"] !== "boolean"
  ) {
    throw new TypeError("Theme builder vibrantPalette must be boolean");
  }
}

/** Strict JSON/share input boundary; copy only the supported source settings. */
export function validateBuilderSettings(value: unknown): BuilderSettings {
  validateSettings(value);
  const settings = { ...value };
  builderTheme(settings);
  return settings;
}

/** Pure base-token configuration; the shared API validates and freezes both modes. */
export function builderTheme(settings: BuilderSettings): Theme {
  validateSettings(settings);
  const preset = findMatchingTheme(settings);
  const semantic = preset ? presetSemanticOverrides[preset] : undefined;
  return defineTheme({
    name: "custom",
    light: modeOverrides(settings, "light", semantic),
    dark: modeOverrides(settings, "dark", semantic),
  });
}

/**
 * Element variables for the same settings, including source builder-only
 * scrollbar and soft-foreground switches outside the editable Theme schema.
 * All other derived mixes/radii remain owned by the existing theme CSS.
 */
export function builderVariables(
  settings: BuilderSettings,
  mode: ThemeMode,
): Readonly<Record<string, string>> {
  const result: Record<string, string> = { ...themeToVariables(builderTheme(settings), mode) };
  const font = getBuilderFont(settings.fontFamily);
  result[font.variable] =
    `${settings.fontFamily === "inter" ? '"Lenso Inter", ' : ""}"${font.label}", ui-sans-serif, system-ui, sans-serif`;
  result["--scrollbar"] = oklch(
    mode === "light" ? 0.871 : 0.705,
    Math.max(0, grayChroma(settings)),
    settings.hue,
  );
  if (settings.vibrantPalette) {
    for (const token of ["accent", "success", "warning", "danger"]) {
      result[`--${token}-soft-foreground`] =
        `color-mix(in oklab, var(--${token}) 92%, var(--foreground) 8%)`;
    }
  }
  if (adaptive(settings)) result["--accent-soft-foreground"] = result["--accent"]!;
  return Object.freeze(result);
}

/** Serialize exactly the settings applied to the preview, including builder exceptions. */
export function builderCSS(settings: BuilderSettings): string {
  const theme = builderTheme(settings);
  const scopes = (["light", "dark"] as const)
    .map((mode) => {
      const declarations = Object.entries(builderVariables(settings, mode))
        .map(([key, value]) => `  ${key}: ${value};`)
        .join("\n");
      return `[data-lenso-theme="${theme.name}"][data-theme="${mode}"] {\n${declarations}\n}`;
    })
    .join("\n\n");
  return `@import url("${getBuilderFont(settings.fontFamily).cdnUrl}");\n\n${scopes}`;
}
