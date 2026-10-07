import assert from "node:assert/strict";
import test from "node:test";
import { defineDocs } from "../src/config.mjs";

const locales = [
  { code: "en", label: "English", language: "en", routePrefix: "/en", contentDir: "content/en" },
  { code: "cn", label: "Chinese", language: "zh", routePrefix: "/cn" },
];

test("config extensions preserve existing defaults and round-trip supplied values", () => {
  assert.deepEqual(defineDocs({ title: "Docs" }), {
    title: "Docs",
    basePath: "",
    contentDir: "content",
    language: "en",
  });
  const config = defineDocs({
    title: "Docs",
    source: "src/docs.ts",
    build: "scripts/build.mjs",
    root: "src/root.tsx",
    aliases: { "@": "src" },
    styles: ["src/styles.css"],
    stylesheet: "consumer",
    trailingSlash: false,
    locales,
    defaultLocale: "cn",
  });
  assert.deepEqual(config.locales, locales);
  assert.equal(config.source, "src/docs.ts");
  assert.equal(config.build, "scripts/build.mjs");
  assert.equal(config.root, "src/root.tsx");
  assert.deepEqual(config.aliases, { "@": "src" });
  assert.deepEqual(config.styles, ["src/styles.css"]);
  assert.equal(config.stylesheet, "consumer");
  assert.equal(config.trailingSlash, false);
  assert.equal(config.defaultLocale, "cn");
});

test("module paths, aliases and styles reject unsafe or duplicate values", () => {
  for (const source of [
    "/tmp/site.ts",
    "../outside.ts",
    "node_modules/x.js",
    "src/view.tsx",
    "src/view.mts",
  ])
    assert.throws(() => defineDocs({ title: "Docs", source }), /source/);
  for (const directory of ["/tmp", "../src", "out", "public", "node_modules"])
    assert.throws(() => defineDocs({ title: "Docs", aliases: { "@": directory } }), /aliases/);
  assert.throws(
    () => defineDocs({ title: "Docs", styles: ["src/a.css", "src/a.css"] }),
    /duplicate/,
  );
  assert.throws(() => defineDocs({ title: "Docs", styles: ["public/site.css"] }), /styles/);
});

// The source/build validator excludes JSX; root and page customization need the
// same contained JSX-capable contract without accepting generated/public paths.
test("root and components share the JSX-capable customization path contract", () => {
  for (const field of ["root", "components"]) {
    for (const extension of ["tsx", "jsx", "ts", "js", "mjs", "cjs"]) {
      const module = `src/customization.${extension}`;
      assert.equal(defineDocs({ title: "Docs", [field]: module })[field], module);
    }
    for (const module of [
      "/tmp/root.tsx",
      "../outside.tsx",
      "src/../root.tsx",
      "src\\root.tsx",
      "src/root\n.tsx",
      "src/root.css",
      ".lenso/root.tsx",
      "public/root.tsx",
      "node_modules/root.tsx",
    ])
      assert.throws(() => defineDocs({ title: "Docs", [field]: module }), new RegExp(field));
  }
});

test("locale schema rejects duplicates, unsafe routes and unregistered defaults", () => {
  assert.throws(
    () => defineDocs({ title: "Docs", locales: [locales[0], locales[0]] }),
    /duplicate code/,
  );
  assert.throws(
    () =>
      defineDocs({
        title: "Docs",
        locales: [locales[0], { ...locales[1], routePrefix: "/en" }],
      }),
    /duplicate routePrefix/,
  );
  for (const routePrefix of ["//evil", "/en/", "/../x", "https://evil"])
    assert.throws(
      () =>
        defineDocs({
          title: "Docs",
          locales: [{ ...locales[0], routePrefix }],
        }),
      /routePrefix/,
    );
  assert.throws(() => defineDocs({ title: "Docs", locales, defaultLocale: "fr" }), /defaultLocale/);
  assert.throws(() => defineDocs({ title: "Docs", stylesheet: false }), /stylesheet/);
  assert.throws(() => defineDocs({ title: "Docs", trailingSlash: "false" }), /trailingSlash/);
});
