import assert from "node:assert/strict";
import { test } from "bun:test";
import { themeDeclarations } from "../src/contract/source.ts";
import { implementationImports, themeEditableTokens } from "../src/contract/source-parser.ts";
import { readFile } from "node:fs/promises";

// Theme values can contain separators inside strings/functions; a declaration regex loses scope and raw data.
test("preserves nested CSS scopes, multiline mixes, fallbacks and quoted separators", () => {
  const file = "packages/tokens/themes/default/variables.css";
  const code = `/* provenance */
@layer base {
  :root, :host {
    --lenso-tint: color-mix(
      in oklch, var(--test-tint-base, oklch(60% 0.1 20)) 90%, transparent
    );
    --lenso-font-body: "A;B", system-ui;
  }
  @media (prefers-color-scheme: dark) {
    [data-theme="dark"] { --lenso-tint: var(--lenso-constant-white) }
  }
}`;
  assert.deepEqual(themeDeclarations({ file, code }), [
    {
      file,
      scope: ["@layer base", ":root, :host"],
      name: "--lenso-tint",
      value:
        "color-mix(\n      in oklch, var(--test-tint-base, oklch(60% 0.1 20)) 90%, transparent\n    )",
    },
    {
      file,
      scope: ["@layer base", ":root, :host"],
      name: "--lenso-font-body",
      value: '"A;B", system-ui',
    },
    {
      file,
      scope: ["@layer base", "@media (prefers-color-scheme: dark)", '[data-theme="dark"]'],
      name: "--lenso-tint",
      value: "var(--lenso-constant-white)",
    },
  ]);
  assert.throws(
    () => themeDeclarations({ file, code: ":root { --lenso-tint: var(--missing;" }),
    /Unbalanced/,
  );
});

test("extracts imports from Babel syntax without treating comments or strings as imports", () => {
  const file = "packages/ui/src/components/menu/menu.tsx";
  assert.deepEqual(
    implementationImports({
      file,
      code: `
    // import("../src/contract/invented")
    const text = 'export * from "../src/contract/invented"';
    import type { Value } from "../src/contract/types.js";
    type Other = import("../src/contract/other.js").Other;
    import Legacy = require("../src/contract/legacy.js");
    export { shared } from "../../utils/shared.js";
    const load = () => import("../src/contract/lazy");
  `,
    }),
    [
      "../../utils/shared.js",
      "../src/contract/lazy",
      "../src/contract/legacy.js",
      "../src/contract/other.js",
      "../src/contract/types.js",
    ],
  );
  assert.throws(
    () => implementationImports({ file, code: "import(getSource())" }),
    /literal dynamic/,
  );
});

test("verifies the actual static editor schema and labels without executing source", async () => {
  const file = "packages/tokens/src/theme.ts";
  const code = await readFile(new URL("../../tokens/src/theme.ts", import.meta.url), "utf8");
  const tokens = themeEditableTokens({ file, code });
  assert.ok(tokens.length > 1);
  assert.deepEqual(
    tokens.find((token) => token.key === "background-secondary"),
    {
      key: "background-secondary",
      label: "Background Secondary",
      category: "color",
    },
  );
  assert.throws(
    () =>
      themeEditableTokens({
        file,
        code: code.replace("letter.toUpperCase()", "letter.toLowerCase()"),
      }),
    /cannot verify labels without executing/,
  );
  assert.throws(
    () =>
      themeEditableTokens({
        file,
        code: 'export const themeTokens = getTokens(); throw new Error("must never execute")',
      }),
    /cannot verify labels without executing/,
  );
  assert.throws(
    () =>
      themeEditableTokens({
        file,
        code: code.replace('tint: "color"', '...getCategories(), tint: "color"'),
      }),
    /literal properties/,
  );
});
