// node combined-pass-probe.mjs <read-only dependency workspace> <output directory> [--baseline]
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdir, readFile, realpath, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

const [dependencies, output, mode] = process.argv.slice(2);
assert(dependencies && output, "Supply the dependency workspace and evidence directory");
assert(mode === undefined || mode === "--baseline", "Optional mode: --baseline");
const compilerFile = await realpath(
  resolve(dependencies, "node_modules/@stylexjs/unplugin/lib/core.js"),
);
const require = createRequire(compilerFile);
const babel = require("@babel/core");
const compiler = require("@stylexjs/babel-plugin");
const testingRequire = createRequire(resolve(dependencies, "packages/testing/package.json"));
const playwright = await import(pathToFileURL(testingRequire.resolve("playwright")));
const { chromium } = playwright.default ?? playwright;
const compile = (body) =>
  babel.transformSync(
    `import * as stylex from "@stylexjs/stylex";
     export const styles = stylex.create({ text: ${body} });`,
    {
      filename: resolve(output, "probe.tsx"),
      babelrc: false,
      configFile: false,
      plugins: [compiler.withOptions({ dev: false, treeshakeCompensation: true })],
    },
  ).metadata.stylex;
const defaults = compile("{ fontSize: 16, margin: 0, borderWidth: 1 }");
const responsive = compile('{ fontSize: { default: 16, "@media (min-width: 900px)": 14 } }');
const processRules = (rules) => compiler.processStylexRules([...rules], { useLayers: false });
const defaultClass = defaults.find(([, rule]) => rule.ltr.includes("font-size:16px"))[0];
const responsiveClass = responsive.find(([name]) => name !== defaultClass)[0];
const css = {
  defaults: processRules(defaults),
  responsive: processRules(responsive),
  combined: processRules([...defaults, ...responsive]),
};
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1000, height: 600 } });
const results = {};
try {
  for (const [name, sheets] of Object.entries({
    independentPackageFirst: [css.responsive, css.defaults],
    independentConsumerFirst: [css.defaults, css.responsive],
    combinedOnly: [css.combined],
    combinedThenLateStandaloneDefault: [css.combined, css.defaults],
    standaloneDefaultThenCombined: [css.defaults, css.combined],
  })) {
    await page.setContent(`<span class="${defaultClass} ${responsiveClass}">Text</span>`);
    for (const content of sheets) await page.addStyleTag({ content });
    results[name] = await page.locator("span").evaluate((node) => getComputedStyle(node).fontSize);
  }
  await page.setViewportSize({ width: 600, height: 600 });
  await page.setContent(`<span class="${defaultClass} ${responsiveClass}">Text</span>`);
  await page.addStyleTag({ content: css.combined });
  results.combinedMobile = await page
    .locator("span")
    .evaluate((node) => getComputedStyle(node).fontSize);
} finally {
  await browser.close();
}
await mkdir(output, { recursive: true });
const evidence = {
  node: process.versions.node,
  unpluginCoreSha256: createHash("sha256")
    .update(await readFile(compilerFile))
    .digest("hex"),
  babelPluginSha256: createHash("sha256")
    .update(await readFile(require.resolve("@stylexjs/babel-plugin")))
    .digest("hex"),
  compileMode: { dev: false, styleResolution: "property-specificity", useLayers: false },
  raw: { defaults, responsive },
  css,
  results,
};
await writeFile(resolve(output, "combined-pass.json"), JSON.stringify(evidence, null, 2));
console.log(JSON.stringify(evidence, null, 2));
assert.equal(results.independentPackageFirst, "16px", "Reproduce independent-sheet media loss");
assert.equal(results.combinedOnly, "14px", "The official combined pass restores desktop media");
assert.equal(results.combinedMobile, "16px", "The official combined pass retains mobile default");
if (mode === "--baseline")
  assert.equal(
    results.independentPackageFirst,
    "14px",
    "Independent sheets must retain desktop media",
  );
assert.equal(results.standaloneDefaultThenCombined, "14px");
assert.equal(
  results.combinedThenLateStandaloneDefault,
  "14px",
  "The combined pass must preserve desktop media after a late standalone default stylesheet",
);
