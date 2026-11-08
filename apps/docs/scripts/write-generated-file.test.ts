import assert from "node:assert/strict";
import { test } from "bun:test";
import { mkdtemp, readFile, readdir, rm, stat, utimes } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { writeGeneratedFile } from "./write-generated-file.ts";

test("unchanged generation preserves timestamps and concurrent readers see complete JSON", async () => {
  const directory = await mkdtemp(path.join(tmpdir(), "lenso-generated-"));
  const file = path.join(directory, "index.json");
  const content = JSON.stringify({ text: "a".repeat(200_000) });
  try {
    await writeGeneratedFile(file, content);
    await utimes(file, 1, 1);
    const before = (await stat(file)).mtimeMs;
    await writeGeneratedFile(file, content);
    assert.equal((await stat(file)).mtimeMs, before);

    await Promise.all([
      ...Array.from({ length: 3 }, async (_, writer) => {
        for (let revision = 0; revision < 20; revision++)
          await writeGeneratedFile(
            file,
            JSON.stringify({ writer, revision, text: "b".repeat(200_000) }),
          );
      }),
      ...Array.from({ length: 3 }, async () => {
        for (let read = 0; read < 100; read++)
          assert.equal(JSON.parse(await readFile(file, "utf8")).text.length, 200_000);
      }),
    ]);
    assert.deepEqual(await readdir(directory), ["index.json"]);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});
