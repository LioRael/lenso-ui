import assert from "node:assert/strict";
import { mkdtemp, mkdir, readFile, readdir, rm, symlink, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
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
