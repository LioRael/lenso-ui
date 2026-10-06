import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { test } from "node:test";

import {
  builderCSS,
  builderTheme,
  builderVariables,
  defaultThemeVariables,
  findMatchingTheme,
  fonts,
  formRadiusOptions,
  radiusOptions,
  themes,
  themeValuesById,
  validateBuilderSettings,
} from "./theme-builder-model.js";

// Pinned HeroUI e385ac2 computeThemeVars base output, sorted [token, value]
// entries (without "--") encoded as JSON and SHA-256. Retain every base value,
// including source numeric serialization and all foreground pairs. Exclude only
// CSS-owned derivations/aliases and scrollbar; include font/radius and adaptive
// accent overrides. Existing token API tests prove validation, not this palette.
const sourceDigests = {
  default: [
    "a657a6cdd11fbc1a9dd51ef342800bbce0eab6fc5f87ab949f3f0302604d10ca",
    "1289fceab1963b2675faedf75128eef2a18073230b22cc46f3a463d77dd55b54",
  ],
  sky: [
    "428205c8a94f48cb7374f4cd2709ec73ff243f43e27f05d64dc8fbeb15aef13f",
    "24f87df42c615b9d70148644a77a50ceb3b92d780cb4014ea61f151b76e33eb9",
  ],
  lavender: [
    "9656283e6addc451b618ca1026a78de959bb707405bc76742cbc3530ac1ad0cc",
    "6eac2185cde922eb88e84f6c6f7b7e61ac7530620adaad208399de1eb6bdd858",
  ],
  mint: [
    "1afc2ab205cb48f28bf1737aca1036d142bd9b698137e9c7da93a1a71f306684",
    "d1ca81a0d71a803c2bc06d1931e0f60a14c3977a709da0aa99bf23d4d6cf05c6",
  ],
  netflix: [
    "4baaa0634c2c14a5226f783a6d5a748e38f9a98b747c00e1d30d1d0dfedabea0",
    "03cd31f9897b2577539416202880882ca3eefe63b20739c93f077782fc12636d",
  ],
  uber: [
    "07ab32d74922541bdb5688b7a0edd17e2fe134f11c5254a94152936f23651b08",
    "4e3c7948159f859949fc268c5ac94cca540164765d9276a50b2e2dc9c035ea7c",
  ],
  spotify: [
    "10583fdcb62ad65f3ac2885f66cc8c6f07134288447ff05fce1df4ed9eabfb8f",
    "8747b3ad63d6e25cd43feee9dbdfe335c645c48f01f06620c9a96df2c61a952d",
  ],
  coinbase: [
    "5c727e32a7b2bbe0da571aab449ea2b2b4f0c67199ad6001d39fe86d5c4d92b6",
    "a386c57be4af37e523471586c83634c3dd05880ac6308b7002afcf16a0e8e4ae",
  ],
  airbnb: [
    "a32d0d6bd6089ea664a26fd3e6c3d06fd10bd8dead3306411177e807c1ffa5ca",
    "f938235c998ca4c3d24e35b8ab659264f1300bcbabc135cc850b4f3669ea72a4",
  ],
  discord: [
    "b01e92fb12abe6ad04c947c4ecf67937a4bac469c09a5b52e03e0e4f1686bf9a",
    "c8ae77dbb3a2c7b3de3e062dc4ea5a7e68427feb9c88139b2082af48fcd18a01",
  ],
  rabbit: [
    "1ec3bcad4227828f3812d368f54c466b5a842943b87401184674b0e8cd751628",
    "1620e3c05ef1701d8d6b9af7ae27c8f87647e87940cd4df8c9eeefc8170c5dc7",
  ],
} as const;

