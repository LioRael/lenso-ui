import assert from "node:assert/strict";
import { mkdir, mkdtemp, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { fileURLToPath, pathToFileURL } from "node:url";
import path from "node:path";
import test from "node:test";
import { buildDistribution } from "../scripts/distribution.ts";
import { fixture } from "./fixture.ts";

// Copying source folders directly cannot prove a warm production build drops
// obsolete skill references that would otherwise reach consumer plans.
test("distribution rebuild replaces portable skill trees rather than overlaying stale files", async (t) => {
  const repository = fileURLToPath(new URL("../../../", import.meta.url));
  const parent = path.join(repository, "test-results/tool-distribution");
  await mkdir(parent, { recursive: true });
  const directory = await mkdtemp(path.join(parent, "build-"));
  t.after(() => rm(directory, { recursive: true, force: true }));
  const artifact = path.join(directory, "contract.json");
  await writeFile(artifact, JSON.stringify(await fixture()));
  const distUrl = pathToFileURL(`${path.join(directory, "dist")}/`);
  await buildDistribution("cli", { artifactUrl: pathToFileURL(artifact), distUrl });
  const stale = new URL("skills/lenso-ui/references/removed.md", distUrl);
  await writeFile(stale, "Obsolete instructions\n");
  await buildDistribution("cli", { artifactUrl: pathToFileURL(artifact), distUrl });
  assert.equal(
    (await readdir(new URL("skills/lenso-ui/references/", distUrl))).includes("removed.md"),
    false,
  );
  assert.equal(
    await readFile(new URL("skills/lenso-ui/LICENSE.txt", distUrl), "utf8"),
    await readFile(
      new URL("../../../.agents/skills/lenso-ui/LICENSE.txt", import.meta.url),
      "utf8",
    ),
  );
});
