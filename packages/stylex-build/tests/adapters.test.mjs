import assert from "node:assert/strict";
import test from "node:test";
import { adapters } from "../src/adapters.mjs";

const union = ".compiled{color:red}";
const context = (cssInjectionTarget) => ({
  prepareSources: async () => {},
  collectCss: () => union,
  metadata: () => null,
  cssInjectionTarget,
});
const asset = (fileName, source = "") => ({ type: "asset", fileName, source });
const emitter = (bundle) => ({
  emitFile(value) {
    const fileName = value.fileName ?? `assets/${value.name.replace(".css", "-unionhash.css")}`;
    bundle[fileName] = asset(fileName, value.source);
    return fileName;
  },
  getFileName: (reference) => reference,
});

test("Vite HTML delivery links one union per document, including CSS-less entries and relative bases", async () => {
  for (const [base, first, nested] of [
    ["/app/", "/app/assets/stylex-unionhash.css", "/app/assets/stylex-unionhash.css"],
    ["./", "./assets/stylex-unionhash.css", "../assets/stylex-unionhash.css"],
    [
      "https://cdn.example/app/",
      "https://cdn.example/app/assets/stylex-unionhash.css",
      "https://cdn.example/app/assets/stylex-unionhash.css",
    ],
  ]) {
    const plugin = adapters({}, context(), "vite");
    plugin.configResolved({ base });
    const bundle = {
      "a.html": asset("a.html", "<head></head><body></body>"),
      "pages/b.html": asset("pages/b.html", "<!doctype html><body></body>"),
      "assets/a.css": asset("assets/a.css", ".a{color:blue}"),
    };
    await plugin.generateBundle.handler.call(emitter(bundle), {}, bundle);
    assert.equal(bundle["assets/stylex-unionhash.css"].source, union);
    assert(bundle["a.html"].source.includes(`href="${first}"`));
    assert(bundle["pages/b.html"].source.includes(`href="${nested}"`));
    assert(bundle["pages/b.html"].source.startsWith("<!doctype html>"));
    assert.equal(bundle["assets/a.css"].source, ".a{color:blue}");
  }
});

test("explicit Vite target fails closed instead of falling back to an unreachable CSS asset", async () => {
  const bundle = {
    "a.html": asset("a.html", '<head><link rel="stylesheet" href="/assets/a.css"></head>'),
    "b.html": asset("b.html", '<head><link rel="stylesheet" href="/assets/b.css"></head>'),
    "assets/a.css": asset("assets/a.css"),
    "assets/b.css": asset("assets/b.css"),
  };
  const plugin = adapters(
    {},
    context((name) => name.endsWith("/a.css")),
    "vite",
  );
  await assert.rejects(
    plugin.generateBundle.handler.call(emitter(bundle), {}, bundle),
    /cssInjectionTarget is not linked by b\.html/,
  );
  assert.equal(bundle["assets/a.css"].source, "");
  const missing = adapters(
    {},
    context(() => false),
    "vite",
  );
  await assert.rejects(
    missing.generateBundle.handler.call(emitter(bundle), {}, bundle),
    /cssInjectionTarget matched no CSS assets/,
  );
});

