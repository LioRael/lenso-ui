/*
 * Copyright 2025 NextUI Inc.
 * SPDX-License-Identifier: Apache-2.0
 * Modified: documentation tint presets use the shared Lenso theme API.
 * See THIRD_PARTY_NOTICES.md for the full license.
 */
import { converter } from "culori";
import { defineTheme, tintOverrides, type ThemeMode } from "@lenso/tokens";

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

interface PresetTint {
  lightness: number;
  chroma: number;
  hue: number;
}

const tints: Record<ThemeId, PresetTint> = {
  default: { lightness: 0.6320535763052352, chroma: 0.2017874378254327, hue: 254.08790503045662 },
  sky: { lightness: 0.78, chroma: 0.16, hue: 225 },
  lavender: { lightness: 0.77, chroma: 0.13, hue: 305 },
  mint: { lightness: 0.82, chroma: 0.12, hue: 155 },
  netflix: { lightness: 0.5814, chroma: 0.2349, hue: 27.99 },
  uber: { lightness: 0, chroma: 0, hue: 0 },
  spotify: { lightness: 0.7697, chroma: 0.2124, hue: 148.67 },
  coinbase: { lightness: 0.5282, chroma: 0.2628, hue: 262.87 },
  airbnb: { lightness: 0.6579, chroma: 0.2309, hue: 17.07 },
  discord: { lightness: 0.5774, chroma: 0.2091, hue: 273.85 },
  rabbit: { lightness: 0.6678, chroma: 0.2232, hue: 36.66 },
};

export const themes = themeIds.map((id) => ({
  id,
  label: id[0]!.toUpperCase() + id.slice(1),
  variables: tints[id],
}));

export function presetPreview({ lightness, chroma, hue }: PresetTint): string {
  const highlight = Math.min(0.96, lightness + 0.18);
  return `linear-gradient(135deg, oklch(${highlight} ${chroma * 0.6} ${hue}), oklch(${lightness} ${chroma} ${hue}))`;
}

const toRgb = converter("rgb");
export function docsPresetTheme(id: ThemeId) {
  const { lightness, chroma, hue } = tints[id];
  const tint = toRgb({ mode: "oklch", l: lightness, c: chroma, h: hue })!;
  const clamp = (value: number) => Math.max(0, Math.min(1, value));
  const rgb = [clamp(tint.r), clamp(tint.g), clamp(tint.b)] as const;
  const overrides = (mode: ThemeMode, increased = false) => ({
    ...(id === "default" ? {} : tintOverrides(rgb, mode, increased ? "increased" : "standard")),
    "font-body": '"Lenso Inter", "Inter", ui-sans-serif, system-ui, sans-serif',
  });
  return defineTheme({
    name: `docs-${id}`,
    light: overrides("light"),
    dark: overrides("dark"),
    lightIncreased: overrides("light", true),
    darkIncreased: overrides("dark", true),
  });
}
