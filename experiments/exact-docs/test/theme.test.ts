import { afterAll, expect, test } from "bun:test";
import { mkdtemp, rm } from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import { generateApp, loadSite, parseConfig } from "../src/index.ts";
const roots: string[] = [];
afterAll(async () => {
  for (const root of roots) await rm(root, { recursive: true, force: true });
});
// The theme must not add Web hatches/state to headless or Apple builds, or override caller layouts.
test("Lenso theme is explicit, stages real libraries, and preserves headless/native/custom layout boundaries", async () => {
  expect(parseConfig({ name: "Docs", pages: [{ path: "/", source: "index.md" }] }).theme).toBe(
    "headless",
  );
  expect(() =>
    parseConfig({ name: "Docs", theme: "missing", pages: [{ path: "/", source: "index.md" }] }),
  ).toThrow("theme must be");
  const root = await mkdtemp(path.join(os.tmpdir(), "exact-docs-theme-"));
  roots.push(root);
  await Bun.write(path.join(root, "index.md"), "# Welcome\n\nA themed page.");
  const config = { name: "Docs", theme: "lenso", pages: [{ path: "/", source: "index.md" }] };
  await Bun.write(path.join(root, "docs.json"), JSON.stringify(config));
  const site = await loadSite(root),
    app = await generateApp(site);
  const source = await Bun.file(path.join(app, "app.contract")).text();
  expect(source).toContain("LensoDocsLayout(");
  expect(source).toContain('state docsAppearance = "light"');
  expect(
    await Bun.file(
      path.join(app, "node_modules/@lenso/primitives-exact/components/button.contract"),
    ).text(),
  ).toContain("component Link");
  expect((await Bun.file(path.join(app, "app.json")).json()).hatches["lenso-ui"]).toEqual(["web"]);
  expect(await Bun.file(path.join(app, "lenso-layout.contract")).text()).toContain(
    'from "@lenso/ui-exact"',
  );
  const native = await generateApp(site, "macos");
  expect(await Bun.file(path.join(native, "app.contract")).text()).not.toContain("LensoDocsLayout");
  expect(
    (await Bun.file(path.join(native, "app.json")).json()).hatches?.["lenso-ui"],
  ).toBeUndefined();
  await Bun.write(
    path.join(root, "layout.contract"),
    "component Custom\n  slot\n  view\n    column\n      children\n",
  );
  await Bun.write(
    path.join(root, "docs.json"),
    JSON.stringify({ ...config, layout: { source: "layout.contract", component: "Custom" } }),
  );
  await generateApp(await loadSite(root));
  const custom = await Bun.file(path.join(app, "app.contract")).text();
  expect(custom).toContain("DocsCustomLayout(");
  expect(custom).not.toContain("\n      LensoDocsLayout(");
  await Bun.write(path.join(root, "docs.json"), JSON.stringify({ ...config, theme: "headless" }));
  await generateApp(await loadSite(root));
  expect(await Bun.file(path.join(app, "app.contract")).text()).not.toContain("docsAppearance");
  expect(await Bun.file(path.join(app, "lenso-layout.contract")).exists()).toBe(false);
});
