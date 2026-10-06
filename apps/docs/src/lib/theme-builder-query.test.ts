import assert from "node:assert/strict";
import { test } from "node:test";

import { defaultThemeVariables, validateBuilderSettings } from "./theme-builder-model.js";
import {
  builderQueryParsers,
  builderQueryValues,
  builderShareURL,
  settingsFromQuery,
} from "./theme-builder-query.js";

// Model tests cover valid JSON snapshots, not untrusted individual query fields,
// omission of defaults, or links built while a URL write is still queued.
test("query parsers reject malformed, out-of-range and unsafe inputs", () => {
  for (const raw of ["", " ", "12oops", "0x20", "Infinity", "NaN", "-1", "361"]) {
    assert.equal(builderQueryParsers.hue.parse(raw), null, raw);
  }
  assert.equal(builderQueryParsers.base.parse("0.5"), null);
  assert.equal(builderQueryParsers.chroma.parse("2"), null);
  assert.equal(builderQueryParsers.lightness.parse("2"), null);
  assert.equal(builderQueryParsers.fontFamily.parse("https://evil.example/font.css"), null);
  assert.equal(builderQueryParsers.fontFamily.parse("javascript:alert(1)"), null);
  assert.equal(builderQueryParsers.radius.parse("giant"), null);
  assert.equal(builderQueryParsers.vibrantPalette.parse("yes"), null);
  assert.equal(builderQueryParsers.hue.parse("180.5"), 180.5);
  assert.equal(builderQueryParsers.fontFamily.parse("geist"), "geist");
  assert.equal(builderQueryParsers.vibrantPalette.parse("false"), false);
});

test("individual invalid fields fall back without losing valid fields", () => {
  const query = builderQueryValues(defaultThemeVariables);
  query.hue = builderQueryParsers.hue.parse("Infinity") ?? builderQueryParsers.hue.defaultValue;
  query.fontFamily =
    builderQueryParsers.fontFamily.parse("unsafe") ?? builderQueryParsers.fontFamily.defaultValue;
  query.chroma = builderQueryParsers.chroma.parse("0.12")!;
  assert.deepEqual(settingsFromQuery(query), { ...defaultThemeVariables, chroma: 0.12 });
});

test("canonical shares use latest settings, omit defaults and unrelated query data", () => {
  const settings = validateBuilderSettings({
    ...defaultThemeVariables,
    hue: 180,
    fontFamily: "geist",
    vibrantPalette: true,
  });
  const url = new URL(builderShareURL("https://docs.example", "/cn/themes", settings));
  assert.equal(url.pathname, "/cn/themes");
  assert.deepEqual(
    [...url.searchParams],
    [
      ["hue", "180"],
      ["fontFamily", "geist"],
      ["vibrantPalette", "true"],
    ],
  );
  assert.equal(
    builderShareURL("https://docs.example", "/en/themes", defaultThemeVariables),
    "https://docs.example/en/themes",
  );
});

test("replacement without vibrantPalette clears it, including JSON imports and reset", () => {
  const imported = validateBuilderSettings(JSON.parse(JSON.stringify(defaultThemeVariables)));
  const query = builderQueryValues(imported);
  assert.equal(query.vibrantPalette, null);
  assert.deepEqual(settingsFromQuery(query), defaultThemeVariables);
  assert.throws(() => builderQueryValues({ ...imported, hue: 999 }));
});
