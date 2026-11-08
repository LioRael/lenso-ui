import assert from "node:assert/strict";
import { mkdtemp, mkdir, readFile, rm, symlink, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import type { AddressInfo } from "node:net";
import { afterEach, test } from "bun:test";

const cleanup: Array<() => void | Promise<void>> = [];
afterEach(async () => {
  for (const dispose of cleanup.splice(0).reverse()) await dispose();
});
import { loadHost, routePath } from "../src/host.ts";
import { prepare } from "../src/runtime.ts";
import { generateHost } from "../src/generate-host.ts";
import { serve } from "../src/serve.ts";
import { oramaStaticClient } from "fumadocs-core/search/client/orama-static";

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
function emittedContent(files: Map<string, string>, file: string): string {
  const content = files.get(file);
  assert.ok(content !== undefined, `Missing generated file: ${file}`);
  return content;
}

async function fixture(input: unknown = source) {
  const root = await mkdtemp(path.join(tmpdir(), "lenso-host-"));
  cleanup.push(() => rm(root, { recursive: true, force: true }));
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

test("Bun loads and refreshes a TypeScript source module", async () => {
  const root = await fixture();
  const file = path.join(root, "docs.source.ts");
  const input = { ...config, source: "docs.source.ts" };
  const writeSource = (title: string) =>
    writeFile(
      file,
      `export function loadSource(_context: { root: string }) { return ${JSON.stringify({
        ...source,
        pages: [{ ...pages[0]!, title }],
      })}; }`,
    );
  await writeSource("First version");
  assert.equal((await loadHost(root, input, "build")).pages[0]!.title, "First version");
  await writeSource("Updated version");
  assert.equal((await loadHost(root, input, "build")).pages[0]!.title, "Updated version");
});

test("custom rendering keeps large raw sources out of the generated module graph", async () => {
  const markdown = "Large raw source marker.\n".repeat(50000);
  const root = await fixture({
    ...source,
    render: "custom",
    pages: [{ ...pages[0]!, markdown }],
  });
  const host = await loadHost(root, config, "build");
  assert.equal(host.pages[0]!.compiled, undefined);
  const emitted = new Map<string, string>();
  const directory = path.join(root, ".lenso");
  await generateHost(root, directory, config, host, {
    development: false,
    source: fileURLToPath(new URL("../src", import.meta.url)),
    write: async (file, content) => {
      emitted.set(path.relative(directory, file), content);
    },
  });
  assert.equal(emittedContent(emitted, "documents/0.md"), markdown);
  assert.ok(!emitted.has("documents/0.js"));
  assert.ok(emittedContent(emitted, "model.ts").length < 10000);
  assert.doesNotMatch(emittedContent(emitted, "model.ts"), /Large raw source marker/);
});

test("direct host generation protects CLI config and emits locale-correct server modules", async () => {
  const root = await fixture({
    ...source,
    pages: pages.map((page) => ({ ...page, customField: "source-owned" })),
  });
  await mkdir(path.join(root, "src"));
  await writeFile(path.join(root, "src/site.css"), ":root { color: red; }");
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
    stylesheet: "consumer" as const,
    styles: ["src/site.css"],
    trailingSlash: true,
  };
  const host = await loadHost(root, input, "build");
  const directory = path.join(root, ".lenso");
  await mkdir(path.join(directory, "node_modules"), { recursive: true });
  await symlink(
    fileURLToPath(new URL("../node_modules", import.meta.url)),
    path.join(root, "node_modules"),
    process.platform === "win32" ? "junction" : "dir",
  );
  await mkdir(path.join(directory, "node_modules/@lenso"));
  await symlink(
    fileURLToPath(new URL("../", import.meta.url)),
    path.join(directory, "node_modules/@lenso/docs"),
    process.platform === "win32" ? "junction" : "dir",
  );
  await symlink(
    path.dirname(createRequire(import.meta.url).resolve("react/package.json")),
    path.join(directory, "node_modules/react"),
    process.platform === "win32" ? "junction" : "dir",
  );
  await symlink(
    path.dirname(createRequire(import.meta.url).resolve("next/package.json")),
    path.join(directory, "node_modules/next"),
    process.platform === "win32" ? "junction" : "dir",
  );
  const emitted = new Map<string, string>();
  await generateHost(root, directory, input, host, {
    development: false,
    source: fileURLToPath(new URL("../src", import.meta.url)),
    write: async (file, content) => {
      emitted.set(path.relative(directory, file), content);
      await mkdir(path.dirname(file), { recursive: true });
      await writeFile(file, content);
    },
  });
  const next = (await import(path.join(directory, "next.config.ts"))).default;
  const settings = await next("phase-production-build", {});
  const check = Bun.spawn(
    [
      process.execPath,
      "check",
      "--no-script",
      "--allowJs",
      "--moduleResolution",
      "bundler",
      "--module",
      "esnext",
      "--target",
      "esnext",
      "--skipLibCheck",
      "--strict",
      path.join(directory, "next.config.ts"),
    ],
    { stdout: "pipe", stderr: "pipe" },
  );
  const [output, errors, status] = await Promise.all([
    new Response(check.stdout).text(),
    new Response(check.stderr).text(),
    check.exited,
  ]);
  assert.equal(status, 0, output + errors);
  const generatedCheck = Bun.spawn(
    [process.execPath, "check", "--no-script", "-p", path.join(directory, "tsconfig.json")],
    { stdout: "pipe", stderr: "pipe" },
  );
  const [generatedOutput, generatedErrors, generatedStatus] = await Promise.all([
    new Response(generatedCheck.stdout).text(),
    new Response(generatedCheck.stderr).text(),
    generatedCheck.exited,
  ]);
  assert.equal(generatedStatus, 0, generatedOutput + generatedErrors);
  assert.equal(settings.output, "export");
  assert.equal(settings.distDir, ".next");
  assert.equal(settings.basePath, "/manual");
  assert.equal(settings.trailingSlash, true);
  assert.deepEqual(settings.transpilePackages, [
    "@lenso/docs",
    "@lenso/tokens",
    "shiki",
    "consumer-lib",
  ]);
  assert.equal(settings.experimental.globalNotFound, true);
  assert.deepEqual(settings.webpack({}, {}).resolve.alias, {
    prior: "/prior",
    "@": path.join(root, "src"),
  });
  const layout = emittedContent(emitted, "app/(locale-1)/layout.tsx");
  const tsOptions = JSON.parse(emittedContent(emitted, "tsconfig.json")).compilerOptions;
  assert.equal(tsOptions.allowImportingTsExtensions, true);
  assert.deepEqual(tsOptions.paths, {
    "@": ["../src"],
    "@/*": ["../src/*"],
  });
  assert.match(layout, /"language":"zh-CN"/);
  assert.doesNotMatch(layout, /stylex\.css|docs\.css/);
  assert.ok(emitted.has("app/(locale-1)/cn/read/page.tsx"));
  assert.ok(emitted.has("app/(locale-1)/cn/home/page.tsx"));
  assert.ok(emitted.has("app/(locale-0)/old/page.tsx"));
  assert.match(layout, /docs\.components\.tsx/);
  assert.match(layout, /import "\.\.\/\.\.\/\.\.\/src\/site\.css"/);
  for (const [file, content] of emitted) {
    if (!/\.(?:ts|tsx|js)$/.test(file)) continue;
    for (const match of content.matchAll(/\bimport(?:[^\n;]*?\bfrom\s*)?\s*["']([^"']+)["']/g))
      assert.equal(path.isAbsolute(match[1]!), false, `${file}: ${match[1]}`);
  }
  assert.match(layout, /Reflect\.get\(customization as object, "getRootOptions"\)/);
  assert.match(
    emittedContent(emitted, "render.tsx"),
    /Reflect\.get\(customization as object, "getDocument"\)/,
  );
  const model = await import(path.join(directory, "model.ts"));
  assert.equal(model.pages[0]!.compiled, undefined);
  assert.equal(model.pages[0]!.customField, "source-owned");
  assert.equal(model.bodies, undefined);
  assert.doesNotMatch(emittedContent(emitted, "model.ts"), /documents\/\d+\.js/);
  const route = emittedContent(emitted, "app/(locale-1)/cn/read/page.tsx");
  assert.match(route, /import Body from ".*documents\/1\.js"/);
  assert.doesNotMatch(route, /documents\/0\.js/);
  assert.equal(
    (await import(path.join(directory, "documents/1.js"))).default instanceof Function,
    true,
  );
});

// A shared customization import passes the legacy host tests while pulling every
// document adapter into every route. Prove the actual emitted import boundaries.
test("root and document customizations stay local to their generated entry points", async () => {
  const documents = ["routes/en-document.tsx", "routes/cn-document.tsx"];
  const root = await fixture({
    ...source,
    render: "custom",
    pages: pages.map((page, index) => ({ ...page, module: documents[index]! })),
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
    assert.equal(page.module, path.join(root, documents[index]!));
    assert.ok(host.watchPaths.includes(documents[index]!));
  }
  const directory = path.join(root, ".lenso");
  const emitted = new Map<string, string>();
  await generateHost(root, directory, input, host, {
    development: false,
    source: fileURLToPath(new URL("../src", import.meta.url)),
    write: async (file, content) => {
      emitted.set(path.relative(directory, file), content);
    },
  });
  for (const group of ["(locale-0)", "(locale-1)"]) {
    const layout = emittedContent(emitted, `app/${group}/layout.tsx`);
    assert.match(layout, /from "\.\.\/\.\.\/\.\.\/docs\.root\.tsx"/);
    assert.match(layout, /\/dist\/framework\/root\.js"/);
    assert.doesNotMatch(layout, /view\.js|docs\.components\.tsx|document\.tsx|render\.tsx/);
  }
  const entries = ["app/(locale-0)/en/learn/page.tsx", "app/(locale-1)/cn/read/page.tsx"];
  for (const [index, entry] of entries.entries()) {
    const module = emittedContent(emitted, entry);
    const specifier = module.match(/import \* as documentModule from "([^"]+)"/)![1]!;
    assert.equal(path.isAbsolute(specifier), false);
    assert.equal(
      path.resolve(directory, path.dirname(entry), specifier),
      path.join(root, documents[index]!),
    );
    assert.ok(!module.includes(documents[1 - index]!));
    assert.ok(module.includes(`renderPage(${JSON.stringify(pages[index]!.id)}, documentModule, "`));
    assert.doesNotMatch(module, /\bimport\(/);
  }
  for (const module of ["model.ts", "render.tsx"]) {
    for (const document of documents)
      assert.ok(!emittedContent(emitted, module).includes(document));
    assert.doesNotMatch(emittedContent(emitted, module), /\bimport\(/);
  }
  const modelFile = path.join(root, "model-proof.ts");
  await writeFile(modelFile, emittedContent(emitted, "model.ts"));
  const model = await import(modelFile);
  assert.ok(model.pages.every((page: { id: string }) => !("module" in page)));
});

test("custom source can use per-document renderers without global customization", async () => {
  const root = await fixture({
    render: "custom",
    pages: pages.map((page) => ({ ...page, module: "routes/home.tsx" })),
  });
  const { components: _components, ...input } = config;
  const host = await loadHost(root, input, "build");
  assert.equal(host.pages.length, 2);
  assert.ok(host.pages.every((page) => page.compiled === undefined));
  const missing = await fixture({ render: "custom", pages: [pages[0]!] });
  await assert.rejects(loadHost(missing, input, "build"), /page module or a components module/);
});

test("page namespaces override document hooks while async chrome hooks retain the public context", async () => {
  const root = await fixture({
    render: "custom",
    pages: [{ ...pages[0]!, module: "routes/document.mjs" }, pages[1]!],
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
  await mkdir(path.join(root, "dist/framework"), { recursive: true });
  await writeFile(
    path.join(root, "dist/framework/page-layout.js"),
    "export function DocumentationPageLayout() { return null; }",
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
  const { renderPage } = await import(path.join(directory, "render.tsx"));
  const documentModule = await import(host.pages[0]!.module!);
  const local = (await renderPage(pages[0]!.id, documentModule)).props;
  assert.equal(local.document.content, `local ${pages[0]!.id}`);
  assert.equal(local.customComponents.marker, `local ${pages[0]!.id}`);
  assert.deepEqual(local.siteSlots.marker, ["config", "page"]);
  assert.equal(local.siteOptions.marker, config.title + pages[0]!.id);
  assert.equal(local.pageOptions.marker, pages[0]!.markdown);
  assert.equal("module" in local.page, false);
  const localDefault = (await renderPage(pages[0]!.id, { default: { marker: "local default" } }))
    .props;
  assert.equal(localDefault.customComponents.marker, "local default");
  const fallback = (await renderPage(pages[0]!.id)).props;
  assert.equal(fallback.document.content, `global ${pages[0]!.id}`);
  assert.equal(fallback.customComponents.marker, `global ${pages[0]!.id}`);
  await assert.rejects(
    renderPage(pages[1]!.id),
    /requires getDocument to return a document result/,
  );
});

test("prepare watches a contained root module and rejects non-files and symlinked roots", async () => {
  const root = await fixture();
  await writeFile(path.join(root, "docs.root.tsx"), "export const getRootOptions = () => ({});");
  await writeFile(
    path.join(root, "docs.config.mjs"),
    `export default ${JSON.stringify({ ...config, root: "docs.root.tsx" })};`,
  );
  const result = await prepare(root, { development: true });
  assert.ok(result.watchPaths.includes("docs.root.tsx"));
  const layout = await readFile(path.join(result.directory, "app/(locale-0)/layout.tsx"), "utf8");
  assert.match(layout, /docs\.root\.tsx/);
  // Package builds replace dist/framework; dev must keep a stable source entry.
  assert.match(layout, /\/src\/root\.tsx"/);
  assert.doesNotMatch(layout, /dist\/framework/);
  assert.doesNotMatch(layout, /docs\.components\.tsx/);
  await mkdir(path.join(root, "root-directory.tsx"));
  await symlink(path.join(root, "docs.root.tsx"), path.join(root, "root-alias.tsx"));
  await symlink(path.join(root, "routes"), path.join(root, "linked"));
  for (const [module, expected] of [
    ["root-directory.tsx", /regular contained file/],
    ["root-alias.tsx", /symlinks/],
    ["linked/home.tsx", /symlinks/],
  ] as const) {
    await writeFile(
      path.join(root, "docs.config.mjs"),
      `export default ${JSON.stringify({ ...config, root: module })};`,
    );
    await assert.rejects(prepare(root), expected);
  }
});

test("virtual bilingual source is prepared, compiled, split and hosted as exact locale routes", async () => {
  const root = await fixture();
  const result = await prepare(root, { development: true });
  assert.equal(await readFile(path.join(root, "prepared.txt"), "utf8"), "dev");
  assert.deepEqual(result.pages[0]!.headings, [{ title: "Reading", id: "reading", depth: 2 }]);
  assert.doesNotMatch(result.pages[0]!.compiled!, /private: hidden/);
  const model = await import(path.join(result.directory, "model.ts"));
  assert.deepEqual(model.alternates["en/start"], {
    en: "/manual/en/learn",
    "zh-CN": "/manual/cn/read",
  });
  assert.equal(model.trees.cn.children[0].url, "/cn/read");
  for (const field of ["compiled", "body", "searchText", "structuredData"])
    assert.equal(field in model.pages[0]!, false);
  assert.match(
    await readFile(path.join(result.directory, "app/(locale-1)/cn/home/page.tsx"), "utf8"),
    /你好/,
  );
  assert.match(
    await readFile(path.join(result.directory, "app/(locale-0)/old/page.tsx"), "utf8"),
    /redirect\("\/manual\/en\/learn"\)/,
  );
  const sitemap = await readFile(path.join(result.directory, "public/sitemap.xml"), "utf8");
  assert.match(sitemap, /https:\/\/example.test\/manual\/cn\/home/);
  const server = await serve(path.join(result.directory, "public"), {
    port: 0,
    basePath: "/manual",
  });
  cleanup.push(
    () =>
      new Promise<void>((resolve, reject) =>
        server.close((error) => (error ? reject(error) : resolve())),
      ),
  );
  const origin = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
  const redirect = await fetch(`${origin}/manual/old/?q=read`, { redirect: "manual" });
  assert.equal(redirect.status, 302);
  assert.equal(redirect.headers.get("location"), "/manual/en/learn?q=read");
  const en = oramaStaticClient({ from: `${origin}/manual/_lenso/search/en.json` });
  const cn = oramaStaticClient({ from: `${origin}/manual/_lenso/search/cn.json` });
  assert.ok((await en.search("English-only")).some((item) => item.url.startsWith("/en/learn")));
  assert.equal((await cn.search("English-only")).length, 0);
  assert.equal(
    await readFile(path.join(result.directory, "public/_lenso/markdown/en/start.md"), "utf8"),
    pages[0]!.markdown,
  );
});

test("source hosting rejects global IDs, route collisions, unsafe modules and redirect cycles", async () => {
  for (const [input, expected] of [
    [
      { ...source, pages: [pages[0]!, { ...pages[1]!, id: pages[0]!.id }] },
      /duplicate global page ID/,
    ],
    [
      { ...source, routes: [{ ...source.routes[0]!, path: "/manual/en/learn/" }] },
      /route collision/,
    ],
    [
      { ...source, routes: [{ ...source.routes[0]!, module: "../outside.tsx" }] },
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
  ] as const) {
    const root = await fixture(input);
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
  const root = await fixture();
  await symlink(path.join(root, "routes/home.tsx"), path.join(root, "routes/alias.tsx"));
  await writeFile(
    path.join(root, "docs.source.mjs"),
    `export const loadSource = () => (${JSON.stringify({
      ...source,
      routes: [{ ...source.routes[0]!, module: "routes/alias.tsx" }],
    })});`,
  );
  await assert.rejects(loadHost(root, config, "build"), /symlinks/);
});

test("per-document modules reject unsafe paths, directories and file or ancestor symlinks", async () => {
  const root = await fixture();
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
  ] as const) {
    await writeFile(
      path.join(root, "docs.source.mjs"),
      `export const loadSource = () => (${JSON.stringify({
        render: "custom",
        pages: [{ ...pages[0]!, module }],
      })});`,
    );
    await assert.rejects(loadHost(root, config, "build"), expected);
  }
});
