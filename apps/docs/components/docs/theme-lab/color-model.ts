import { clampChroma, converter, formatHex, wcagContrast, type Lch } from "culori";

import { semanticTokenNames } from "@lenso/tokens";

export type ThemeMode = "dark" | "light";

export const themeTokenPaths = [
  "color.surface.canvas",
  "color.surface.surface",
  "color.surface.panel",
  "color.surface.control",
  "color.surface.elevated",
  "color.surface.popover",
  "color.surface.dialog",
  "color.surface.interactiveHover",
  "color.surface.overlayHover",
  "color.surface.selected",
  "color.content.primary",
  "color.content.secondary",
  "color.content.tertiary",
  "color.border.control",
  "color.border.popover",
  "color.border.dialog",
  "color.action.primary",
  "color.action.primaryHover",
  "color.action.primaryContent",
  "color.switch.trackOn",
  "color.switch.trackOnHover",
  "color.focus.ring",
] as const;

export type ThemeTokenPath = (typeof themeTokenPaths)[number];

export interface ColorAdjustment {
  chroma: number;
  hue: number;
  lightness: number;
}

export interface DerivedThemeInput {
  chroma: number;
  lightness: number;
}

export interface ThemeRecipe {
  accent: string;
  adjustments: Partial<Record<ThemeTokenPath, ColorAdjustment>>;
  base: string;
  contrast: number;
  derived: {
    elevated: DerivedThemeInput;
    menu: DerivedThemeInput;
  };
  mode: ThemeMode;
}

export interface GeneratedTheme {
  contrast: {
    accentContent: number;
    primaryOnCanvas: number;
    secondaryOnCanvas: number;
    tertiaryOnCanvas: number;
  };
  tokens: Record<ThemeTokenPath, string>;
}

const toLch = converter("lch");
const fallbackBase = "#0e1012";
const fallbackAccent = "#5e6ad2";
const zeroAdjustment: ColorAdjustment = { chroma: 0, hue: 0, lightness: 0 };

export const defaultThemeRecipes: Record<ThemeMode, ThemeRecipe> = {
  dark: {
    accent: fallbackAccent,
    adjustments: {},
    base: fallbackBase,
    contrast: 27,
    derived: {
      elevated: { chroma: 1, lightness: 3 },
      menu: { chroma: 1, lightness: 5 },
    },
    mode: "dark",
  },
  light: {
    accent: fallbackAccent,
    adjustments: {},
    base: "#f8f8f7",
    contrast: 32,
    derived: {
      elevated: { chroma: 0, lightness: 2 },
      menu: { chroma: 0, lightness: 2.5 },
    },
    mode: "light",
  },
};

function clamp(value: number, minimum: number, maximum: number): number {
  return Math.min(maximum, Math.max(minimum, value));
}

function parseLch(value: string, fallback: string): Lch {
  return toLch(value) ?? toLch(fallback)!;
}

function shift(color: Lch, adjustment: Partial<ColorAdjustment>, chromaLimit?: number): string {
  const next: Lch = {
    ...color,
    c: clamp(color.c + (adjustment.chroma ?? 0), 0, chromaLimit ?? Number.POSITIVE_INFINITY),
    h: ((((color.h ?? 0) + (adjustment.hue ?? 0)) % 360) + 360) % 360,
    l: clamp(color.l + (adjustment.lightness ?? 0), 0.5, 99.5),
  };

  return formatHex(clampChroma(next, "lch"));
}

function neutralAt(base: Lch, lightness: number): string {
  return shift({ ...base, c: Math.min(base.c, 2), l: lightness }, zeroAdjustment, 2);
}

function withAdjustment(value: string, path: ThemeTokenPath, recipe: ThemeRecipe): string {
  return shift(parseLch(value, fallbackBase), recipe.adjustments[path] ?? zeroAdjustment);
}

function chooseReadableContent(background: string): string {
  const dark = "#111214";
  const light = "#ffffff";
  return wcagContrast(background, light) >= wcagContrast(background, dark) ? light : dark;
}

