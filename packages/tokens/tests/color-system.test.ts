import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "bun:test";
import { appleColors, appleColorSelectors } from "../src/apple-colors.ts";
import { contrastRatio, resolveColorRoles, tintOverrides } from "../src/color-system.ts";

const rgb = (css: string): [number, number, number] => {
  const values = css
    .match(/rgb\(([^)]+)\)/)![1]!
    .split(/[ /]+/)
    .map(Number);
  return [values[0]! / 255, values[1]! / 255, values[2]! / 255];
};
// A runtime-only check could silently replace approved design values with older OS colors.
test("one matrix follows Figma values and declares every missing-source fallback", async () => {
  const read = async (file: string) =>
    JSON.parse(
      await readFile(new URL(`./fixtures/apple-color-evidence/${file}`, import.meta.url), "utf8"),
    );
  const native = await read("uikit-ios-26.5.json");
  const figma = await read("figma-ios27-colors.json");
  const counts = { figma: 0, "uikit-26.5-fallback": 0, "lenso-web-fallback": 0 };
  const origins: Record<
    string,
    Record<
      string,
      {
        source: keyof typeof counts;
        variable: string;
        nodeId: string;
        mode: string;
        selector: string;
      }
    >
  > = await read("color-origins.json");
  assert.equal(Object.keys(appleColors).length, 8);
  for (const [env, roles] of Object.entries(appleColors)) {
    assert.equal(Object.keys(roles).length, 38);
    assert.deepEqual(Object.keys(origins[env]!).sort(), Object.keys(roles).sort());
    for (const [role, value] of Object.entries(roles)) {
      const origin = origins[env]![role]!;
      counts[origin.source]++;
      if (origin.source === "figma") {
        const variable = figma.variables[origin.variable];
        assert.equal(origin.nodeId, variable.nodeId);
        assert.deepEqual(value, variable[origin.mode], `${env}: ${role}`);
      } else if (origin.source === "uikit-26.5-fallback") {
        assert.equal(
          origin.selector,
          appleColorSelectors[role as keyof typeof appleColorSelectors],
        );
        assert.deepEqual(value, native.samples[env][origin.selector], `${env}: ${role}`);
      } else {
        assert.ok(env.includes("increased"));
        assert.ok(["scrim", "control-selection-fill"].includes(role));
        assert.deepEqual(
          value,
          role === "scrim"
            ? [0, 0, 0, env.startsWith("dark") ? 0.6 : 0.4]
            : native.samples[env].systemBackground,
        );
      }
    }
  }
  assert.deepEqual(counts, { figma: 144, "uikit-26.5-fallback": 152, "lenso-web-fallback": 8 });
});
test("Web status text and borders meet their contracts on every sampled content background", () => {
  for (const env of Object.keys(appleColors) as (keyof typeof appleColors)[]) {
    const native = appleColors[env];
    const roles = resolveColorRoles(env),
      backgrounds = Object.entries(native)
        .filter(([key]) => key.startsWith("background-"))
        .map(([, value]) => [value[0], value[1], value[2]] as const);
    for (const status of ["success", "warning", "error", "info"])
      for (const background of backgrounds) {
        assert.ok(
          contrastRatio(rgb(roles[`status-${status}-text`]!), background) >=
            (env.includes("increased") ? 7 : 4.5) - 1e-6,
        );
        assert.ok(contrastRatio(rgb(roles[`status-${status}-border`]!), background) >= 3 - 1e-6);
      }
    for (const [status, hue] of [
      ["success", "green"],
      ["warning", "orange"],
      ["error", "red"],
      ["info", "blue"],
    ] as const)
      assert.ok(
        contrastRatio(rgb(roles[`status-${status}-on-fill`]!), [
          native[`system-${hue}`][0],
          native[`system-${hue}`][1],
          native[`system-${hue}`][2],
        ]) >= 4.5,
      );
  }
});
test("custom tint cannot recolor business status and selects a readable foreground", () => {
  for (const color of [
    [0, 0, 0],
    [1, 1, 1],
    [1, 1, 0],
    [0.3, 0.1, 0.8],
  ] as const)
    for (const mode of ["light", "dark"] as const)
      for (const contrast of ["standard", "increased"] as const) {
        const roles = tintOverrides(color, mode, contrast);
        assert.deepEqual(Object.keys(roles).sort(), ["label-on-tint", "tint", "tint-text"]);
        assert.ok(contrastRatio(rgb(roles["label-on-tint"]!), color) >= 4.5);
      }
  assert.throws(() => tintOverrides([NaN, 0, 0], "light"), TypeError);
});

// Contrast-only checks missed the authored white labels on Apple action controls.
test("Apple default prominent action labels stay white in all eight environments", () => {
  for (const environment of Object.keys(appleColors) as (keyof typeof appleColors)[]) {
    const roles = resolveColorRoles(environment);
    assert.equal(roles["label-on-tint"], "rgb(255 255 255)");
    assert.equal(roles["label-on-destructive"], "rgb(255 255 255)");
  }
});
