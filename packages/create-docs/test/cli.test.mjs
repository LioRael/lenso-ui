import { mkdtemp, readFile, readdir, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import test from "node:test";
import assert from "node:assert/strict";
import { fileURLToPath } from "node:url";

const packageDir = fileURLToPath(new URL("..", import.meta.url));
const cli = path.join(packageDir, "src/cli.mjs");

function run(args, cwd) {
  return spawnSync(process.execPath, [cli, ...args], { cwd, encoding: "utf8" });
}

test("initializer creates a content-only project without installing dependencies", async (t) => {
  const root = await mkdtemp(path.join(os.tmpdir(), "lenso-docs-"));
  t.after(() => rm(root, { recursive: true, force: true }));
  const target = path.join(root, "my-notes");
  const result = run([target], root);
  assert.equal(result.status, 0, result.stderr);
  const entries = await readdir(target);
  assert.deepEqual(
    entries.sort(),
    [
      ".gitignore",
      "LICENSE",
      "README.md",
      "components",
      "content",
      "docs-components.tsx",
      "docs.config.ts",
      "package.json",
      "public",
    ].sort(),
  );
  assert.equal(
    await readFile(path.join(target, "docs.config.ts"), "utf8"),
    await readFile(path.join(packageDir, "template", "docs.config.ts"), "utf8"),
  );
  assert.equal(
    (await readFile(path.join(target, ".gitignore"), "utf8")).includes("node_modules/"),
    true,
  );
  assert.equal(
    await readFile(path.join(target, "content/guides/content.mdx"), "utf8"),
    await readFile(path.join(packageDir, "template", "content/guides/content.mdx"), "utf8"),
  );
  for (const file of [
    "docs-components.tsx",
    "components/Counter.tsx",
    "content/components/counter.mdx",
    "content/api/messages.mdx",
  ]) {
    const generated = await readFile(path.join(target, file), "utf8");
    const template = await readFile(path.join(packageDir, "template", file), "utf8");
    assert.equal(generated, template, `${file} should be copied from the template`);
  }
  const manifest = JSON.parse(await readFile(path.join(target, "package.json"), "utf8"));
  assert.equal(manifest.name, "my-notes");
  assert.equal(manifest.dependencies["@lenso/docs"], "0.1.0");
  assert.deepEqual(manifest.scripts, {
    dev: "lenso-docs dev --turbopack",
    build: "lenso-docs build",
    preview: "lenso-docs preview",
  });
});

test("initializer refuses nonempty targets without changing them", async (t) => {
  const root = await mkdtemp(path.join(os.tmpdir(), "lenso-docs-"));
  t.after(() => rm(root, { recursive: true, force: true }));
  const target = path.join(root, "occupied");
  await import("node:fs/promises").then(({ mkdir }) => mkdir(target));
  await writeFile(path.join(target, "keep.txt"), "untouched");
  const result = run([target], root);
  assert.notEqual(result.status, 0);
  assert.equal(await readFile(path.join(target, "keep.txt"), "utf8"), "untouched");
  assert.deepEqual(await readdir(target), ["keep.txt"]);
});

test("help and version are available without creating files", async () => {
  assert.match(run(["--help"], process.cwd()).stdout, /Usage:/);
  assert.equal(run(["--version"], process.cwd()).stdout.trim(), "0.1.0");
});
