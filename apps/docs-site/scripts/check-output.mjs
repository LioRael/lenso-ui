import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";

const prefix = process.env.LENSO_DOCS_BASE_PATH?.replace(/^\/+|\/+$/g, "") ?? "";
const sitePath = prefix ? `/${prefix}` : "";
const dist = new URL("../dist/", import.meta.url);
const output = (path) =>
  readFileSync(new URL(`${prefix ? `${prefix}/` : ""}${path}`, dist), "utf8");
const page = (href) => {
  const path = href.slice(sitePath.length).replace(/^\/+|\/+$/g, "");
  return output(`${path}/index.html`);
};

assert.match(output("index.html"), new RegExp(`url=${sitePath}/start`));

const search = JSON.parse(output("search.json"));
assert.equal(search.length, 47, "all migrated docs must be searchable");
for (const entry of search) {
  assert.match(page(entry.href), /docs-sidebar-item/, `missing page ${entry.href}`);
}

const button = page(`${sitePath}/components/button`);
assert.match(button, /Live playground/);
assert.match(button, /Choose Button when/);
assert.match(button, /Create issue/);
assert.match(page(`${sitePath}/start`), new RegExp(`href="${sitePath}/components/button"`));
assert.match(output("sitemap.xml"), new RegExp(`${sitePath}/components/button`));
assert.match(output("llms.txt"), new RegExp(`${sitePath}/components/button`));
assert.ok(existsSync(new URL("r/setup.json", dist)), "registry setup must ship with docs");
assert.ok(existsSync(new URL("r/button.json", dist)), "registry component must ship with docs");

console.log(
  "47 docs pages, landing, interactive examples, search, sitemap, llms index, and registry output verified.",
);
