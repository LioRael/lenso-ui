import assert from "node:assert/strict";
import { test } from "bun:test";
import { createHash } from "node:crypto";
import { cp, mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { pathToFileURL } from "node:url";
import { legalPackages, validateLegalPackage } from "../scripts/legal-attribution.ts";

for (const entry of legalPackages) {
  test(`${entry.name}: missing or damaged legal assets fail the distribution caller`, async () => {
    const directory = await mkdtemp(`${tmpdir()}/lenso-legal-`);
    const root = pathToFileURL(`${directory}/`);
    const text = "dist/THIRD_PARTY_NOTICES.md";
    const original = new URL("../THIRD_PARTY_NOTICES.md", import.meta.url);
    try {
      await mkdir(new URL("./", new URL(text, root)), { recursive: true });
      await writeFile(
        new URL("package.json", root),
        JSON.stringify({ name: entry.name, license: entry.license }),
      );
      await cp(original, new URL(text, root));
      if (entry.directory === "glass") {
        await mkdir(new URL("dist/source/src/", root), { recursive: true });
        for (const file of ["gpu-blur.ts", "gpu-optics.ts"])
          await cp(
            new URL(`../packages/glass/src/${file}`, import.meta.url),
            new URL(`dist/source/src/${file}`, root),
          );
        await cp(
          new URL("../packages/glass/tsdown.config.ts", import.meta.url),
          new URL("dist/source/tsdown.config.ts", root),
        );
      }
      await validateLegalPackage(root, entry);
      await writeFile(
        new URL(text, root),
        (await readFile(original, "utf8")).replace(/Copyright[^\n]+/, ""),
      );
      await assert.rejects(validateLegalPackage(root, entry), /original license/);
      await rm(new URL(text, root));
      await assert.rejects(validateLegalPackage(root, entry), /ENOENT/);
    } finally {
      await rm(directory, { recursive: true, force: true });
    }
  });
}

// Pin the consolidated license texts, including retained contributor copyrights.
test("consolidated notices preserve the original license texts", async () => {
  const notice = await readFile(new URL("../THIRD_PARTY_NOTICES.md", import.meta.url), "utf8");
  const originals = [
    ["Glass MIT license", "60151b6b09e4da3266138a369051052646b3867ebf2de277e02e808e83e7858f"],
    [
      "HeroUI Apache-2.0 license",
      "bd087c1ebd511adbab74705ec2b31d63d175e8d422f58c1af54754da02b1d329",
    ],
    [
      "React Spectrum Apache-2.0 license",
      "7dfe6526888bac51759c99f9a51262ba2711a8c12a067f2181609dd9a4066b84",
    ],
    [
      "WebKit LGPL-2.0-or-later license",
      "45decd245a7c2fddf18e215359a3c1892c1770438f7f81a1b21bdd525a942fa7",
    ],
  ] as const;
  for (const [title, hash] of originals) {
    const start = `### ${title}\n\n\`\`\`text\n`;
    const [, remainder] = notice.split(start);
    assert.ok(remainder, `Missing original ${title}`);
    const end = remainder.indexOf("\n```\n");
    assert.notEqual(end, -1, `Missing closing fence for ${title}`);
    assert.equal(
      createHash("sha256")
        .update(`${remainder.slice(0, end)}\n`)
        .digest("hex"),
      hash,
      title,
    );
  }
});
