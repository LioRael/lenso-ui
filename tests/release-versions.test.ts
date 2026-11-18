import { test } from "bun:test";
import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));

test("Changesets propagates exact workspace releases without bumping unchanged Primitives", async () => {
  const directory = await mkdtemp(join(tmpdir(), "lenso-release-versions-"));
  const json = async (path: string, value: unknown) => {
    await mkdir(join(directory, path, ".."), { recursive: true });
    await writeFile(join(directory, path), JSON.stringify(value, null, 2) + "\n");
  };
  try {
    await json("package.json", {
      name: "fixture",
      private: true,
      packageManager: "bun@1.4.4",
      workspaces: ["packages/*"],
    });
    await writeFile(join(directory, "bun.lock"), "{}\n");
    const expected: Record<string, string> = {
      tokens: "0.11.5",
      glass: "0.2.5",
      primitives: "0.9.1",
      ui: "0.11.5",
      docs: "0.3.6",
      "create-docs": "0.3.6",
    };
    const initial: Record<string, string> = {
      tokens: "0.11.4",
      glass: "0.2.4",
      primitives: "0.9.1",
      ui: "0.11.4",
      docs: "0.3.5",
      "create-docs": "0.3.5",
    };
    for (const dir of Object.keys(expected)) {
      const manifest = JSON.parse(
        await readFile(join(root, "packages", dir, "package.json"), "utf8"),
      );
      await json(`packages/${dir}/package.json`, { ...manifest, version: initial[dir] });
    }
    await mkdir(join(directory, ".changeset"));
    await writeFile(
      join(directory, ".changeset/config.json"),
      await readFile(join(root, ".changeset/config.json")),
    );
    await writeFile(
      join(directory, ".changeset/patch.md"),
      '---\n"@lenso/ui": patch\n"@lenso/glass": patch\n---\n\nFix host lifecycle.\n',
    );
    await json("packages/create-docs/template/package.json", {
      dependencies: { "@lenso/docs": "0.3.5", react: "19.3.1" },
    });
    execFileSync(process.execPath, [join(root, "node_modules/@changesets/cli/bin.js"), "version"], {
      cwd: directory,
      stdio: "pipe",
    });
    for (const [dir, version] of Object.entries(expected)) {
      const manifest = JSON.parse(
        await readFile(join(directory, "packages", dir, "package.json"), "utf8"),
      );
      assert.equal(manifest.version, version, dir);
    }
    const ui = JSON.parse(await readFile(join(directory, "packages/ui/package.json"), "utf8"));
    assert.equal(ui.dependencies["@lenso/glass"], "workspace:*");
    assert.equal(ui.dependencies["@lenso/primitives"], "workspace:*");
    const result = spawnSync(process.execPath, [join(root, "scripts/sync-release-versions.ts")], {
      cwd: directory,
      encoding: "utf8",
    });
    assert.equal(result.status, 0, result.stderr);
    const template = JSON.parse(
      await readFile(join(directory, "packages/create-docs/template/package.json"), "utf8"),
    );
    assert.deepEqual(template.dependencies, { "@lenso/docs": "0.3.6", react: "19.3.1" });
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});
