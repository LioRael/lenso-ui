import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "bun:test";
import { staticClient } from "fumadocs-core/search/client/orama-static";
import {
  authoredHeadingIds,
  createLocaleSearch,
  searchMarkdown,
  searchStructure,
} from "./static-search.ts";
import { structure } from "fumadocs-core/mdx-plugins/remark-structure";
import { remarkHeading } from "fumadocs-core/mdx-plugins/remark-heading";
import matter from "gray-matter";

test("search retains authored guidance without native API declarations", async () => {
  const markdown = matter(
    await readFile(
      new URL("../content/lenso/en/react/components/button.mdx", import.meta.url),
      "utf8",
    ),
  ).content;
  const plugins: Parameters<typeof structure>[1] = [
    authoredHeadingIds("button"),
    [remarkHeading, { customId: false }],
  ];
  const options = { types: ["heading", "paragraph"] };
  const searchable = searchMarkdown(markdown, "button");
  assert.ok(!searchable.includes("Property declarations"));
  assert.ok(!searchable.includes("packages/ui/src/components/button/"));
  assert.deepEqual(
    searchStructure(searchMarkdown(markdown, "button"), "button"),
    structure(searchMarkdown(markdown, "button"), plugins, options),
  );
  const authored =
    "## Guide\n\n| Heading | Value |\n| --- | --- |\n| a | b |\n\n## API Reference\n\n```md\n| example | code |\n```\n\n| Property | Type |\n| --- | --- |\n| name | string |\n\n## More\n\n| Still | authored |";
  const stripped = searchMarkdown(authored, "button");
  assert.ok(stripped.includes("| Heading | Value |"));
  assert.ok(!stripped.includes("| example | code |"));
  assert.ok(stripped.includes("| Still | authored |"));
  assert.ok(!stripped.includes("| name | string |"));
  assert.equal(searchMarkdown(authored, undefined), authored);
});

test("transform-only search extraction retains official records for every authored page", async () => {
  const index = JSON.parse(
    await readFile(new URL("../src/generated/lenso-docs-index.json", import.meta.url), "utf8"),
  );
  for (const page of index.pages) {
    const family = page.slug.startsWith("react/components/") ? page.slug.split("/")[2] : undefined;
    const markdown = searchMarkdown(
      matter(await readFile(new URL(`../${page.markdownFile}`, import.meta.url), "utf8")).content,
      family,
    );
    assert.deepEqual(
      searchStructure(markdown, family),
      structure(markdown, [authoredHeadingIds(family), [remarkHeading, { customId: false }]], {
        types: ["heading", "paragraph"],
      }),
      page.markdownFile,
    );
  }
}, 30000);

test("search anchors use the renderer's punctuation/Unicode IDs and native API IDs", () => {
  const data = structure(
    "## A.B: C_D [!toc]\n\n## 主题与令牌\n\n## Hello [#manual]\n\n## API Reference\n\n### ` ButtonRoot `\n\n#### Callback state",
    [authoredHeadingIds("button"), [remarkHeading, { customId: false }]],
    { types: ["heading", "paragraph"] },
  );
  assert.deepEqual(
    data.headings.map((heading) => heading.id),
    ["ab-cd", "主题与令牌", "hello-manual", "native-api-button", "api-button-ButtonRoot"],
  );
});

// Exercise exported English and Chinese search through the actual static client.
for (const locale of ["en", "cn"]) {
  test(`exported ${locale} search matches authored pages without an API`, async () => {
    const index: {
      pages: { locale: string; slug: string; title: string; markdownFile: string }[];
    } = JSON.parse(
      await readFile(new URL("../src/generated/lenso-docs-index.json", import.meta.url), "utf8"),
    );
    const data = JSON.parse(
      await readFile(new URL(`../public/search/${locale}.json`, import.meta.url), "utf8"),
    );
    assert.ok(
      Buffer.byteLength(JSON.stringify(data)) < 25 * 1024 * 1024,
      "Locale asset must fit Cloudflare's file limit",
    );
    const requests: Parameters<typeof globalThis.fetch>[0][] = [];
    const fetch = globalThis.fetch;
    globalThis.fetch = Object.assign(
      async (url: Parameters<typeof globalThis.fetch>[0]) => {
        requests.push(url);
        return Response.json(data);
      },
      { preconnect: fetch.preconnect },
    );
    try {
      const client = staticClient({
        from: `/search/${locale}.json`,
        search: { limit: 60 },
      });
      const cases =
        locale === "cn"
          ? [
              ["安装", "react/getting-started/installation"],
              ["键盘", "react/components/kbd"],
            ]
          : [
              ["Button", "react/components/button"],
              ["Quick start", "react/getting-started/installation"],
            ];
      for (const [query, slug] of cases) {
        const hits = await client.search(query);
        assert.ok(
          hits.some((hit) => hit.url === `/${locale}/docs/${slug}`),
          `${query} must find ${slug}`,
        );
        assert.ok(hits.every((hit) => hit.url.startsWith(`/${locale}/docs/`)));
      }
      if (locale === "en") {
        const phrase = "hashing and manifests";
        const target = index.pages.find(
          (page) => page.locale === "en" && page.slug === "react/getting-started/frameworks",
        );
        assert.ok(target);
        const markdown = await readFile(
          new URL(`../${target.markdownFile}`, import.meta.url),
          "utf8",
        );
        const extracted = structure(matter(markdown).content);
        assert.ok(!target.title.toLowerCase().includes("hashing"));
        assert.ok(
          extracted.headings.every((heading) => !heading.content.toLowerCase().includes("hashing")),
        );
        assert.ok(markdown.includes(phrase));
        const hits = await client.search(phrase);
        const body = hits.find(
          (hit) =>
            hit.type === "text" &&
            hit.url === "/en/docs/react/getting-started/frameworks#load-css-and-the-theme" &&
            hit.content.replace(/<\/?mark>/g, "").includes(phrase),
        );
        assert.ok(
          body,
          "A prose-only query must return its native text row and owning canonical heading",
        );
      }
      assert.deepEqual(await client.search("zzzzzzzznotadocument"), []);
      assert.deepEqual(requests, [`/search/${locale}.json`]);
    } finally {
      globalThis.fetch = fetch;
    }
  });
}

// Full client regression uses the generated assets above. Generator extraction
// needs only one real authored page per locale, not both complete API catalogs.
test("search generation exports one authored guide in each locale", async () => {
  for (const locale of ["en", "cn"]) {
    const server = await createLocaleSearch(
      {
        pages: [
          {
            locale,
            slug: "react/getting-started/installation",
            title: locale === "cn" ? "安装" : "Installation",
            description: "Install Lenso",
            markdownFile: `content/lenso/${locale}/react/getting-started/installation.mdx`,
          },
        ],
      },
      locale,
    );
    const data = await server.export();
    assert.ok(JSON.stringify(data).includes(`/${locale}/docs/react/getting-started/installation`));
  }
});