export function generateTheme(recipe: ThemeRecipe): GeneratedTheme {
  const base = parseLch(recipe.base, fallbackBase);
  const accent = parseLch(recipe.accent, fallbackAccent);
  const contrast = clamp(recipe.contrast, 0, 100);
  const direction = recipe.mode === "dark" ? 1 : -1;
  const elevationScale = recipe.mode === "dark" ? 1 : 0.45;
  const interactionDelta = 2 + contrast * 0.12;
  const selectedDelta = 4 + contrast * 0.06;
  const borderDelta = 6 + contrast * 0.1;
  const primaryLightness = recipe.mode === "dark" ? 88 + contrast * 0.1 : 12 - contrast * 0.06;
  const secondaryLightness = recipe.mode === "dark" ? 70 + contrast * 0.15 : 25 - contrast * 0.08;
  const tertiaryLightness = recipe.mode === "dark" ? 52 + contrast * 0.12 : 45 - contrast * 0.08;

  const panel = shift(base, { lightness: 2.5 * elevationScale });
  const control = shift(base, { lightness: 3.5 * elevationScale });
  const elevated = shift(base, {
    chroma: recipe.derived.elevated.chroma,
    lightness: recipe.derived.elevated.lightness * elevationScale,
  });
  const menu = shift(base, {
    chroma: recipe.derived.menu.chroma,
    lightness: recipe.derived.menu.lightness * elevationScale,
  });
  const primary = neutralAt(base, primaryLightness);
  const secondary = neutralAt(base, secondaryLightness);
  const tertiary = neutralAt(base, tertiaryLightness);
  const accentValue = formatHex(clampChroma(accent, "lch"));
  const accentHover = shift(accent, { lightness: direction * 5 });
  const accentContent = chooseReadableContent(accentValue);

  const rawTokens: Record<ThemeTokenPath, string> = {
    "color.action.primary": accentValue,
    "color.action.primaryContent": accentContent,
    "color.action.primaryHover": accentHover,
    "color.border.control": shift(parseLch(control, fallbackBase), {
      lightness: direction * borderDelta,
    }),
    "color.border.dialog": shift(parseLch(elevated, fallbackBase), {
      lightness: direction * borderDelta,
    }),
    "color.border.popover": shift(parseLch(menu, fallbackBase), {
      lightness: direction * borderDelta,
    }),
    "color.content.primary": primary,
    "color.content.secondary": secondary,
    "color.content.tertiary": tertiary,
    "color.focus.ring": accentValue,
    "color.surface.canvas": shift(base, zeroAdjustment),
    "color.surface.control": control,
    "color.surface.dialog": elevated,
    "color.surface.elevated": elevated,
    "color.surface.interactiveHover": shift(parseLch(control, fallbackBase), {
      lightness: direction * interactionDelta,
    }),
    "color.surface.overlayHover": shift(parseLch(menu, fallbackBase), {
      lightness: direction * interactionDelta,
    }),
    "color.surface.panel": panel,
    "color.surface.popover": menu,
    "color.surface.selected": shift(base, { lightness: direction * selectedDelta }),
    "color.surface.surface": shift(base, { lightness: elevationScale }),
    "color.switch.trackOn": accentValue,
    "color.switch.trackOnHover": accentHover,
  };

  const tokens = Object.fromEntries(
    themeTokenPaths.map((path) => [path, withAdjustment(rawTokens[path], path, recipe)]),
  ) as Record<ThemeTokenPath, string>;

  return {
    contrast: {
      accentContent: wcagContrast(
        tokens["color.action.primaryContent"],
        tokens["color.action.primary"],
      ),
      primaryOnCanvas: wcagContrast(
        tokens["color.content.primary"],
        tokens["color.surface.canvas"],
      ),
      secondaryOnCanvas: wcagContrast(
        tokens["color.content.secondary"],
        tokens["color.surface.canvas"],
      ),
      tertiaryOnCanvas: wcagContrast(
        tokens["color.content.tertiary"],
        tokens["color.surface.canvas"],
      ),
    },
    tokens,
  };
}

export function serializeThemeRecipe(recipe: ThemeRecipe, generated: GeneratedTheme): string {
  return JSON.stringify(
    {
      input: {
        accent: recipe.accent,
        base: recipe.base,
        contrast: recipe.contrast,
        derived: recipe.derived,
        mode: recipe.mode,
      },
      overrides: recipe.adjustments,
      tokens: generated.tokens,
    },
    null,
    2,
  );
}

export function serializeThemeCss(recipe: ThemeRecipe, generated: GeneratedTheme): string {
  const selector = `[data-theme="${recipe.mode}"]`;
  const declarations = themeTokenPaths
    .map((path) => `  ${semanticTokenNames[path]}: ${generated.tokens[path]};`)
    .join("\n");
  return `${selector} {\n${declarations}\n}`;
}
