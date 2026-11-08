import assert from "node:assert/strict";
import { glob, readFile } from "node:fs/promises";
import { test } from "bun:test";

const root = new URL("../../../", import.meta.url);
const patterns = [
  "packages/tokens/src/**/*.{ts,tsx}",
  "packages/ui/src/**/*.{ts,tsx}",
  "packages/docs/presentation/**/*.{ts,tsx}",
  "packages/docs/src/**/*.{ts,tsx,css}",
  "packages/storybook/stories/**/*.{ts,tsx}",
  "apps/docs/src/**/*.{ts,tsx,css}",
  "apps/docs/scripts/docs-projection.ts",
  "apps/docs/scripts/generate-page-documents.ts",
  "apps/docs/content/lenso/**/*.mdx",
];
// These silently fell back to invalid/transparent colors in live documentation;
// palette resolution tests alone cannot catch a consumer using a retired name.
const retired =
  /(?<![\w-])--(?:accent(?:-[\w-]+)?|apple-(?!material-profile\b|glass-icon-(?:width|height)\b)[\w-]+|foreground|muted|background(?:-secondary|-tertiary|-inverse)?|surface(?:-[\w-]+)?|default(?:-[\w-]+)?|primary|shadow-(?:xs|sm|md|lg|panel)|lg-tint|switch-control-bg(?:-[\w-]+)?)(?![\w-])/g;

test("components and authored examples do not consume retired theme names or self-referential overrides", async () => {
  const files: string[] = [];
  for await (const file of glob(patterns, { cwd: root })) {
    // Generated component pages duplicate checked source and may be absent or stale.
    if (
      /\.test[.-]|test-styles|\/releases\//.test(file) ||
      /^apps\/docs\/content\/lenso\/(en|cn)\/react\/components\//.test(file) ||
      file === "apps/docs/src/demos/generated.ts"
    )
      continue;
    files.push(file);
  }
  const failures: string[] = [];
  for (let index = 0; index < files.length; index += 16) {
    await Promise.all(
      files.slice(index, index + 16).map(async (file) => {
        const source = await readFile(new URL(file, root), "utf8");
        for (const match of source.matchAll(retired)) failures.push(`${file}: ${match[0]}`);
        for (const match of source.matchAll(/"(--lenso-[\w-]+)":\s*"var\(\1\)"/g)) {
          failures.push(`${file}: cyclic override ${match[1]}`);
        }
      }),
    );
  }
  assert.deepEqual(failures.sort(), []);
}, 30000);
