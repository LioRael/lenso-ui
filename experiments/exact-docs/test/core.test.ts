import { afterEach, expect, test } from "bun:test";
import { mkdtemp, rm, symlink } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { main } from "../src/cli.ts";
import { generateApp, loadSite, navigationGroups, parseConfig } from "../src/index.ts";
import { frontmatter } from "../src/metadata.ts";
import { compileMarkdown } from "../src/markdown.ts";
import { staticResponse } from "../src/server.ts";

const temporary: string[] = [];
async function fixture() {
  const root = await mkdtemp(path.join(tmpdir(), "exact-docs-test-"));
  temporary.push(root);
  return root;
}
afterEach(async () => {
  await Promise.all(temporary.splice(0).map((root) => rm(root, { recursive: true, force: true })));
});

// No existing documentation tests exercise this independent content compiler or CLI.
test("rejects duplicate routes, unsafe source paths and untyped Exact exports", () => {
  const page = { path: "/", title: "Home", source: "index.md" };
  expect(() => parseConfig({ name: "Docs", pages: [page, page] })).toThrow("Duplicate route");
  expect(() => parseConfig({ name: "Docs", pages: [{ ...page, source: "../secret.md" }] })).toThrow(
    "relative source",
  );
  expect(() =>
    parseConfig({ name: "Docs", pages: [{ ...page, source: "home.contract" }] }),
  ).toThrow("component name");
  expect(() =>
    parseConfig({ name: "Docs", pages: [page], root: { source: "../root.contract" } }),
  ).toThrow("root requires");
  expect(() =>
    parseConfig({
      name: "Docs",
      pages: [page],
      root: {
        source: "root.contract",
        imports: [{ source: "types.contract", names: ["Counter\ncomponent Injected"] }],
      },
    }),
  ).toThrow("identifier names");
  expect(
    parseConfig({ name: "Docs", pages: [page], root: { source: "root.contract" } }).root?.data,
  ).toBeUndefined();
});

test("Markdown escapes Contract syntax and gives repeated headings distinct anchors", () => {
  const compiled = compileMarkdown(
    '# Hello\n\n## Hello\n\nText "quoted" ${count}\n\n```contract\ncomponent Bad\n```',
    (href) => href,
  );
  expect(compiled.headings.map((heading) => heading.id)).toEqual(["hello", "hello-2"]);
  expect(compiled.contract).toContain('text "Text \\"quoted\\" ${count}"');
  expect(compiled.contract).not.toContain("\ncomponent Bad");
  expect(() => compileMarkdown("<script>alert(1)</script>", (href) => href)).toThrow("Raw HTML");
  expect(() => compileMarkdown("[bad](javascript:alert)", (href) => href)).toThrow(
    "Unsupported link",
  );
});

// Metadata changes must affect content, grouping and navigation through one normalized document.
test("frontmatter precedence, inferred titles and hidden pages share one document model", async () => {
  const root = await fixture();
  await Bun.write(
    path.join(root, "first.md"),
    "---\ntitle: Frontmatter title\ndescription: First description\ngroup: Guides\n---\n# First heading\n\nBody",
  );
  await Bun.write(
    path.join(root, "hidden.md"),
    "---\nnav: false\nsearch: false\n---\n# Hidden heading",
  );
  await Bun.write(
    path.join(root, "docs.json"),
    JSON.stringify({
      name: "Docs",
      pages: [
        { path: "/", title: "Configured title", source: "first.md" },
        { path: "/hidden", source: "hidden.md" },
      ],
    }),
  );
  const site = await loadSite(root);
  expect(site.documents[0]!.title).toBe("Configured title");
  expect(site.documents[0]!.description).toBe("First description");
  expect(site.documents[0]!.headings[0]!.title).toBe("First heading");
  expect(site.documents[1]!.title).toBe("Hidden heading");
  expect(site.documents[1]!.search).toBe(false);
  expect(navigationGroups(site.documents)).toEqual([
    { id: "0", title: "Guides", items: [{ title: "Configured title", href: "/" }] },
  ]);
  expect(() => frontmatter("---\ntitle: []\n---\nBody")).toThrow("title must be a string");
  expect(() => frontmatter("---\ntitle: Unclosed")).toThrow("Unclosed");
});

test("new creates an independent project, preserves existing directories, and resolves source links", async () => {
  const parent = await fixture();
  const root = path.join(parent, "docs");
  await main(["new", root]);
  await expect(main(["new", root])).rejects.toThrow();
  await Bun.write(
    path.join(root, "index.md"),
    "# Home\n\n[Authoring](authoring.md?q=hello#exact-pages)",
  );
  const site = await loadSite(root);
  expect(site.documents[0]!.links).toEqual(["/authoring?q=hello#exact-pages"]);
  const app = await generateApp(site);
  expect(await Bun.file(path.join(app, "app.contract")).text()).toContain("DocsCustomPage2()");
  expect(await Bun.file(path.join(app, "app.ts")).text()).toContain("./site/data/source.ts");
  expect(await Bun.file(path.join(root, "docs.json")).exists()).toBe(true);
  const configFile = Bun.file(path.join(root, "docs.json"));
  const withoutData = await configFile.json();
  delete withoutData.root;
  withoutData.pages = withoutData.pages.map((page: { path: string }) =>
    page.path === "/data" ? { path: "/data", title: "Static page", source: "index.md" } : page,
  );
  await Bun.write(configFile, JSON.stringify(withoutData));
  await generateApp(await loadSite(root));
  expect(await Bun.file(path.join(app, "app.ts")).exists()).toBe(false);
  await Bun.write(path.join(root, "index.md"), "# Home\n\n[Missing](/authoring#unknown)");
  await expect(loadSite(root)).rejects.toThrow("missing heading");
});

test("page symlinks cannot read outside the content project", async () => {
  const root = await fixture();
  const outside = await fixture();
  await Bun.write(path.join(outside, "secret.md"), "# Outside");
  await symlink(path.join(outside, "secret.md"), path.join(root, "index.md"));
  await Bun.write(
    path.join(root, "docs.json"),
    JSON.stringify({ name: "Docs", pages: [{ path: "/", title: "Home", source: "index.md" }] }),
  );
  await expect(loadSite(root)).rejects.toThrow("escapes project");
});

test("static delivery returns rendered pages, real 404 statuses and no internal build files", async () => {
  const root = await fixture();
  await Bun.write(path.join(root, "guide/index.html"), "<body>Guide</body>");
  await Bun.write(path.join(root, "404.html"), "<body>Not found</body>");
  expect(await (await staticResponse(new Request("http://localhost/guide"), root)).text()).toBe(
    "<body>Guide</body>",
  );
  expect((await staticResponse(new Request("http://localhost/missing"), root)).status).toBe(404);
  expect((await staticResponse(new Request("http://localhost/.gen/app.js"), root)).status).toBe(
    404,
  );
  const dev = await staticResponse(new Request("http://localhost/guide"), root, { dev: true });
  expect(await dev.text()).toContain("EventSource");
});
