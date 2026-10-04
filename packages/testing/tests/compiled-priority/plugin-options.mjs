import assert from "node:assert/strict";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

export async function pluginOptionsProbe(compilerRoot, require, output, patched) {
  const { build } = await import(pathToFileURL(require.resolve("vite")));
  const cjs = createRequire(resolve(compilerRoot, "package.json"))("./lib/vite.js").default;
  const { default: esm } = await import(pathToFileURL(resolve(compilerRoot, "lib/es/vite.mjs")));
  const root = resolve(output, "plugin-options");
  await mkdir(root);
  await writeFile(
    resolve(root, "index.html"),
    '<div id="root"></div><script type="module" src="./entry.js"></script>',
  );
  await writeFile(
    resolve(root, "entry.js"),
    `import * as stylex from "@stylexjs/stylex";
const styles = stylex.create({root: {margin: 0, borderWidth: 1, opacity: 0}});
Object.assign(document.getElementById("root"), stylex.props(styles.root));`,
  );
  const results = [];
  for (const [backend, plugin] of [
    ["cjs", cjs],
    ["esm", esm],
  ]) {
    const css = {};
    for (const flag of [undefined, false, true]) {
      const outDir = resolve(root, `${backend}-${String(flag)}`);
      await build({
        root,
        configFile: false,
        logLevel: "error",
        plugins: [
          plugin({
            dev: false,
            useCSSLayers: false,
            lightningcssOptions: { exclude: 4 },
            ...(flag === undefined ? {} : { legacyDisableLayers: flag }),
          }),
        ],
        build: { outDir, minify: false },
      });
      css[String(flag)] = await readFile(resolve(outDir, "assets/stylex.css"), "utf8");
      assert.equal(css[String(flag)].includes(":not(#"), !(patched && flag === true));
    }
    assert.equal(css.undefined, css.false, "Omitting the flag preserves the default CSS");
    results.push({ backend, css });
  }
  await writeFile(resolve(output, "plugin-options.json"), JSON.stringify(results, null, 2));
  return results;
}
