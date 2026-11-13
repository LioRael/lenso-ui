import assert from "node:assert/strict";
import {
  mkdtemp,
  mkdir,
  readFile,
  readdir,
  rm,
  stat,
  symlink,
  utimes,
  writeFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import type { AddressInfo } from "node:net";
import { afterEach, test } from "bun:test";

const cleanup: Array<() => void | Promise<void>> = [];
afterEach(async () => {
  for (const dispose of cleanup.splice(0).reverse()) await dispose();
});
import { oramaStaticClient } from "fumadocs-core/search/client/orama-static";
import { prepare, run } from "../src/runtime.ts";
import { serve } from "../src/serve.ts";

// The Lenso app's build does not cover ownership or source isolation in a generic consumer.
async function project() {
  const root = await mkdtemp(path.join(tmpdir(), "lenso-runtime-"));
  cleanup.push(() => rm(root, { recursive: true, force: true }));
  await mkdir(path.join(root, "content"));
  await writeFile(path.join(root, "content", "index.md"), "# Home\n\n## Reading\n\nStart here.\n");
  return root;
}

test("prepare generates one model and byte-exact Markdown without changing source", async () => {
  const root = await project();
  const before = await readFile(path.join(root, "content", "index.md"), "utf8");
  const result = await prepare(root);
  assert.equal(result.pages.length, 1);
  assert.equal(
    await readFile(
      path.join(root, ".lenso", "build", "public", "_lenso", "markdown", "index.md"),
      "utf8",
    ),
    before,
  );
  assert.equal(await readFile(path.join(root, "content", "index.md"), "utf8"), before);
  const search = await readFile(
    path.join(root, ".lenso", "build", "public", "_lenso", "search.json"),
    "utf8",
  );
  assert.match(search, /Start here/);
  const model = await import(path.join(root, ".lenso", "build", "model.ts"));
  assert.equal(model.trees.en.children[0].url, "/");
  assert.equal(model.pages[0].headings[0].id, "reading");
});

test("prepare retires old generated modules without following symlinks", async () => {
  const root = await project();
  const { directory } = await prepare(root);
  const next = path.join(directory, "next.config.mjs");
  const model = path.join(directory, "model.mjs");
  const render = path.join(directory, "render.jsx");
  await writeFile(render, "export default null;");
  await writeFile(next, "export default {};");
  await writeFile(model, "export const stale = true;");
  await prepare(root);
  await assert.rejects(readFile(next), { code: "ENOENT" });
  await assert.rejects(readFile(model), { code: "ENOENT" });
  await assert.rejects(readFile(render), { code: "ENOENT" });
  await readFile(path.join(directory, "vite.config.ts"));
  await readFile(path.join(directory, "model.ts"));

  const outside = path.join(root, "outside.mjs");
  await writeFile(outside, "unchanged");
  await symlink(outside, next);
  await assert.rejects(prepare(root), /Generated file cannot be a symlink or directory/);
  assert.equal(await readFile(outside, "utf8"), "unchanged");
});

// The standalone host must own its compiler setup without changing authored files.
test("Vite host replaces Next configuration and isolates dev from production", async () => {
  const root = await project();
  await mkdir(path.join(root, "src"));
  await writeFile(path.join(root, "build.mjs"), 'export default { define: { CUSTOM: "true" } };');
  await writeFile(
    path.join(root, "docs.config.mjs"),
    'export default { title: "Docs", build: "build.mjs", aliases: { "@": "src" } };',
  );
  const dev = await prepare(root, { development: true });
  const before = await readFile(path.join(dev.directory, "vite.config.ts"), "utf8");
  const production = await prepare(root);
  assert.notEqual(production.directory, dev.directory);
  assert.equal(await readFile(path.join(dev.directory, "vite.config.ts"), "utf8"), before);
  assert.match(before, /tanstackStart/);
  assert.match(before, /stylex/);
  assert.match(before, /build\.mjs/);
  for (const directory of [dev.directory, production.directory])
    for (const file of ["next.config.ts", "babel.config.json", "postcss.config.cjs"])
      await assert.rejects(readFile(path.join(directory, file)), { code: "ENOENT" });
  assert.equal(dev.watchPaths.includes("build.mjs"), true);
});

test("the exported search index is readable by the installed Fumadocs static client", async () => {
  const root = await project();
  const { directory } = await prepare(root);
  const server = await serve(path.join(directory, "public"), { port: 0 });
  cleanup.push(
    () =>
      new Promise<void>((resolve, reject) =>
        server.close((error) => (error ? reject(error) : resolve())),
      ),
  );
  const client = oramaStaticClient({
    from: `http://127.0.0.1:${(server.address() as AddressInfo).port}/_lenso/search.json`,
  });
  const results = await client.search("Reading");
  assert.ok(results.some((result) => result.type === "page" && result.url === "/"));
  assert.ok(results.some((result) => result.url === "/#reading"));
});

test("prepare refuses foreign runtime data and symlinked ownership markers", async () => {
  const root = await project();
  const runtime = path.join(root, ".lenso");
  await mkdir(runtime);
  const unrelated = path.join(runtime, "notes.txt");
  await writeFile(unrelated, "user data");
  await assert.rejects(prepare(root), /not owned/);
  assert.equal(await readFile(unrelated, "utf8"), "user data");
  const privateFile = path.join(root, "private.txt");
  await writeFile(privateFile, "must not change");
  await symlink(privateFile, path.join(runtime, ".lenso-owned"));
  await assert.rejects(prepare(root), /not owned/);
  assert.equal(await readFile(privateFile, "utf8"), "must not change");
});

test("prepare rejects generated ancestor symlinks even when the descendant exists", async () => {
  const root = await project();
  const runtime = path.join(root, ".lenso", "build");
  const outside = path.join(root, "outside");
  await mkdir(path.join(outside, "[[...slug]]"), { recursive: true });
  const target = path.join(outside, "[[...slug]]", "page.tsx");
  await writeFile(target, "must not change");
  await mkdir(runtime, { recursive: true });
  await writeFile(path.join(root, ".lenso", ".lenso-owned"), "lenso-docs\n");
  await writeFile(path.join(runtime, ".lenso-owned"), "lenso-docs\n");
  await symlink(outside, path.join(runtime, "src"));
  await assert.rejects(prepare(root), /Generated directory cannot be a symlink/);
  assert.equal(await readFile(target, "utf8"), "must not change");
});

test("prepare rejects symlinked public directories and files without modifying their targets", async () => {
  const root = await project();
  const assets = path.join(root, "assets");
  await mkdir(assets);
  await writeFile(path.join(assets, "private.txt"), "private asset");
  await symlink(assets, path.join(root, "public"));
  await assert.rejects(prepare(root), /cannot contain symlinks/);
  assert.deepEqual(await readdir(assets), ["private.txt"]);
  await rm(path.join(root, "public"));
  await mkdir(path.join(root, "public"));
  await symlink(path.join(assets, "private.txt"), path.join(root, "public", "robots.txt"));
  await assert.rejects(prepare(root), /Public assets cannot be symlinks/);
  assert.equal(await readFile(path.join(assets, "private.txt"), "utf8"), "private asset");
});

test("prepare rejects public files that would overwrite rendered routes", async () => {
  const root = await project();
  await mkdir(path.join(root, "public"));
  await writeFile(path.join(root, "public", "index.html"), "not the rendered page");
  await assert.rejects(prepare(root), /conflicts with documentation route/);
});

test("a fresh prepare removes assets and source exports deleted between sessions", async () => {
  const root = await project();
  await mkdir(path.join(root, "public"));
  await writeFile(path.join(root, "public", "retired.svg"), "old asset");
  await writeFile(path.join(root, "content", "retired.md"), "# Retired");
  await writeFile(
    path.join(root, "docs.config.mjs"),
    'export default { title: "Docs", siteUrl: "https://docs.example.com" };',
  );
  const first = await prepare(root);
  const publicRoot = path.join(first.directory, "public");
  await writeFile(path.join(publicRoot, "_redirects"), "/old / 301\n");
  await writeFile(path.join(publicRoot, "_lenso", "search", "retired.json"), "{}");
  await rm(path.join(root, "public", "retired.svg"));
  await rm(path.join(root, "content", "retired.md"));
  await rm(path.join(root, "docs.config.mjs"));
  await prepare(root);
  for (const file of [
    "retired.svg",
    "_lenso/markdown/retired.md",
    "_lenso/search/retired.json",
    "sitemap.xml",
    "robots.txt",
    "_redirects",
  ]) {
    await assert.rejects(readFile(path.join(publicRoot, file)), { code: "ENOENT" });
  }
});

test("incremental prepare removes retired sitemap and redirect exports", async () => {
  const root = await project();
  await writeFile(
    path.join(root, "docs.source.mjs"),
    `
export function loadSource({ config }) {
  return { pages: [{ id: "index", slug: "", locale: "en", url: "/", title: "Home", markdown: "# Home" }],
    redirects: config.siteUrl ? [{ from: "/old", to: "/" }] : [] };
}`,
  );
  const configFile = path.join(root, "docs.config.mjs");
  await writeFile(
    configFile,
    'export default { title: "Docs", source: "docs.source.mjs", siteUrl: "https://docs.example.com" };',
  );
  const first = await prepare(root);
  const publicRoot = path.join(first.directory, "public");
  for (const file of ["sitemap.xml", "robots.txt", "_redirects"])
    await readFile(path.join(publicRoot, file));
  await writeFile(configFile, 'export default { title: "Docs", source: "docs.source.mjs" };');
  await prepare(root, { previous: first, changedPaths: ["docs.config.mjs"] });
  for (const file of ["sitemap.xml", "robots.txt", "_redirects"]) {
    await assert.rejects(readFile(path.join(publicRoot, file)), { code: "ENOENT" });
  }
});

test("sites without siteUrl retain authored public sitemap and robots files", async () => {
  const root = await project();
  await mkdir(path.join(root, "public"));
  const authored = {
    "sitemap.xml": "<urlset />",
    "robots.txt": "User-agent: *\nDisallow: /private/\n",
  };
  for (const [file, text] of Object.entries(authored))
    await writeFile(path.join(root, "public", file), text);
  const first = await prepare(root);
  await writeFile(path.join(root, "content", "index.md"), "# Home\n\nEdited.\n");
  await prepare(root, { previous: first, changedPaths: ["content/index.md"] });
  for (const [file, text] of Object.entries(authored)) {
    assert.equal(await readFile(path.join(first.directory, "public", file), "utf8"), text);
  }
});

test("content-only refresh retains unchanged file times and invalidates the edited route", async () => {
  const root = await project();
  await mkdir(path.join(root, "public"));
  await writeFile(path.join(root, "public", "logo.svg"), "logo");
  await writeFile(path.join(root, "content", "other.md"), "# Other\n\nUnchanged.\n");
  const first = await prepare(root, { development: true });
  const stableFiles = [
    "public/logo.svg",
    "public/_lenso/markdown/other.md",
    "documents/1.js",
    "src/routes/[other].tsx",
  ];
  const timestamp = new Date("2000-01-01T00:00:00Z");
  const times = new Map();
  for (const file of stableFiles) {
    const target = path.join(first.directory, file);
    await utimes(target, timestamp, timestamp);
    times.set(file, (await stat(target)).mtimeMs);
  }
  const route = path.join(first.directory, "pages", "0.tsx");
  const before = await readFile(route, "utf8");
  const model = path.join(first.directory, "model.ts");
  const oldModel = await readFile(model, "utf8");
  await mkdir(path.join(first.directory, "app"));
  await writeFile(
    path.join(first.directory, "app/legacy.js"),
    "export default function Legacy() {};",
  );
  const markdown = "# Home\n\n## Reading\n\nUpdated body.\n";
  await writeFile(path.join(root, "content", "index.md"), markdown);
  await prepare(root, { development: true, previous: first, changedPaths: ["content/index.md"] });
  await assert.rejects(stat(path.join(first.directory, "app/legacy.js")), { code: "ENOENT" });
  assert.equal(await readFile(route, "utf8"), before);
  assert.equal(await readFile(path.join(first.directory, "documents/0.md"), "utf8"), markdown);
  const newModel = await readFile(model, "utf8");
  assert.notEqual(
    newModel.match(/export const searchRevision = "([^"]+)"/u)?.[1],
    oldModel.match(/export const searchRevision = "([^"]+)"/u)?.[1],
  );
  assert.equal(
    await readFile(path.join(first.directory, "public/_lenso/markdown/index.md"), "utf8"),
    markdown,
  );
  for (const [file, mtime] of times)
    assert.equal((await stat(path.join(first.directory, file))).mtimeMs, mtime, file);
});

