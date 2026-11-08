import assert from "node:assert/strict";
import { mkdtemp, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { pathToFileURL } from "node:url";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, test } from "bun:test";
import { buildDistribution } from "@lenso/ui-devtools/build";
import { fixture } from "@lenso/ui-devtools/testing";

const temporaryDirectories: string[] = [];
afterEach(async () => {
  await Promise.all(
    temporaryDirectories
      .splice(0)
      .map((directory) => rm(directory, { recursive: true, force: true })),
  );
});

// Copying source folders directly cannot prove a warm production build drops
// obsolete skill references that would otherwise reach consumer plans.
test("distribution rebuild replaces portable skill trees rather than overlaying stale files", async () => {
  const directory = await mkdtemp(path.join(tmpdir(), "lenso-tool-distribution-"));
  temporaryDirectories.push(directory);
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
