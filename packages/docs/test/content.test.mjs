import assert from "node:assert/strict";
import { mkdtemp, mkdir, rm, symlink, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { compile } from "@mdx-js/mdx";
import { defineDocs, loadConfig } from "../src/config.mjs";
import { buildContent } from "../src/content.mjs";

async function project(t, files) {
  const root = await mkdtemp(path.join(os.tmpdir(), "lenso-docs-content-"));
  t.after(() => rm(root, { recursive: true, force: true }));
  for (const [name, value] of Object.entries(files)) {
    const file = path.join(root, name);
    await mkdir(path.dirname(file), { recursive: true });
    await writeFile(file, value);
  }
  return root;
}

test("configuration defaults and entry reload work in external projects", async (t) => {
  const root = await project(t, {});
  assert.deepEqual(await loadConfig(root), {
    title: "Documentation",
    contentDir: "content",
    language: "en",
    basePath: "",
  });
  const file = path.join(root, "docs.config.ts");
  await writeFile(file, 'const title: string = "First"; export default { title };');
  assert.equal((await loadConfig(root)).title, "First");
  await writeFile(file, 'export default { title: "Other", basePath: "/manual" };');
  assert.equal((await loadConfig(root)).title, "Other");
  await rm(file);
  await writeFile(path.join(root, "docs.config.mjs"), 'export default {title: "Module"}');
  assert.equal((await loadConfig(root)).title, "Module");
});

test("file sources preserve document kind and custom data without changing exact Markdown", async (t) => {
  const markdown =
    "---\ntitle: API\nkind: api\nmetadata:\n  audience: Developers\n---\n\n## Operation\n";
  const root = await project(t, { "content/index.mdx": markdown });
  const { pages } = await buildContent(root, { title: "Docs" });
  assert.equal(pages[0].kind, "api");
  assert.deepEqual(pages[0].metadata, { audience: "Developers" });
  assert.equal(pages[0].markdown, markdown);
});

test("configuration rejects unsupported fields and unsafe URLs or paths", () => {
  for (const input of [
    {},
    { title: "Docs", theme: {} },
    { title: "Docs", contentDir: "../content" },
    { title: "Docs", contentDir: "/tmp" },
    { title: "Docs", contentDir: ".lenso/content" },
    { title: "Docs", contentDir: "out" },
    { title: "Docs", contentDir: "public/pages" },
    { title: "Docs", contentDir: "node_modules/pages" },
    { title: "Docs", basePath: "/manual/" },
    { title: "Docs", basePath: "/_lenso" },
    { title: "Docs", basePath: "/404" },
    { title: "Docs", logo: "http://example.com/logo.svg" },
    { title: "Docs", logo: "//example.com/logo.svg" },
    { title: "Docs", links: { Run: "javascript:alert(1)" } },
    { title: "Docs", links: { Run: "/%2e%2e/private" } },
    { title: "Docs", logo: "/%00/logo.svg" },
    { title: "Docs", siteUrl: "/docs" },
    { title: "Docs", navigation: [{ title: "Guide", pages: ["guide.md"] }] },
  ])
    assert.throws(() => defineDocs(input), /Docs config:/u);
  assert.equal(
    defineDocs({
      title: "Docs",
      logo: "/logo.svg",
      links: { Home: "https://example.com", Mail: "mailto:a@example.com" },
    }).logo,
    "/logo.svg",
  );
});

test("the content root and its ancestor directories cannot alias external source", async (t) => {
  const root = await project(t, { "source/pages/index.md": "# Private source" });
  await symlink(path.join(root, "source", "pages"), path.join(root, "content"));
  await assert.rejects(buildContent(root, { title: "Docs" }), /content symlinks are unsupported/u);
  await rm(path.join(root, "content"));
  await symlink(path.join(root, "source"), path.join(root, "content"));
  await assert.rejects(
    buildContent(root, { title: "Docs", contentDir: "content/pages" }),
    /content symlinks are unsupported/u,
  );
});

test("pages share source, TOC IDs, compiled headings, routes and searchable text", async (t) => {
  const original =
    "---\ntitle: Home\ndescription: Start here\n---\n# Home\n\n## Hello *world*\n\nSome `code`.\n\n## Hello *world*\n\n### Child\n\n#### Detail\n\n##### Not in TOC\n";
  const root = await project(t, {
    "content/index.md": original,
    "content/guides/index.mdx": "# Guides\n\n## Overview\n",
    "content/guides/setup.md": "# Setup\n\nInstall instructions.",
    "content/hidden.md": "---\ndraft: true\n---\n# Hidden",
  });
  const { pages, tree } = await buildContent(
    root,
    defineDocs({ title: "Example", basePath: "/manual" }),
  );
  assert.deepEqual(
    pages.map((page) => page.id),
    ["guides/index", "guides/setup", "index"],
  );
  assert.deepEqual(
    pages.map((page) => page.url),
    ["/manual/guides/", "/manual/guides/setup/", "/manual/"],
  );
  const home = pages.find((page) => page.id === "index");
  assert.equal(home.markdown, original);
  assert.ok(home.body.startsWith("# Home"));
  assert.equal(home.title, "Home");
  assert.deepEqual(
    home.headings.map((heading) => heading.id),
    ["hello-world", "hello-world-1", "child", "detail"],
  );
  for (const heading of home.headings) assert.ok(home.compiled.includes(`id: "${heading.id}"`));
  assert.doesNotMatch(home.compiled, /children: "Home"/u);
  assert.match(home.compiled, /react\/jsx-runtime/u);
  assert.match(home.compiled, /export default function MDXContent/u);
  assert.match(home.compiled, /props\.components/u);
  assert.match(home.searchText, /Some code/u);
  assert.equal(tree[0].index.id, "guides/index");
  assert.equal(tree[0].children[0].id, "guides/setup");
});

test("Markdown headings inside Steps compile as flow content and enter the TOC", async (t) => {
  const source =
    "# Guide\n\n<Steps>\n  <Step>\n    ### Create a page\n\n    Add a page.\n  </Step>\n</Steps>\n";
  const root = await project(t, { "content/guides/index.mdx": source });
  const { pages } = await buildContent(root, { title: "Docs" });
  const stepNodes = [];
  await compile(source, {
    remarkPlugins: [
      () => (tree) => {
        function visit(node) {
          if (node.name === "Step") stepNodes.push(node);
          for (const child of node.children ?? []) visit(child);
        }
        visit(tree);
      },
    ],
  });

  assert.deepEqual(
    stepNodes[0].children.map((node) => node.type),
    ["heading", "paragraph"],
  );
  assert.deepEqual(
    pages[0].headings.map(({ title, id }) => ({ title, id })),
    [{ title: "Create a page", id: "create-a-page" }],
  );
});

test("explicit navigation orders only displayed pages, not searchable pages", async (t) => {
  const root = await project(t, {
    "content/index.md": "# Home",
    "content/start.md": "# Start",
    "content/draft.md": "---\ndraft: true\n---\n# Draft",
  });
  const config = { title: "Docs", navigation: [{ title: "Read", pages: ["start", "index"] }] };
  const { pages, tree } = await buildContent(root, config);
  assert.equal(pages.length, 2);
  assert.deepEqual(
    tree[0].children.map((node) => node.id),
    ["start", "index"],
  );
  const hidden = await buildContent(root, {
    ...config,
    navigation: [{ title: "Read", pages: ["start"] }],
  });
  assert.ok(hidden.pages.some((page) => page.id === "index"));
  for (const id of ["draft", "missing"]) {
    await assert.rejects(
      buildContent(root, {
        ...config,
        navigation: [{ title: "Read", pages: [id] }],
      }),
      /missing or draft page/u,
    );
  }
});

test("MDX imports and reexports retain their original source location", async (t) => {
  const root = await project(t, {
    "content/guides/start.mdx":
      'import Demo from "./demo.js"\nexport { helper } from "../helper.js"\n\n{/* Introduction */}\n\n# Getting started\n\n<Demo />',
  });
  const { pages } = await buildContent(root, { title: "Docs" });
  assert.ok(pages[0].compiled.includes(path.join(root, "content/guides/demo.js")));
  assert.ok(pages[0].compiled.includes(path.join(root, "content/helper.js")));
  assert.equal(pages[0].title, "Getting started");
  assert.doesNotMatch(pages[0].compiled, /children: "Getting started"/u);
});

test("cached MDX resolves imports again after a source move that preserves its URL", async (t) => {
  const markdown = 'import Demo from "./demo.js"\n\n# Guide\n\n<Demo />';
  const root = await project(t, { "content/guide.mdx": markdown });
  const first = await buildContent(root, { title: "Docs" });
  await rm(path.join(root, "content", "guide.mdx"));
  await mkdir(path.join(root, "content", "guide"));
  await writeFile(path.join(root, "content", "guide", "index.mdx"), markdown);
  const second = await buildContent(root, { title: "Docs" }, { previous: first.pages });
  assert.equal(second.pages[0].url, first.pages[0].url);
  assert.ok(second.pages[0].compiled.includes(path.join(root, "content", "guide", "demo.js")));
  assert.ok(!second.pages[0].compiled.includes(path.join(root, "content", "demo.js")));
});

test("cached Markdown is recompiled when the file becomes MDX", async (t) => {
  const markdown = "# Guide\n\n<Demo />\n";
  const root = await project(t, { "content/guide.md": markdown });
  const first = await buildContent(root, { title: "Docs" });
  await rm(path.join(root, "content", "guide.md"));
  await writeFile(path.join(root, "content", "guide.mdx"), markdown);
  const second = await buildContent(root, { title: "Docs" }, { previous: first.pages });
  assert.equal(second.pages[0].url, first.pages[0].url);
  assert.notEqual(second.pages[0].compiled, first.pages[0].compiled);
  assert.match(second.pages[0].compiled, /_missingMdxReference\("Demo"/u);
});

test("fenced code retains its source and remains searchable", async (t) => {
  const root = await project(t, {
    "content/index.md": "# Example\n\n```js\nconst answer = 42;\n```\n",
  });
  const { pages } = await buildContent(root, { title: "Docs" });
  assert.match(pages[0].body, /```js\nconst answer = 42;\n```/u);
  assert.match(pages[0].searchText, /const answer = 42;/u);
});

test("search snippets keep paragraph boundaries and rendered heading identities", async (t) => {
  // The original whole-page record made a matching result fill the search dialog.
  const root = await project(t, {
    "content/index.md":
      "# Example\n\n## First\n\nA first paragraph.\n\nAnother paragraph.\n\n## First\n\nLast paragraph.\n\n```js\nconst answer = 42;\n```\n",
  });
  const { pages } = await buildContent(root, { title: "Docs" });
  const { headings, contents } = pages[0].structuredData;
  assert.deepEqual(
    headings.map((heading) => heading.id),
    ["first", "first-1"],
  );
  assert.ok(
    contents.some(
      (content) => content.content === "A first paragraph." && content.heading === "first",
    ),
  );
  assert.ok(contents.some((content) => content.content === "Another paragraph."));
  assert.ok(contents.some((content) => content.content.includes("const answer = 42;")));
  assert.ok(
    contents.every(
      (content) =>
        !(
          content.content.includes("A first paragraph.") &&
          content.content.includes("Last paragraph.")
        ),
    ),
  );
});

test("invalid metadata, conflicting titles, routes and malformed MDX fail actionably", async (t) => {
  for (const [name, files, expected] of [
    [
      "unknown",
      { "content/index.md": "---\nauthor: Person\n---\n# Home" },
      /unsupported frontmatter field/u,
    ],
    ["draft", { "content/index.md": "---\ndraft: yes\n---\n# Home" }, /draft must be a boolean/u],
    [
      "title",
      { "content/index.md": "---\ntitle: Frontmatter\n---\n# Different" },
      /differs from leading H1/u,
    ],
    [
      "collision",
      { "content/guide.md": "# Guide", "content/guide/index.md": "# Landing" },
      /duplicate route/u,
    ],
    ["extensions", { "content/guide.md.md": "# Guide" }, /without extensions/u],
    ["reserved", { "content/_next/index.md": "# Internal" }, /reserved route/u],
    ["markdown collision", { "content/index.md/index.md": "# Bad" }, /without extensions/u],
    ["parse", { "content/index.mdx": "# Home\n\n<Broken" }, /index\.mdx:\d+:\d+/u],
    ["empty", { "content/index.md": "---\ndraft: true\n---\n# Draft" }, /No published pages/u],
  ]) {
    await t.test(name, async (subtest) => {
      const root = await project(subtest, files);
      await assert.rejects(buildContent(root, { title: "Docs" }), expected);
    });
  }
});

test("content symlinks cannot expose outside files", async (t) => {
  const root = await project(t, { "content/index.md": "# Home", "private.md": "# Secret" });
  await symlink(path.join(root, "private.md"), path.join(root, "content/secret.md"));
  await assert.rejects(buildContent(root, { title: "Docs" }), /symlinks must not escape/u);
});
