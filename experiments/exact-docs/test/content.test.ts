import { expect, test } from "bun:test";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { parseMarkdown } from "../src/markdown.ts";
import { renderContract } from "../src/renderers/exact.ts";
import { renderHtml } from "../src/renderers/html.ts";
import { highlightDocuments } from "../src/highlight.ts";
import { walk } from "../src/content.ts";
import { loadSite, parseConfig } from "../src/index.ts";
import { pageSeo, decoratePageHtml, writeSeo } from "../src/seo.ts";

test("one serializable document renders through independent Exact and HTML backends", () => {
  const parsed = parseMarkdown(
    "# Title\n\n**Strong** [link](/guide?q=x&y=2)\n\n3. First\n4. Second",
    (href) => href,
  );
  const nodes = JSON.parse(JSON.stringify(parsed.nodes));
  expect(renderContract(nodes)).toContain('href="/guide?q=x&y=2"');
  const html = renderHtml(nodes);
  expect(html).toContain("<strong>Strong</strong>");
  expect(html).toContain('href="/guide?q=x&amp;y=2"');
  expect(html).toContain('<ol start="3">');
  expect(JSON.stringify(nodes)).not.toContain('"attrs"');
});

test("build-time grammar tokens preserve code exactly and carry no theme palette", async () => {
  const source = 'const value = 42; // note\nconst text = "<tag>";\n';
  const parsed = parseMarkdown("```ts\n" + source + "```", (href) => href);
  await highlightDocuments([{ body: parsed.nodes }]);
  const code = [...walk(parsed.nodes)].find((node) => node.kind === "code");
  if (!code || code.kind !== "code") throw new Error("Missing code node");
  expect(code.tokens?.map((token) => token.text).join("")).toBe(source);
  expect(code.tokens?.some((token) => token.kind === "keyword")).toBe(true);
  expect(code.tokens?.some((token) => token.kind === "comment")).toBe(true);
  expect(code.tokens?.some((token) => token.kind === "number")).toBe(true);
  expect(renderContract(parsed.nodes)).toContain('data-docs-token="keyword"');
  expect(renderContract(parsed.nodes)).not.toContain("color=");
  expect(renderHtml(parsed.nodes)).toContain("&lt;tag&gt;");
});

test("registered component calls are data, keep Markdown children, and reject executable props", () => {
  const source =
    "```exact-component\n" +
    JSON.stringify({
      name: "Counter",
      props: { label: "${danger}", initial: 2 },
      children: "## Child heading\n\n[Child link](/guide)",
    }) +
    "\n```";
  const parsed = parseMarkdown(source, (href) => href);
  expect(parsed.headings[0]?.id).toBe("child-heading");
  expect(parsed.links).toEqual(["/guide"]);
  expect(() => renderContract(parsed.nodes)).toThrow("Unregistered component");
  expect(renderContract(parsed.nodes, { Counter: "DocsEmbed0" })).toContain(
    'DocsEmbed0(label="${danger}", initial=2)',
  );
  expect(() => renderHtml(parsed.nodes)).toThrow("component adapter");
  expect(
    renderHtml(parsed.nodes, (node) => `<aside>${renderHtml(node.children)}</aside>`),
  ).toContain('<h2 id="child-heading">Child heading</h2>');
  expect(() =>
    parseMarkdown(
      '```exact-component\n{"name":"Counter","props":{"run()":"unsafe"}}\n```',
      (href) => href,
    ),
  ).toThrow("Unsupported component prop");
});

test("SEO alternates stay in one version and noindex pages leave the sitemap", async () => {
  const root = await mkdtemp(path.join(tmpdir(), "exact-docs-seo-"));
  try {
    await Bun.write(path.join(root, "index.md"), "# Guide");
    const input = {
      name: "Docs",
      origin: "https://docs.example.test",
      locales: [
        { id: "en", label: "English" },
        { id: "zh-CN", label: "中文" },
      ],
      versions: [
        { id: "v2", label: "v2" },
        { id: "v1", label: "v1" },
      ],
      pages: [
        { id: "guide", path: "/", source: "index.md" },
        { id: "guide", path: "/zh", source: "index.md", locale: "zh-CN" },
        { id: "guide", path: "/v1", source: "index.md", version: "v1" },
        { id: "private", path: "/private", source: "index.md", noindex: true },
      ],
    };
    await Bun.write(path.join(root, "docs.json"), JSON.stringify(input));
    const site = await loadSite(root),
      doc = site.documents[1]!;
    expect(pageSeo(doc, site).alternates.map((item) => item.href)).toEqual([
      "https://docs.example.test/",
      "https://docs.example.test/zh",
      "https://docs.example.test/",
    ]);
    const html = decoratePageHtml(
      '<html lang="en"><meta charset="utf-8"><title>Guide</title>',
      doc,
      site,
    );
    expect(html).toContain('lang="zh-CN"');
    expect(html).toContain('hreflang="zh-CN"');
    await writeSeo(site, path.join(root, "out"));
    const sitemap = await Bun.file(path.join(root, "out/sitemap.xml")).text();
    expect(sitemap).not.toContain("/private");
    expect(sitemap).toContain("/v1");
    expect(() => parseConfig({ ...input, origin: "https://docs.example.test/subpath" })).toThrow(
      "origin",
    );
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
