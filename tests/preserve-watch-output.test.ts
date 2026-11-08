import assert from "node:assert/strict";
import { test } from "bun:test";

test("watch output preserves identical final bytes while changed/new and production outputs remain", async () => {
  const { mkdtemp, writeFile, readFile, stat, rm } = await import("node:fs/promises");
  const { join } = await import("node:path");
  const { default: preserveWatchOutput } = await import("../scripts/preserve-watch-output.ts");
  const root = await mkdtemp("/tmp/lenso-watch-output-");
  try {
    await writeFile(join(root, "entry.js"), "export const x=1;\n");
    await writeFile(join(root, "rules.json"), "same");
    const before = (await stat(join(root, "entry.js"))).mtimeMs;
    const bundle = {
      "entry.js": { type: "chunk" as const, fileName: "entry.js", code: "export const x=1;\n" },
      "rules.json": {
        type: "asset" as const,
        fileName: "rules.json",
        source: new Uint8Array(Buffer.from("same")),
      },
      "changed.css": { type: "asset" as const, fileName: "changed.css", source: ".x{width:2px}" },
      "new.js": { type: "chunk" as const, fileName: "new.js", code: "export const newValue=1;" },
    };
    await writeFile(join(root, "changed.css"), ".x{width:1px}");
    const original = structuredClone(bundle);
    const hook = preserveWatchOutput().generateBundle.handler;
    await hook.call({ meta: { watchMode: true } }, { dir: root }, bundle, true);
    assert.deepEqual(Object.keys(bundle), ["changed.css", "new.js"]);
    assert.equal((await stat(join(root, "entry.js"))).mtimeMs, before);
    assert.equal(await readFile(join(root, "entry.js"), "utf8"), "export const x=1;\n");
    const production = structuredClone(original);
    await hook.call({ meta: { watchMode: false } }, { dir: root }, production, true);
    assert.deepEqual(production, original);
    const generated = structuredClone(original);
    await hook.call({ meta: { watchMode: true } }, { dir: root }, generated, false);
    assert.deepEqual(generated, original);
  } finally {
    await rm(root, { recursive: true });
  }
});
