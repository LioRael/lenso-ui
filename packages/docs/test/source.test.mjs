import assert from "node:assert/strict";
import test from "node:test";
import { createDocumentationSource } from "../src/source.mjs";

const locales = [
  { code: "en", label: "English", language: "en" },
  { code: "cn", label: "中文", language: "zh-CN" },
];
const pages = [
  {
    slug: "guide",
    url: "/en/docs/guide",
    locale: "en",
    title: "Guide",
    collection: "start",
    navigation: { group: "Start", order: 1 },
  },
  {
    slug: "guide",
    url: "/cn/docs/guide",
    locale: "cn",
    title: "指南",
    collection: "start",
    navigation: { group: "开始", order: 1 },
  },
  {
    slug: "button",
    url: "/en/docs/button",
    locale: "en",
    title: "Button",
    kind: "component",
    collection: "components",
  },
  {
    slug: "requests",
    url: "/en/docs/requests",
    locale: "en",
    title: "Requests",
    kind: "api",
    collection: "api",
  },
];

test("source adapters share multilingual lookup, aliases, page kinds and navigation without rewriting raw content", async () => {
  const raw = "---\ntitle: Guide\n---\n\n## Heading\n\nExact source.\n";
  const source = createDocumentationSource({
    pages,
    locales,
    readPage: async () => raw,
    canonicalSlug: (slug) => (slug === "start" ? "guide" : slug),
  });
  assert.equal(source.getPage("cn", "start").title, "指南");
  assert.equal(await source.readPage(source.getPage("en", "guide")), raw);
  assert.deepEqual(source.getAlternates(source.getPage("en", "guide")), [
    { ...locales[0], url: "/en/docs/guide" },
    { ...locales[1], url: "/cn/docs/guide" },
  ]);
  assert.deepEqual(source.getNavigation("cn", "start"), [
    { title: "开始" },
    { title: "指南", url: "/cn/docs/guide" },
  ]);
  assert.equal(source.getPage("en", "guide").kind, "docs");
  assert.equal(source.getPage("en", "button").kind, "component");
  assert.equal(source.getPage("en", "requests").kind, "api");
  assert.equal(source.getPage("fr", "guide"), undefined);
});

test("source adapters reject ambiguous identity, unsafe URLs and unknown locales or kinds", () => {
  for (const invalid of [
    [...pages, pages[0]],
    [{ ...pages[0], url: "/../secret" }],
    [{ ...pages[0], locale: "fr" }],
    [{ ...pages[0], kind: "unknown" }],
    [{ ...pages[0], navigation: { order: NaN } }],
  ]) {
    assert.throws(() =>
      createDocumentationSource({ pages: invalid, locales, readPage: async () => "" }),
    );
  }
});

test("locale and slug identities cannot collide through delimiters or match an unknown locale", () => {
  const page = { locale: "en", slug: "docs:guide", title: "Guide", url: "/en/docs:guide" };
  const one = createDocumentationSource({ pages: [page], locales, readPage: async () => "" });
  assert.equal(one.getPage("en:docs", "guide"), undefined);
  const two = createDocumentationSource({
    pages: [page, { locale: "en:docs", slug: "guide", title: "Other", url: "/other/guide" }],
    locales: [...locales, { code: "en:docs", label: "Other", language: "en" }],
    readPage: async () => "",
  });
  assert.equal(two.getPage("en", "docs:guide").title, "Guide");
  assert.equal(two.getPage("en:docs", "guide").title, "Other");
});

test("translation keys connect localized slugs without inventing missing translations", () => {
  const translated = [
    {
      locale: "en",
      slug: "start",
      url: "/en/start",
      title: "Start",
      translationKey: "getting-started",
    },
    {
      locale: "cn",
      slug: "kai-shi",
      url: "/cn/kai-shi",
      title: "开始",
      translationKey: "getting-started",
    },
  ];
  const source = createDocumentationSource({
    pages: translated,
    locales,
    readPage: async () => "",
  });
  assert.deepEqual(
    source.getAlternates(source.getPage("en", "start")).map(({ url }) => url),
    ["/en/start", "/cn/kai-shi"],
  );
  assert.throws(
    () =>
      createDocumentationSource({
        pages: [...translated, { ...translated[0], slug: "other", url: "/en/other" }],
        locales,
        readPage: async () => "",
      }),
    /duplicate translation/,
  );
});

test("custom metadata is cloned JSON data, not executable or cyclic state", () => {
  const metadata = { audience: "Developers", options: { required: false }, tags: ["api"] };
  const source = createDocumentationSource({
    pages: [{ ...pages[0], metadata }],
    locales,
    readPage: async () => "",
  });
  metadata.tags.push("changed");
  assert.deepEqual(source.getPage("en", "guide").metadata.tags, ["api"]);
  const cyclic = {};
  cyclic.self = cyclic;
  for (const invalid of [
    { callback: () => "" },
    { timestamp: new Date() },
    { value: Infinity },
    cyclic,
  ]) {
    assert.throws(
      () =>
        createDocumentationSource({
          pages: [{ ...pages[0], metadata: invalid }],
          locales,
          readPage: async () => "",
        }),
      /metadata/,
    );
  }
});
