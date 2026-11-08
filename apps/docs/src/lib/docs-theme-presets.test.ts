import assert from "node:assert/strict";
import { test } from "bun:test";
import { themeToCSS } from "@lenso/tokens";
import { docsPresetTheme, themes } from "./docs-theme-presets";

// Presets must retain tint contrast variants without taking over component geometry or status colors.
for (const preset of themes) {
  test(`${preset.id} preserves the documentation theme boundary`, () => {
    const theme = docsPresetTheme(preset.id);
    for (const mode of ["light", "dark", "lightIncreased", "darkIncreased"] as const) {
      assert.ok(theme[mode]["font-body"]);
      for (const key of Object.keys(theme[mode]))
        assert.ok(["tint", "tint-text", "label-on-tint", "font-body"].includes(key));
      if (preset.id !== "default") {
        assert.ok(theme[mode]["tint"]);
        assert.ok(theme[mode]["tint-text"]);
        assert.ok(theme[mode]["label-on-tint"]);
      }
    }
    assert.match(themeToCSS(theme), /prefers-contrast: more/);
  });
}
