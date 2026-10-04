import compiler from "@stylexjs/babel-plugin";
import upstream from "@stylexjs/unplugin";
import browserslist from "browserslist";
import { AsyncLocalStorage } from "node:async_hooks";
import { readFile } from "node:fs/promises";
import { isAbsolute } from "node:path";
import { fileURLToPath } from "node:url";
import { browserslistToTargets, transform as lightningTransform } from "lightningcss";
import { createRolldownPlugin, createVitePlugin, createWebpackPlugin } from "unplugin";
import { adapters } from "./adapters.mjs";
import { compileMode, createMetadata, readMetadata, validateRules } from "./metadata.mjs";

export { buildSupport } from "./support.mjs";

function factory(options = {}, meta) {
  const {
    metadata,
    sources = [],
    emitMetadata,
    sourceOnly = false,
    devMode = "full",
    lightningcssOptions = { exclude: 4 },
    cssInjectionTarget,
    unstable_moduleResolution,
    ...unsupported
  } = options;
  if (Object.keys(unsupported).length)
    throw new Error(
      `[lenso/stylex-build] Unsupported options: ${Object.keys(unsupported).join(", ")}. Compiler mode is fixed by raw-rule contract v1; do not enable legacy flags or change compiled property keys.`,
    );
  if (metadata !== undefined && !Array.isArray(metadata))
    throw new Error(
      "[lenso/stylex-build] metadata must be an array of absolute paths or file URLs.",
    );
  if (!metadata?.length && !emitMetadata && !sourceOnly)
    throw new Error(
      "[lenso/stylex-build] Supply metadata: [new URL(import.meta.resolve('@lenso/tokens/stylex-rules.json'))]. Use sourceOnly only when compiling every style declaration from source.",
    );
  if (emitMetadata && (!/^[\w.-]+\.json$/.test(emitMetadata) || metadata?.length || sourceOnly))
    throw new Error(
      "[lenso/stylex-build] emitMetadata needs a basename.json and no metadata/sourceOnly.",
    );
  if (!["full", "off", "css-only"].includes(devMode))
    throw new Error("[lenso/stylex-build] devMode must be full, css-only or off.");
  if (!Array.isArray(sources))
    throw new Error(
      "[lenso/stylex-build] sources must be an array of absolute paths or file URLs.",
    );
  const sourceFiles = [
    ...new Set(
      sources.map((source) => {
        const file =
          source instanceof URL && source.protocol === "file:" ? fileURLToPath(source) : source;
        if (typeof file !== "string" || !isAbsolute(file) || !/\.[cm]?[jt]sx?$/.test(file))
          throw new Error(
            "[lenso/stylex-build] sources must contain absolute JavaScript/TypeScript files or file URLs.",
          );
        return file;
      }),
    ),
  ];

  const rulesByModule = new Map();
  // Babel strips query variants from filenames; retain bundler identity across concurrent transforms.
  const moduleIdentity = new AsyncLocalStorage();
  let seeds = [];
  let version = 0;
  const reloadSeeds = () => {
    seeds = (metadata ?? []).map(readMetadata);
  };
  reloadSeeds();
  const rawRules = () => [
    ...seeds.flatMap((seed) => seed.rules),
    ...[...rulesByModule.values()].flat(),
  ];
  const collectCss = () => {
    const rules = rawRules();
    if (!rules.length) return "";
    return lightningTransform({
      targets: browserslistToTargets(browserslist()),
      ...lightningcssOptions,
      filename: "stylex.css",
      code: Buffer.from(compiler.processStylexRules(structuredClone(rules), { useLayers: false })),
    }).code.toString();
  };
  // Babel's public post hook sees complete raw metadata after StyleX visitors finish.
  const collector = () => ({
    name: "lenso-raw-rule-collector",
    post(file) {
      const rules = file.metadata.stylex ?? [];
      validateRules(rules, file.opts.filename);
      rulesByModule.set(moduleIdentity.getStore(), rules);
      version++;
      // Transfer collection to this build; upstream must not retain a second process-global rule store.
      file.metadata.stylex = [];
    },
  });
  const base = upstream.raw(
    {
      ...compileMode,
      devMode,
      useCSSLayers: false,
      unstable_moduleResolution,
      babelConfig: { plugins: [collector] },
    },
    meta,
  );
  const reset = () => {
    rulesByModule.clear();
    reloadSeeds();
    version++;
  };
  const prepareSources = async () => {
    for (const file of sourceFiles) {
      let code;
      try {
        code = await readFile(file, "utf8");
      } catch (cause) {
        throw new Error(`[lenso/stylex-build] Cannot read additional source ${file}.`, { cause });
      }
      if (rulesByModule.delete(file)) version++;
      try {
        await moduleIdentity.run(file, () => base.transform.call({}, code, file));
      } catch (cause) {
        throw new Error(
          `[lenso/stylex-build] Cannot compile raw declarations in ${file} with contract v1: ${cause.message}`,
          { cause },
        );
      }
    }
  };
  const context = {
    collectCss,
    reset,
    seeds: () => seeds,
    version: () => version,
    metadata: () => (emitMetadata ? JSON.stringify(createMetadata(rawRules())) : null),
    emitMetadata,
    devMode,
    cssInjectionTarget,
    prepareSources,
    sourceFiles,
  };
  return adapters(
    {
      ...base,
      name: "@lenso/stylex-build",
      async buildStart() {
        base.buildStart.call(this);
        reset();
        for (const seed of seeds) this.addWatchFile?.(seed.file);
        for (const source of sourceFiles) this.addWatchFile?.(source);
        await prepareSources();
      },
      async transform(code, id) {
        if (rulesByModule.delete(id)) version++;
        return moduleIdentity.run(id, () => base.transform.call(this, code, id));
      },
      shouldTransformCachedModule() {
        // Raw metadata is build-local; a cached transform cannot reconstruct its rule collection.
        return true;
      },
      async watchChange(id, change) {
        if (change.event === "delete") {
          for (const module of rulesByModule.keys()) {
            if (module === id || module.split("?")[0] === id) rulesByModule.delete(module);
          }
          version++;
        }
        if (seeds.some((seed) => seed.file === id)) {
          reloadSeeds();
          version++;
        }
        if (sourceFiles.includes(id)) await prepareSources();
      },
    },
    context,
    meta.framework,
  );
}

const stylex = {
  vite: createVitePlugin(factory),
  rolldown: createRolldownPlugin(factory),
  webpack: createWebpackPlugin(factory),
};
export default stylex;
