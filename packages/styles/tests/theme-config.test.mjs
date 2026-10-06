import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { chromium } from "playwright";
import { defineTheme, themeToCSS, themeToVariables, themeTokens } from "../src/theme.ts";

// Existing theme.test.mjs proves hand-written overrides, not configuration validation,
// generated named scopes, editable metadata, or serialization of both modes.
test("configuration and both serializers reject invalid or unsafe inputs", () => {
  const invalid = [
    null,
    [],
    { name: "" },
    { name: "9brand" },
    { name: 'brand"] {}' },
    { name: "a".repeat(65) },
    { name: "brand", extra: {} },
    { name: "brand", light: [] },
    { name: "brand", dark: null },
    { name: "brand", light: { "--accent": "red" } },
    { name: "brand", light: { "accent-hover": "red" } },
    { name: "brand", light: { accent: 42 } },
    { name: "brand", light: { accent: "red; color: blue" } },
    { name: "brand", light: { accent: "red!important" } },
    { name: "brand", light: { accent: "var(--accent)/*comment*/" } },
    { name: "brand", light: { accent: "</style><script>alert(1)</script>" } },
    { name: "brand", light: { accent: "url(https://example.com)" } },
    { name: "brand", light: { accent: "oklch(banana)" } },
    { name: "brand", light: { accent: "hsl(0, 50, 50)" } },
    { name: "brand", light: { accent: "rgb(1%, 2, 3%)" } },
    { name: "brand", light: { accent: "rgb(none, none, none)" } },
    { name: "brand", light: { accent: "rgba(1, 2, 3, none)" } },
    { name: "brand", light: { accent: "hsla(0, 50%, 50%, none)" } },
    { name: "brand", light: { accent: "color-mix(in srgb longer hue, red, blue)" } },
    { name: "brand", light: { accent: "var(--x" } },
    { name: "brand", light: { accent: "\\72 ed" } },
    { name: "brand", light: { radius: "-2px" } },
    { name: "brand", light: { radius: "20" } },
    { name: "brand", light: { radius: "calc(1rem / 0)" } },
    { name: "brand", light: { "font-sans": "url(font.woff)" } },
    { name: "brand", light: { "font-sans": "(" } },
    { name: "brand", light: { [Symbol("accent")]: "red" } },
  ];
  for (const config of invalid) {
    assert.throws(() => defineTheme(config), TypeError);
    assert.throws(() => themeToCSS(config), TypeError);
    assert.throws(() => themeToVariables(config, "light"), TypeError);
  }
  assert.throws(() => themeToVariables({ name: "brand" }, "system"), TypeError);
});

test("supported values serialize by exact CSS names without mutating input", () => {
  const config = {
    name: "brand_2",
    light: {
      accent: " oklch(65% 0.2 140 / 90%) ",
      default: "rgb(10, 20, 30)",
      success: "rgb(10%, 20%, 30%)",
      warning: "rgba(10, 20, 30, 0.5)",
      danger: "hsl(120deg, 50%, 40%)",
      link: "hsla(0, 50%, 50%, 25%)",
      border: "rgb(10, 20, 30, 0.5)",
      separator: "rgba(10, 20, 30)",
      focus: "hsl(0, 50%, 50%, 0.5)",
      backdrop: "hsla(0, 50%, 50%)",
      foreground: "var(--ink, oklch(20% 0.01 280))",
      surface: "color-mix(in oklch, var(--white) 80%, oklch(60% 0.2 140))",
      radius: "1rem",
      "field-radius": "calc(var(--radius) * 1.5)",
      "border-width": "0",
      "field-border-width": "var(--line, 2px)",
      "font-sans": '"Inter", ui-sans-serif, system-ui, sans-serif',
    },
    dark: { accent: "#aabbcc", radius: "24px", backdrop: "rgba(0, 0, 0, 0.6)" },
  };
  const original = structuredClone(config);
  const theme = defineTheme(config);
  assert.deepEqual(config, original);
  assert.equal(theme.light.accent, "oklch(65% 0.2 140 / 90%)");
  config.light.accent = "blue";
  assert.equal(theme.light.accent, "oklch(65% 0.2 140 / 90%)");
  assert.ok(Object.isFrozen(theme));
  assert.ok(Object.isFrozen(theme.light));
  assert.ok(Object.isFrozen(theme.dark));
  assert.throws(() => {
    theme.light.accent = "red";
  }, TypeError);
  const variables = themeToVariables(theme, "dark");
  assert.deepEqual(variables, {
    "--accent": "#aabbcc",
    "--radius": "24px",
    "--backdrop": "rgba(0, 0, 0, 0.6)",
  });
  assert.ok(Object.isFrozen(variables));
  const css = themeToCSS(theme);
  for (const mode of ["light", "dark"]) {
    assert.ok(css.includes(`[data-lenso-theme="brand_2"][data-theme="${mode}"]`));
    for (const [key, value] of Object.entries(themeToVariables(theme, mode))) {
      assert.ok(css.includes(`${key}: ${value};`));
    }
  }
  assert.deepEqual(defineTheme({ name: "minimal" }), { name: "minimal", light: {}, dark: {} });
});

