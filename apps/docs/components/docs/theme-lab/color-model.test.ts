import { converter, wcagLuminance } from "culori";
import { describe, expect, it } from "vitest";

import {
  defaultThemeRecipes,
  generateTheme,
  serializeThemeCss,
  serializeThemeRecipe,
  themeTokenPaths,
} from "./color-model";

const toLch = converter("lch");

describe("Theme Lab color model", () => {
  it("derives one coherent dark surface family from the base input", () => {
    const generated = generateTheme(defaultThemeRecipes.dark);
    const canvas = generated.tokens["color.surface.canvas"];
    const panel = generated.tokens["color.surface.panel"];
    const menu = generated.tokens["color.surface.popover"];

    expect(wcagLuminance(canvas)).toBeLessThan(wcagLuminance(panel));
    expect(wcagLuminance(panel)).toBeLessThan(wcagLuminance(menu));

    const baseHue = toLch(canvas)?.h ?? 0;
    const menuHue = toLch(menu)?.h ?? 0;
    expect(Math.abs(baseHue - menuHue)).toBeLessThan(1);
  });

  it("keeps every generated semantic color in resolved hex notation", () => {
    for (const mode of ["light", "dark"] as const) {
      const generated = generateTheme(defaultThemeRecipes[mode]);
      expect(Object.keys(generated.tokens)).toEqual([...themeTokenPaths]);
      expect(Object.values(generated.tokens).every((value) => /^#[0-9a-f]{6}$/i.test(value))).toBe(
        true,
      );
    }
  });

  it("applies a token adjustment without changing sibling roles", () => {
    const baseline = generateTheme(defaultThemeRecipes.dark);
    const adjusted = generateTheme({
      ...defaultThemeRecipes.dark,
      adjustments: {
        "color.surface.popover": { chroma: 0, hue: 0, lightness: 4 },
      },
    });

    expect(adjusted.tokens["color.surface.popover"]).not.toBe(
      baseline.tokens["color.surface.popover"],
    );
    expect(adjusted.tokens["color.surface.panel"]).toBe(baseline.tokens["color.surface.panel"]);
  });

  it("derives checked Switch surfaces from the accent ramp", () => {
    const generated = generateTheme({ ...defaultThemeRecipes.dark, accent: "#d46bba" });

    expect(generated.tokens["color.switch.trackOn"]).toBe(generated.tokens["color.action.primary"]);
    expect(generated.tokens["color.switch.trackOnHover"]).toBe(
      generated.tokens["color.action.primaryHover"],
    );
  });

  it("exports reviewable JSON and CSS recipes", () => {
    const recipe = defaultThemeRecipes.dark;
    const generated = generateTheme(recipe);
    const json = serializeThemeRecipe(recipe, generated);
    const css = serializeThemeCss(recipe, generated);

    expect(JSON.parse(json)).toMatchObject({ input: { mode: "dark" } });
    expect(css).toContain('[data-theme="dark"]');
    expect(css).toContain("--color-surface-popover:");
  });
});
