import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";

import { generateDocsManifest } from "./generate.mjs";

const roots = [];
afterEach(async () => {
  for (const root of roots.splice(0)) await rm(root, { recursive: true, force: true });
});

async function fixture() {
  const root = await mkdtemp(path.join(tmpdir(), "lenso-docs-"));
  roots.push(root);
  const contentDir = path.join(root, "contents");
  await mkdir(path.join(contentDir, "start", "quick-start"), { recursive: true });
  await writeFile(path.join(contentDir, "start", "content.mdx"), "---\ntitle: Overview\n---\n");
  await writeFile(
    path.join(contentDir, "start", "quick-start", "content.mdx"),
    "---\ntitle: Quick start\n---\n",
  );
  const outputFile = path.join(root, "manifest.json");
  return { contentDir, outputFile };
}

const tabs = [{ path: "start", label: "Start" }];

describe("docs manifest conventions", () => {
  it("derives routes and order from files and meta.json", async () => {
    const { contentDir, outputFile } = await fixture();
    await writeFile(
      path.join(contentDir, "start", "meta.json"),
      JSON.stringify({ pages: ["quick-start", "index"] }),
    );
    const result = await generateDocsManifest({
      contentDir,
      outputFile,
      publicDir: path.dirname(outputFile),
      site: "https://ui.lenso.dev",
      tabs,
    });
    expect(result.sections[0].items.map(({ href }) => href)).toEqual(["/start/quick-start", "/"]);
    expect(JSON.parse(await readFile(outputFile, "utf8"))).toEqual(result);
    expect(
      JSON.parse(await readFile(path.join(path.dirname(outputFile), "search.json"), "utf8")),
    ).toHaveLength(2);
    expect(await readFile(path.join(path.dirname(outputFile), "sitemap.xml"), "utf8")).toContain(
      "https://ui.lenso.dev/start/quick-start",
    );
  });

  it("rejects stale page ordering", async () => {
    const { contentDir, outputFile } = await fixture();
    await writeFile(
      path.join(contentDir, "start", "meta.json"),
      JSON.stringify({ pages: ["missing"] }),
    );
    await expect(generateDocsManifest({ contentDir, outputFile, tabs })).rejects.toThrow(
      "missing page",
    );
  });
});
