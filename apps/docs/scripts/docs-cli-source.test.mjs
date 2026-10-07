import assert from "node:assert/strict";
import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { loadSource } from "../docs.source.mjs";

test("the CLI adapter reads fresh generated documents and preserves product routes, aliases and raw source", async (t) => {
  const root = await mkdtemp(path.join(os.tmpdir(), "lenso-cli-source-"));
  t.after(() => rm(root, { recursive: true, force: true }));
  await mkdir(path.join(root, "src/generated"), { recursive: true });
  await mkdir(path.join(root, "content"), { recursive: true });
  const pages = ["en", "cn"].map((locale) => ({
    locale,
    slug: "react/components/menu",
    title: locale === "en" ? "Menu" : "菜单",
    description: "A generated component.",
    markdownFile: `content/${locale}.mdx`,
    navigationGroup: "Components",
  }));
  for (const page of pages)
    await writeFile(
      path.join(root, page.markdownFile),
      `---\ntitle: ${page.title}\n---\n\n## API Reference\n`,
    );
  const indexPath = path.join(root, "src/generated/lenso-docs-index.json");
  await writeFile(indexPath, JSON.stringify({ pages, sourceFamilyMapping: { dropdown: "menu" } }));
  const first = await loadSource({ root });
  assert.equal(first.pages[0].url, "/en/docs/react/components/menu");
  assert.equal(first.pages[0].kind, "component");
  assert.equal(
    first.pages[0].markdown,
    await readFile(path.join(root, pages[0].markdownFile), "utf8"),
  );
  assert.ok(
    first.redirects.some(
      ({ from, to }) =>
        from === "/docs/react/components/dropdown" && to === "/en/docs/react/components/menu",
    ),
  );
  assert.equal(
    first.routes.find(({ path: route }) => route === "/cn").metadata.alternates.canonical,
    "/cn",
  );
  assert.ok(first.routes.some(({ path: route }) => route === "/cn/theme-builder"));
  assert.ok(first.routes.some(({ path: route }) => route === "/coverage"));
  pages[0].title = "Updated Menu";
  await writeFile(indexPath, JSON.stringify({ pages, sourceFamilyMapping: { dropdown: "menu" } }));
  assert.equal((await loadSource({ root })).pages[0].title, "Updated Menu");
});
