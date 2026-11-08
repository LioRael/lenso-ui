import assert from "node:assert/strict";
import { readFile, stat } from "node:fs/promises";
import { test } from "bun:test";
import path from "node:path";
const output = path.resolve(import.meta.dirname, "../out");
// Following redirects during prerender writes a target's hydration state at the wrong URL.
test("static aliases use platform redirects and never contain another route's HTML", async () => {
  const redirects = (await readFile(path.join(output, "_redirects"), "utf8")).trim().split("\n");
  assert.ok(redirects.length > 0);
  for (const line of redirects) {
    const [from, to, status] = line.split(/\s+/);
    assert.equal(status, "302");
    assert.ok((await stat(path.join(output, to!, "index.html"))).isFile(), `Missing target ${to}`);
    await assert.rejects(stat(path.join(output, from!, "index.html")), { code: "ENOENT" });
  }
  assert.ok((await readFile(path.join(output, "404.html"), "utf8")).includes("Page not found"));
  const sitemap = await readFile(path.join(output, "sitemap.xml"), "utf8");
  assert.ok(sitemap.includes("/en/docs/react/components/button"));
  assert.ok(!sitemap.includes("/docs/react/components/dropdown"));
});
