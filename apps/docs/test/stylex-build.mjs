import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdir, mkdtemp, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { resolve, join } from "node:path";
import { chromium } from "playwright";
import * as stylex from "@stylexjs/stylex";
import { buttonStyles, buttonSizes } from "@lenso/tokens/button";
import { spinnerStyles } from "@lenso/tokens/spinner";
import { breadcrumbsStyles } from "@lenso/tokens/breadcrumbs";
import { prose as presentationProse, styles as presentationDocs } from "@lenso/docs/presentation";

// Cached transforms used to lose server-only CSS. Independently processed library
// CSS also hid union-order errors; inspect delivered CSS and computed styles together.
const require = createRequire(import.meta.url);
const pluginRequire = createRequire(require.resolve("@stylexjs/postcss-plugin"));
const postcss = pluginRequire("postcss");
const babel = pluginRequire("@babel/core");
const options = require("../postcss.config.cjs").plugins["@lenso/stylex-build/postcss"];
const createPlugin = require("@lenso/stylex-build/postcss");
const babelConfig = {
  babelrc: false,
  configFile: false,
  parserOpts: { plugins: ["typescript", "jsx"] },
  plugins: require("../babel.config.json").plugins,
};
const root = resolve(import.meta.dirname, "..");
const evidence = resolve(
  root,
  process.env.LENSO_STYLEX_EVIDENCE ?? "../../test-results/stylex-postcss",
);
const base = process.env.LENSO_DOCS_TEST_URL ?? "http://127.0.0.1:3000";
const report = {};

const sourceHashes = [];
for (const directory of ["src", "../../packages/styles/src", "../../packages/docs/presentation"]) {
  for (const file of (await readdir(resolve(root, directory), { recursive: true })).sort()) {
    if (!/\.[jt]sx?$/.test(file) || file.endsWith(".d.ts")) continue;
    sourceHashes.push([
      join(directory, file),
      createHash("sha256")
        .update(await readFile(resolve(root, directory, file)))
        .digest("hex"),
    ]);
  }
}
report.sourceUnion = {
  sha256: createHash("sha256").update(JSON.stringify(sourceHashes)).digest("hex"),
  files: sourceHashes,
};
assert.equal(
  await readFile(resolve(root, "../../packages/styles/dist/theme.css"), "utf8"),
  await readFile(resolve(root, "../../packages/styles/styles.css"), "utf8"),
);
assert.ok(
  (await readFile(resolve(root, "../../packages/styles/dist/styles.css"), "utf8")).includes(
    "assets/stylex.css",
  ),
);

async function compiled(relative, name) {
  const filename = resolve(root, relative);
  const result = await babel.transformAsync(await readFile(filename, "utf8"), {
    ...babelConfig,
    filename,
  });
  const code = result.code.replace(/^import .*;$/gm, "").replace(/export const /g, "const ");
  return Function(`${code}; return ${name};`)();
}

const prose = await compiled("../../packages/docs/presentation/styles/prose.stylex.ts", "prose");
const api = await compiled("src/styles/api-reference.stylex.ts", "styles");
const docs = await compiled("../../packages/docs/presentation/styles/docs.stylex.ts", "styles");
assert.deepEqual(prose, presentationProse);
assert.deepEqual(docs, presentationDocs);
assert.deepEqual(
  await compiled("../../packages/styles/src/components/button/button.styles.ts", "buttonStyles"),
  buttonStyles,
  "Official Babel must preserve the exact precompiled library maps",
);
assert.deepEqual(
  await compiled("../../packages/styles/src/components/spinner/spinner.styles.ts", "spinnerStyles"),
  spinnerStyles,
);

