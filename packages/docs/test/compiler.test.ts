import assert from "node:assert/strict";
import { test } from "node:test";
import { createElement, type ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { compileDocument, type DocumentationAstNode } from "../src/compile-document";
import type { DocumentationDocument } from "../src/document-model";

function renderedHeadingIds(html: string): string[] {
  return [...html.matchAll(/<h[1-6] id="([^"]*)"/g)].map((match) => match[1]!);
}

test("title removal skips non-rendering prefixes but preserves a real introduction", async () => {
  for (const prefix of ["[ref]: /guide\n\n", "{/* License notice */}\n\n"]) {
    const markdown = `${prefix}# Guide\n\n## Section\n`;
    const result = await compileDocument({ markdown, titleMode: "remove-leading" });
    assert.doesNotMatch(renderToStaticMarkup(result.content), /<h1/);
    assert.equal(result.markdown, markdown);
  }
  const result = await compileDocument({
    markdown: "[ref]: /guide\n\nAn introduction.\n\n# Body heading\n",
    titleMode: "remove-leading",
  });
  assert.match(renderToStaticMarkup(result.content), /<h1/);
});

test("image alternative text gives a heading a usable identity and TOC label", async () => {
  const result = await compileDocument({ markdown: "## ![Diagram](image.png)\n" });
  assert.deepEqual(result.headings, [{ title: "Diagram", id: "diagram", depth: 2 }]);
  assert.match(renderToStaticMarkup(result.content), /<h2 id="diagram">/);
});

test("default IDs follow GitHub duplicate rules and match rendered nested headings", async () => {
  const result = await compileDocument({
    markdown:
      "# Repeat\n\n## Repeat\n\n<Steps>\n\n### Repeat\n\n#### Repeat\n\n</Steps>\n\n## Repeat-1",
    components: {
      Steps: ({ children }: { children?: ReactNode }) => createElement("section", null, children),
    },
  });
  const html = renderToStaticMarkup(result.content);
  assert.deepEqual(renderedHeadingIds(html), [
    "repeat",
    "repeat-1",
    "repeat-2",
    "repeat-3",
    "repeat-1-1",
  ]);
  assert.deepEqual(result.headings, [
    { title: "Repeat", id: "repeat-1", depth: 2 },
    { title: "Repeat", id: "repeat-2", depth: 3 },
    { title: "Repeat", id: "repeat-3", depth: 4 },
    { title: "Repeat-1", id: "repeat-1-1", depth: 2 },
  ]);
  const separateDocument = await compileDocument({ markdown: "## Repeat" });
  assert.deepEqual(separateDocument.headings, [{ title: "Repeat", id: "repeat", depth: 2 }]);
});

test("consumer transforms run before collection and custom JSX headings replace pseudo headings", async () => {
  const markdown =
    "---\ntitle: Button\nrevision: 3\n---\n# Button\n\n## API Reference\n\nOld API prose.\n";
  const replaceApi = () => (tree: DocumentationAstNode) => {
    const start = tree.children?.findIndex((node) => node.type === "heading" && node.depth === 2);
    assert.notEqual(start, undefined);
    assert.notEqual(start, -1);
    tree.children!.splice(start!, 2, {
      type: "mdxJsxFlowElement",
      name: "NativeApiReference",
      attributes: [{ type: "mdxJsxAttribute", name: "id", value: "native-api-button" }],
      children: [
        { type: "heading", depth: 2, children: [{ type: "text", value: "API Reference" }] },
      ],
    });
  };
  const result = await compileDocument({
    markdown,
    titleMode: "remove-leading",
    remarkPlugins: [replaceApi],
    components: {
      NativeApiReference: ({ id }: { id?: string }) => createElement("h2", { id }, "API Reference"),
    },
    headingPolicy: {
      id: (title) => title.toLowerCase().replaceAll(" ", "-"),
      additional: (node) =>
        node.type === "mdxJsxFlowElement" && node.name === "NativeApiReference"
          ? [
              {
                title: "API Reference",
                id: String(node.attributes?.find((attribute) => attribute.name === "id")?.value),
                depth: 2,
              },
            ]
          : [],
    },
  });
  assert.deepEqual(result.headings, [
    { title: "API Reference", id: "native-api-button", depth: 2 },
  ]);
  assert.equal(
    renderToStaticMarkup(result.content),
    '<h2 id="native-api-button">API Reference</h2>',
  );
  assert.equal(result.markdown, markdown);
  assert.deepEqual(result.frontmatter, { title: "Button", revision: 3 });
});

test("consumer heading IDs and TOC filter preserve visible heading text", async () => {
  const result = await compileDocument({
    markdown: "## **Visible** `code`\n\n#### Hidden\n\n#### Included [!toc]",
    headingPolicy: {
      id: (title) =>
        title
          .toLowerCase()
          .replace(/\[!toc\]/g, "")
          .trim()
          .replaceAll(" ", "-"),
      include: (title, depth) =>
        depth >= 2 && depth <= 4 && (depth !== 4 || title.includes("[!toc]")),
    },
  });
  assert.deepEqual(result.headings, [
    { title: "Visible code", id: "visible-code", depth: 2 },
    { title: "Included", id: "included", depth: 4 },
  ]);
  const html = renderToStaticMarkup(result.content);
  assert.match(html, /<h2 id="visible-code"><strong>Visible<\/strong> <code>code<\/code><\/h2>/);
  assert.match(html, /<h4 id="included">Included \[!toc\]<\/h4>/);
  assert.deepEqual(renderedHeadingIds(html), ["visible-code", "hidden", "included"]);
});

test("only remove-leading mode removes the initial H1, without modifying authored Markdown", async () => {
  const markdown = "---\ntitle: Authored\n---\n\n# Authored\n\n## Section\n\n# Later\n";
  const preserved = await compileDocument({ markdown });
  const removed = await compileDocument({ markdown, titleMode: "remove-leading" });
  assert.deepEqual(renderedHeadingIds(renderToStaticMarkup(preserved.content)), [
    "authored",
    "section",
    "later",
  ]);
  assert.deepEqual(renderedHeadingIds(renderToStaticMarkup(removed.content)), ["section", "later"]);
  assert.equal(removed.markdown, markdown);
  assert.equal(preserved.markdown, markdown);
  const notLeading = await compileDocument({
    markdown: "Intro.\n\n# Not leading",
    titleMode: "remove-leading",
  });
  assert.match(renderToStaticMarkup(notLeading.content), /<h1 id="not-leading">/);
});

test("docs, component and api documents compile through the same content contract", async () => {
  const documents: DocumentationDocument[] = (["docs", "component", "api"] as const).map(
    (kind, index) => ({
      id: `page-${index}`,
      slug: `page-${index}`,
      url: `/docs/page-${index}`,
      locale: "en",
      title: `Page ${index}`,
      kind,
      markdown: `## ${kind}\n\n| Name | Value |\n| --- | --- |\n| kind | ${kind} |`,
    }),
  );
  for (const document of documents) {
    const result = await compileDocument(document);
    assert.equal(result.markdown, document.markdown);
    assert.deepEqual(result.headings, [{ title: document.kind, id: document.kind, depth: 2 }]);
    assert.match(renderToStaticMarkup(result.content), /<table>/);
  }
});

test("malformed MDX rejects rather than returning partial compiled content", async () => {
  await assert.rejects(compileDocument({ markdown: "## Valid heading\n\n<Unclosed>" }));
});