test("Webpack delivery follows each initial chunk graph, never an orphan or lazy CSS asset", async () => {
  const sources = new Map([
    ["orphan.css", ""],
    ["shared.css", "theme"],
    ["lazy.css", "lazy"],
  ]);
  const initial = { files: new Set(["shared.css"]) };
  const entry = {
    getFiles: () => ["a.js"],
    chunks: [{ getAllInitialChunks: () => new Set([initial]) }],
  };
  const handlers = [];
  const infos = new Map();
  const processAssets = async (assets) => {
    for (const handler of handlers) await handler(assets);
  };
  const compilation = {
    errors: [],
    entrypoints: new Map([
      ["a", entry],
      ["b", entry],
    ]),
    fileDependencies: new Set(),
    hooks: {
      processAssets: {
        tapPromise: (_options, handler) => handlers.push(handler),
        tap: (_options, handler) => handlers.push(handler),
      },
    },
    getAsset: (name) => ({
      source: { source: () => sources.get(name) },
      info: infos.get(name) ?? {},
    }),
    updateAsset: (name, source, info) => {
      sources.set(name, source.value);
      infos.set(name, info(infos.get(name) ?? {}));
    },
  };
  const compiler = {
    options: { name: "client" },
    webpack: {
      Compilation: { PROCESS_ASSETS_STAGE_SUMMARIZE: 1000 },
      sources: {
        RawSource: class {
          constructor(value) {
            this.value = value;
          }
        },
      },
    },
    hooks: { thisCompilation: { tap: (_name, handler) => handler(compilation) } },
  };
  const ctx = { ...context(), reset() {}, seeds: () => [], sourceFiles: [] };
  adapters({}, ctx, "webpack").webpack(compiler);
  await processAssets(Object.fromEntries(sources));
  assert.equal(sources.get("shared.css"), `theme\n${union}`);
  assert.equal(sources.get("orphan.css"), "");
  assert.equal(sources.get("lazy.css"), "lazy");
  compilation.entrypoints.set("unreachable", { getFiles: () => ["lazy.js"], chunks: [] });
  await assert.rejects(
    processAssets(Object.fromEntries(sources)),
    /entry unreachable needs an initial CSS asset/,
  );
  infos.clear();
  ctx.cssInjectionTarget = (name) => name === "orphan.css";
  await assert.rejects(processAssets(Object.fromEntries(sources)), /matching cssInjectionTarget/);
});

