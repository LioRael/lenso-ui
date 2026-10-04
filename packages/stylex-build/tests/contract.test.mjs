import assert from "node:assert/strict";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import test from "node:test";
import compiler from "@stylexjs/babel-plugin";
import upstream from "@stylexjs/unplugin";
import browserslist from "browserslist";
import { browserslistToTargets, transform } from "lightningcss";
import stylex from "../src/index.mjs";
import { createMetadata } from "../src/metadata.mjs";

const source = (body) =>
  `import * as stylex from "@stylexjs/stylex";
   export const styles = stylex.create({test: ${body}});`;
const compile = async (plugin, code, filename = "/fixture.stylex.ts") => {
  await plugin.transform.call({}, code, filename);
  const assets = [];
  await plugin.generateBundle.call({ emitFile: (asset) => assets.push(asset) }, {}, {});
  return assets;
};
const css = (assets) =>
  assets.find((asset) => asset.fileName === "assets/stylex.css")?.source ?? "";
const output = fileURLToPath(new URL("../../../test-results/stylex-build/", import.meta.url));
await mkdir(output, { recursive: true });

test("public collector emits raw rules, not independently guarded CSS; consumer makes one official pass", async () => {
  const directory = await mkdtemp(join(output, "contract-"));
  try {
    const producer = stylex.rolldown({ emitMetadata: "rules.json", devMode: "off" });
    await producer.buildStart.call({});
    const output = await compile(producer, source("{padding: 24, opacity: 0}"));
    const artifact = output.find((asset) => asset.fileName === "rules.json").source;
    const file = join(directory, "rules.json");
    await writeFile(file, artifact);
    const metadata = JSON.parse(artifact);
    assert(metadata.rules.length > 0);
    assert(metadata.rules.every(([, rule]) => !rule.ltr.includes(":not(#")));
    assert.equal(metadata.compilerVersion, "0.19.1");
    assert.doesNotThrow(() => stylex.vite({ metadata: [pathToFileURL(file).href] }));

    const consumer = stylex.rolldown({ metadata: [file], devMode: "off" });
    await consumer.buildStart.call({});
    let calls = 0;
    let collected;
    const original = compiler.processStylexRules;
    compiler.processStylexRules = (rules, options) => {
      calls++;
      collected = structuredClone(rules);
      return original(rules, options);
    };
    let result;
    try {
      result = await compile(
        consumer,
        source('{opacity: {default: 0, ":hover": 1}, paddingTop: 29}'),
      );
    } finally {
      compiler.processStylexRules = original;
    }
    assert.equal(calls, 1);
    for (const rule of metadata.rules)
      assert(collected.some((item) => JSON.stringify(item) === JSON.stringify(rule)));
    assert(collected.length > metadata.rules.length);
    const expected = transform({
      filename: "stylex.css",
      targets: browserslistToTargets(browserslist()),
      exclude: 4,
      code: Buffer.from(original(collected, { useLayers: false })),
    }).code.toString();
    assert.equal(css(result), expected);
    assert.equal(await readFile(file, "utf8"), artifact, "Consumer never mutates package metadata");
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});

test("collection is scoped to a build and replaces removed/retransformed modules", async () => {
  const first = stylex.rolldown({ sourceOnly: true });
  await first.buildStart.call({});
  assert.match(css(await compile(first, source("{opacity: 0}"))), /opacity:\s*0/);
  const second = stylex.rolldown({ sourceOnly: true });
  await second.buildStart.call({});
  assert(!css(await compile(second, source("{fontSize: 16}"))).includes("opacity"));
  assert.equal(css(await compile(first, "export const removed = true;")), "");
  await compile(first, source("{opacity: 0}"));
  await first.buildStart.call({});
  assert.equal(css(await compile(first, "export const empty = true;")), "");
  const foreign = upstream.rolldown({ dev: false, useCSSLayers: false });
  const bundle = {
    "style.css": { type: "asset", fileName: "style.css", source: "" },
  };
  foreign.generateBundle.call(
    { emitFile: () => assert.fail("Server/build-local rules leaked into an unrelated compiler") },
    {},
    bundle,
  );
  assert.equal(bundle["style.css"].source, "");
});

test("query variants own independent rules across concurrent transforms and watch deletion", async () => {
  const plugin = stylex.rolldown({ sourceOnly: true });
  await plugin.buildStart.call({});
  const file = "/query.stylex.js";
  await Promise.all([
    plugin.transform.call({}, source("{color: 'red'}"), file),
    plugin.transform.call({}, source("{color: 'blue'}"), `${file}?variant=blue`),
  ]);
  let result = css(await compile(plugin, "export default 'raw source';", `${file}?raw`));
  assert.match(result, /color:\s*red/);
  assert.match(result, /color:\s*#00f/);
  result = css(await compile(plugin, source("{color: 'green'}"), file));
  assert(!/color:\s*red/.test(result));
  assert.match(result, /color:\s*green/);
  assert.match(result, /color:\s*#00f/);
  result = css(await compile(plugin, "export const removed = true;", `${file}?variant=blue`));
  assert(!/color:\s*#00f/.test(result));
  assert.match(result, /color:\s*green/);
  await compile(plugin, source("{color: 'blue'}"), `${file}?variant=blue`);
  await plugin.watchChange(`${file}?variant=blue`, { event: "delete" });
  result = css(await compile(plugin, "export const empty = true;", "/empty.js"));
  assert(!/color:\s*#00f/.test(result));
  assert.match(result, /color:\s*green/);
  await plugin.watchChange(file, { event: "delete" });
  assert.equal(css(await compile(plugin, "export const empty = true;", "/empty.js")), "");
});

test("explicit server-only source declarations join client rules without a global compiler store", async () => {
  const directory = await mkdtemp(join(output, "server-source-"));
  try {
    const file = join(directory, "server.stylex.ts");
    await writeFile(file, source("{padding: 24}"));
    const consumer = stylex.rolldown({ sourceOnly: true, sources: [file] });
    await consumer.buildStart.call({});
    const result = await compile(consumer, source("{paddingTop: 29}"));
    assert.match(css(result), /padding:\s*24px/);
    assert.match(css(result), /padding-top:\s*29px/);
    await writeFile(file, "export const noStyles = true;");
    assert(!css(await compile(consumer, source("{paddingTop: 29}"))).includes("padding:"));
    await rm(file);
    await assert.rejects(
      compile(consumer, source("{paddingTop: 29}")),
      /Cannot read additional source/,
    );
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});

test("missing, malformed, incompatible and modified metadata fail before compilation", async () => {
  const directory = await mkdtemp(join(output, "rejected-"));
  try {
    const file = join(directory, "rules.json");
    assert.throws(() => stylex.vite({ metadata: [file] }), /Cannot read raw-rule metadata.*Build/);
    for (const [value, expected] of [
      [null, /Invalid metadata object/],
      [{ ...createMetadata([]), version: 2 }, /Incompatible version/],
      [{ ...createMetadata([]), compilerVersion: "0.20.0" }, /Incompatible compilerVersion/],
      [{ ...createMetadata([]), compileMode: { dev: true } }, /Incompatible compileMode/],
      [
        { ...createMetadata([]), rules: [["x", { ltr: ".x{opacity:0}", rtl: null }, 3000]] },
        /digest mismatch/,
      ],
      [{ ...createMetadata([]), rules: "not rules" }, /Invalid raw StyleX rules/],
    ]) {
      await writeFile(file, JSON.stringify(value));
      assert.throws(() => stylex.vite({ metadata: [file] }), expected);
    }
    assert.throws(() => stylex.vite({}), /Supply metadata/);
    assert.throws(
      () => stylex.vite({ sourceOnly: true, legacyDisableLayers: true }),
      /Unsupported options/,
    );
    assert.throws(() => stylex.rolldown({ emitMetadata: "../rules.json" }), /basename/);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});
