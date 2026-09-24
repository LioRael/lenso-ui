import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const prefix = process.env.LENSO_DOCS_BASE_PATH?.replace(/^\/+|\/+$/g, "") ?? "";
const sitePath = prefix ? `/${prefix}` : "";
const output = (path) =>
  readFileSync(new URL(`../dist/${prefix ? `${prefix}/` : ""}${path}`, import.meta.url), "utf8");

for (const route of [
  "start/index.html",
  "start/quick-start/index.html",
  "components/button/index.html",
]) {
  const html = output(route);
  assert.match(html, /Lenso UI/);
  assert.match(html, /docs-sidebar-item/);
}

const search = JSON.parse(output("search.json"));
assert.equal(search.length, 3);
assert.ok(
  search.some((page) => page.title === "Button" && page.href === `${sitePath}/components/button`),
);
assert.match(
  output("sitemap.xml"),
  new RegExp(`http://localhost:4321${sitePath}/components/button`),
);
assert.match(output("llms.txt"), new RegExp(`http://localhost:4321${sitePath}/components/button`));
assert.match(output("start/index.html"), new RegExp(`href="${sitePath}/components/button"`));
console.log("Docs routes, navigation, links, search, sitemap, and llms index verified.");
