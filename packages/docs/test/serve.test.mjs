import assert from "node:assert/strict";
import { mkdtemp, mkdir, rm, symlink, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";
import { serve } from "../src/serve.mjs";

// Existing application checks do not exercise a standalone static preview server.
test("preview serves deep exports under a base path and returns actual 404s", async (t) => {
  const root = await mkdtemp(path.join(tmpdir(), "lenso-preview-"));
  t.after(() => rm(root, { recursive: true, force: true }));
  await mkdir(path.join(root, "guides"), { recursive: true });
  await writeFile(path.join(root, "guides", "index.html"), "<h1>Guides</h1>");
  await writeFile(path.join(root, "404.html"), "<h1>Page not found</h1>");
  await writeFile(path.join(root, "search.json"), '{"pages":1}');
  const server = await serve(root, { basePath: "/manual", port: 0 });
  t.after(() => new Promise((resolve) => server.close(resolve)));
  const url = `http://127.0.0.1:${server.address().port}`;
  const page = await fetch(`${url}/manual/guides/`);
  assert.equal(page.status, 200);
  assert.equal(await page.text(), "<h1>Guides</h1>");
  assert.match(page.headers.get("content-type"), /text\/html/);
  const head = await fetch(`${url}/manual/guides/`, { method: "HEAD" });
  assert.equal(head.status, 200);
  assert.equal(await head.text(), "");
  assert.equal(
    (await fetch(`${url}/manual/search.json`)).headers.get("content-type"),
    "application/json; charset=utf-8",
  );
  for (const missing of ["/guides/", "/manual/missing/", "/manuality/guides/", "/manual/%00"])
    assert.equal((await fetch(`${url}${missing}`)).status, 404, missing);
  assert.equal((await fetch(`${url}/manual/guides/`, { method: "POST" })).status, 405);
});

test("preview resolves flat exports beside RSC folders and Unicode redirects", async (t) => {
  const root = await mkdtemp(path.join(tmpdir(), "lenso-preview-flat-"));
  t.after(() => rm(root, { recursive: true, force: true }));
  await mkdir(path.join(root, "release", "0.9"), { recursive: true });
  await writeFile(path.join(root, "release", "0.9", "__next.txt"), "RSC payload");
  await writeFile(path.join(root, "release", "0.9.html"), "<h1>Release</h1>");
  await writeFile(path.join(root, "指南.html"), "<h1>指南</h1>");
  await writeFile(path.join(root, "_redirects"), "/manual/old /manual/指南 302\n");
  const server = await serve(root, { basePath: "/manual", port: 0 });
  t.after(() => new Promise((resolve) => server.close(resolve)));
  const url = `http://127.0.0.1:${server.address().port}`;
  const page = await fetch(`${url}/manual/release/0.9`);
  assert.equal(page.status, 200);
  assert.equal(await page.text(), "<h1>Release</h1>");
  const redirect = await fetch(`${url}/manual/old?query=value`, { redirect: "manual" });
  assert.equal(redirect.status, 302);
  assert.equal(redirect.headers.get("location"), "/manual/%E6%8C%87%E5%8D%97?query=value");
  assert.equal((await fetch(`${url}${redirect.headers.get("location")}`)).status, 200);
});

test("preview never follows public symlinks outside the export", async (t) => {
  const fixture = await mkdtemp(path.join(tmpdir(), "lenso-preview-"));
  t.after(() => rm(fixture, { recursive: true, force: true }));
  const root = path.join(fixture, "out");
  await mkdir(root);
  await writeFile(path.join(fixture, "private.txt"), "not a public asset");
  await symlink(path.join(fixture, "private.txt"), path.join(root, "leak.txt"));
  await symlink(path.join(fixture, "private.txt"), path.join(root, "404.html"));
  const server = await serve(root, { port: 0 });
  t.after(() => new Promise((resolve) => server.close(resolve)));
  const response = await fetch(`http://127.0.0.1:${server.address().port}/leak.txt`);
  assert.equal(response.status, 404);
  assert.doesNotMatch(await response.text(), /not a public asset/);
});