test("declaration preloader leaves Next SWC in charge and watches inlined StyleX constants", async () => {
  const { createRequire } = await import("node:module");
  const { mkdtemp, writeFile, rm } = await import("node:fs/promises");
  const { resolve, join } = await import("node:path");
  const require = createRequire(import.meta.url);
  const loader = require("@lenso/stylex-build/webpack-loader");
  const nextRequire = createRequire(new URL("../../../apps/docs/package.json", import.meta.url));
  const { transform, loadBindings } = nextRequire("next/dist/build/swc");
  await loadBindings();
  const { getLoaderSWCOptions } = nextRequire("next/dist/build/swc/options");
  const { compileStylexSource } = await import("../src/compile-source.mjs");
  const root = await mkdtemp("/tmp/lenso-stylex-loader-");
  const filename = join(root, "client.tsx");
  const dependencies = [];
  const load = (source) =>
    new Promise((resolveResult, reject) => {
      const callback = (error, code, map) => (error ? reject(error) : resolveResult({ code, map }));
      loader.call(
        {
          cacheable() {},
          resourcePath: filename,
          context: root,
          sourceMap: true,
          getOptions: () => ({ unstable_moduleResolution: { type: "commonJS" } }),
          callback,
          async: () => callback,
          getResolve: (options) => {
            assert.equal(options.dependencyType, "esm");
            assert.deepEqual(options.conditionNames, ["source", "import", "default"]);
            return async (context, specifier) => resolve(context, specifier);
          },
          addDependency: (file) => dependencies.push(file),
        },
        source,
      );
    });
  try {
    const constants = join(root, "values.stylex.js");
    const constantSource = (width) =>
      `import * as stylex from '@stylexjs/stylex';export const values=stylex.defineConsts({width:'${width}px'});`;
    await writeFile(constants, constantSource(211));
    const source = `"use client";import {create as c,props as p} from '@stylexjs/stylex';import {values} from './values.stylex.js';type Props={label:string};const styles=c({root:{width:values.width}});export function Widget({label}:Props){return <button {...p(styles.root)}>{label}</button>;}`;
    const transformed = await load(source);
    assert.match(transformed.code, /["']use client["']/);
    assert.match(transformed.code, /type Props/);
    assert.match(transformed.code, /<button/);
    assert.doesNotMatch(transformed.code, /styles\s*=\s*c\(/);
    assert.ok(transformed.map);
    assert.ok(dependencies.includes(constants));
    const options = (isServer, bundleLayer) => ({
      ...getLoaderSWCOptions({
        filename,
        isServer,
        development: true,
        hasReactRefresh: !isServer,
        configDir: root,
        serverComponents: true,
        isCacheComponents: false,
        useCacheEnabled: false,
        taintEnabled: false,
        relativeFilePathFromRoot: "client.tsx",
        serverReferenceHashSalt: "test",
        bundleLayer,
        esm: true,
      }),
      filename,
    });
    const client = await transform(transformed.code, options(false, "app-pages-browser"));
    assert.doesNotMatch(client.code, /type Props|<button/);
    assert.match(client.code, /Widget/);
    const server = await transform(transformed.code, options(true, "rsc"));
    assert.match(server.code, /__next_internal_client_entry_do_not_use__/);
    const serverComponent = await load(source.replace('"use client";', ""));
    const renderedServer = await transform(serverComponent.code, options(true, "rsc"));
    assert.doesNotMatch(renderedServer.code, /__next_internal_client_entry_do_not_use__/);
    assert.match(renderedServer.code, /Widget/);
    const compiler = require("@stylexjs/babel-plugin");
    const before = await compileStylexSource(source, filename);
    const beforeConstants = await compileStylexSource(constantSource(211), constants);
    await writeFile(constants, constantSource(223));
    const after = await compileStylexSource(source, filename);
    const afterConstants = await compileStylexSource(constantSource(223), constants);
    const beforeCss = compiler.processStylexRules([...before.rules, ...beforeConstants.rules]);
    const afterCss = compiler.processStylexRules([...after.rules, ...afterConstants.rules]);
    assert.match(beforeCss, /211px/);
    assert.match(afterCss, /223px/);
    assert.doesNotMatch(afterCss, /211px/);
    const propsOnly = `import * as sx from '@stylexjs/stylex';export const x=sx.props({$$css:true,width:'x123'});`;
    assert.equal((await load(propsOnly)).code, propsOnly);
    const aliased = `import * as sx from '@stylexjs/stylex';export const x=sx.create({root:{width:7}});`;
    assert.doesNotMatch((await load(aliased)).code, /sx\.create\(/);
  } finally {
    await rm(root, { recursive: true });
  }
});

test("watch output preserves identical final bytes while changed/new and production outputs remain", async () => {
  const { mkdtemp, writeFile, readFile, stat, rm } = await import("node:fs/promises");
  const { join } = await import("node:path");
  const { default: preserveWatchOutput } = await import("../src/watch-output.mjs");
  const root = await mkdtemp("/tmp/lenso-watch-output-");
  try {
    await writeFile(join(root, "entry.js"), "export const x=1;\n");
    await writeFile(join(root, "rules.json"), "same");
    const before = (await stat(join(root, "entry.js"))).mtimeMs;
    const bundle = {
      "entry.js": { type: "chunk", fileName: "entry.js", code: "export const x=1;\n" },
      "rules.json": {
        type: "asset",
        fileName: "rules.json",
        source: new Uint8Array(Buffer.from("same")),
      },
      "changed.css": { type: "asset", fileName: "changed.css", source: ".x{width:2px}" },
      "new.js": { type: "chunk", fileName: "new.js", code: "export const newValue=1;" },
    };
    await writeFile(join(root, "changed.css"), ".x{width:1px}");
    const original = structuredClone(bundle);
    const hook = preserveWatchOutput().generateBundle.handler;
    await hook.call({ meta: { watchMode: true } }, { dir: root }, bundle, true);
    assert.deepEqual(Object.keys(bundle), ["changed.css", "new.js"]);
    assert.equal((await stat(join(root, "entry.js"))).mtimeMs, before);
    assert.equal(await readFile(join(root, "entry.js"), "utf8"), "export const x=1;\n");
    const production = structuredClone(original);
    await hook.call({ meta: { watchMode: false } }, { dir: root }, production, true);
    assert.deepEqual(production, original);
    const generated = structuredClone(original);
    await hook.call({ meta: { watchMode: true } }, { dir: root }, generated, false);
    assert.deepEqual(generated, original);
  } finally {
    await rm(root, { recursive: true });
  }
});
