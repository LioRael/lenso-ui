import assert from "node:assert/strict";
import { test } from "bun:test";
import { readFile, readdir } from "node:fs/promises";
import { createRequire } from "node:module";
import { join, resolve } from "node:path";
import * as stylex from "@stylexjs/stylex";

const require = createRequire(import.meta.url);
const libraryRequire = createRequire(
  new URL("../../../packages/docs/package.json", import.meta.url),
);
const compilerRequire = createRequire(libraryRequire.resolve("@stylexjs/postcss-plugin"));
const postcss = compilerRequire("postcss");
const babel = compilerRequire("@babel/core");
const babelOptions = {
  babelrc: false,
  configFile: false,
  parserOpts: { plugins: ["typescript", "jsx"] },
  plugins: [
    [
      require.resolve("@stylexjs/babel-plugin"),
      { dev: false, runtimeInjection: false, unstable_moduleResolution: { type: "commonJS" } },
    ],
  ],
};
const root = resolve(import.meta.dir, "..");

test("production docs deliver referenced StyleX rules in one stylesheet", async () => {
  assert.equal(
    await readFile(resolve(root, "../../packages/tokens/dist/theme.css"), "utf8"),
    await readFile(resolve(root, "../../packages/tokens/styles.css"), "utf8"),
  );
  const directory = join(root, "out/assets");
  const cssFiles = (await readdir(directory)).filter((file) => file.endsWith(".css"));
  const cssContents = await Promise.all(
    cssFiles.map((file) => readFile(join(directory, file), "utf8")),
  );
  const css = cssContents.join("\n");
  const runtime = (
    await Promise.all(
      (await readdir(directory))
        .filter((file) => file.endsWith(".js"))
        .map((file) => readFile(join(directory, file), "utf8")),
    )
  ).join("\n");
  const usedClasses = new Set(runtime.match(/\bx[a-z0-9]+(?:-[A-Z])?\b/g));
  const atomicSelector = (selector: string) =>
    /\.x[a-z0-9]+(?:-[A-Z])?(?=[\s,.#:[>+~]|$)/.test(selector);
  const fingerprints = new Set<string>();
  const keyframes = new Set<string>();
  interface Ancestor {
    type: string;
    name?: string;
    params?: string;
    parent?: Ancestor;
  }
  interface Rule {
    selector: string;
    nodes: Array<{ toString(): string }>;
    parent?: Ancestor;
  }
  const ast = postcss.parse(css);
  ast.walkAtRules("keyframes", (rule: { params: string }) => {
    assert.ok(!keyframes.has(rule.params), `Duplicate keyframe ${rule.params}`);
    keyframes.add(rule.params);
  });
  ast.walkRules((rule: Rule) => {
    if (!atomicSelector(rule.selector)) return;
    const ancestors: string[] = [];
    for (let node = rule.parent; node && node.type !== "root"; node = node.parent)
      ancestors.push(`${node.name}:${node.params}`);
    const fingerprint = JSON.stringify([
      ancestors,
      rule.selector,
      rule.nodes.map((node) => node.toString()),
    ]);
    assert.ok(!fingerprints.has(fingerprint), `Duplicate atomic rule ${rule.selector}`);
    fingerprints.add(fingerprint);
  });
  const atomicFiles = cssFiles.filter((_file, index) => {
    let hasAtomicRule = false;
    postcss.parse(cssContents[index]!).walkRules((rule: { selector: string }) => {
      if (atomicSelector(rule.selector)) hasAtomicRule = true;
    });
    return hasAtomicRule;
  });
  assert.equal(atomicFiles.length, 1, "Exactly one delivered union atomic stylesheet");
  assert.ok(css.includes(":dir(rtl)"));
  assert.ok(!css.includes("@stylex"));
  const packageRoot = resolve(root, "../../packages/tokens/dist");
  for (const file of await readdir(packageRoot, { recursive: true })) {
    if (!file.endsWith(".js")) continue;
    const filename = resolve(packageRoot, file);
    const source = await readFile(filename, "utf8");
    if (!source.includes("@stylexjs/stylex")) continue;
    const transformed = await babel.transformAsync(source, {
      cwd: root,
      ...babelOptions,
      filename,
    });
    for (const [identity, rule] of transformed.metadata.stylex ?? []) {
      if (!rule.ltr) continue;
      // Unreachable package maps may be omitted by the module-based extractor.
      if (identity.startsWith("--") ? !runtime.includes(identity) : !usedClasses.has(identity))
        continue;
      if (rule.ltr.includes("@keyframes")) assert.ok(keyframes.has(identity), identity);
      else if (identity.startsWith("--")) assert.ok(css.includes(identity), identity);
      else assert.ok(css.includes(`.${identity}`), `Missing library class ${identity} in ${file}`);
    }
  }
  const filename = resolve(root, "src/styles/api-reference.stylex.ts");
  const transformed = await babel.transformAsync(await readFile(filename, "utf8"), {
    cwd: root,
    ...babelOptions,
    filename,
  });
  const code: string = transformed.code
    .replace(/^import .*;$/gm, "")
    .replace(/export const /g, "const ");
  const executable = new Bun.Transpiler({ loader: "ts" }).transformSync(code);
  const maps = Function(`${executable}; return styles;`)() as Record<
    string,
    Parameters<typeof stylex.props>[0]
  >;
  for (const map of Object.values(maps))
    for (const className of stylex.props(map).className!.split(" "))
      assert.ok(css.includes(`.${className}`), `Missing server-only API class ${className}`);
});
