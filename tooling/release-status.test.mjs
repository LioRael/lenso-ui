import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, test } from "node:test";
import assert from "node:assert/strict";

import { checkReleaseStatus, writeReleaseStatus } from "./release-status.mjs";

const roots = new Set();

afterEach(async () => {
  await Promise.all([...roots].map((root) => rm(root, { recursive: true })));
  roots.clear();
});

test("checks without writing and updates only marked release slots", async () => {
  const root = await fixture({ version: "0.4.0" });
  const readme = join(root, "README.md");
  const before = await readFile(readme, "utf8");

  await assert.rejects(checkReleaseStatus(root), /release status is stale/u);
  assert.equal(await readFile(readme, "utf8"), before);

  await writeReleaseStatus(root);
  await checkReleaseStatus(root);
  assert.equal(
    await readFile(readme, "utf8"),
    [
      "Unmarked historical version 9.9.9.",
      "<!-- lenso-release-slot:start -->",
      "Current 0.4.0 and /r/v/0.4.0/.",
      "<!-- lenso-release-slot:end -->",
      "",
    ].join("\n"),
  );
});

test("rejects mismatched versions in the Changesets fixed group", async () => {
  const root = await fixture({
    versions: {
      "@lenso/primitives": "0.4.0",
      "@lenso/tokens": "0.4.0",
      "@lenso/ui": "0.4.1",
    },
  });

  await assert.rejects(checkReleaseStatus(root), /fixed-group package versions disagree/u);
});

async function fixture({ version, versions } = {}) {
  const root = await mkdtemp(join(tmpdir(), "lenso-release-status-test-"));
  roots.add(root);
  await mkdir(join(root, ".changeset"), { recursive: true });
  await mkdir(join(root, "packages/primitives"), { recursive: true });
  await mkdir(join(root, "packages/tokens"), { recursive: true });
  await mkdir(join(root, "packages/ui"), { recursive: true });
  await mkdir(join(root, "docs"), { recursive: true });
  await mkdir(join(root, "apps/docs/contents/start/release-status"), {
    recursive: true,
  });
  await writeJson(join(root, ".changeset/config.json"), {
    fixed: [["@lenso/ui", "@lenso/primitives", "@lenso/tokens"]],
  });
  const packageVersions =
    versions ??
    Object.fromEntries(
      ["@lenso/ui", "@lenso/primitives", "@lenso/tokens"].map((name) => [name, version]),
    );
  for (const [name, path] of [
    ["@lenso/ui", "packages/ui/package.json"],
    ["@lenso/primitives", "packages/primitives/package.json"],
    ["@lenso/tokens", "packages/tokens/package.json"],
  ]) {
    await writeJson(join(root, path), { name, version: packageVersions[name] });
  }
  const stale = [
    "Unmarked historical version 9.9.9.",
    "<!-- lenso-release-slot:start -->",
    "Current 0.2.0 and /r/v/0.2.0/.",
    "<!-- lenso-release-slot:end -->",
    "",
  ].join("\n");
  await Promise.all(
    [
      "README.md",
      "docs/architecture.md",
      "apps/docs/contents/start/release-status/content.mdx",
    ].map((path) => writeFile(join(root, path), stale)),
  );
  return root;
}

function writeJson(path, value) {
  return writeFile(path, `${JSON.stringify(value, null, 2)}\n`);
}