for (const preset of themes) {
  test(`${preset.label} preserves the complete source palette in both modes`, () => {
    assert.equal(findMatchingTheme(preset.variables), preset.id);
    const theme = builderTheme(preset.variables);
    for (const mode of ["light", "dark"] as const) {
      const digest = createHash("sha256")
        .update(JSON.stringify(Object.entries(theme[mode]).sort()))
        .digest("hex");
      assert.equal(digest, sourceDigests[preset.id][mode === "light" ? 0 : 1], mode);
      assert.ok(Object.isFrozen(theme[mode]));
    }
  });
}

test("initial values and source neutral chroma multipliers are exact", () => {
  assert.deepEqual(defaultThemeVariables, {
    base: 0.0015,
    chroma: 0.195,
    hue: 253.83,
    lightness: 0.6204,
    fontFamily: "inter",
    radius: "medium",
    formRadius: "large",
  });
  const theme = builderTheme(defaultThemeVariables);
  assert.equal(theme.light.accent, "oklch(62.04% 0.1950 253.83)");
  assert.equal(theme.dark.accent, theme.light.accent);
  assert.equal(theme.light.surface, "oklch(100.00% 0.0008 253.83)");
  assert.equal(theme.dark.surface, "oklch(21.03% 0.0030 253.83)");
  assert.equal(theme.light["accent-foreground"], "oklch(99.11% 0 0)");
});

test("radius, field radius and every font apply in both modes", () => {
  for (const radius of radiusOptions) {
    for (const field of formRadiusOptions) {
      for (const font of fonts) {
        const theme = builderTheme({
          ...defaultThemeVariables,
          radius: radius.id,
          formRadius: field.id,
          fontFamily: font.id,
        });
        for (const mode of ["light", "dark"] as const) {
          assert.equal(theme[mode].radius, radius.cssValue);
          assert.equal(theme[mode]["field-radius"], field.cssValue);
          assert.equal(theme[mode]["font-sans"], `var(${font.variable})`);
        }
      }
    }
  }
});

test("accent threshold and preset-only foreground overrides follow the source", () => {
  const atThreshold = builderTheme({ ...defaultThemeVariables, lightness: 0.65 });
  const aboveThreshold = builderTheme({ ...defaultThemeVariables, lightness: 0.6501 });
  assert.equal(atThreshold.light["accent-foreground"], "oklch(99.11% 0 0)");
  assert.equal(aboveThreshold.light["accent-foreground"], "oklch(15% 0.0300 253.83)");
  const preset = builderTheme(themeValuesById.airbnb);
  const custom = builderTheme({ ...themeValuesById.airbnb, radius: "small" });
  assert.equal(preset.light["accent-foreground"], "oklch(0.9911 0 0)");
  assert.equal(preset.dark["success-foreground"], "oklch(0.9911 0 0)");
  assert.equal(custom.light["accent-foreground"], "oklch(15% 0.0300 17.07)");
  assert.notEqual(custom.light.success, preset.light.success);
});

test("selected fonts define their referenced family and exported stylesheet import", () => {
  for (const font of fonts) {
    const settings = { ...defaultThemeVariables, fontFamily: font.id };
    for (const mode of ["light", "dark"] as const) {
      const variables = builderVariables(settings, mode);
      assert.equal(variables["--font-sans"], `var(${font.variable})`);
      assert.ok(variables[font.variable]?.includes(`"${font.label}"`));
    }
    assert.ok(builderCSS(settings).startsWith(`@import url("${font.cdnUrl}");`));
  }
});

test("custom Google Fonts resolve safely through sharing and CSS delivery", () => {
  const url =
    "https://fonts.googleapis.com/css2?family=Noto+Sans:wght@400;700&display=swap" as const;
  const settings = validateBuilderSettings({ ...defaultThemeVariables, fontFamily: url });
  const variables = builderVariables(settings, "light");
  assert.equal(variables["--font-sans"], "var(--font-noto-sans)");
  assert.equal(variables["--font-noto-sans"], '"Noto Sans", ui-sans-serif, system-ui, sans-serif');
  assert.ok(builderCSS(settings).startsWith(`@import url("${url}");`));
  for (const fontFamily of [
    "https://example.com/private.css",
    "javascript:alert(1)",
    "https://fonts.googleapis.com/css2?family=x%22%7D",
    "https://fonts.googleapis.com/css2?family=A&family=B",
  ]) {
    assert.throws(
      () => validateBuilderSettings({ ...defaultThemeVariables, fontFamily }),
      TypeError,
    );
  }
});

