import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

export const legalPackages = [
  { directory: "ui", name: "@lenso/ui", license: "(Apache-2.0 AND MIT)" },
  { directory: "glass", name: "@lenso/glass", license: "(MIT AND LGPL-2.0-or-later)" },
  { directory: "tokens", name: "@lenso/tokens", license: "Apache-2.0" },
];

// Check the extracted package, including the complete notices actually shipped.
export async function validateLegalPackage(root: URL, entry: (typeof legalPackages)[number]) {
  const get = (path: string) => readFile(new URL(path, root), "utf8");
  const manifest = JSON.parse(await get("package.json"));
  assert.equal(manifest.name, entry.name);
  assert.equal(manifest.license, entry.license);
  const text = "dist/THIRD_PARTY_NOTICES.md";
  const original = new URL("../THIRD_PARTY_NOTICES.md", import.meta.url);
  const license = await get(text);
  assert.equal(
    license,
    await readFile(original, "utf8"),
    "Full original license notices must ship unchanged",
  );
  if (entry.directory === "glass") {
    assert.match(license, /LGPL-2\.0-or-later/);
    for (const file of ["gpu-blur.ts", "gpu-optics.ts"])
      assert.match(await get(`dist/source/src/${file}`), /LGPL-2\.0-or-later/);
    await get("dist/source/tsdown.config.ts");
  }
  return {
    name: manifest.name,
    version: manifest.version,
    license: manifest.license,
    files: [text],
  };
}
