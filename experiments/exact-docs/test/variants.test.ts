import { expect, test } from "bun:test";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { loadSite, parseConfig } from "../src/index.ts";
import { choices, sameScope } from "../src/variants.ts";
import { preparePageHtml } from "../src/delivery.ts";

const axes = {
  locales: [
    { id: "en", label: "English" },
    { id: "zh-CN", label: "中文" },
  ],
  versions: [
    { id: "v2", label: "v2" },
    { id: "v1", label: "v1", status: "archived" },
    { id: "next", label: "Next" },
  ],
};

test("nested-route activation resolves the runtime against the delivery base without rewriting content", () => {
  const html =
    '<base href="/"><pre>import("./app.js")</pre><script>const checkpoint="application/vnd.exact.checkpoint";import("./app.js")</script>';
  const result = preparePageHtml(html);
  expect(result).toContain('<pre>import("./app.js")</pre>');
  expect(result).toContain('import(new URL("./app.js",document.baseURI).href)');
  expect(preparePageHtml(result)).toBe(result);
});

// Routes alone cannot detect two URLs claiming the same translation/version identity.
test("variant declarations reject unknown scopes, duplicate identities and invalid defaults", () => {
  const home = { id: "home", path: "/", source: "index.md" };
  const config = { name: "Docs", ...axes, pages: [home] };
  const legacy = parseConfig({ name: "Docs", pages: [home] });
  expect(legacy.preload).toBe("render");
  expect(parseConfig({ name: "Docs", pages: [home], preload: "intent" }).preload).toBe("intent");
  expect(() => parseConfig({ name: "Docs", pages: [home], preload: "eager" })).toThrow(
    "preload must be",
  );
  expect(legacy.pages[0]).toMatchObject({ locale: "", version: "", id: "home" });
  expect(
    parseConfig({ name: "Docs", locales: axes.locales, pages: [home] }).pages[0],
  ).toMatchObject({ locale: "en", version: "" });
  expect(
    parseConfig({ name: "Docs", versions: axes.versions, pages: [home] }).pages[0],
  ).toMatchObject({ locale: "", version: "v2" });
  expect(parseConfig(config).pages[0]).toMatchObject({ locale: "en", version: "v2" });
  expect(() => parseConfig({ ...config, defaultVersion: "missing" })).toThrow(
    "Unknown defaultVersion",
  );
  expect(() => parseConfig({ ...config, pages: [{ ...home, locale: null }] })).toThrow(
    "Unknown page locale",
  );
  expect(() => parseConfig({ ...config, pages: [{ ...home, locale: "fr" }] })).toThrow(
    "Unknown page locale",
  );
  expect(() => parseConfig({ ...config, locales: [axes.locales[0], axes.locales[0]] })).toThrow(
    "Duplicate locales id",
  );
  expect(() => parseConfig({ ...config, pages: [home, { ...home, path: "/alias" }] })).toThrow(
    "Duplicate page variant",
  );
  expect(() =>
    parseConfig({ ...config, versions: [{ id: "v2", label: "v2", status: "invalid" }] }),
  ).toThrow("Invalid status");
});

test("shared source links and switch targets stay in their language/version scope", async () => {
  const root = await mkdtemp(path.join(tmpdir(), "exact-docs-variants-"));
  try {
    await Bun.write(path.join(root, "index.md"), "# Home\n\n[Guide](guide.md?q=read#details)");
    await Bun.write(path.join(root, "guide.md"), "# Guide\n\n## Details\n\nRead this edition.");
    await Bun.write(path.join(root, "landing.md"), "# Archived landing");
    const pages = [
      { id: "home", path: "/", source: "index.md" },
      { id: "guide", path: "/guide", source: "guide.md" },
      { id: "home", path: "/zh", locale: "zh-CN", source: "index.md" },
      { id: "guide", path: "/zh/guide", locale: "zh-CN", source: "guide.md" },
      { id: "home", path: "/v1", version: "v1", source: "index.md" },
      { id: "guide", path: "/v1/guide", version: "v1", source: "guide.md" },
      { id: "home", path: "/zh/v1", locale: "zh-CN", version: "v1", source: "landing.md" },
    ];
    await Bun.write(path.join(root, "docs.json"), JSON.stringify({ name: "Docs", ...axes, pages }));
    const { documents, config } = await loadSite(root);
    expect(documents[0]!.links).toEqual(["/guide?q=read#details"]);
    expect(documents[2]!.links).toEqual(["/zh/guide?q=read#details"]);
    expect(documents[4]!.links).toEqual(["/v1/guide?q=read#details"]);
    const current = documents[3]!;
    expect(documents.filter((doc) => sameScope(doc, current)).map((doc) => doc.path)).toEqual([
      "/zh",
      "/zh/guide",
    ]);
    expect(choices(documents, current, "locale", config.locales)[0]).toMatchObject({
      href: "/guide",
      exact: true,
      current: false,
    });
    expect(choices(documents, current, "version", config.versions)).toMatchObject([
      { href: "/zh/guide", current: true, exact: true },
      { href: "/zh/v1", current: false, exact: false },
      { href: "", current: false, exact: false },
    ]);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
