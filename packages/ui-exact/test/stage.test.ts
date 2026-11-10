import { describe, expect, test } from "bun:test";
import path from "node:path";
import { webRequirements, withLensoWeb, linkWebStyles } from "../scripts/stage.js";
import { mkdtemp, mkdir, rm } from "node:fs/promises";
import { tmpdir } from "node:os";

describe("Exact consumer manifest", () => {
  test("adds Web requirements while preserving existing app, platform and hatch declarations", () => {
    const original = {
      app: { id: "dev.example.exact" },
      host: { web: { base: "/demo/" } },
      data: ["customer", "theme"],
      hatches: { chart: ["web"], "lenso-ui": ["ios"] },
    };
    const before = structuredClone(original);
    const configured = withLensoWeb(original);
    expect(original).toEqual(before);
    expect(configured["app"]).toEqual(original.app);
    expect(configured["host"]).toEqual(original.host);
    expect(configured.hatches).toEqual({ chart: ["web"], "lenso-ui": ["ios", "web"] });
    expect(configured.data).toContain("customer");
    expect(configured.data.filter((word) => word === "theme")).toHaveLength(1);
    expect(withLensoWeb(configured)).toEqual(configured);
    expect(withLensoWeb({}).data).toEqual(webRequirements.data);
  });

  test("refuses malformed declarations instead of replacing consumer configuration", () => {
    for (const manifest of [
      null,
      [],
      { data: "theme" },
      { data: null },
      { data: [1] },
      { hatches: [] },
      { hatches: null },
      { hatches: { "lenso-ui": "web" } },
      { hatches: { "lenso-ui": null } },
    ])
      expect(() => withLensoWeb(manifest)).toThrow(TypeError);
  });

  test("the published declarations cover data words in every shipped Contract file", async () => {
    const root = path.resolve(import.meta.dirname, "..");
    const files = ["index.contract", ...new Bun.Glob("components/**/*.contract").scanSync(root)];
    const words = new Set<string>();
    for (const file of files) {
      const source = await Bun.file(path.join(root, file)).text();
      for (const match of source.matchAll(/\bdata-([a-z][a-z0-9-]*)\s*=/g)) {
        const word = match[1];
        if (word) words.add(word);
      }
    }
    expect([...words].sort()).toEqual([...webRequirements.data].sort());
  });
});

test("blocking CSS links preserve Exact's base URL, update hashes and leave foreign HTML untouched", async () => {
  const root = await mkdtemp(path.join(tmpdir(), "lenso-exact-styles-"));
  try {
    await mkdir(path.join(root, "modules/lenso-ui"), { recursive: true });
    const css = path.join(root, "modules/lenso-ui/web.css");
    await Bun.write(css, ".sample{color:red}");
    const page = path.join(root, "index.html");
    const asset = path.join(root, "asset.html");
    await Bun.write(
      page,
      '<!doctype html><html><base href="/demo/"><title>Example</title><div id="exact-root"></div><script type="module" src="./app.js"></script>',
    );
    await Bun.write(asset, "<script>const example = 'id=\"exact-root\"';</script>");
    expect(await linkWebStyles(root)).toEqual([page]);
    const initial = await Bun.file(page).text();
    expect(initial).toContain(
      '<base href="/demo/">\n<link rel="stylesheet" href="./modules/lenso-ui/web.css?v=',
    );
    expect(initial).toContain('<script type="module" src="./app.js"></script>');
    expect(await linkWebStyles(root)).toEqual([]);
    expect(await Bun.file(page).text()).toBe(initial);
    await Bun.write(css, ".sample{color:blue}");
    expect(await linkWebStyles(root)).toEqual([page]);
    const updated = await Bun.file(page).text();
    expect(updated).not.toBe(initial);
    expect(updated.match(/data-lenso-exact-styles/g)).toHaveLength(1);
    expect(await Bun.file(asset).text()).toBe(
      "<script>const example = 'id=\"exact-root\"';</script>",
    );
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
