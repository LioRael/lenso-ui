import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";
import { create } from "@orama/orama";
import { createTokenizer } from "@orama/tokenizers/mandarin";
import { oramaStaticClient } from "fumadocs-core/search/client/orama-static";
import { authoredHeadingIds, createLocaleSearch } from "./static-search.mjs";
import { structure } from "fumadocs-core/mdx-plugins/remark-structure";
import { remarkHeading } from "fumadocs-core/mdx-plugins/remark-heading";
import matter from "gray-matter";

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

// Default Orama tokenization silently returned no matches for Chinese words.
// Exercise the exported database through Fuma's actual static client, not just
// the server query, to prove the client recreates the same Mandarin tokenizer.
for (const locale of ["en", "cn"]) {
  test(`exported ${locale} search matches authored pages without an API`, async () => {
    const index = JSON.parse(
      await readFile(new URL("../src/generated/lenso-docs-index.json", import.meta.url)),
    );
    const server = await createLocaleSearch(index, locale);
    const data = await server.export();
    assert.ok(
      Buffer.byteLength(JSON.stringify(data)) < 25 * 1024 * 1024,
      "Locale asset must fit Cloudflare's file limit",
    );
    const requests = [];
    const fetch = globalThis.fetch;
    globalThis.fetch = async (url) => {
      requests.push(url);
      return Response.json(data);
    };
    try {
      const client = oramaStaticClient({
        from: `/search/${locale}.json`,
        search: { limit: 60 },
        initOrama: () =>
          create({
            schema: { _: "string" },
            components: locale === "cn" ? { tokenizer: createTokenizer() } : undefined,
          }),
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
        const phrase = "establish support";
        const target = index.pages.find(
          (page) => page.locale === "en" && page.slug === "react/getting-started/frameworks",
        );
        const markdown = await readFile(
          new URL(`../${target.markdownFile}`, import.meta.url),
          "utf8",
        );
        const extracted = structure(matter(markdown).content);
        assert.ok(!target.title.toLowerCase().includes("establish"));
        assert.ok(
          extracted.headings.every(
            (heading) => !heading.content.toLowerCase().includes("establish"),
          ),
        );
        assert.ok(markdown.includes(phrase));
        const hits = await client.search(phrase);
        const body = hits.find(
          (hit) =>
            hit.type === "text" &&
            hit.url === "/en/docs/react/getting-started/frameworks#other-frameworks" &&
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
