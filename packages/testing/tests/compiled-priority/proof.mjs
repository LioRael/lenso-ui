// node proof.mjs <empty scratch directory> <read-only dependency project> [--legacy|--application-order]
import assert from "node:assert/strict";
import { execFile, spawn } from "node:child_process";
import { createHash } from "node:crypto";
import { createServer } from "node:http";
import { createRequire } from "node:module";
import {
  cp,
  mkdir,
  readFile,
  readdir,
  realpath,
  rename,
  symlink,
  writeFile,
} from "node:fs/promises";
import { dirname, extname, resolve, sep } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { promisify } from "node:util";
import { compilerProbe } from "./compiler-probe.mjs";
import { pluginOptionsProbe } from "./plugin-options.mjs";

assert.equal(process.versions.node, "26.10.0");
const fixture = dirname(fileURLToPath(import.meta.url));
const project = resolve(fixture, "../../../..");
const [scratchArgument, dependenciesArgument, mode] = process.argv.slice(2);
assert(scratchArgument && dependenciesArgument, "Supply scratch and dependency project");
assert(
  mode === undefined ||
    mode === "--baseline" ||
    mode === "--packed" ||
    mode === "--legacy" ||
    mode === "--application-order",
  "Optional mode: --baseline, --packed, --legacy or --application-order",
);
const experimental = mode === "--legacy" || mode === "--application-order";
const scratch = resolve(scratchArgument);
const dependencies = resolve(dependenciesArgument);
assert(
  !scratch.startsWith(dependencies + sep) &&
    scratch !== dependencies &&
    (scratch.startsWith(resolve(project, "test-results") + sep) ||
      (scratch !== project && !scratch.startsWith(project + sep))),
  "Outputs must stay in ignored project test-results or outside projects, never in dependencies",
);
await mkdir(scratch, { recursive: true });
assert.deepEqual(await readdir(scratch), [], "Use an empty scratch directory");
const compilerRoot = resolve(scratch, "compiler/unplugin");
const originalCompiler = await realpath(resolve(dependencies, "node_modules/@stylexjs/unplugin"));
await cp(originalCompiler, compilerRoot, {
  recursive: true,
  filter: (path) => !/\/node_modules(?:\/|$)/.test(path.slice(originalCompiler.length)),
});
const patch = resolve(fixture, "unplugin-forwarding.experimental.patch");
const exec = promisify(execFile);
let originallyPatched = false;
try {
  await exec("git", ["apply", "--check", patch], { cwd: compilerRoot });
} catch {
  await exec("git", ["apply", "--reverse", "--check", patch], { cwd: compilerRoot });
  originallyPatched = true;
}
if (!experimental && originallyPatched)
  await exec("git", ["apply", "--reverse", patch], { cwd: compilerRoot });
if (experimental && !originallyPatched) await exec("git", ["apply", patch], { cwd: compilerRoot });
await links(resolve(originalCompiler, "../.."), resolve(compilerRoot, "node_modules"));
const compiler = await compilerProbe(dependencies, scratch, resolve(compilerRoot, "lib/core.js"));
const rootRequire = createRequire(resolve(dependencies, "package.json"));
const packageRequire = (name) =>
  createRequire(resolve(dependencies, "packages", name, "package.json"));
const binary = (require, name, file) =>
  resolve(dirname(require.resolve(`${name}/package.json`)), file);
async function run(file, args, cwd = scratch) {
  await new Promise((done, reject) => {
    const child = spawn(process.execPath, [file, ...args], {
      cwd,
      stdio: "inherit",
      env: { ...process.env, NODE_ENV: "production" },
    });
    child.on("error", reject);
    child.on("exit", (code) => (code === 0 ? done() : reject(new Error(`${file}: ${code}`))));
  });
}
async function links(source, destination) {
  await mkdir(destination, { recursive: true });
  for (const entry of await readdir(source, { withFileTypes: true })) {
    if ([".cache", ".vite", ".vite-temp", ".stylex", ".pnpm", "@lenso"].includes(entry.name))
      continue;
    const target = resolve(destination, entry.name);
    if (entry.name.startsWith("@") && entry.isDirectory())
      await links(resolve(source, entry.name), target);
    else
      await symlink(
        source.endsWith(`${sep}@stylexjs`) && entry.name === "unplugin"
          ? compilerRoot
          : resolve(source, entry.name),
        target,
      );
  }
  await mkdir(resolve(destination, "@lenso"), { recursive: true });
  await symlink(resolve(scratch, "packages/styles"), resolve(destination, "@lenso/tokens"));
  await symlink(resolve(scratch, "packages/react"), resolve(destination, "@lenso/ui"));
  await symlink(resolve(scratch, "packages/testing"), resolve(destination, "@lenso/testing"));
  await symlink(
    resolve(scratch, "packages/stylex-build"),
    resolve(destination, "@lenso/stylex-build"),
  );
}
for (const name of [
  "package.json",
  "pnpm-workspace.yaml",
  "pnpm-lock.yaml",
  "tsconfig.base.json",
  "third-party",
])
  await cp(resolve(project, name), resolve(scratch, name), { recursive: true });
