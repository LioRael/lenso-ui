import { expect, test } from "bun:test";
import { mkdtemp, mkdir, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { watchThemeSources } from "../src/development.ts";

// Project-only watching misses sibling library edits. Watching all package files
// instead loops on generated bridges and dist; exercise actual filesystem events.
test("theme watcher observes library sources and ignores its own build outputs", async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), "exact-docs-watch-"));
  const packages = path.join(root, "packages"),
    themes = path.join(root, "themes");
  for (const directory of [
    themes,
    ...["ui-exact", "glass", "tokens", "primitives-exact"].map((name) => path.join(packages, name)),
  ])
    await mkdir(directory, { recursive: true });
  const events: string[] = [];
  const stop = watchThemeSources((kind) => events.push(kind), packages, themes);
  const wait = async () => {
    for (let attempt = 0; attempt < 100 && !events.length; attempt++) await Bun.sleep(10);
  };
  try {
    for (const file of [
      "ui-exact/src/web.ts",
      "glass/src/refraction.ts",
      "tokens/src/color.ts",
      "primitives-exact/components/button.contract",
      "ui-exact/index.contract",
    ]) {
      events.length = 0;
      await Bun.write(path.join(packages, file), "source");
      await wait();
      expect(events).toContain("ui");
      await Bun.sleep(30);
    }
    events.length = 0;
    await Bun.write(path.join(themes, "lenso/styles.ts"), "theme");
    await wait();
    expect(events).toContain("theme");
    await Bun.sleep(30);
    events.length = 0;
    for (const file of [
      "ui-exact/dist/web.js",
      "ui-exact/components/generated/button.contract",
      "glass/test/example.ts",
      "tokens/.cache/styles.css",
      "ui-exact/node_modules/x/index.js",
    ])
      await Bun.write(path.join(packages, file), "output");
    await Bun.sleep(150);
    expect(events).toEqual([]);
    stop();
    await Bun.write(path.join(packages, "glass/src/refraction.ts"), "stopped");
    await Bun.sleep(50);
    expect(events).toEqual([]);
  } finally {
    stop();
    await rm(root, { recursive: true, force: true });
  }
});
