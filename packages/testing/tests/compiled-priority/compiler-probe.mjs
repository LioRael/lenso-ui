import assert from "node:assert/strict";
import { realpath, readFile, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { dirname, resolve } from "node:path";

export async function compilerProbe(dependencies, output, modulePath) {
  const require = createRequire(
    await realpath(
      modulePath ?? resolve(dependencies, "node_modules/@stylexjs/unplugin/lib/core.js"),
    ),
  );
  const babel = require("@babel/core");
  const compiler = require("@stylexjs/babel-plugin");
  const lightning = require("lightningcss");
  const browserslist = require("browserslist");
  const source = (extra) => `
    import * as stylex from "@stylexjs/stylex";
    export const styles = stylex.create({
      check: {opacity: {default: 0, ":is([data-checked] *)": 1}},
      radio: {"::before": {scale: {default: "1", ":is([data-checked])": ".5"}}}
      ${extra}
    });
  `;
  const transform = (extra, styleResolution) =>
    babel.transformSync(source(extra), {
      filename: resolve(output, "compiler-probe.tsx"),
      babelrc: false,
      configFile: false,
      plugins: [
        compiler.withOptions({
          dev: false,
          treeshakeCompensation: true,
          ...(styleResolution ? { styleResolution } : {}),
        }),
      ],
    });
  const compile = (extra, styleResolution) => transform(extra, styleResolution).metadata.stylex;
  const small = compile("");
  const large = compile(",unrelated: {margin: 0, borderWidth: 1}");
  assert.deepEqual(
    large.slice(0, small.length),
    small,
    "Raw atoms and numeric priorities are identical",
  );
  const process = (rules, useLayers = false, legacyDisableLayers = false) => {
    const beforeLightning = compiler.processStylexRules([...rules], {
      useLayers,
      legacyDisableLayers,
    });
    const afterLightning = lightning
      .transform({
        filename: "stylex.css",
        code: Buffer.from(beforeLightning),
        targets: lightning.browserslistToTargets(browserslist()),
        exclude: 4,
      })
      .code.toString();
    return { beforeLightning, afterLightning };
  };
  const versions = {};
  for (const name of ["@stylexjs/babel-plugin", "@babel/core", "lightningcss"])
    versions[name] = JSON.parse(
      await readFile(resolve(dirname(dirname(require.resolve(name))), "package.json")),
    ).version;
  const data = {
    versions,
    raw: { small, large },
    noLayers: { small: process(small), large: process(large) },
    layers: { small: process(small, true), large: process(large, true) },
    legacyDisableLayers: { small: process(small, false, true), large: process(large, false, true) },
    compilerKeyABI: Object.fromEntries(
      ["property-specificity", "application-order"].map((option) => [
        option,
        transform(
          ",packagePadding: {padding: 24},consumerPadding: (value) => ({paddingTop: value}),logical: {paddingInlineStart: 37},physical: {paddingLeft: 17}",
          option,
        ).code,
      ]),
    ),
    styleResolution: Object.fromEntries(
      ["property-specificity", "application-order", "legacy-expand-shorthands"].map((option) => [
        option,
        process(compile("", option)),
      ]),
    ),
  };
  await writeFile(resolve(output, "compiler.json"), JSON.stringify(data, null, 2));
  return data;
}
