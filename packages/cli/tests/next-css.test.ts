import assert from "node:assert/strict";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { checkProject, planInit } from "../src/project.mjs";
import { fixture } from "./fixture.mjs";

// The legacy-only diagnostic must not reject a verified explicit-CSS configuration.
test("Next global-error diagnostics distinguish prepared CSS from legacy delivery", async (t) => {
  const root = await mkdtemp(join(tmpdir(), "lenso-next-css-check-"));
  t.after(() => rm(root, { recursive: true, force: true }));
  await writeFile(
    join(root, "package.json"),
    JSON.stringify({ private: true, type: "module", dependencies: { next: "16.3.8" } }),
  );
  await mkdir(join(root, "app"));
  await writeFile(
    join(root, "app/global-error.tsx"),
    `"use client"; import "@lenso/tokens/styles.css"; import "./lenso.generated.css";
export default function Error() { return <html><body>Recovery</body></html>; }`,
  );
  const contract = await fixture();
  const globalError = async () =>
    (await checkProject(root, contract)).diagnostics.filter(
      (entry: { ruleId: string }) => entry.ruleId === "lenso/next-global-error",
    );
  assert.equal((await globalError()).length, 1);
  await writeFile(
    join(root, "next.config.ts"),
    `import { prepareNext as prepare } from "@lenso/stylex-build";
export default { async webpack(config) {
  config.plugins.push(await prepare({ cssFile: new URL("./app/lenso.generated.css", import.meta.url) }));
  return config;
} };`,
  );
  assert.deepEqual(await globalError(), []);
  await writeFile(
    join(root, "next.config.ts"),
    `import type { prepareNext } from "@lenso/stylex-build";
const example = "prepareNext()";
export default {};`,
  );
  assert.equal((await globalError()).length, 1);
  const plan = await planInit(root, "next", contract);
  assert.match(plan.conflicts.join("\n"), /global-error/);
});
