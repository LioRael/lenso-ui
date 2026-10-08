import assert from "node:assert/strict";
import {
  mkdtemp,
  mkdir,
  readFile,
  readdir,
  realpath,
  rm,
  stat,
  symlink,
  utimes,
  writeFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { createRequire } from "node:module";
import test from "node:test";
import { oramaStaticClient } from "fumadocs-core/search/client/orama-static";
import { prepare, run } from "../src/runtime.mjs";
import { serve } from "../src/serve.mjs";

// The Lenso app's build does not cover ownership or source isolation in a generic consumer.
async function project(t) {
  const root = await mkdtemp(path.join(tmpdir(), "lenso-runtime-"));
  t.after(() => rm(root, { recursive: true, force: true }));
  await mkdir(path.join(root, "content"));
  await writeFile(path.join(root, "content", "index.md"), "# Home\n\n## Reading\n\nStart here.\n");
  return root;
}

test("prepare generates one model and byte-exact Markdown without changing source", async (t) => {
  const root = await project(t);
  const before = await readFile(path.join(root, "content", "index.md"), "utf8");
  const result = await prepare(root);
  assert.equal(result.pages.length, 1);
  assert.equal(
    await readFile(path.join(root, ".lenso", "public", "_lenso", "markdown", "index.md"), "utf8"),
    before,
  );
  assert.equal(await readFile(path.join(root, "content", "index.md"), "utf8"), before);
  const search = await readFile(
    path.join(root, ".lenso", "public", "_lenso", "search.json"),
    "utf8",
  );
  assert.match(search, /Start here/);
  const model = await import(path.join(root, ".lenso", "model.mjs"));
  assert.equal(model.trees.en.children[0].url, "/");
  assert.equal(model.pages[0].headings[0].id, "reading");
});

// Switching dev bundlers must remove stale staged Babel config while keeping
// production transforms and consumer aliases/rules intact.
test("Turbopack dev isolates Babel staging and preserves consumer build configuration", async (t) => {
  const root = await project(t);
  await mkdir(path.join(root, "src"));
  const babel = '{"presets":["next/babel"]}\n';
  await writeFile(path.join(root, "babel.config.json"), babel);
  await writeFile(path.join(root, "raw-rules.json"), "{}");
  await writeFile(
    path.join(root, "postcss.config.cjs"),
    'module.exports = { plugins: [], directory: __dirname, metadata: require.resolve("./raw-rules.json") };\n',
  );
  await writeFile(
    path.join(root, "build.mjs"),
    `export default { turbopack: { root: ${JSON.stringify(root)}, rules: { "*.txt": { loaders: ["raw-loader"] } }, resolveAlias: { prior: "./prior" } } };`,
  );
  await writeFile(
    path.join(root, "docs.config.mjs"),
    'export default { title: "Docs", build: "build.mjs", aliases: { "@": "src" } };',
  );
  const webpack = await prepare(root, { development: true });
  const staged = path.join(webpack.directory, "babel.config.json");
  assert.equal(await readFile(staged, "utf8"), babel);
  const turbo = await prepare(root, { development: true, turbopack: true });
  await assert.rejects(readFile(staged), { code: "ENOENT" });
  assert.notEqual(turbo.configurationKey, webpack.configurationKey);
  assert.equal(turbo.watchPaths.includes("babel.config.json"), false);
  assert.match(await readFile(path.join(turbo.directory, "postcss.config.cjs"), "utf8"), /require/);
  const postcss = createRequire(import.meta.url)(path.join(turbo.directory, "postcss.config.cjs"));
  assert.equal(postcss.directory, await realpath(root));
  assert.equal(postcss.metadata, await realpath(path.join(root, "raw-rules.json")));
  const settings = await (
    await import(path.join(turbo.directory, "next.config.mjs"))
  ).default("phase-development-server", {});
  assert.equal(settings.turbopack.root, root);
  assert.deepEqual(settings.turbopack.resolveAlias, { prior: "./prior", "@": "./src" });
  assert.deepEqual(settings.turbopack.rules["*.txt"].loaders, ["raw-loader"]);
  await prepare(root);
  assert.equal(await readFile(staged, "utf8"), babel);
  assert.equal(await readFile(path.join(root, "babel.config.json"), "utf8"), babel);
  await assert.rejects(run("build", root, { turbopack: true }), /only available for development/);
  await assert.rejects(run("preview", root, { turbopack: true }), /only available for development/);
});

test("the exported search index is readable by the installed Fumadocs static client", async (t) => {
  const root = await project(t);
  const { directory } = await prepare(root);
  const server = await serve(path.join(directory, "public"), { port: 0 });
  t.after(() => new Promise((resolve) => server.close(resolve)));
  const client = oramaStaticClient({
    from: `http://127.0.0.1:${server.address().port}/_lenso/search.json`,
  });
  const results = await client.search("Reading");
  assert.ok(results.some((result) => result.type === "page" && result.url === "/"));
  assert.ok(results.some((result) => result.url === "/#reading"));
});

test("prepare refuses foreign runtime data and symlinked ownership markers", async (t) => {
  const root = await project(t);
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

test("prepare rejects generated ancestor symlinks even when the descendant exists", async (t) => {
  const root = await project(t);
  const runtime = path.join(root, ".lenso");
  const outside = path.join(root, "outside");
  await mkdir(path.join(outside, "[[...slug]]"), { recursive: true });
  const target = path.join(outside, "[[...slug]]", "page.jsx");
  await writeFile(target, "must not change");
  await mkdir(runtime);
  await writeFile(path.join(runtime, ".lenso-owned"), "lenso-docs\n");
  await symlink(outside, path.join(runtime, "app"));
  await assert.rejects(prepare(root), /Generated directory cannot be a symlink/);
  assert.equal(await readFile(target, "utf8"), "must not change");
});

test("prepare rejects symlinked public directories and files without modifying their targets", async (t) => {
  const root = await project(t);
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

test("prepare rejects public files that would overwrite rendered routes", async (t) => {
  const root = await project(t);
  await mkdir(path.join(root, "public"));
  await writeFile(path.join(root, "public", "index.html"), "not the rendered page");
  await assert.rejects(prepare(root), /conflicts with documentation route/);
});

test("a fresh prepare removes assets and source exports deleted between sessions", async (t) => {
  const root = await project(t);
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

test("incremental prepare removes retired sitemap and redirect exports", async (t) => {
  const root = await project(t);
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

test("sites without siteUrl retain authored public sitemap and robots files", async (t) => {
  const root = await project(t);
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

test("content-only refresh retains unchanged file times and invalidates the edited route", async (t) => {
  const root = await project(t);
  await mkdir(path.join(root, "public"));
  await writeFile(path.join(root, "public", "logo.svg"), "logo");
  await writeFile(path.join(root, "content", "other.md"), "# Other\n\nUnchanged.\n");
  const first = await prepare(root, { development: true });
  const stableFiles = [
    "public/logo.svg",
    "public/_lenso/markdown/other.md",
    "pages/1.mjs",
    "app/(locale-0)/other/page.jsx",
  ];
  const timestamp = new Date("2000-01-01T00:00:00Z");
  const times = new Map();
  for (const file of stableFiles) {
    const target = path.join(first.directory, file);
    await utimes(target, timestamp, timestamp);
    times.set(file, (await stat(target)).mtimeMs);
  }
  const route = path.join(first.directory, "app", "(locale-0)", "page.jsx");
  const before = await readFile(route, "utf8");
  const model = path.join(first.directory, "model.mjs");
  const oldModel = await readFile(model, "utf8");
  const markdown = "# Home\n\n## Reading\n\nUpdated body.\n";
  await writeFile(path.join(root, "content", "index.md"), markdown);
  await prepare(root, { development: true, previous: first, changedPaths: ["content/index.md"] });
  assert.notEqual(await readFile(route, "utf8"), before);
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

test("default locale changes refresh the search alias and remove retired locale indexes", async (t) => {
  const root = await project(t);
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
  config.locales = [config.locales[1]];
  await writeFile(configFile, `export default ${JSON.stringify(config)};`);
  await prepare(root, { previous: second, changedPaths: ["docs.config.mjs"] });
  await assert.rejects(readFile(path.join(assets, "search", "en.json")), { code: "ENOENT" });
});

test("new content routes are checked against unchanged public assets", async (t) => {
  const root = await project(t);
  await mkdir(path.join(root, "public"));
  await writeFile(path.join(root, "public", "guide.html"), "asset");
  const first = await prepare(root);
  await writeFile(path.join(root, "content", "guide.md"), "# Guide");
  await assert.rejects(
    prepare(root, { previous: first, changedPaths: ["content/guide.md"] }),
    /conflicts with documentation route/,
  );
});

test("asset refresh supports file-to-directory and directory-to-file replacements", async (t) => {
  const root = await project(t);
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

test("removed public directories can return with different asset path types", async (t) => {
  const root = await project(t);
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

test("preview reports missing and malformed exports instead of starting a broken server", async (t) => {
  const root = await project(t);
  await assert.rejects(run("preview", root), /Run lenso-docs build before preview/);
  const directory = path.join(root, "out", "_lenso");
  await mkdir(directory, { recursive: true });
  for (const invalid of ["{", "null", '{"config":{"title":"Docs","basePath":"/../private"}}']) {
    await writeFile(path.join(directory, "build.json"), invalid);
    await assert.rejects(run("preview", root), /Run lenso-docs build before preview/);
  }
});
