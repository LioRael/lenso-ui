import assert from "node:assert/strict";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, test } from "bun:test";
import { checkProject, planInit } from "../src/project.ts";
import { fixture } from "@lenso/ui-devtools/testing";

const temporaryDirectories: string[] = [];
afterEach(async () => {
  await Promise.all(
    temporaryDirectories
      .splice(0)
      .map((directory) => rm(directory, { recursive: true, force: true })),
  );
});

test("Next global-error owns its ordinary StyleX stylesheet", async () => {
  const root = await mkdtemp(join(tmpdir(), "lenso-next-css-check-"));
  temporaryDirectories.push(root);
  await writeFile(
    join(root, "package.json"),
    JSON.stringify({ private: true, type: "module", dependencies: { next: "16.3.8" } }),
  );
  await mkdir(join(root, "app"));
  const file = join(root, "app/global-error.tsx");
  await writeFile(
    file,
    '"use client"; export default function Error() { return <html><body>Recovery</body></html>; }',
  );
  const contract = await fixture();
  const errors = async () =>
    (await checkProject(root, contract)).diagnostics.filter(
      (entry) => entry.ruleId === "lenso/next-global-error",
    );
  assert.equal((await errors()).length, 1);
  await writeFile(join(root, "lenso.theme.css"), '@import "@lenso/tokens/styles.css";\n@stylex;');
  await writeFile(
    file,
    '"use client"; import "../lenso.theme.css"; export default function Error() { return <html><body>Recovery</body></html>; }',
  );
  assert.deepEqual(await errors(), []);
  const plan = await planInit(root, "next", contract);
  assert.ok(!plan.conflicts.some((conflict) => conflict.includes("global-error")));
});
