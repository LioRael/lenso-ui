import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

export const legalPackages = [
  {
    directory: "react",
    name: "@lenso/ui",
    license: "Apache-2.0",
    text: "dist/HEROUI-LICENSE.txt",
    notice: "dist/HEROUI-NOTICE.md",
  },
  {
    directory: "styles",
    name: "@lenso/tokens",
    license: "Apache-2.0",
    text: "dist/third-party/heroui/LICENSE.txt",
    notice: "dist/third-party/heroui/NOTICE.md",
  },
  {
    directory: "stylex-build",
    name: "@lenso/stylex-build",
    license: "MIT",
    text: "LICENSE",
    notice: "NOTICE.md",
  },
];

// Check extracted packed files, not the source manifest's intended allowlist.
export async function validateLegalPackage(root, entry) {
  const get = (path) => readFile(new URL(path, root), "utf8");
  const manifest = JSON.parse(await get("package.json"));
  assert.equal(manifest.name, entry.name);
  assert.equal(manifest.license, entry.license);
  const [license, notice] = await Promise.all([get(entry.text), get(entry.notice)]);
  const original =
    entry.license === "MIT"
      ? new URL("../packages/stylex-build/LICENSE", import.meta.url)
      : new URL("../third-party/heroui/LICENSE.txt", import.meta.url);
  assert.equal(
    license,
    await readFile(original, "utf8"),
    "Full original license must ship unchanged",
  );
  assert.match(notice, /Modified by Lenso contributors:/);
  if (entry.license === "Apache-2.0") {
    assert.match(license, /Copyright 2025 NextUI Inc\./);
    assert.match(notice, /e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e/);
    assert.match(notice, /authored by Lenso/);
  } else {
    assert.match(license, /Copyright \(c\) Meta Platforms, Inc\. and affiliates\./);
    assert.match(notice, /@stylexjs\/unplugin@0\.19\.0/);
    assert.match(await get("src/adapters.mjs"), /Copyright \(c\) Meta Platforms/);
  }
  return {
    name: manifest.name,
    version: manifest.version,
    license: manifest.license,
    files: [entry.text, entry.notice],
  };
}
