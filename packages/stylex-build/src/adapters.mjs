/**
 * Adapted from @stylexjs/unplugin 0.19.0 core, rollup, vite and webpack hooks.
 * Copyright (c) Meta Platforms, Inc. and affiliates. MIT; see ../LICENSE.
 *
 * Collection is supplied by one build-local context. CSS compilation remains
 * the public StyleX processor; these hooks only place its result in the bundle.
 */
import { readdirSync, realpathSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { basename, dirname, isAbsolute, join, posix, sep } from "node:path";
import { buildSupport } from "./support.mjs";

function initialFiles(entrypoint) {
  const files = new Set(entrypoint.getFiles());
  for (const chunk of entrypoint.chunks)
    for (const initial of chunk.getAllInitialChunks())
      for (const file of initial.files) files.add(file);
  return files;
}

function builtinFallbackGraph(compilation, entrypoint, fallback, appDirectory) {
  const pending = [];
  const builtinPath = realpathSync(fallback.builtin);
  const appPath = realpathSync(appDirectory).replaceAll("\\", "/");
  for (const chunk of entrypoint.chunks)
    for (const initial of chunk.getAllInitialChunks())
      pending.push(...compilation.chunkGraph.getChunkModulesIterable(initial));
  const visited = new Set();
  let ownsBuiltin = false;
  while (pending.length) {
    const module = pending.pop();
    if (!module || visited.has(module)) continue;
    visited.add(module);
    const resource = module.resource?.split("?")[0].replaceAll("\\", "/") ?? "";
    const source = module.originalSource?.()?.source().toString() ?? "";
    if (
      resource.startsWith(`${appPath}/`) ||
      resource.includes("/@stylexjs/stylex/") ||
      /(?:\$\$css|["']\$\$css["'])\s*:/.test(source)
    )
      return false;
    if (
      resource &&
      basename(resource) === basename(fallback.builtin) &&
      realpathSync(resource) === builtinPath
    )
      ownsBuiltin = true;
    // The pinned static 500 renderer is server-only: its client graph is exactly
    // one empty, framework-owned flight bridge rather than an imported component.
    if (
      fallback.emptyLoader &&
      !resource &&
      !source.trim() &&
      module.type === "javascript/auto" &&
      module.buildInfo?.rsc?.type === "client" &&
      module.loaders?.length === 1 &&
      module.loaders[0].options === "server=false" &&
      realpathSync(module.loaders[0].loader) === fallback.emptyLoader
    )
      ownsBuiltin = true;
    if (module.modules) pending.push(...module.modules);
  }
  return ownsBuiltin && (!fallback.emptyLoader || visited.size === 1);
}

function hasNextSource(stem, compilation) {
  try {
    const files = readdirSync(dirname(stem), { withFileTypes: true }).filter(
      (file) =>
        (file.isFile() || file.isSymbolicLink()) && file.name.startsWith(`${basename(stem)}.`),
    );
    for (const file of files) compilation.fileDependencies.add(join(dirname(stem), file.name));
    return files.length > 0;
  } catch (error) {
    if (error.code === "ENOENT" || error.code === "ENOTDIR") return false;
    throw error;
  }
}

// Legacy automatic asset rewriting, retained for development, needs pinned
// Next route/fallback ownership. Explicit production imports never enter this layer.
function validateLegacyNextDelivery(compilation, assets, hasUnion, compiler) {
  const native = compiler.options.plugins?.find(
    (plugin) => plugin?.constructor?.name === "ClientReferenceManifestPlugin",
  );
  if (!native) return false;
  const nextRequire = createRequire(join(compiler.context, "package.json"));
  const version = nextRequire("next/package.json").version;
  if (version !== buildSupport.next.version)
    throw new Error(
      `[lenso/stylex-build] Next route CSS delivery supports ${buildSupport.next.version}, not ${version}.`,
    );
  if (typeof native.appDirBase !== "string" || !isAbsolute(native.appDirBase))
    throw new Error("[lenso/stylex-build] Unsupported Next App Router source ownership.");
  const appDirectory = join(native.appDirBase, "app");
  const constants = nextRequire("next/dist/shared/lib/constants");
  const fallbacks = new Map();
  for (const [route, source, builtin] of [
    [constants.UNDERSCORE_NOT_FOUND_ROUTE_ENTRY, "global-not-found", "global-not-found"],
    [constants.UNDERSCORE_GLOBAL_ERROR_ROUTE_ENTRY, "global-error", "app-error"],
  ]) {
    if (typeof route !== "string" || !route.startsWith("/"))
      throw new Error("[lenso/stylex-build] Unsupported Next fallback source ownership.");
    fallbacks.set(`app${route}`, {
      source: join(appDirectory, source),
      builtin: nextRequire.resolve(`next/dist/client/components/builtin/${builtin}`),
      emptyLoader:
        source === "global-error"
          ? realpathSync(
              nextRequire.resolve(
                "next/dist/build/webpack/loaders/next-flight-client-entry-loader",
              ),
            )
          : null,
    });
  }
  if (hasNextSource(join(appDirectory, "global-error"), compilation))
    throw new Error(
      "[lenso/stylex-build] Custom Next global-error delivery is unsupported by the pinned App Router CSS proof.",
    );
  const manifests = new Map();
  for (const [fileName, asset] of Object.entries(assets)) {
    if (!fileName.endsWith("_client-reference-manifest.js")) continue;
    const assignment =
      /^globalThis\.__RSC_MANIFEST=\(globalThis\.__RSC_MANIFEST\|\|\{\}\);globalThis\.__RSC_MANIFEST\[("(?:\\.|[^"\\])*")\]=(\{[\s\S]*\});\s*$/.exec(
        asset.source().toString(),
      );
    if (!assignment)
      throw new Error(`[lenso/stylex-build] Unsupported Next route manifest ${fileName}.`);
    const route = JSON.parse(assignment[1]);
    const manifest = JSON.parse(assignment[2]);
    if (
      !manifest ||
      typeof manifest !== "object" ||
      Array.isArray(manifest) ||
      !manifest.entryCSSFiles ||
      typeof manifest.entryCSSFiles !== "object" ||
      Array.isArray(manifest.entryCSSFiles) ||
      !manifest.clientModules ||
      typeof manifest.clientModules !== "object" ||
      Array.isArray(manifest.clientModules)
    )
      throw new Error(`[lenso/stylex-build] Invalid Next route manifest ${fileName}.`);
    for (const [owner, files] of Object.entries(manifest.entryCSSFiles)) {
      if (
        !isAbsolute(owner) ||
        !Array.isArray(files) ||
        files.some(
          (file) =>
            !file ||
            typeof file.path !== "string" ||
            typeof file.inlined !== "boolean" ||
            (file.inlined && typeof file.content !== "string"),
        )
      )
        throw new Error(`[lenso/stylex-build] Invalid Next route CSS graph ${fileName}.`);
    }
    if (manifests.has(route))
      throw new Error(`[lenso/stylex-build] Duplicate Next route manifest for ${route}.`);
    manifests.set(route, manifest.entryCSSFiles);
  }
  for (const [entryName, entrypoint] of compilation.entrypoints) {
    if (!entryName.startsWith("app/") || !/\/page(?:\.[^/]+)?$/.test(entryName)) continue;
    const route = entryName
      .replace(/\/page(?:\.[^/]+)?$/, "/page")
      .replaceAll("%5F", "_")
      .slice(3);
    const manifest = manifests.get(route);
    if (!manifest)
      throw new Error(`[lenso/stylex-build] Missing Next route CSS manifest for ${entryName}.`);
    const page = join(native.appDirBase, entryName);
    const pageDirectory = dirname(page);
    // Next merges sibling route-group inventories too. Only this physical page and
    // its ancestor layouts/templates are guaranteed to render before its styled content.
    const owners = Object.entries(manifest).filter(([owner]) => {
      const directory = dirname(owner);
      return (
        owner === page ||
        (/^(?:layout|template)(?:\.[^/]+)?$/.test(basename(owner)) &&
          (directory === pageDirectory || pageDirectory.startsWith(`${directory}${sep}`)))
      );
    });
    if (
      owners
        .flatMap(([, files]) => files)
        .some(
          (file) =>
            hasUnion(file.path) &&
            (!file.inlined ||
              file.content === compilation.getAsset(file.path).source.source().toString()),
        )
    )
      continue;
    const sourceOwners = owners.map(([owner]) => owner);
    // Native Next maps app/global-not-found.* to this synthetic page entry. Its
    // server source is absent from the client graph and must not be mistaken for a built-in.
    const fallback = fallbacks.get(entryName);
    if (fallback) sourceOwners.push(fallback.source);
    if (
      fallback &&
      !sourceOwners.some((owner) => hasNextSource(owner, compilation)) &&
      builtinFallbackGraph(compilation, entrypoint, fallback, appDirectory)
    )
      continue;
    throw new Error(
      `[lenso/stylex-build] Next route ${entryName} cannot reach the complete StyleX union through its layout/page CSS manifest.`,
    );
  }
  return true;
}

function cssAssets(bundle, choose) {
  return Object.values(bundle).filter(
    (asset) =>
      asset.type === "asset" &&
      asset.fileName.endsWith(".css") &&
      (!choose || choose(asset.fileName)),
  );
}

function cssUrl(fileName, htmlName, base) {
  if (base === "" || base === "./") {
    const relative = posix.relative(posix.dirname(htmlName), fileName);
    return relative.startsWith(".") ? relative : `./${relative}`;
  }
  return `${base.endsWith("/") ? base : `${base}/`}${fileName}`;
}

function escapeAttribute(value) {
  return value.replaceAll("&", "&amp;").replaceAll('"', "&quot;").replaceAll("<", "&lt;");
}

function htmlLinksCss(html, asset, base) {
  const href = cssUrl(asset.fileName, html.fileName, base);
  return [...html.source.toString().matchAll(/<link\b[^>]*>/gi)].some(([tag]) => {
    const attributes = new Map(
      [...tag.matchAll(/([\w-]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/g)].map(
        ([, key, double, single, bare]) => [key.toLowerCase(), double ?? single ?? bare],
      ),
    );
    return (
      attributes.get("rel")?.toLowerCase().split(/\s+/).includes("stylesheet") &&
      attributes.get("href") === escapeAttribute(href)
    );
  });
}

function replaceCss(ctx, bundle, asset, source) {
  const name = asset.name ?? asset.fileName.replace(/-[a-z0-9]{8,}\.css$/i, ".css");
  const reference = ctx.emitFile({ type: "asset", name, source });
  const next = ctx.getFileName(reference);
  const previous = asset.fileName;
  if (next === previous) {
    asset.source = source;
    return;
  }
  for (const item of Object.values(bundle)) {
    if (item.type === "chunk") {
      item.code = item.code.split(previous).join(next);
      const css = item.viteMetadata?.importedCss;
      if (css instanceof Set && css.delete(previous)) css.add(next);
    } else if (typeof item.source === "string") {
      item.source = item.source.split(previous).join(next);
    }
  }
  delete bundle[previous];
}

const cssPath = "/virtual:stylex.css";
const runtimeId = "virtual:stylex:runtime";
const runtime = `
const id = "__stylex_virtual__";
async function update() {
  const response = await fetch(${JSON.stringify(cssPath)} + "?t=" + Date.now(), {cache: "no-store"});
  let element = document.getElementById(id);
  if (!element) {
    element = document.createElement("style");
    element.id = id;
    document.head.appendChild(element);
  }
  element.textContent = await response.text();
}
update();
if (import.meta.hot) {
  import.meta.hot.on("stylex:css-update", update);
  import.meta.hot.on("vite:afterUpdate", () => setTimeout(update, 180));
  import.meta.hot.dispose(() => document.getElementById(id)?.remove());
}
`;

export function adapters(plugin, context, framework) {
  let injected = false;
  let base = "/";
  const result = {
    ...plugin,
    async generateBundle(_options, bundle) {
      await context.prepareSources();
      const metadata = context.metadata();
      if (metadata)
        this.emitFile({ type: "asset", fileName: context.emitMetadata, source: metadata });
      const css = context.collectCss();
      if (!css) return;
      const html = Object.values(bundle).filter(
        (asset) => asset.type === "asset" && asset.fileName.endsWith(".html"),
      );
      const assets = cssAssets(bundle, context.cssInjectionTarget);
      if (framework === "vite" && html.length && !context.cssInjectionTarget) {
        const reference = this.emitFile({ type: "asset", name: "stylex.css", source: css });
        const fileName = this.getFileName(reference);
        for (const page of html) {
          const link = `<link rel="stylesheet" href="${escapeAttribute(cssUrl(fileName, page.fileName, base))}">`;
          const source = page.source.toString();
          page.source = /<\/head\s*>/i.test(source)
            ? source.replace(/<\/head\s*>/i, `${link}\n</head>`)
            : /^(\uFEFF?\s*<!doctype[^>]*>)/i.test(source)
              ? source.replace(/^(\uFEFF?\s*<!doctype[^>]*>)/i, `$1\n${link}`)
              : `${link}\n${source}`;
        }
        injected = true;
      } else if (assets.length) {
        if (context.cssInjectionTarget && html.length) {
          for (const page of html) {
            if (!assets.some((asset) => htmlLinksCss(page, asset, base)))
              throw new Error(
                `[lenso/stylex-build] cssInjectionTarget is not linked by ${page.fileName}.`,
              );
          }
        }
        for (const asset of assets)
          replaceCss(this, bundle, asset, `${asset.source.toString()}\n${css}`);
        injected = true;
      } else if (context.cssInjectionTarget) {
        throw new Error("[lenso/stylex-build] cssInjectionTarget matched no CSS assets.");
      } else {
        this.emitFile({ type: "asset", fileName: "assets/stylex.css", source: css });
        injected = true;
      }
    },
    async writeBundle(options) {
      if (injected) return;
      const outDir = options.dir ?? (options.file && dirname(options.file));
      if (!outDir) return;
      const css = context.collectCss();
      if (!css) return;
      await mkdir(join(outDir, "assets"), { recursive: true });
      await writeFile(join(outDir, "assets/stylex.css"), css);
    },
  };
  const buildStart = result.buildStart;
  result.buildStart = async function () {
    injected = false;
    return buildStart.call(this);
  };
  if (framework === "vite") {
    // Vite's HTML emitter runs after pre-enforced transforms. Delivery needs its final asset graph.
    result.generateBundle = { order: "post", handler: result.generateBundle };
    result.configResolved = (config) => {
      base = config.base;
    };
    result.config = (config) => ({
      optimizeDeps: {
        ...config.optimizeDeps,
        exclude: [
          ...new Set([...(config.optimizeDeps?.exclude ?? []), "@lenso/ui", "@lenso/tokens"]),
        ],
      },
    });
    result.resolveId = (id) => (id === runtimeId ? id : null);
    result.load = (id) => (id === runtimeId ? runtime : null);
    let server;
    let interval;
    result.configureServer = (viteServer) => {
      server = viteServer;
      server.middlewares.use((request, response, next) => {
        if (!request.url?.startsWith(cssPath)) return next();
        try {
          response.setHeader("Content-Type", "text/css");
          response.setHeader("Cache-Control", "no-store");
          response.end(context.collectCss());
        } catch (error) {
          next(error);
        }
      });
      let version = context.version();
      interval = setInterval(() => {
        if (version === context.version()) return;
        version = context.version();
        server.ws.send({ type: "custom", event: "stylex:css-update" });
      }, 150);
      interval.unref();
      server.httpServer?.once("close", () => clearInterval(interval));
    };
    result.closeBundle = () => clearInterval(interval);
    result.transformIndexHtml = () =>
      server && context.devMode !== "off"
        ? [
            {
              tag: "script",
              attrs: { type: "module", src: `${server.config.base}@id/${runtimeId}` },
              injectTo: "head",
            },
          ]
        : undefined;
    result.handleHotUpdate = () => {
      server?.ws.send({ type: "custom", event: "stylex:css-update" });
    };
  }
  if (framework === "webpack") {
    // Unplugin maps writeBundle to Webpack afterEmit without Rollup output options.
    delete result.generateBundle;
    delete result.writeBundle;
    if (context.explicitCss) {
      result.webpack = (compiler) => {
        if (compiler.options.mode !== "production" || compiler.options.watch)
          throw new Error("[lenso/stylex-build] prepareNext supports production builds only.");
        // Cached transforms can bypass the prepared-rule coverage check when
        // a later configuration omits a previously compiled source.
        if (compiler.options.cache !== false)
          throw new Error(
            "[lenso/stylex-build] prepareNext requires config.cache = false; cached transforms can bypass prepared-rule validation.",
          );
        compiler.hooks.watchRun.tap("@lenso/stylex-build:explicit-css", () => {
          throw new Error("[lenso/stylex-build] prepareNext supports production builds only.");
        });
        const nextRequire = createRequire(join(compiler.context, "package.json"));
        const version = nextRequire("next/package.json").version;
        if (version !== buildSupport.next.version)
          throw new Error(
            `[lenso/stylex-build] Explicit Next CSS delivery supports ${buildSupport.next.version}, not ${version}.`,
          );
        compiler.hooks.beforeCompile.tapPromise("@lenso/stylex-build:explicit-css", async () => {
          const css = await readFile(context.explicitCss, "utf8");
          if (css !== context.preparedCss)
            throw new Error(
              `[lenso/stylex-build] Prepared CSS changed at ${context.explicitCss}; regenerate it and use the matching prepareNext plugin before building.`,
            );
        });
        compiler.hooks.thisCompilation.tap("@lenso/stylex-build:explicit-css", (compilation) => {
          for (const seed of context.seeds()) compilation.fileDependencies.add(seed.file);
          for (const source of context.sourceFiles) compilation.fileDependencies.add(source);
          compilation.fileDependencies.add(context.explicitCss);
        });
      };
      return result;
    }
    result.webpack = (compiler) => {
      compiler.hooks.thisCompilation.tap("@lenso/stylex-build", (compilation) => {
        context.reset();
        for (const seed of context.seeds()) compilation.fileDependencies.add(seed.file);
        for (const source of context.sourceFiles) compilation.fileDependencies.add(source);
        const wp = compiler.webpack;
        let needsDelivery = false;
        compilation.hooks.processAssets.tapPromise(
          {
            name: "@lenso/stylex-build",
            stage: wp.Compilation.PROCESS_ASSETS_STAGE_SUMMARIZE,
          },
          async (assets) => {
            if (compilation.errors.length) return;
            await context.prepareSources();
            const css = context.collectCss();
            if (!css) return;
            needsDelivery = true;
            const names = new Set();
            for (const entrypoint of compilation.entrypoints.values()) {
              const reachable = [...initialFiles(entrypoint)].filter(
                (name) =>
                  name.endsWith(".css") &&
                  assets[name] &&
                  (!context.cssInjectionTarget || context.cssInjectionTarget(name)),
              );
              for (const name of reachable) names.add(name);
            }
            for (const name of names) {
              const asset = compilation.getAsset(name);
              compilation.updateAsset(
                name,
                new wp.sources.RawSource(`${asset.source.source().toString()}\n${css}`),
                (info) => ({ ...info, lensoStylexUnion: true }),
              );
            }
          },
        );
        compilation.hooks.processAssets.tap(
          {
            name: "@lenso/stylex-build:delivery",
            stage: wp.Compilation.PROCESS_ASSETS_STAGE_REPORT,
          },
          (assets) => {
            if (!needsDelivery || compilation.errors.length) return;
            if (["server", "edge-server"].includes(compiler.options.name)) return;
            const hasUnion = (name) => compilation.getAsset(name)?.info.lensoStylexUnion === true;
            // Next emits merged route/layout manifests after native CSS content hashes finalize.
            if (validateLegacyNextDelivery(compilation, assets, hasUnion, compiler)) return;
            for (const [entryName, entrypoint] of compilation.entrypoints) {
              if (![...initialFiles(entrypoint)].some(hasUnion))
                throw new Error(
                  `[lenso/stylex-build] Webpack entry ${entryName} needs an initial CSS asset${context.cssInjectionTarget ? " matching cssInjectionTarget" : "; import the theme stylesheet"}.`,
                );
            }
          },
        );
      });
    };
  }
  return result;
}