for (const name of ["styles", "react", "standard", "testing", "stylex-build"]) {
  await cp(resolve(project, "packages", name), resolve(scratch, "packages", name), {
    recursive: true,
    filter: (path) => !/\/(?:node_modules|dist)(?:\/|$)/.test(path),
  });
}
await cp(
  resolve(project, "packages/storybook/.storybook/main.ts"),
  resolve(scratch, "packages/storybook/.storybook/main.ts"),
);
if (mode === "--baseline") {
  const file = resolve(scratch, "packages/storybook/.storybook/main.ts");
  await writeFile(
    file,
    (await readFile(file, "utf8"))
      .replace('from "@lenso/stylex-build"', 'from "@stylexjs/unplugin"')
      .replace(
        'metadata: [new URL(import.meta.resolve("@lenso/tokens/stylex-rules.json"))],',
        "dev: false, useCSSLayers: false,",
      ),
  );
}
if (experimental) {
  for (const file of [
    "packages/styles/tsdown.config.ts",
    "packages/react/tsdown.config.ts",
    "packages/storybook/.storybook/main.ts",
    "packages/react/vitest.config.ts",
    "packages/testing/src/browser.ts",
    "packages/react/src/components/list-box/validation/vitest.config.ts",
  ]) {
    const path = resolve(scratch, file);
    const source = await readFile(path, "utf8");
    assert(source.includes("useCSSLayers: false,"), `Existing compiler boundary: ${file}`);
    await writeFile(
      path,
      source.replace(
        "useCSSLayers: false,",
        `useCSSLayers: false, legacyDisableLayers: true,${
          mode === "--application-order" ? ' styleResolution: "application-order",' : ""
        }`,
      ),
    );
  }
}
await links(resolve(dependencies, "node_modules"), resolve(scratch, "node_modules"));
await links(
  resolve(originalCompiler, "../.."),
  resolve(scratch, "packages/stylex-build/node_modules"),
);
for (const name of ["styles", "react", "testing", "storybook"])
  await links(
    resolve(dependencies, "packages", name, "node_modules"),
    resolve(scratch, "packages", name, "node_modules"),
  );
