import assert from "node:assert/strict";
import test from "node:test";
import { cp, mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { pathToFileURL } from "node:url";
import { legalPackages, validateLegalPackage } from "./legal-attribution.mjs";

for (const entry of legalPackages) {
  test(`${entry.name}: missing or damaged legal assets fail the distribution caller`, async () => {
    const directory = await mkdtemp(`${tmpdir()}/lenso-legal-`);
    const root = pathToFileURL(`${directory}/`);
    try {
      const original =
        entry.license === "MIT"
          ? new URL("../packages/stylex-build/LICENSE", import.meta.url)
          : new URL("../third-party/heroui/LICENSE.txt", import.meta.url);
      const notice =
        entry.license === "MIT"
          ? new URL("../third-party/stylex/NOTICE.md", import.meta.url)
          : new URL("../third-party/heroui/NOTICE.md", import.meta.url);
      await mkdir(new URL("./", new URL(entry.text, root)), { recursive: true });
      await writeFile(
        new URL("package.json", root),
        JSON.stringify({ name: entry.name, license: entry.license }),
      );
      await cp(original, new URL(entry.text, root));
      await cp(notice, new URL(entry.notice, root));
      if (entry.license === "MIT") {
        await mkdir(new URL("src/", root));
        await cp(
          new URL("../packages/stylex-build/src/adapters.mjs", import.meta.url),
          new URL("src/adapters.mjs", root),
        );
      }
      await validateLegalPackage(root, entry);
      const license = await readFile(original, "utf8");
      await writeFile(new URL(entry.text, root), license.replace(/Copyright[^\n]+/g, ""));
      await assert.rejects(validateLegalPackage(root, entry), /original license/);
      await cp(original, new URL(entry.text, root));
      await writeFile(
        new URL(entry.notice, root),
        (await readFile(notice, "utf8")).replace("Modified by Lenso contributors:", "Changes:"),
      );
      await assert.rejects(validateLegalPackage(root, entry));
      await rm(new URL(entry.notice, root));
      await assert.rejects(validateLegalPackage(root, entry), /ENOENT/);
      await cp(notice, new URL(entry.notice, root));
      await rm(new URL(entry.text, root));
      await assert.rejects(validateLegalPackage(root, entry), /ENOENT/);
    } finally {
      await rm(directory, { recursive: true, force: true });
    }
  });
}
