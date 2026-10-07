import assert from "node:assert/strict";
import { mkdtemp, mkdir, readFile, rm, symlink, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { createRequire } from "node:module";
import test from "node:test";
import { loadHost, routePath } from "../src/host.mjs";
import { prepare } from "../src/runtime.mjs";
import { generateHost } from "../src/generate-host.mjs";
import { serve } from "../src/serve.mjs";
import { oramaStaticClient } from "fumadocs-core/search/client/orama-static";
import { tsImport } from "tsx/esm/api";

const locales = [
  { code: "en", label: "English", language: "en", routePrefix: "/en" },
  { code: "cn", label: "中文", language: "zh-CN", routePrefix: "/cn" },
];
const config = {
  title: "Bilingual fixture",
  basePath: "/manual",
  contentDir: "content",
  language: "en",
  source: "docs.source.mjs",
  locales,
  defaultLocale: "en",
  siteUrl: "https://example.test",
  components: "docs.components.tsx",
};
const pages = [
  {
    id: "en/start",
    slug: "start",
    url: "/manual/en/learn",
    locale: "en",
    title: "Start",
    translationKey: "intro",
    markdown: "---\nprivate: hidden\n---\n# Start\n\n## Reading\n\nEnglish-only phrase.\n",
  },
  {
    id: "cn/start",
    slug: "开始",
    url: "/manual/cn/read",
    locale: "cn",
    title: "开始",
    translationKey: "intro",
    markdown: "# 开始\n\n## 阅读\n\n中文内容。\n",
  },
];
const source = {
  pages,
  routes: [
    {
      path: "/manual/cn/home",
      module: "routes/home.tsx",
      locale: "cn",
      props: { greeting: "你好" },
      metadata: { title: "Chinese home" },
    },
  ],
  redirects: [{ from: "/manual/old", to: "/manual/en/learn", permanent: false }],
  watchPaths: ["content"],
};

// Existing single-language content tests do not cover exact virtual routes,
// root-language selection, translations, or executable source preparation.
async function fixture(t, input = source) {
  const root = await mkdtemp(path.join(tmpdir(), "lenso-host-"));
  t.after(() => rm(root, { recursive: true, force: true }));
  await mkdir(path.join(root, "routes"));
  await mkdir(path.join(root, "content"));
  await writeFile(path.join(root, "docs.config.mjs"), `export default ${JSON.stringify(config)};`);
  await writeFile(
    path.join(root, "docs.source.mjs"),
    `
import { writeFile, readFile } from "node:fs/promises";
import path from "node:path";
export async function prepare({ root, command }) {
  await writeFile(path.join(root, "prepared.txt"), command);
}
export async function loadSource({ root }) {
  if (!(await readFile(path.join(root, "prepared.txt"), "utf8"))) throw new Error("not prepared");
  return ${JSON.stringify(input)};
}`,
  );
  await writeFile(
    path.join(root, "routes/home.tsx"),
    `export default function Home({ greeting }: { greeting: string }) { return <h1>{greeting}</h1>; }`,
  );
  await writeFile(
    path.join(root, "docs.components.tsx"),
    `
export async function getDocument() { return { content: <p>RSC content override</p>, headings: [] }; }
export async function getRootOptions() { return { metadata: { applicationName: "Fixture" } }; }
`,
  );
  return root;
}

test("custom rendering keeps large raw sources out of the generated module graph", async (t) => {
  const markdown = "Large raw source marker.\n".repeat(50000);
  const root = await fixture(t, {
    ...source,
    render: "custom",
    pages: [{ ...pages[0], markdown }],
  });
  const host = await loadHost(root, config, "build");
  assert.equal(host.pages[0].compiled, undefined);
  const emitted = new Map();
  const directory = path.join(root, ".lenso");
  await generateHost(root, directory, config, host, {
    development: false,
    source: path.resolve("src"),
    write: async (file, content) => emitted.set(path.relative(directory, file), content),
  });
  assert.equal(emitted.get("pages/0.md"), markdown);
  assert.ok(!emitted.has("pages/0.mjs"));
  assert.ok(emitted.get("model.mjs").length < 10000);
  assert.doesNotMatch(emitted.get("model.mjs"), /Large raw source marker/);
});

test("direct host generation protects CLI config and emits locale-correct server modules", async (t) => {
  const root = await fixture(t);
  await mkdir(path.join(root, "src"));
  await writeFile(
    path.join(root, "docs.build.mjs"),
    `export default () => ({
    output: "standalone", distDir: "/outside", basePath: "/wrong", trailingSlash: false,
    transpilePackages: ["consumer-lib"], experimental: { testSetting: true },
    webpack(config) { config.resolve = { alias: { prior: "/prior" } }; return config; }
  });`,
  );
  const input = {
    ...config,
    build: "docs.build.mjs",
    aliases: { "@": "src" },
    stylesheet: "consumer",
    trailingSlash: true,
  };
  const host = await loadHost(root, input, "build");
  const directory = path.join(root, ".lenso");
  await mkdir(path.join(directory, "node_modules"), { recursive: true });
  await symlink(
    path.dirname(createRequire(import.meta.url).resolve("react/package.json")),
    path.join(directory, "node_modules/react"),
    process.platform === "win32" ? "junction" : "dir",
  );
  const emitted = new Map();
  await generateHost(root, directory, input, host, {
    development: false,
    source: path.resolve("packages/docs/src"),
    write: async (file, content) => {
      emitted.set(path.relative(directory, file), content);
      await mkdir(path.dirname(file), { recursive: true });
      await writeFile(file, content);
    },
  });
  const next = (await import(path.join(directory, "next.config.mjs"))).default;
  const settings = await next("phase-production-build", {});
  assert.equal(settings.output, "export");
  assert.equal(settings.distDir, ".next");
  assert.equal(settings.basePath, "/manual");
  assert.equal(settings.trailingSlash, true);
  assert.deepEqual(settings.transpilePackages, ["@lenso/docs", "consumer-lib"]);
  assert.equal(settings.experimental.globalNotFound, true);
  assert.deepEqual(settings.webpack({}, {}).resolve.alias, {
    prior: "/prior",
    "@": path.join(root, "src"),
  });
  const layout = emitted.get("app/(locale-1)/layout.jsx");
  assert.match(layout, /"language":"zh-CN"/);
  assert.doesNotMatch(layout, /stylex\.css|docs\.css/);
  assert.ok(emitted.has("app/(locale-1)/cn/read/page.jsx"));
  assert.ok(emitted.has("app/(locale-1)/cn/home/page.jsx"));
  assert.ok(emitted.has("app/(locale-0)/old/page.jsx"));
  assert.match(layout, /docs\.components\.tsx/);
  assert.match(layout, /Reflect\.get\(customization, "getRootOptions"\)/);
  assert.match(emitted.get("render.jsx"), /Reflect\.get\(customization, "getDocument"\)/);
  const model = await import(path.join(directory, "model.mjs"));
  assert.equal(model.pages[0].compiled, undefined);
  assert.equal(model.bodies["cn/start"] instanceof Function, true);
});

// A shared customization import passes the legacy host tests while pulling every
// document adapter into every route. Prove the actual emitted import boundaries.
test("root and document customizations stay local to their generated entry points", async (t) => {
  const documents = ["routes/en-document.tsx", "routes/cn-document.tsx"];
  const root = await fixture(t, {
    ...source,
    render: "custom",
    pages: pages.map((page, index) => ({ ...page, module: documents[index] })),
  });
  await writeFile(path.join(root, "docs.root.tsx"), "export const getRootOptions = () => ({});");
  for (const module of documents)
    await writeFile(
      path.join(root, module),
      "export const getDocument = () => ({ content: null });",
    );
  const input = { ...config, root: "docs.root.tsx" };
  const host = await loadHost(root, input, "build");
  for (const [index, page] of host.pages.entries()) {
    assert.equal(page.module, path.join(root, documents[index]));
    assert.ok(host.watchPaths.includes(documents[index]));
  }
  const directory = path.join(root, ".lenso");
  const emitted = new Map();
  await generateHost(root, directory, input, host, {
    development: false,
    source: path.resolve("packages/docs/src"),
    write: async (file, content) => emitted.set(path.relative(directory, file), content),
  });
  for (const group of ["(locale-0)", "(locale-1)"]) {
    const layout = emitted.get(`app/${group}/layout.jsx`);
    assert.ok(layout.includes(path.join(root, "docs.root.tsx")));
    assert.match(layout, /\/root\.tsx"/);
    assert.doesNotMatch(layout, /view\.tsx|docs\.components\.tsx|document\.tsx|render\.jsx/);
  }
  const entries = ["app/(locale-0)/en/learn/page.jsx", "app/(locale-1)/cn/read/page.jsx"];
  for (const [index, entry] of entries.entries()) {
    const module = emitted.get(entry);
    assert.ok(module.includes(path.join(root, documents[index])));
    assert.ok(!module.includes(documents[1 - index]));
    assert.ok(module.includes(`renderPage(${JSON.stringify(pages[index].id)}, documentModule)`));
    assert.doesNotMatch(module, /\bimport\(/);
  }
  for (const module of ["model.mjs", "render.jsx"]) {
    for (const document of documents) assert.ok(!emitted.get(module).includes(document));
    assert.doesNotMatch(emitted.get(module), /\bimport\(/);
  }
  const model = await import(
    `data:text/javascript,${encodeURIComponent(emitted.get("model.mjs"))}`
  );
  assert.ok(model.pages.every((page) => !("module" in page)));
});

test("custom source can use per-document renderers without global customization", async (t) => {
  const root = await fixture(t, {
    render: "custom",
    pages: pages.map((page) => ({ ...page, module: "routes/home.tsx" })),
  });
  const input = { ...config, components: undefined };
  const host = await loadHost(root, input, "build");
  assert.equal(host.pages.length, 2);
  assert.ok(host.pages.every((page) => page.compiled === undefined));
  const missing = await fixture(t, { render: "custom", pages: [pages[0]] });
  await assert.rejects(loadHost(missing, input, "build"), /page module or a components module/);
});

test("page namespaces override document hooks while async chrome hooks retain the public context", async (t) => {
  const root = await fixture(t, {
    render: "custom",
    pages: [{ ...pages[0], module: "routes/document.mjs" }, pages[1]],
  });
  await writeFile(
    path.join(root, "routes/document.mjs"),
    `export async function getDocument({ page }) { return { content: "local " + page.id }; }
export async function getComponents({ page }) { return { marker: "local " + page.id }; }`,
  );
  await writeFile(
    path.join(root, "docs.customization.mjs"),
    `export async function getDocument({ page }) {
  if (page.locale === "en") return { content: "global " + page.id };
}
export async function getComponents({ page }) { return { marker: "global " + page.id }; }
export async function getSiteSlots(context) { return { marker: Object.keys(context).sort() }; }
export async function getSiteOptions({ config, page }) { return { marker: config.title + page.id }; }
export async function getPageOptions({ page }) { return { marker: page.markdown }; }`,
  );
  const input = { ...config, components: "docs.customization.mjs" };
  const host = await loadHost(root, input, "build");
  const directory = path.join(root, ".lenso");
  const sourceDirectory = path.join(root, "src");
  await mkdir(sourceDirectory);
  // Only inspect the shared renderer's element props, without coupling this hook
  // contract test to presentation builds or rendering the Fumadocs chrome.
  await writeFile(
    path.join(sourceDirectory, "view.tsx"),
    "export function DocumentationPage() { return null; }",
  );
  await mkdir(path.join(directory, "node_modules"), { recursive: true });
  await symlink(
    path.dirname(createRequire(import.meta.url).resolve("react/package.json")),
    path.join(directory, "node_modules/react"),
    process.platform === "win32" ? "junction" : "dir",
  );
  await generateHost(root, directory, input, host, {
    development: false,
    source: sourceDirectory,
    write: async (file, content) => {
      await mkdir(path.dirname(file), { recursive: true });
      await writeFile(file, content);
    },
  });
  const { renderPage } = await tsImport(path.join(directory, "render.jsx"), import.meta.url);
  const documentModule = await import(host.pages[0].module);
  const local = (await renderPage(pages[0].id, documentModule)).props;
  assert.equal(local.document.content, `local ${pages[0].id}`);
  assert.equal(local.customComponents.marker, `local ${pages[0].id}`);
  assert.deepEqual(local.siteSlots.marker, ["config", "page"]);
  assert.equal(local.siteOptions.marker, config.title + pages[0].id);
  assert.equal(local.pageOptions.marker, pages[0].markdown);
  assert.equal("module" in local.page, false);
  const localDefault = (await renderPage(pages[0].id, { default: { marker: "local default" } }))
    .props;
  assert.equal(localDefault.customComponents.marker, "local default");
  const fallback = (await renderPage(pages[0].id)).props;
  assert.equal(fallback.document.content, `global ${pages[0].id}`);
  assert.equal(fallback.customComponents.marker, `global ${pages[0].id}`);
  await assert.rejects(renderPage(pages[1].id), /requires getDocument to return a document result/);
});

test("prepare watches a contained root module and rejects non-files and symlinked roots", async (t) => {
  const root = await fixture(t);
  await writeFile(path.join(root, "docs.root.tsx"), "export const getRootOptions = () => ({});");
  await writeFile(
    path.join(root, "docs.config.mjs"),
    `export default ${JSON.stringify({ ...config, root: "docs.root.tsx" })};`,
  );
  const result = await prepare(root, { development: true });
  assert.ok(result.watchPaths.includes("docs.root.tsx"));
  const layout = await readFile(path.join(result.directory, "app/(locale-0)/layout.jsx"), "utf8");
  assert.match(layout, /docs\.root\.tsx/);
  assert.doesNotMatch(layout, /docs\.components\.tsx/);
  await mkdir(path.join(root, "root-directory.tsx"));
  await symlink(path.join(root, "docs.root.tsx"), path.join(root, "root-alias.tsx"));
  await symlink(path.join(root, "routes"), path.join(root, "linked"));
  for (const [module, expected] of [
    ["root-directory.tsx", /regular contained file/],
    ["root-alias.tsx", /symlinks/],
    ["linked/home.tsx", /symlinks/],
  ]) {
    await writeFile(
      path.join(root, "docs.config.mjs"),
      `export default ${JSON.stringify({ ...config, root: module })};`,
    );
    await assert.rejects(prepare(root), expected);
  }
});

test("virtual bilingual source is prepared, compiled, split and hosted as exact locale routes", async (t) => {
  const root = await fixture(t);
  const result = await prepare(root, { development: true });
  assert.equal(await readFile(path.join(root, "prepared.txt"), "utf8"), "dev");
  assert.deepEqual(result.pages[0].headings, [{ title: "Reading", id: "reading", depth: 2 }]);
  assert.doesNotMatch(result.pages[0].compiled, /private: hidden/);
  const model = await import(path.join(result.directory, "model.mjs"));
  assert.deepEqual(model.alternates["en/start"], {
    en: "/manual/en/learn",
    "zh-CN": "/manual/cn/read",
  });
  assert.equal(model.trees.cn.children[0].url, "/cn/read");
  for (const field of ["compiled", "body", "searchText", "structuredData"])
    assert.equal(field in model.pages[0], false);
  assert.match(
    await readFile(path.join(result.directory, "app/(locale-1)/cn/home/page.jsx"), "utf8"),
    /你好/,
  );
  assert.match(
    await readFile(path.join(result.directory, "app/(locale-0)/old/page.jsx"), "utf8"),
    /redirect\("\/manual\/en\/learn"\)/,
  );
  const sitemap = await readFile(path.join(result.directory, "public/sitemap.xml"), "utf8");
  assert.match(sitemap, /https:\/\/example.test\/manual\/cn\/home/);
  const server = await serve(path.join(result.directory, "public"), {
    port: 0,
    basePath: "/manual",
  });
  t.after(() => new Promise((resolve) => server.close(resolve)));
  const origin = `http://127.0.0.1:${server.address().port}`;
  const redirect = await fetch(`${origin}/manual/old/?q=read`, { redirect: "manual" });
  assert.equal(redirect.status, 302);
  assert.equal(redirect.headers.get("location"), "/manual/en/learn?q=read");
  const en = oramaStaticClient({ from: `${origin}/manual/_lenso/search/en.json` });
  const cn = oramaStaticClient({ from: `${origin}/manual/_lenso/search/cn.json` });
  assert.ok((await en.search("English-only")).some((item) => item.url.startsWith("/en/learn")));
  assert.equal((await cn.search("English-only")).length, 0);
  assert.equal(
    await readFile(path.join(result.directory, "public/_lenso/markdown/en/start.md"), "utf8"),
    pages[0].markdown,
  );
});

test("source hosting rejects global IDs, route collisions, unsafe modules and redirect cycles", async (t) => {
  for (const [input, expected] of [
    [
      { ...source, pages: [pages[0], { ...pages[1], id: pages[0].id }] },
      /duplicate global page ID/,
    ],
    [
      { ...source, routes: [{ ...source.routes[0], path: "/manual/en/learn/" }] },
      /route collision/,
    ],
    [
      { ...source, routes: [{ ...source.routes[0], module: "../outside.tsx" }] },
      /contained local path/,
    ],
    [
      {
        ...source,
        redirects: [
          { from: "/manual/a", to: "/manual/b" },
          { from: "/manual/b", to: "/manual/a" },
        ],
      },
      /Redirect cycle/,
    ],
    [{ ...source, watchPaths: [".lenso"] }, /contained local path/],
  ]) {
    const root = await fixture(t, input);
    await assert.rejects(loadHost(root, config, "build"), expected);
  }
  for (const url of [
    "/manual/%2fother",
    "/manual/a/../b",
    "/manual/(group)",
    "/manual/a//b",
    "/manual/a%3fb",
    "/manual/%252e%252e",
  ])
    assert.throws(() => routePath(url, "/manual"), /Unsafe documentation URL/);
  const root = await fixture(t);
  await symlink(path.join(root, "routes/home.tsx"), path.join(root, "routes/alias.tsx"));
  await writeFile(
    path.join(root, "docs.source.mjs"),
    `export const loadSource = () => (${JSON.stringify({
      ...source,
      routes: [{ ...source.routes[0], module: "routes/alias.tsx" }],
    })});`,
  );
  await assert.rejects(loadHost(root, config, "build"), /symlinks/);
});

test("per-document modules reject unsafe paths, directories and file or ancestor symlinks", async (t) => {
  const root = await fixture(t);
  await mkdir(path.join(root, "routes/directory.tsx"));
  await symlink(path.join(root, "routes/home.tsx"), path.join(root, "routes/alias.tsx"));
  await symlink(path.join(root, "routes"), path.join(root, "linked"));
  for (const [module, expected] of [
    ["../outside.tsx", /contained local path/],
    [path.join(root, "routes/home.tsx"), /contained local path/],
    [".lenso/page.tsx", /contained local path/],
    ["routes/home.css", /Unsupported source module extension/],
    ["routes/directory.tsx", /regular contained file/],
    ["routes/alias.tsx", /symlinks/],
    ["linked/home.tsx", /symlinks/],
  ]) {
    await writeFile(
      path.join(root, "docs.source.mjs"),
      `export const loadSource = () => (${JSON.stringify({
        render: "custom",
        pages: [{ ...pages[0], module }],
      })});`,
    );
    await assert.rejects(loadHost(root, config, "build"), expected);
  }
});