test("legacy color aliases and interpolation grammar match browser syntax", async () => {
  const cases = [
    ["rgb(10, 20, 30)", true],
    ["rgba(10, 20, 30)", true],
    ["rgb(10%, 20%, 30%, 50%)", true],
    ["hsla(0, 50%, 50%)", true],
    ["hsl(0, 50%, 50%, 0.5)", true],
    ["color-mix(in oklch longer hue, red, blue)", true],
    ["hsl(0, 50, 50)", false],
    ["rgb(1%, 2, 3%)", false],
    ["rgb(none, none, none)", false],
    ["rgba(1, 2, 3, none)", false],
    ["color-mix(in srgb longer hue, red, blue)", false],
  ];
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage();
    for (const [value, supported] of cases) {
      assert.equal(await page.evaluate((color) => CSS.supports("color", color), value), supported);
      const config = { name: "syntax", light: { accent: value } };
      if (supported) assert.doesNotThrow(() => defineTheme(config));
      else assert.throws(() => defineTheme(config), TypeError);
    }
  } finally {
    await browser.close();
  }
});

test("editable metadata uses existing public names and cannot be changed", async () => {
  const sources = await Promise.all(
    ["src/tokens.stylex.const.ts", "themes/default/variables.css", "themes/shared/theme.css"].map(
      (file) => readFile(new URL(`../${file}`, import.meta.url), "utf8"),
    ),
  );
  const keys = themeTokens.map(({ key }) => key);
  assert.equal(new Set(keys).size, keys.length);
  assert.ok(Object.isFrozen(themeTokens));
  for (const token of themeTokens) {
    assert.ok(Object.isFrozen(token));
    assert.ok(token.label.length > 0);
    assert.ok(["color", "length", "font-family"].includes(token.category));
    assert.ok(sources.slice(1).some((source) => source.includes(`--${token.key}:`)));
    assert.ok(sources[0].includes(`var(--${token.key})`));
  }
  assert.ok(keys.includes("font-sans"));
  assert.ok(!keys.includes("font-family"));
});

test("generated named themes and inline previews resolve live mixes, radii and mode defaults", async () => {
  const theme = defineTheme({
    name: "brand",
    light: {
      accent: "oklch(70% 0.15 140)",
      radius: "20px",
      "font-sans": '"Example Font", sans-serif',
    },
    dark: {
      accent: "oklch(60% 0.2 30)",
      radius: "12px",
      "field-radius": "7px",
      "field-border-width": "3px",
    },
  });
  const base = await Promise.all(
    ["themes/shared/theme.css", "themes/default/variables.css"].map((file) =>
      readFile(new URL(`../${file}`, import.meta.url), "utf8"),
    ),
  );
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage();
    await page.setContent(`
      <style>${base.join("\n")}
        ${themeToCSS(theme)}
        .probe { color: var(--foreground); background: var(--accent-hover);
          border-radius: var(--radius-xl); outline-color: var(--accent-soft);
          border: var(--border-width-field) solid; font-family: var(--font-sans); }
        .field { border-radius: var(--radius-field); }
        .expected { background: color-mix(in oklab, var(--accent) 90%, var(--accent-foreground) 10%); }
      </style>
      <div data-theme="light" data-lenso-theme="brand" id="scope">
        <div class="probe" id="probe"></div><div class="probe field" id="field"></div>
        <div class="expected" id="expected"></div>
      </div>
      <div data-theme="light" id="preview"><div class="probe" id="inline"></div></div>
      <div data-theme="light"><div class="probe" id="default"></div></div>
    `);
    const sample = () =>
      page.evaluate(() => {
        const style = (id) => getComputedStyle(document.getElementById(id));
        return {
          color: style("probe").color,
          defaultColor: style("default").color,
          background: style("probe").backgroundColor,
          expected: style("expected").backgroundColor,
          soft: style("probe").outlineColor,
          radius: style("probe").borderTopLeftRadius,
          fieldRadius: style("field").borderTopLeftRadius,
          border: style("probe").borderTopWidth,
          font: style("probe").fontFamily,
          inlineBackground: style("inline").backgroundColor,
          inlineRadius: style("inline").borderTopLeftRadius,
        };
      });
    const light = await sample();
    assert.equal(light.background, light.expected);
    assert.equal(light.radius, "30px");
    assert.equal(light.fieldRadius, "30px");
    assert.ok(light.font.includes("Example Font"));
    for (const mode of ["light", "dark"]) {
      await page.evaluate(
        ({ mode, variables }) => {
          document.getElementById("scope").dataset.theme = mode;
          const preview = document.getElementById("preview");
          preview.dataset.theme = mode;
          preview.dataset.lensoTheme = "preview-only";
          preview.removeAttribute("style");
          for (const [key, value] of Object.entries(variables))
            preview.style.setProperty(key, value);
        },
        { mode, variables: themeToVariables(theme, mode) },
      );
      const current = await sample();
      assert.equal(current.background, current.expected);
      assert.equal(current.inlineBackground, current.background);
      assert.equal(current.inlineRadius, current.radius);
      if (mode === "dark") {
        assert.notEqual(current.color, current.defaultColor);
        assert.notEqual(current.background, light.background);
        assert.notEqual(current.soft, light.soft);
        assert.equal(current.radius, "18px");
        assert.equal(current.fieldRadius, "7px");
        assert.equal(current.border, "3px");
      }
    }
    const before = await sample();
    await page.evaluate(() => {
      const scope = document.getElementById("scope");
      scope.style.setProperty("--accent", "oklch(80% 0.1 240)");
      scope.style.setProperty("--radius", "28px");
    });
    const after = await sample();
    assert.notEqual(after.background, before.background);
    assert.equal(after.background, after.expected);
    assert.equal(after.radius, "42px");
    assert.equal(after.fieldRadius, "7px");
  } finally {
    await browser.close();
  }
});
