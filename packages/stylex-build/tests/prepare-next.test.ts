import assert from "node:assert/strict";
import { mkdir, mkdtemp, readFile, rm, stat, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import test from "node:test";
import { pathToFileURL } from "node:url";
import stylex, { prepareNext } from "@lenso/stylex-build";

interface Transform {
  transform(this: object, source: string, id: string): Promise<{ code: string }>;
}
interface Rule {
  use(data: { resource: string }): { options: { plugin: Transform } }[];
}
interface Collector extends Transform {
  buildStart(this: object): Promise<void>;
  generateBundle(
    this: { emitFile(asset: { fileName: string; source: string }): void },
    options: object,
    bundle: object,
  ): Promise<void>;
}
type Plugin = Awaited<ReturnType<typeof prepareNext>>;

// Exercise the transform supplied to Webpack without another Next production
// build. The browser fixture proves delivery; it cannot prove omitted files fail.
function transform(
  plugin: Plugin,
  {
    mode = "production",
    context = resolve(import.meta.dirname, "../../../apps/docs"),
    watch = false,
    cache = false,
    triggerWatchRun = false,
  }: {
    mode?: string;
    context?: string;
    watch?: boolean;
    cache?: false | object;
    triggerWatchRun?: boolean;
  } = {},
) {
  const rules: Rule[] = [];
  let beforeCompile: () => Promise<void> = async () => {};
  const compiler = {
    context,
    options: { context, mode, watch, cache, module: { rules } },
    hooks: {
      thisCompilation: { tap() {} },
      make: { tapPromise() {} },
      emit: { tapPromise() {} },
      beforeCompile: {
        tapPromise(_name: string, callback: () => Promise<void>) {
          beforeCompile = callback;
        },
      },
      watchRun: {
        tap(_name: string, callback: () => void) {
          if (triggerWatchRun) callback();
        },
      },
    },
  };
  plugin.apply(compiler as unknown as Parameters<Plugin["apply"]>[0]);
  const rule = rules.find((item) => typeof item.use === "function");
  assert(rule);
  const loader = rule.use({ resource: "/probe.ts" })[0];
  assert(loader);
  return Object.assign(loader.options.plugin, { beforeCompile: () => beforeCompile() });
}
const source = (color: string) =>
  `import * as stylex from '@stylexjs/stylex';export const styles=stylex.create({root:{color:'${color}'}});`;

test("prepared union rejects uncovered rules, allows covered declarations and never rewrites CSS during transform", async () => {
  const root = await mkdtemp(join(tmpdir(), "lenso-prepare-next-"));
  try {
    const file = join(root, "styles.ts");
    const cssFile = join(root, "stylex.css");
    await writeFile(file, source("red"));
    const plugin = await prepareNext({
      sourceOnly: true,
      sources: [pathToFileURL(file)],
      cssFile: pathToFileURL(cssFile),
    });
    const css = await readFile(cssFile, "utf8");
    assert.match(css, /color:\s*red/);
    const collector = transform(plugin);
    await collector.beforeCompile();
    await writeFile(cssFile, css + "/* stale generated artifact */");
    await assert.rejects(
      collector.beforeCompile(),
      /Prepared CSS changed.*matching prepareNext plugin/s,
    );
    const different = await prepareNext({ sourceOnly: true, sources: [], cssFile });
    await assert.rejects(collector.beforeCompile(), /Prepared CSS changed/);
    await transform(different).beforeCompile();
    await writeFile(cssFile, css);
    const covered = await collector.transform.call({}, source("red"), file);
    assert(covered.code.includes("$$css"));
    await collector.transform.call({}, source("red"), join(root, "same-rules.ts"));
    await assert.rejects(
      collector.transform.call({}, source("blue"), join(root, "omitted.ts")),
      /Unprepared StyleX rules.*omitted\.ts.*prepareNext metadata\/sources/s,
    );
    await writeFile(file, source("green"));
    await assert.rejects(
      collector.transform.call({}, await readFile(file, "utf8"), file),
      /Unprepared StyleX rules.*regenerate CSS/s,
    );
    assert.equal(await readFile(cssFile, "utf8"), css);
    assert.throws(() => transform(plugin, { mode: "development" }), /production builds only/);
    assert.throws(() => transform(plugin, { watch: true }), /production builds only/);
    assert.throws(() => transform(plugin, { triggerWatchRun: true }), /production builds only/);
    assert.throws(() => transform(plugin, { cache: {} }), /requires config\.cache = false/);
    await mkdir(join(root, "node_modules/next"), { recursive: true });
    await writeFile(join(root, "node_modules/next/package.json"), '{"version":"16.3.7"}');
    assert.throws(() => transform(plugin, { context: root }), /supports 16\.3\.8, not 16\.3\.7/);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("prepareNext validates the explicit production contract before creating CSS", async () => {
  const root = await mkdtemp(join(tmpdir(), "lenso-prepare-next-options-"));
  try {
    await assert.rejects(
      prepareNext({ sourceOnly: true, sources: [], cssFile: "relative.css" }),
      /absolute \.css file/,
    );
    await assert.rejects(
      prepareNext({
        sourceOnly: true,
        sources: [join(root, "missing.ts")],
        cssFile: join(root, "stylex.css"),
      }),
      /Cannot read additional source/,
    );
    const cssFile = join(root, "package-only.css");
    await prepareNext({ sourceOnly: true, sources: [], cssFile });
    assert.match(await readFile(cssFile, "utf8"), /^\/\* @lenso\/stylex-build generated/);
    const before = await stat(cssFile);
    await prepareNext({ sourceOnly: true, sources: [], cssFile });
    assert.equal(
      (await stat(cssFile)).mtimeMs,
      before.mtimeMs,
      "Unchanged generated CSS is not rewritten",
    );
    await writeFile(cssFile, ".authored{color:red}");
    await assert.rejects(
      prepareNext({ sourceOnly: true, sources: [], cssFile }),
      /Refusing to overwrite authored CSS/,
    );
    assert.equal(await readFile(cssFile, "utf8"), ".authored{color:red}");
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("metadata and application tuples are processed once and seeded source declarations need no duplicate source entry", async () => {
  const root = await mkdtemp(join(tmpdir(), "lenso-prepare-next-seeds-"));
  const compiler = createRequire(import.meta.url)("@stylexjs/babel-plugin") as {
    processStylexRules(rules: unknown[], options: { useLayers: boolean }): string;
  };
  const original = compiler.processStylexRules;
  try {
    const producer = stylex.rolldown({
      emitMetadata: "rules.json",
      devMode: "off",
    }) as unknown as Collector;
    await producer.buildStart.call({});
    await producer.transform.call({}, source("red"), join(root, "package.ts"));
    const assets: { fileName: string; source: string }[] = [];
    await producer.generateBundle.call({ emitFile: (asset) => assets.push(asset) }, {}, {});
    const artifact = assets.find((asset) => asset.fileName === "rules.json");
    assert(artifact);
    const metadata = join(root, "rules.json");
    await writeFile(metadata, artifact.source);
    const application = join(root, "application.ts");
    await writeFile(application, source("blue"));
    let calls = 0;
    let union: unknown[] = [];
    compiler.processStylexRules = (rules, options) => {
      calls++;
      union = structuredClone(rules);
      return original(rules, options);
    };
    const plugin = await prepareNext({
      metadata: [metadata],
      sources: [application],
      cssFile: join(root, "stylex.css"),
    });
    const collector = transform(plugin);
    await collector.transform.call({}, source("red"), join(root, "seeded-package.ts"));
    await collector.transform.call({}, source("blue"), application);
    assert.equal(calls, 1, "Webpack source transforms do not process the prepared union again");
    const packageRules = (JSON.parse(artifact.source) as { rules: unknown[] }).rules;
    for (const rule of packageRules)
      assert(union.some((item) => JSON.stringify(item) === JSON.stringify(rule)));
    assert(
      union.length > packageRules.length,
      "The same processing pass includes application rules",
    );
    await producer.transform.call({}, source("green"), join(root, "package.ts"));
    assets.length = 0;
    await producer.generateBundle.call({ emitFile: (asset) => assets.push(asset) }, {}, {});
    const changed = assets.find((asset) => asset.fileName === "rules.json");
    assert(changed);
    await writeFile(metadata, changed.source);
    assert.throws(() => transform(plugin), /Unprepared StyleX rules.*rules\.json/s);
  } finally {
    compiler.processStylexRules = original;
    await rm(root, { recursive: true, force: true });
  }
});
