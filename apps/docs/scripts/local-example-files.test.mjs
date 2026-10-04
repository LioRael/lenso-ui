import assert from "node:assert/strict";
import test from "node:test";
import { mkdir, mkdtemp, writeFile, rm, symlink } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { localExampleFiles } from "../src/lib/local-example-files.ts";
import { docsDirectory } from "../src/lib/docs-directory.mjs";

const root = fileURLToPath(new URL("../../../", import.meta.url));

test("server source readers resolve the same docs directory from repository and docs cwd", () => {
  assert.equal(docsDirectory(root), path.join(root, "apps/docs"));
  assert.equal(docsDirectory(path.join(root, "apps/docs")), path.join(root, "apps/docs"));
});

// A single-file source pane omits the actual dynamic date-format scene and style helpers.
test("reads local static, re-exported and dynamic helper sources, preserving exact bytes and cycles", async (t) => {
  await mkdir(path.join(root, "test-results/lenso-docs-projection"), { recursive: true });
  const directory = await mkdtemp(path.join(root, "test-results/lenso-docs-projection/graph-"));
  t.after(() => rm(directory, { recursive: true, force: true }));
  const files = {
    "en/menu/basic.tsx":
      'import { styles } from "./styles.js";\nexport { Shared } from "./shared";\nconst scene = () => import("./scene").then((module) => module.Scene);\n',
    "en/menu/styles.ts": 'export const styles = { color: "red" };\n',
    "en/menu/shared.tsx": 'import "./styles.js";\nexport const Shared = () => null;\n',
    "en/menu/scene.tsx": 'import "./basic";\nexport const Scene = () => null;\n',
  };
  for (const [file, code] of Object.entries(files)) {
    await mkdir(path.dirname(path.join(directory, "src/demos", file)), { recursive: true });
    await writeFile(path.join(directory, "src/demos", file), code);
  }
  const graph = await localExampleFiles("en/menu/basic.tsx", directory);
  assert.deepEqual(Object.fromEntries(graph.map(({ file, code }) => [file, code])), files);
  assert.equal(graph.length, 4);
  await writeFile(path.join(directory, "src/demos/en/menu/scene.tsx"), 'import "./missing";');
  await assert.rejects(
    localExampleFiles("en/menu/basic.tsx", directory),
    /Missing local example helper/,
  );
  await assert.rejects(
    localExampleFiles("../../outside.tsx", directory),
    /escapes local demo root/,
  );
  await writeFile(path.join(directory, "outside.ts"), "export const secret = 'private';");
  await symlink(
    path.join(directory, "outside.ts"),
    path.join(directory, "src/demos/en/menu/escape.ts"),
  );
  await assert.rejects(localExampleFiles("en/menu/escape.ts", directory), /through a symlink/);
});
