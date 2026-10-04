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
