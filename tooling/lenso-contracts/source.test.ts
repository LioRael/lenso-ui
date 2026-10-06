import assert from "node:assert/strict";
import test from "node:test";
import { themeDeclarations } from "./source.ts";
import { implementationImports, themeEditableTokens } from "./source-parser.ts";
import { readFile } from "node:fs/promises";

// Theme values can contain separators inside strings/functions; a declaration regex loses scope and raw data.
test("preserves nested CSS scopes, multiline mixes, fallbacks and quoted separators", () => {
  const file = "packages/styles/themes/default/variables.css";
  const code = `/* provenance */
@layer base {
  :root, :host {
    --accent: color-mix(
      in oklch, var(--accent-base, oklch(60% 0.1 20)) 90%, transparent
    );
    --font-sans: "A;B", system-ui;
  }
  @media (prefers-color-scheme: dark) {
    [data-theme="dark"] { --accent: var(--snow) }
  }
}`;
  assert.deepEqual(themeDeclarations({ file, code }), [
    {
      file,
      scope: ["@layer base", ":root, :host"],
      name: "--accent",
      value:
        "color-mix(\n      in oklch, var(--accent-base, oklch(60% 0.1 20)) 90%, transparent\n    )",
    },
    {
      file,
      scope: ["@layer base", ":root, :host"],
      name: "--font-sans",
      value: '"A;B", system-ui',
    },
    {
      file,
      scope: ["@layer base", "@media (prefers-color-scheme: dark)", '[data-theme="dark"]'],
      name: "--accent",
      value: "var(--snow)",
    },
  ]);
  assert.throws(
    () => themeDeclarations({ file, code: ":root { --accent: var(--missing;" }),
    /Unbalanced/,
  );
});

test("extracts imports from Babel syntax without treating comments or strings as imports", () => {
  const file = "packages/react/src/components/menu/menu.tsx";
  assert.deepEqual(
    implementationImports({
      file,
      code: `
    // import("./invented")
    const text = 'export * from "./invented"';
    import type { Value } from "./types.js";
    type Other = import("./other.js").Other;
    import Legacy = require("./legacy.js");
    export { shared } from "../../utils/shared.js";
    const load = () => import("./lazy");
  `,
    }),
    ["../../utils/shared.js", "./lazy", "./legacy.js", "./other.js", "./types.js"],
  );
  assert.throws(
    () => implementationImports({ file, code: "import(getSource())" }),
    /literal dynamic/,
  );
});

test("verifies the actual static editor schema and labels without executing source", async () => {
  const file = "packages/styles/src/theme.ts";
  const code = await readFile(
    new URL("../../packages/styles/src/theme.ts", import.meta.url),
    "utf8",
  );
  const tokens = themeEditableTokens({ file, code });
  assert.ok(tokens.length > 1);
  assert.deepEqual(
    tokens.find((token) => token.key === "field-background"),
    {
      key: "field-background",
      label: "Field Background",
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
        code: code.replace('white: "color"', '...getCategories(), white: "color"'),
      }),
    /literal properties/,
  );
});