const cssFiles = (await readdir(join(root, "out/_next/static/css"))).filter((file) =>
  file.endsWith(".css"),
);
const css = (
  await Promise.all(
    cssFiles.map((file) => readFile(join(root, "out/_next/static/css", file), "utf8")),
  )
).join("\n");
const ast = postcss.parse(css);
const atomicFiles = [];
// Fuma's precompiled .xl\: utilities are not StyleX .x<hash> classes.
const isAtomicSelector = (selector) => /\.x[a-z0-9]+(?:-[A-Z])?(?=[\s,.#:[>+~]|$)/.test(selector);
const fingerprints = new Set();
const keyframes = new Set();
ast.walkAtRules("keyframes", (rule) => {
  assert.ok(!keyframes.has(rule.params), `Duplicate keyframe ${rule.params}`);
  keyframes.add(rule.params);
});
ast.walkRules((rule) => {
  if (!isAtomicSelector(rule.selector)) return;
  const ancestors = [];
  for (let node = rule.parent; node?.type !== "root"; node = node.parent)
    ancestors.push(`${node.name}:${node.params}`);
  const fingerprint = JSON.stringify([
    ancestors,
    rule.selector,
    rule.nodes.map((node) => node.toString()),
  ]);
  assert.ok(!fingerprints.has(fingerprint), `Duplicate atomic rule ${rule.selector}`);
  fingerprints.add(fingerprint);
});
for (const file of cssFiles) {
  const content = await readFile(join(root, "out/_next/static/css", file), "utf8");
  let hasAtomicRule = false;
  postcss.parse(content).walkRules((rule) => {
    if (isAtomicSelector(rule.selector)) hasAtomicRule = true;
  });
  if (hasAtomicRule) atomicFiles.push(file);
}
assert.equal(atomicFiles.length, 1, "Exactly one delivered union atomic stylesheet");
assert.ok(css.includes(":dir(rtl)"), "Native RTL must not become a language approximation");
assert.ok(!css.includes("@stylex"));
const metadata = JSON.parse(
  await readFile(resolve(root, "../../packages/styles/dist/stylex-rules.json")),
);
for (const [identity, rule] of metadata.rules) {
  if (!rule.ltr) continue; // defineConsts metadata is not an emitted selector.
  if (rule.ltr.includes("@keyframes")) assert.ok(keyframes.has(identity), identity);
  else if (identity.startsWith("--")) assert.ok(css.includes(identity), identity);
  else assert.ok(css.includes(`.${identity}`), `Missing compiled library class ${identity}`);
}
report.delivery = {
  cssFiles,
  atomicFiles,
  atomicRules: fingerprints.size,
  keyframes: [...keyframes],
  libraryIdentities: metadata.rules.length,
  emittedLibraryIdentities: metadata.rules.filter(([, rule]) => rule.ltr).length,
  atomicSha256: createHash("sha256")
    .update(await readFile(join(root, "out/_next/static/css", atomicFiles[0])))
    .digest("hex"),
};

const browser = await chromium.launch();
try {
  report.routes = [];
  for (const route of [
    "/en/docs/react/components/button",
    "/cn/docs/react/components/date-picker",
    "/docs/react/components/button",
  ]) {
    const page = await browser.newPage({ javaScriptEnabled: false });
    const response = await page.goto(`${base}${route}`, { waitUntil: "networkidle" });
    assert.equal(response.status(), 200);
    const samples = await page
      .locator("section[aria-labelledby^=native-api-] table")
      .first()
      .evaluate((table) => {
        const head = table.querySelector("thead th");
        const cell = table.querySelector("tbody th");
        const code = cell.querySelector("code");
        const scroll = table.closest("section[tabindex][aria-label]");
        const styles = (node) => {
          const value = getComputedStyle(node);
          return {
            fontSize: value.fontSize,
            lineHeight: value.lineHeight,
            padding: value.padding,
            overflow: value.overflow,
            borderCollapse: value.borderCollapse,
            whiteSpace: value.whiteSpace,
            background: value.backgroundColor,
          };
        };
        return {
          table: styles(table),
          head: styles(head),
          cell: styles(cell),
          code: styles(code),
          scroll: styles(scroll),
          scrollTabIndex: scroll.tabIndex,
          font: getComputedStyle(document.body).fontFamily,
        };
      });
    assert.equal(samples.table.borderCollapse, "separate");
    assert.equal(samples.table.fontSize, "14px");
    assert.equal(samples.table.lineHeight, "24px");
    assert.equal(samples.cell.padding, "10px");
    assert.equal(samples.scroll.overflow, "auto");
    assert.equal(samples.scrollTabIndex, 0);
    assert.notEqual(samples.head.background, "rgba(0, 0, 0, 0)");
    assert.ok(samples.font.includes("Lenso Inter"));
    report.routes.push({ route, samples });
    await page.close();
  }

  const page = await browser.newPage();
  await page.goto(`${base}/en/docs/react/components/button`, { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);
  assert.ok(await page.evaluate(() => document.fonts.check('500 14px "Lenso Inter"')));
  const fontUrl = await page.evaluate(() => {
    for (const sheet of document.styleSheets) {
      let rules;
      try {
        rules = sheet.cssRules;
      } catch {
        continue;
      }
      for (const rule of rules) {
        if (
          rule instanceof CSSFontFaceRule &&
          rule.style.getPropertyValue("font-family").includes("Lenso Inter")
        ) {
          const source = rule.style.getPropertyValue("src");
          const match = source.match(/url\(["']?([^"')]+)["']?\)/);
          if (match) return new URL(match[1], sheet.href ?? document.baseURI).href;
        }
      }
    }
    return null;
  });
  assert.ok(fontUrl, "Delivered stylesheet must declare the Lenso Inter font source");
  assert.equal(new URL(fontUrl).origin, new URL(base).origin);
  const fontResponse = await page.request.get(fontUrl);
  assert.equal(fontResponse.status(), 200);
  const fontSha256 = createHash("sha256")
    .update(await fontResponse.body())
    .digest("hex");
  assert.equal(fontSha256, "29160a80ff49ddcab2c97711247e08b1fab27a484a329ce8b813d820dc559031");
  report.font = { url: new URL(fontUrl).pathname, sha256: fontSha256, loaded: true };

  report.union = await page.evaluate(
    (maps) => {
      const result = [];
      for (const [name, props] of Object.entries(maps)) {
        const node = document.createElement("div");
        node.className = props.className;
        Object.assign(node.style, props.style);
        document.body.append(node);
        const value = getComputedStyle(node);
        result.push({
          name,
          padding: [value.paddingTop, value.paddingRight, value.paddingBottom, value.paddingLeft],
          animation: value.animationName,
        });
        node.remove();
      }
      return result;
    },
    {
      libraryApp: stylex.props(buttonStyles.root, prose.cell),
      appLibrary: stylex.props(prose.cell, buttonStyles.root),
      xstyleLast: stylex.props(buttonStyles.root, buttonSizes.md, prose.cell),
      xstyleLonghand: stylex.props(buttonStyles.root, buttonSizes.md, docs.pre),
      spinner: stylex.props(spinnerStyles.root),
    },
  );
  for (const sample of report.union.filter((sample) => sample.name !== "spinner")) {
    const expected =
      sample.name === "xstyleLonghand"
        ? ["14px", "24px", "14px", "24px"]
        : sample.name === "xstyleLast"
          ? ["0px", "16px", "0px", "16px"]
          : ["0px", "10px", "0px", "10px"];
    assert.deepEqual(sample.padding, expected);
  }
  assert.ok(keyframes.has(report.union.find((sample) => sample.name === "spinner").animation));

  report.themesRtl = await page.evaluate(
    ({ props, rtlProps }) => {
      const data = [];
      for (const theme of ["light", "dark"]) {
        document.documentElement.className = theme;
        document.documentElement.dir = "rtl";
        for (const portal of [false, true]) {
          const scope = document.createElement("div");
          scope.lang = "en";
          scope.dir = "rtl";
          scope.dataset.theme = theme;
          const node = document.createElement("div");
          node.className = props.className;
          const icon = document.createElement("span");
          icon.className = rtlProps.className;
          node.append(icon);
          scope.append(node);
          (portal ? document.body : document.querySelector("main")).append(scope);
          const value = getComputedStyle(node);
          const iconStyle = getComputedStyle(icon);
          data.push({
            theme,
            portal,
            direction: value.direction,
            color: value.color,
            radius: value.borderStartStartRadius,
            transform: iconStyle.transform,
            rotate: iconStyle.rotate,
          });
          scope.remove();
        }
      }
      return data;
    },
    {
      props: stylex.props(buttonStyles.root, buttonStyles.groupedHorizontal),
      rtlProps: stylex.props(breadcrumbsStyles.separator),
    },
  );
  for (const row of report.themesRtl) {
    assert.equal(row.direction, "rtl");
    assert.ok(row.transform !== "none" || row.rotate !== "none");
  }
  assert.deepEqual(report.themesRtl[0], { ...report.themesRtl[1], portal: false });
  assert.deepEqual(report.themesRtl[2], { ...report.themesRtl[3], portal: false });
  assert.notEqual(report.themesRtl[0].color, report.themesRtl[2].color);
  report.nativePortal = [];
  for (const theme of ["light", "dark"]) {
    await page.evaluate((value) => localStorage.setItem("theme", value), theme);
    await page.reload({ waitUntil: "networkidle" });
    await page.evaluate(() => {
      document.documentElement.dir = "rtl";
    });
    await page.getByRole("button", { name: "Search documentation", exact: true }).click();
    const dialog = page.getByRole("dialog", { name: "Search documentation", exact: true });
    const sample = await dialog.evaluate((node) => ({
      portalled: !document.querySelector("main").contains(node),
      direction: getComputedStyle(node).direction,
      background: getComputedStyle(node).backgroundColor,
      rootTheme: document.documentElement.className,
    }));
    assert.ok(sample.portalled);
    assert.equal(sample.direction, "rtl");
    assert.ok(sample.rootTheme.includes(theme));
    assert.notEqual(sample.background, "rgba(0, 0, 0, 0)");
    report.nativePortal.push({ theme, ...sample });
    await page.keyboard.press("Escape");
  }
  assert.notEqual(report.nativePortal[0].background, report.nativePortal[1].background);
  await page.close();
} finally {
  await browser.close();
}

// Exercise the official plugin's persistent builder, without patching it.
await mkdir(evidence, { recursive: true });
const temporary = await mkdtemp(join(evidence, "probe-"));
try {
  const file = join(temporary, "probe.ts");
  const plugin = createPlugin({ ...options, metadata: [], include: [file] });
  const process = () =>
    postcss([plugin]).process("@stylex;", { from: join(temporary, "entry.css") });
  const source = (value) =>
    `import * as stylex from "@stylexjs/stylex"; export const styles=stylex.create({probe:{width:${value}}});`;
  await writeFile(file, source(193));
  const initial = (await process()).css;
  await writeFile(file, source(197));
  const edited = (await process()).css;
  assert.ok(edited.includes("197px") && !edited.includes("193px"));
  await writeFile(file, "export const styles = {};");
  const removedDeclaration = (await process()).css;
  assert.ok(
    !removedDeclaration.includes("197px"),
    "Removing the last declaration/import must clear its prior rules",
  );
  await rm(file);
  const deletedFile = (await process()).css;
  assert.equal(deletedFile, "");
  const constants = join(temporary, "values.stylex.js");
  const consumer = join(temporary, "consumer.js");
  await writeFile(
    constants,
    'import * as stylex from "@stylexjs/stylex"; export const values=stylex.defineConsts({size:"211px"});',
  );
  await writeFile(
    consumer,
    'import * as stylex from "@stylexjs/stylex"; import { values } from "./values.stylex.js"; export const styles=stylex.create({probe:{width:values.size}});',
  );
  const dependentPlugin = createPlugin({
    ...options,
    metadata: [],
    include: [constants, consumer],
  });
  const dependentProcess = () =>
    postcss([dependentPlugin]).process("@stylex;", { from: join(temporary, "entry.css") });
  const beforeConstantEdit = (await dependentProcess()).css;
  await writeFile(
    constants,
    'import * as stylex from "@stylexjs/stylex"; export const values=stylex.defineConsts({size:"223px"});',
  );
  const afterConstantEdit = (await dependentProcess()).css;
  assert.ok(beforeConstantEdit.includes("211px"), beforeConstantEdit);
  assert.ok(afterConstantEdit.includes("223px") && !afterConstantEdit.includes("211px"));
  assert.equal(beforeConstantEdit.split("{")[0], afterConstantEdit.split("{")[0]);
  report.development = {
    initial,
    edited,
    removedDeclaration,
    deletedFile,
    constantEdit: { before: "211px", after: "223px", classIdentityPreserved: true },
    limitation:
      "Direct edits, declaration removal, imported defineConsts value edits and file deletion update when PostCSS reruns. Actual Next dev invalidation is checked separately.",
  };
} finally {
  await rm(temporary, { recursive: true, force: true });
}

for (const map of Object.values(api))
  for (const className of stylex.props(map).className.split(" "))
    assert.ok(css.includes(`.${className}`), `Server-only native API class ${className}`);
await writeFile(join(evidence, "results.json"), JSON.stringify(report, null, 2));
console.log(
  JSON.stringify(
    {
      ...report,
      sourceUnion: { sha256: report.sourceUnion.sha256, fileCount: sourceHashes.length },
    },
    null,
    2,
  ),
);