test("vibrant switches only four derived foregrounds; adaptive Uber takes precedence", () => {
  for (const mode of ["light", "dark"] as const) {
    const standard = builderVariables(defaultThemeVariables, mode);
    const vibrant = builderVariables({ ...defaultThemeVariables, vibrantPalette: true }, mode);
    for (const token of ["accent", "success", "warning", "danger"]) {
      assert.equal(
        vibrant[`--${token}-soft-foreground`],
        `color-mix(in oklab, var(--${token}) 92%, var(--foreground) 8%)`,
      );
    }
    assert.deepEqual(
      Object.fromEntries(
        Object.entries(vibrant).filter(([key]) => !key.endsWith("-soft-foreground")),
      ),
      standard,
    );
    const uber = builderVariables(
      { ...themeValuesById.uber, base: 0.02, vibrantPalette: true },
      mode,
    );
    assert.equal(
      uber["--accent-soft-foreground"],
      mode === "light" ? "oklch(0 0 0)" : "oklch(0.9848 0 0)",
    );
    assert.equal(
      uber["--background"],
      mode === "light" ? "oklch(97.02% 0.0000 0.00)" : "oklch(12.00% 0.0000 0.00)",
    );
    assert.equal(
      standard["--scrollbar"],
      mode === "light" ? "oklch(87.10% 0.0015 253.83)" : "oklch(70.50% 0.0015 253.83)",
    );
  }
});

test("CSS export uses exactly the preview variables and never emits Tailwind/radius aliases", () => {
  const settings = { ...themeValuesById.uber, vibrantPalette: true };
  const css = builderCSS(settings);
  for (const mode of ["light", "dark"] as const) {
    assert.ok(css.includes(`[data-lenso-theme="custom"][data-theme="${mode}"]`));
    for (const [key, value] of Object.entries(builderVariables(settings, mode))) {
      assert.ok(css.includes(`  ${key}: ${value};`));
    }
  }
  assert.ok(!css.includes("--tw-"));
  assert.ok(!css.includes("--radius-xl"));
});

test("untrusted settings reject unknown keys, non-finite/range values and CSS injection", () => {
  const valid = validateBuilderSettings({ ...defaultThemeVariables, vibrantPalette: false });
  assert.deepEqual(valid, { ...defaultThemeVariables, vibrantPalette: false });
  assert.notEqual(validateBuilderSettings(defaultThemeVariables), defaultThemeVariables);
  for (const input of [
    null,
    [],
    "theme",
    {},
    { ...defaultThemeVariables, unknown: 1 },
    { ...defaultThemeVariables, [Symbol("extra")]: 1 },
    ...["base", "chroma", "hue", "lightness"].flatMap((key) => [
      { ...defaultThemeVariables, [key]: NaN },
      { ...defaultThemeVariables, [key]: Infinity },
      { ...defaultThemeVariables, [key]: -0.1 },
      { ...defaultThemeVariables, [key]: 361 },
    ]),
    { ...defaultThemeVariables, base: 0.0201 },
    { ...defaultThemeVariables, chroma: 0.4001 },
    { ...defaultThemeVariables, lightness: 1.0001 },
    { ...defaultThemeVariables, fontFamily: "inter); color:red" },
    { ...defaultThemeVariables, radius: "0;}" },
    { ...defaultThemeVariables, radius: "extra-large" },
    { ...defaultThemeVariables, formRadius: "unknown" },
    { ...defaultThemeVariables, vibrantPalette: "true" },
    { ...defaultThemeVariables, vibrantPalette: undefined },
  ])
    assert.throws(() => validateBuilderSettings(input), TypeError);
});