test("default locale changes refresh the search alias and remove retired locale indexes", async () => {
  const root = await project();
  await mkdir(path.join(root, "translated"));
  await writeFile(path.join(root, "translated", "index.md"), "# Bonjour\n\nTexte français.\n");
  const config = {
    title: "Docs",
    defaultLocale: "en",
    locales: [
      { code: "en", label: "English", language: "en", contentDir: "content", routePrefix: "/en" },
      { code: "fr", label: "French", language: "fr", contentDir: "translated", routePrefix: "/fr" },
    ],
  };
  const configFile = path.join(root, "docs.config.mjs");
  await writeFile(configFile, `export default ${JSON.stringify(config)};`);
  const first = await prepare(root);
  config.defaultLocale = "fr";
  await writeFile(configFile, `export default ${JSON.stringify(config)};`);
  const second = await prepare(root, { previous: first, changedPaths: ["docs.config.mjs"] });
  const assets = path.join(first.directory, "public", "_lenso");
  assert.equal(
    await readFile(path.join(assets, "search.json"), "utf8"),
    await readFile(path.join(assets, "search", "fr.json"), "utf8"),
  );
  assert.notEqual(
    await readFile(path.join(assets, "search.json"), "utf8"),
    await readFile(path.join(assets, "search", "en.json"), "utf8"),
  );
  config.locales = [config.locales[1]!];
  await writeFile(configFile, `export default ${JSON.stringify(config)};`);
  await prepare(root, { previous: second, changedPaths: ["docs.config.mjs"] });
  await assert.rejects(readFile(path.join(assets, "search", "en.json")), { code: "ENOENT" });
});