const pluginOptions = await pluginOptionsProbe(
  compilerRoot,
  packageRequire("testing"),
  scratch,
  experimental,
);
const tsc = binary(rootRequire, "typescript", "bin/tsc");
for (const name of ["styles", "react"]) {
  const cwd = resolve(scratch, "packages", name);
  if (name === "styles")
    await run(resolve(cwd, "src/components/typography/generate-prose.mjs"), [], cwd);
  await run(
    binary(packageRequire(name), "tsdown", "dist/run.mjs"),
    ["--config", "tsdown.config.ts"],
    cwd,
  );
  await run(
    tsc,
    ["-p", "tsconfig.build.json", "--emitDeclarationOnly", "--noEmit", "false", "--outDir", "dist"],
    cwd,
  );
  await run(
    resolve(cwd, "scripts", name === "styles" ? "copy-css.mjs" : "copy-notices.mjs"),
    [],
    cwd,
  );
}
if (mode === "--packed") {
  const packed = resolve(scratch, "packed");
  await mkdir(packed, { recursive: true });
  await mkdir(resolve(scratch, "source-packages"), { recursive: true });
  for (const [name, archive] of [
    ["stylex-build", "lenso-stylex-build-0.1.0.tgz"],
    ["styles", "lenso-tokens-0.8.0.tgz"],
    ["react", "lenso-ui-0.8.0.tgz"],
  ]) {
    const cwd = resolve(scratch, "packages", name);
    await exec(resolve(dirname(process.execPath), "pnpm"), ["pack", "--pack-destination", packed], {
      cwd,
      env: { ...process.env, COREPACK_ENABLE_NETWORK: "0" },
    });
    await rename(cwd, resolve(scratch, "source-packages", name));
    await mkdir(cwd);
    await exec("tar", ["-xzf", resolve(packed, archive), "-C", cwd, "--strip-components=1"]);
    await links(
      name === "stylex-build"
        ? resolve(originalCompiler, "../..")
        : resolve(dependencies, "packages", name, "node_modules"),
      resolve(cwd, "node_modules"),
    );
  }
}
const consumer = resolve(scratch, "packages/testing/tests/compiled-priority");
await writeFile(
  resolve(consumer, "index.html"),
  '<div id="root"></div><script type="module" src="./consumer.tsx"></script>',
);
await writeFile(
  resolve(consumer, "tsconfig.json"),
  JSON.stringify({
    extends: "../../../standard/tsconfig/react.json",
    compilerOptions: { types: ["node", "react", "vite/client"] },
    include: ["consumer.tsx", "vite.config.ts"],
  }),
);
await run(tsc, ["-p", "tsconfig.json", "--noEmit"], consumer);
await run(binary(packageRequire("testing"), "vite", "bin/vite.js"), ["build"], consumer);
const require = packageRequire("testing");
const playwright = await import(pathToFileURL(require.resolve("playwright")));
const { chromium } = playwright.default ?? playwright;
const staticRoot = resolve(consumer, "dist");
await cp(resolve(scratch, "packages/styles/dist"), resolve(staticRoot, "package"), {
  recursive: true,
});
const server = createServer(async (request, response) => {
  try {
    const file = resolve(staticRoot, `.${new URL(request.url, "http://localhost").pathname}`);
    assert(file.startsWith(staticRoot + sep));
    const target = file === staticRoot + sep ? resolve(file, "index.html") : file;
    response.setHeader(
      "Content-Type",
      { ".html": "text/html", ".js": "application/javascript", ".css": "text/css" }[
        extname(target)
      ] ?? "application/octet-stream",
    );
    response.end(await readFile(target));
  } catch {
    response.writeHead(404).end();
  }
});
await new Promise((done) => server.listen(0, "127.0.0.1", done));
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ reducedMotion: "reduce" });
const errors = [];
page.on("pageerror", (error) => errors.push(error.message));
const results = [];
try {
  await page.goto(`http://127.0.0.1:${server.address().port}/index.html`);
  await page.getByRole("checkbox", { name: "Priority checkbox" }).waitFor();
  assert.equal(
    await page
      .getByRole("checkbox", { name: "Priority checkbox" })
      .getAttribute("data-ref-attached"),
    "true",
    "Native ref reaches the compiled package element",
  );
  const sample = async (label, checked) => {
    const value = await page.locator("svg").evaluate((node) => {
      const matched = [];
      const visit = (rules) => {
        for (const rule of rules) {
          if (rule.selectorText && node.matches(rule.selectorText) && rule.style.opacity)
            matched.push({ selector: rule.selectorText, opacity: rule.style.opacity });
          if (rule.cssRules) visit(rule.cssRules);
        }
      };
      for (const sheet of document.styleSheets) visit(sheet.cssRules);
      const bounds = node.getBoundingClientRect();
      return {
        opacity: getComputedStyle(node).opacity,
        width: bounds.width,
        height: bounds.height,
        matched,
      };
    });
    const radio = await page
      .getByRole("radiogroup", { name: "Priority radios" })
      .locator('[data-slot="radio-indicator"]')
      .evaluateAll((nodes) =>
        nodes.map((node) => {
          const matched = [];
          const visit = (rules) => {
            for (const rule of rules) {
              if (
                rule.selectorText?.endsWith(":before") &&
                node.matches(rule.selectorText.replace(/::?before$/, "")) &&
                rule.style.scale
              )
                matched.push({ selector: rule.selectorText, scale: rule.style.scale });
              if (rule.cssRules) visit(rule.cssRules);
            }
          };
          for (const sheet of document.styleSheets) visit(sheet.cssRules);
          return {
            checked: node.hasAttribute("data-checked"),
            scale: getComputedStyle(node, "::before").scale,
            width: node.getBoundingClientRect().width,
            matched,
          };
        }),
      );
    const native = await page.locator('[data-slot="checkbox-control"]').evaluate((node) => ({
      opacity: getComputedStyle(node, "::before").opacity,
      scale: getComputedStyle(node, "::before").scale,
    }));
    const rootOpacity = await page
      .getByRole("checkbox")
      .evaluate((node) => getComputedStyle(node).opacity);
    const nativeRadioScale = await page
      .getByRole("radiogroup", { name: "Native radios" })
      .locator('[data-slot="radio-indicator"]')
      .evaluate((node) => getComputedStyle(node, "::before").scale);
    results.push({ label, checked, ...value, radio, native, rootOpacity, nativeRadioScale });
  };
  await sample("unchecked", false);
  const checkbox = page.getByRole("checkbox", { name: "Priority checkbox" });
  await checkbox.focus();
  await page.keyboard.press("Space");
  assert.equal(await checkbox.isChecked(), true, "Native checkbox keyboard state");
  await sample("checked", true);
  await page.getByRole("radio", { name: "First radio" }).focus();
  await page.keyboard.press("ArrowDown");
  assert.equal(await page.getByRole("radio", { name: "Second radio" }).isChecked(), true);
  await sample("radio keyboard changed", true);
  const local = await page.getByTestId("local-precedence").evaluate((node) => {
    const style = getComputedStyle(node);
    return {
      width: node.getBoundingClientRect().width,
      opacity: style.opacity,
      marginLeft: style.marginLeft,
      marginRight: style.marginRight,
    };
  });
  const samplePadding = () =>
    page.getByTestId("package-padding").evaluate((node) => {
      const matched = [];
      const visit = (rules) => {
        for (const rule of rules) {
          if (
            rule.selectorText &&
            node.matches(rule.selectorText) &&
            (rule.style.padding || rule.style.paddingTop)
          )
            matched.push({ selector: rule.selectorText, style: rule.style.cssText });
          if (rule.cssRules) visit(rule.cssRules);
          if (rule.styleSheet) visit(rule.styleSheet.cssRules);
        }
      };
      for (const sheet of document.styleSheets) visit(sheet.cssRules);
      return {
        paddingTop: getComputedStyle(node).paddingTop,
        inline: node.style.cssText,
        packageStyle: JSON.parse(node.dataset.packageStyle),
        consumerStyle: JSON.parse(node.dataset.consumerStyle),
        matched,
      };
    });
  const sampleResponsive = async () => {
    const font = () =>
      page.getByTestId("responsive-font").evaluate((node) => getComputedStyle(node).fontSize);
    await page.setViewportSize({ width: 1000, height: 720 });
    const desktop = await font();
    await page.setViewportSize({ width: 600, height: 720 });
    const mobile = await font();
    await page.setViewportSize({ width: 1000, height: 720 });
    return { desktop, mobile };
  };
  const padding = { beforeLatePackageCSS: await samplePadding() };
  const responsive = { beforeLatePackageCSS: await sampleResponsive() };
  await page.evaluate(
    () =>
      new Promise((done, reject) => {
        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = "/package/styles.css";
        link.onload = done;
        link.onerror = reject;
        document.head.append(link);
      }),
  );
  padding.afterLatePackageCSS = await samplePadding();
  responsive.afterLatePackageCSS = await sampleResponsive();
  await sample("late package CSS", true);
  const directional = await page.locator("[data-padding-contract]").evaluateAll((nodes) =>
    nodes.map((node) => {
      const style = getComputedStyle(node);
      return {
        contract: node.dataset.paddingContract,
        direction: style.direction,
        top: style.paddingTop,
        left: style.paddingLeft,
        right: style.paddingRight,
        bottom: style.paddingBottom,
      };
    }),
  );
  await page.evaluate(() => {
    const link = document.querySelector('link[href="/package/styles.css"]');
    document.head.prepend(link);
  });
  padding.reverseOrder = await samplePadding();
  responsive.reverseOrder = await sampleResponsive();
  await sample("reverse stylesheet order", true);
  const versions = {};
  for (const name of ["@stylexjs/stylex", "@stylexjs/unplugin", "vite", "playwright"]) {
    let directory = dirname(require.resolve(name));
    for (;;) {
      try {
        const manifest = JSON.parse(await readFile(resolve(directory, "package.json")));
        if (manifest.name === name) {
          versions[name] = manifest.version;
          break;
        }
      } catch {}
      const parent = dirname(directory);
      assert.notEqual(parent, directory, `Find installed ${name} version`);
      directory = parent;
    }
  }
  const configuration = {};
  const sourceHashes = {};
  for (const [name, file] of [
    ["tokens", "packages/styles/tsdown.config.ts"],
    ["ui", "packages/react/tsdown.config.ts"],
    ["consumer", "packages/storybook/.storybook/main.ts"],
  ]) {
    const archived =
      mode === "--packed" && name !== "consumer"
        ? file.replace("packages/", "source-packages/")
        : file;
    configuration[name] = await readFile(resolve(scratch, archived), "utf8");
    sourceHashes[file] = createHash("sha256").update(configuration[name]).digest("hex");
  }
  for (const file of [
    "packages/stylex-build/src/index.mjs",
    "packages/stylex-build/src/metadata.mjs",
    "packages/stylex-build/src/adapters.mjs",
    "packages/testing/tests/compiled-priority/consumer.tsx",
  ])
    sourceHashes[file] = createHash("sha256")
      .update(await readFile(resolve(scratch, file)))
      .digest("hex");
  const rawArtifact = JSON.parse(
    await readFile(resolve(scratch, "packages/styles/dist/stylex-rules.json"), "utf8"),
  );
  const evidence = {
    node: process.versions.node,
    patchApplied: experimental,
    styleResolution: mode === "--application-order" ? "application-order" : "property-specificity",
    pluginOptions,
    versions: { ...versions, ...compiler.versions },
    configuration,
    sourceHashes,
    toolingVersion: "0.1.0",
    packedConsumption: mode === "--packed",
    rawArtifact: {
      format: rawArtifact.format,
      version: rawArtifact.version,
      compilerVersion: rawArtifact.compilerVersion,
      compileMode: rawArtifact.compileMode,
      rulesSha256: rawArtifact.rulesSha256,
      ruleCount: rawArtifact.rules.length,
    },
    errors,
    local,
    padding,
    responsive,
    directional,
    results,
  };
  await writeFile(resolve(scratch, "results.json"), JSON.stringify(evidence, null, 2));
  console.log(
    JSON.stringify(
      { versions: evidence.versions, errors, local, padding, responsive, directional, results },
      null,
      2,
    ),
  );
  assert.equal(errors.length, 0);
  assert.deepEqual(
    Object.values(padding).map((value) => value.paddingTop),
    ["29px", "29px", "29px"],
    "Dynamic consumer longhand must override package shorthand in either stylesheet order",
  );
  for (const value of Object.values(responsive))
    assert.deepEqual(
      value,
      { desktop: "14px", mobile: "16px" },
      "Responsive sub-bucket precedence",
    );
  for (const value of directional) {
    assert.equal(value.top, "24px");
    assert.equal(value.bottom, "24px");
    const logicalOnly = value.contract === "logical";
    const rtl = value.direction === "rtl";
    assert.equal(value.left, logicalOnly ? (rtl ? "11px" : "37px") : "17px");
    assert.equal(value.right, logicalOnly ? (rtl ? "37px" : "11px") : "23px");
  }
  assert.deepEqual(local, { width: 20, opacity: "0.75", marginLeft: "4px", marginRight: "10px" });
  for (const result of results) {
    assert.equal(result.rootOpacity, "0.75", "Package xstyle-last property precedence");
    assert.equal(result.nativeRadioScale, "0.4286", "Native package checked pseudo-element");
    assert.deepEqual(
      result.native,
      { opacity: result.checked ? "1" : "0", scale: result.checked ? "1" : "0.7" },
      "Native package checked checkbox appearance",
    );
    assert.equal(result.width, 10);
    assert.equal(result.height, 10);
    assert(result.radio.every((radio) => radio.width > 0));
  }
  assert.deepEqual(
    results.map((result) => ({
      opacity: result.opacity,
      scale: result.radio.map((radio) => radio.scale),
    })),
    results.map((result) => ({
      opacity: result.checked ? "1" : "0",
      scale: result.radio.map((radio) => (radio.checked ? "0.5" : "1")),
    })),
    "Checked consumer SVG opacity and Radio pseudo-element scale must override package defaults",
  );
} finally {
  await browser.close();
  await new Promise((done) => server.close(done));
}
