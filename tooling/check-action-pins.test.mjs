import assert from "node:assert/strict";
import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, test } from "node:test";

import { checkActionPins, findUnpinnedActions } from "./check-action-pins.mjs";

const roots = new Set();

afterEach(async () => {
  await Promise.all([...roots].map((root) => rm(root, { recursive: true })));
  roots.clear();
});

test("rejects non-SHA GitHub Action refs with file and line evidence", async () => {
  const root = await fixture(`jobs:
  verify:
    steps:
      - uses: actions/checkout@v6
      - uses: ./.github/actions/local
      - uses: actions/setup-node@249970729cb0ef3589644e2896645e5dc5ba9c38 # v6
`);

  assert.deepEqual(await findUnpinnedActions(root), [
    {
      action: "actions/checkout@v6",
      line: 4,
      path: ".github/workflows/ci.yml",
    },
  ]);
  await assert.rejects(
    checkActionPins(root),
    /\.github\/workflows\/ci\.yml:4 actions\/checkout@v6/u,
  );
});

test("accepts fully pinned and local Actions", async () => {
  const root = await fixture(`jobs:
  verify:
    steps:
      - uses: actions/checkout@d23441a48e516b6c34aea4fa41551a30e30af803 # v6
      - uses: ./.github/actions/local
`);

  await checkActionPins(root);
  assert.deepEqual(await findUnpinnedActions(root), []);
});

async function fixture(workflow) {
  const root = await mkdtemp(join(tmpdir(), "lenso-action-pins-test-"));
  roots.add(root);
  await mkdir(join(root, ".github/workflows"), { recursive: true });
  await writeFile(join(root, ".github/workflows/ci.yml"), workflow);
  return root;
}