test("new content routes are checked against unchanged public assets", async () => {
  const root = await project();
  await mkdir(path.join(root, "public"));
  await writeFile(path.join(root, "public", "guide.html"), "asset");
  const first = await prepare(root);
  await writeFile(path.join(root, "content", "guide.md"), "# Guide");
  await assert.rejects(
    prepare(root, { previous: first, changedPaths: ["content/guide.md"] }),
    /conflicts with documentation route/,
  );
});

test("asset refresh supports file-to-directory and directory-to-file replacements", async () => {
  const root = await project();
  const source = path.join(root, "public", "asset");
  await mkdir(path.dirname(source));
  await writeFile(source, "first");
  const first = await prepare(root);
  await rm(source);
  await mkdir(source);
  await writeFile(path.join(source, "nested.txt"), "nested");
  const second = await prepare(root, { previous: first, changedPaths: ["public/asset"] });
  const target = path.join(first.directory, "public", "asset");
  assert.equal(await readFile(path.join(target, "nested.txt"), "utf8"), "nested");
  await rm(source, { recursive: true });
  await writeFile(source, "last");
  await prepare(root, { previous: second, changedPaths: ["public/asset"] });
  assert.equal(await readFile(target, "utf8"), "last");
});

test("removed public directories can return with different asset path types", async () => {
  const root = await project();
  const source = path.join(root, "public");
  await mkdir(path.join(source, "asset"), { recursive: true });
  await writeFile(path.join(source, "asset", "nested.txt"), "nested");
  const first = await prepare(root);
  await rm(source, { recursive: true });
  const second = await prepare(root, { previous: first, changedPaths: ["public"] });
  await mkdir(source);
  await writeFile(path.join(source, "asset"), "new file");
  await prepare(root, { previous: second, changedPaths: ["public"] });
  assert.equal(await readFile(path.join(first.directory, "public", "asset"), "utf8"), "new file");
});

test("preview reports missing and malformed exports instead of starting a broken server", async () => {
  const root = await project();
  await assert.rejects(run("preview", root), /Run lenso-docs build before preview/);
  const directory = path.join(root, "out", "_lenso");
  await mkdir(directory, { recursive: true });
  for (const invalid of ["{", "null", '{"config":{"title":"Docs","basePath":"/../private"}}']) {
    await writeFile(path.join(directory, "build.json"), invalid);
    await assert.rejects(run("preview", root), /Run lenso-docs build before preview/);
  }
});
