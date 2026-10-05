import assert from "node:assert/strict";
import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";
import { runIncremental } from "./generate-docs.ts";

// Previous preparation regenerated everything and rewrote local demos on each invocation.
test("generation handles clean, warm, source mutation, unrelated edit and missing output", async (t) => {
  const directory = await mkdtemp(path.join(tmpdir(), "lenso-docs-generation-"));
  t.after(() => rm(directory, { recursive: true, force: true }));
  await mkdir(path.join(directory, "source"));
  await writeFile(path.join(directory, "source/demo.tsx"), "first");
  let calls = 0;
  const generate = async () => {
    calls++;
    await mkdir(path.join(directory, "source/generated"), { recursive: true });
    await writeFile(
      path.join(directory, "source/generated/page.json"),
      await readFile(path.join(directory, "source/demo.tsx")),
    );
  };
  const run = () =>
    runIncremental(directory, ["source"], ["source/generated"], ".cache/state.json", generate, [
      "source/generated",
    ]);
  assert.equal(await run(), true);
  assert.equal(await run(), false);
  await writeFile(path.join(directory, "unrelated.md"), "not an input");
  assert.equal(await run(), false);
  await writeFile(path.join(directory, "source/demo.tsx"), "second");
  assert.equal(await run(), true);
  assert.equal(await readFile(path.join(directory, "source/demo.tsx"), "utf8"), "second");
  assert.equal(await run(), false);
  await rm(path.join(directory, "source/generated/page.json"));
  assert.equal(await run(), true);
  assert.equal(calls, 3);
});

test("failed generation is retried, never cached as complete", async (t) => {
  const directory = await mkdtemp(path.join(tmpdir(), "lenso-docs-failed-generation-"));
  t.after(() => rm(directory, { recursive: true, force: true }));
  await writeFile(path.join(directory, "input"), "content");
  let calls = 0;
  const run = () =>
    runIncremental(directory, ["input"], ["output"], ".cache/state.json", async () => {
      if (++calls === 1) throw new Error("generation failed");
      await writeFile(path.join(directory, "output"), "complete");
    });
  await assert.rejects(run(), /generation failed/);
  assert.equal(await run(), true);
  assert.equal(await run(), false);
  assert.equal(calls, 2);
});

test("an input changed during generation invalidates the next invocation", async (t) => {
  const directory = await mkdtemp(path.join(tmpdir(), "lenso-docs-concurrent-edit-"));
  t.after(() => rm(directory, { recursive: true, force: true }));
  await writeFile(path.join(directory, "input"), "first");
  let calls = 0;
  const run = () =>
    runIncremental(directory, ["input"], ["output"], ".cache/state.json", async () => {
      await writeFile(
        path.join(directory, "output"),
        await readFile(path.join(directory, "input")),
      );
      if (++calls === 1) await writeFile(path.join(directory, "input"), "edited while generating");
    });
  assert.equal(await run(), true);
  assert.equal(await run(), true);
  assert.equal(await run(), false);
  assert.equal(await readFile(path.join(directory, "output"), "utf8"), "edited while generating");
});
