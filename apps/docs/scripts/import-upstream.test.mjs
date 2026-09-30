import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import test from "node:test";

test("an unpinned checkout is rejected before any imported content is written", async () => {
  const manifest = new URL("../content/upstream-manifest.json", import.meta.url);
  const before = await readFile(manifest, "utf8");
  const result = spawnSync(
    process.execPath,
    [
      fileURLToPath(new URL("./import-upstream.mjs", import.meta.url)),
      "--source",
      fileURLToPath(new URL("../../../", import.meta.url)),
    ],
    { encoding: "utf8" },
  );
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /Refusing unpinned source/);
  assert.equal(await readFile(manifest, "utf8"), before);
});
