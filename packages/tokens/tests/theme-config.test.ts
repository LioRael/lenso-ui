import assert from "node:assert/strict";
import { test } from "bun:test";
import { defineTheme, themeToCSS, themeToVariables, themeTokens } from "../src/theme.ts";

// A single public namespace must reject the removed schema as well as unsafe CSS.
test("theme configuration rejects legacy keys and unsafe values", () => {
  const values = [
    42,
    "red; color: blue",
    "red!important",
    "url(https://example.com)",
    "</style>",
    "oklch(banana)",
    "var(--x",
    "\\72 ed",
  ];
  for (const tint of values)
    // Exercise malformed input from JavaScript consumers.
    // @ts-expect-error the numeric case is intentionally invalid
    assert.throws(() => defineTheme({ name: "brand", light: { tint } }), TypeError);
  for (const key of [
    "accent",
    "danger",
    "default",
    "apple-accent",
    "lg-fill",
    "system-blue",
    "--lenso-tint",
  ]) {
    assert.throws(() => defineTheme({ name: "brand", light: { [key]: "red" } }), TypeError);
  }
  for (const config of [
    null,
    [],
    { name: "" },
    { name: 'x"] {}' },
    { name: "brand", extra: {} },
    { name: "brand", dark: null },
    { name: "brand", light: [] },
    { name: "brand", light: { "shape-field": "-2px" } },
  ])
    // @ts-expect-error these values exercise the runtime input boundary
    assert.throws(() => defineTheme(config), TypeError);
});

test("four explicit variants serialize without mutating inputs", () => {
  const config = {
    name: "brand",
    light: { tint: " #0088ff " },
    dark: { tint: "#0091ff" },
    lightIncreased: { tint: "#1e6ef4" },
    darkIncreased: { tint: "#5cb8ff" },
  };
  const original = structuredClone(config),
    theme = defineTheme(config);
  assert.deepEqual(config, original);
  assert.equal(theme.light.tint, "#0088ff");
  assert.ok(Object.isFrozen(theme.lightIncreased));
  assert.deepEqual(themeToVariables(theme, "dark", "increased"), { "--lenso-tint": "#5cb8ff" });
  assert.deepEqual(themeToVariables(theme, "dark"), { "--lenso-tint": "#0091ff" });
  assert.match(themeToCSS(theme), /prefers-contrast: more/);
  assert.match(themeToCSS(theme), /data-contrast="increased"/);
  // @ts-expect-error exercise invalid runtime inputs
  assert.throws(() => themeToVariables(theme, "system"), TypeError);
  // @ts-expect-error exercise invalid runtime inputs
  assert.throws(() => themeToVariables(theme, "light", "unknown"), TypeError);
});

test("semantic expressions remain validated and metadata contains no duplicate sources", () => {
  for (const tint of [
    "rgb(10, 20, 30)",
    "rgba(10, 20, 30)",
    "oklch(65% .2 140)",
    "color-mix(in srgb, red 20%, blue)",
    "var(--brand)",
  ])
    assert.doesNotThrow(() => defineTheme({ name: "valid", light: { tint } }));
  for (const tint of [
    "hsl(0, 50, 50)",
    "rgb(1%, 2, 3%)",
    "rgb(none, none, none)",
    "color-mix(in srgb longer hue, red, blue)",
  ])
    assert.throws(() => defineTheme({ name: "invalid", light: { tint } }));
  const names: string[] = themeTokens.map((x) => x.key);
  assert.equal(names.length, new Set(names).size);
  assert.ok(names.includes("label-primary"));
  assert.ok(names.includes("status-error-text"));
  assert.ok(!names.includes("apple-accent"));
  assert.ok(!names.includes("system-blue"));
});
