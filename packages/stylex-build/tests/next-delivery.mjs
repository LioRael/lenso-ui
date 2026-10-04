// Run after production-delivery.mjs: node next-delivery.mjs <its packed evidence directory> <read-only dependency checkout>
import assert from "node:assert/strict";
import { execFile, spawn } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdir, readFile, readdir, rename, rm, symlink, writeFile } from "node:fs/promises";
import { createServer } from "node:http";
import { createRequire } from "node:module";
import { dirname, resolve, sep } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { promisify } from "node:util";

const project = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const [outputArgument, providerArgument] = process.argv.slice(2);
assert(outputArgument && providerArgument);
const output = resolve(outputArgument);
const provider = resolve(providerArgument);
assert(output.startsWith(resolve(project, "test-results") + sep));
assert(!output.startsWith(provider + sep));
const packedRoot = resolve(output, "node_modules/@lenso/stylex-build");
const hashes = {};
for (const file of ["index.mjs", "adapters.mjs", "metadata.mjs"]) {
  const current = await readFile(resolve(project, "packages/stylex-build/src", file));
  assert.deepEqual(await readFile(resolve(packedRoot, "src", file)), current);
  hashes[file] = createHash("sha256").update(current).digest("hex");
}
const docsRequire = createRequire(resolve(provider, "apps/docs/package.json"));
const testingRequire = createRequire(resolve(provider, "packages/testing/package.json"));
const nextCli = docsRequire.resolve("next/dist/bin/next");
assert.equal(docsRequire("next/package.json").version, "16.3.8");
async function dependencies(from, to) {
  await mkdir(to, { recursive: true });
  for (const entry of await readdir(from, { withFileTypes: true })) {
    if (entry.name.startsWith(".") || entry.name === "@lenso") continue;
    if (entry.name.startsWith("@") && entry.isDirectory())
      await dependencies(resolve(from, entry.name), resolve(to, entry.name));
    else
      await symlink(resolve(from, entry.name), resolve(to, entry.name)).catch((error) => {
        if (error.code !== "EEXIST") throw error;
      });
  }
}
await dependencies(resolve(provider, "apps/docs/node_modules"), resolve(output, "node_modules"));
const { default: stylex } = await import(pathToFileURL(resolve(packedRoot, "src/index.mjs")));
const exec = promisify(execFile);
const maps = resolve(output, "maps-producer");
await mkdir(maps);
const producer = stylex.rolldown({ emitMetadata: "rules.json", devMode: "off" });
await producer.buildStart.call({});
const transformed = await producer.transform.call(
  {},
  "import * as stylex from '@stylexjs/stylex'; export const maps=stylex.create({root:{color:'rgb(12,34,56)'}});",
  resolve(maps, "maps.js"),
);
const artifacts = [];
await producer.generateBundle.call({ emitFile: (asset) => artifacts.push(asset) }, {}, {});
await writeFile(resolve(maps, "maps.js"), transformed.code);
await writeFile(
  resolve(maps, "rules.json"),
  artifacts.find((asset) => asset.fileName === "rules.json").source,
);
assert(
  artifacts.some((asset) => asset.fileName === "assets/stylex.css"),
  "Producer standalone CSS remains deliberate",
);
await writeFile(
  resolve(maps, "package.json"),
  JSON.stringify({
    name: "@delivery/maps",
    version: "1.0.0",
    type: "module",
    exports: { ".": "./maps.js", "./rules.json": "./rules.json" },
  }),
);
const tarball = await exec("npm", ["pack", "--ignore-scripts", "--pack-destination", output], {
  cwd: maps,
});
await exec("tar", ["-xzf", resolve(output, tarball.stdout.trim()), "-C", output]);
await mkdir(resolve(output, "node_modules/@delivery"));
await rename(resolve(output, "package"), resolve(output, "node_modules/@delivery/maps"));

const root = resolve(output, "next-app");
await mkdir(root);
const files = {
  "package.json": JSON.stringify({ name: "next-delivery-proof", private: true, type: "module" }),
  "app/server.stylex.js":
    "import * as stylex from '@stylexjs/stylex'; export const server=stylex.create({root:{paddingTop:29}});",
  "app/theme.css": ":root{--theme:1}",
  "app/other.css": ":root{--theme:2}",
  "app/(themed)/layout.jsx":
    "import '../theme.css'; export default function Layout({children}){return <html><body>{children}</body></html>}",
  "app/(unstyled)/layout.jsx":
    "export default function Layout({children}){return <html><body>{children}</body></html>}",
  "app/(themed)/page.jsx": "export {default} from '../../server-page.jsx';",
  "app/(themed)/%5Fescaped/page.jsx": "export {default} from '../../../server-page.jsx';",
  "app/(unstyled)/server/page.jsx": "export {default} from '../../../server-page.jsx';",
  "server-page.jsx":
    "import * as stylex from '@stylexjs/stylex'; import {maps} from '@delivery/maps'; import {server} from './app/server.stylex.js'; export default function Page(){return <div id='probe' {...stylex.props(maps.root,server.root)}>Server-only precompiled styles</div>}",
};
for (const [file, source] of Object.entries(files)) {
  await mkdir(dirname(resolve(root, file)), { recursive: true });
  await writeFile(resolve(root, file), source);
}
function config(inlineCss, customExtensions = false, globalNotFound = false) {
  return `import stylex from '@lenso/stylex-build';
  export default {
    ${customExtensions ? "pageExtensions:['js','jsx','ts','tsx','mdx']," : ""}
    experimental:{cpus:1,inlineCss:${inlineCss},globalNotFound:${globalNotFound}},
    webpack(config){
      config.cache=false;
      config.plugins.push(stylex.webpack({
        metadata:[import.meta.resolve('@delivery/maps/rules.json')],
        sources:[new URL('./app/server.stylex.js',import.meta.url)],
        ...(process.env.STYLEX_TARGET_NONE ? {cssInjectionTarget:()=>false} : {}),
      }));
      if(process.env.STYLEX_BAD_MANIFEST) config.plugins.push({apply(compiler){
        if(compiler.options.name!=='client') return;
        compiler.hooks.thisCompilation.tap('manifest-fault',(compilation)=>{
          compilation.hooks.processAssets.tap({name:'manifest-fault',stage:compiler.webpack.Compilation.PROCESS_ASSETS_STAGE_REPORT-1},()=>{
            const asset=compilation.getAssets().find(asset=>asset.name.endsWith('_client-reference-manifest.js'));
            if(asset) compilation.updateAsset(asset.name,new compiler.webpack.sources.RawSource('unsupported'));
          });
        });
      }});
      return config;
    }
  };`;
}
const environment = { ...process.env, NODE_ENV: "production", NEXT_TELEMETRY_DISABLED: "1" };
async function build(label, expected, extra = {}) {
  await rm(resolve(root, ".next"), { recursive: true, force: true });
  let result;
  try {
    result = await exec(process.execPath, [nextCli, "build", "--webpack"], {
      cwd: root,
      env: { ...environment, ...extra },
      timeout: 120_000,
      maxBuffer: 16 * 1024 * 1024,
    });
  } catch (error) {
    const log = (error.stdout ?? "") + (error.stderr ?? "");
    await writeFile(resolve(output, `${label}.log`), log);
    if (!expected) throw error;
    assert.match(log, expected);
    return;
  }
  await writeFile(resolve(output, `${label}.log`), result.stdout + result.stderr);
  assert(!expected, `${label} must fail closed`);
}
await writeFile(resolve(root, "next.config.mjs"), config(false));
await build(
  "next-sibling-root-rejected",
  /Next route app\/\(unstyled\)\/server\/page cannot reach/,
);
await writeFile(
  resolve(root, "app/(unstyled)/layout.jsx"),
  "import '../other.css'; export default function Layout({children}){return <html><body>{children}</body></html>}",
);
const { chromium } = testingRequire("playwright");
const browser = await chromium.launch({ headless: true });
const results = [];
async function verify(label, customFallback = false) {
  const portProbe = createServer();
  await new Promise((done) => portProbe.listen(0, "127.0.0.1", done));
  const port = portProbe.address().port;
  await new Promise((done) => portProbe.close(done));
  const child = spawn(process.execPath, [nextCli, "start", "-p", String(port), "-H", "127.0.0.1"], {
    cwd: root,
    env: environment,
    stdio: ["ignore", "pipe", "pipe"],
  });
  let log = "";
  child.stdout.on("data", (chunk) => (log += chunk));
  child.stderr.on("data", (chunk) => (log += chunk));
  const origin = `http://127.0.0.1:${port}`;
  try {
    let ready = false;
    for (let attempt = 0; attempt < 100; attempt++) {
      if (child.exitCode !== null) throw new Error(log);
      try {
        if ((await fetch(origin, { signal: AbortSignal.timeout(1000) })).ok) {
          ready = true;
          break;
        }
      } catch {}
      await new Promise((done) => setTimeout(done, 100));
    }
    assert(ready, log);
    const page = await browser.newPage();
    try {
      for (const [route, theme] of [
        ["/", "1"],
        ["/_escaped", "1"],
        ["/server", "2"],
      ]) {
        await page.goto(origin + route);
        const actual = await page.locator("#probe").evaluate((node) => {
          const style = getComputedStyle(node);
          return { color: style.color, paddingTop: style.paddingTop };
        });
        assert.deepEqual(actual, { color: "rgb(12, 34, 56)", paddingTop: "29px" });
        assert.equal(
          await page.evaluate(() =>
            getComputedStyle(document.documentElement).getPropertyValue("--theme"),
          ),
          theme,
        );
        results.push({
          label,
          route,
          actual,
          sheets: await page.evaluate(() => [...document.styleSheets].map((sheet) => sheet.href)),
        });
      }
      const missing = await page.goto(origin + "/absent-route");
      assert.equal(missing.status(), 404, "Native unstyled fallback remains valid");
      if (customFallback) {
        const actual = await page.locator("#probe").evaluate((node) => ({
          color: getComputedStyle(node).color,
          paddingTop: getComputedStyle(node).paddingTop,
        }));
        assert.deepEqual(actual, { color: "rgb(12, 34, 56)", paddingTop: "29px" });
        results.push({
          label,
          route: "/absent-route",
          actual,
          sheets: await page.evaluate(() => [...document.styleSheets].map((sheet) => sheet.href)),
        });
      }
    } finally {
      await page.close();
    }
  } finally {
    if (child.exitCode === null) {
      const stopped = new Promise((done) => child.once("exit", done));
      child.kill("SIGTERM");
      const timeout = setTimeout(() => child.kill("SIGKILL"), 5000);
      await stopped;
      clearTimeout(timeout);
    }
    await writeFile(resolve(output, `${label}-server.log`), log);
  }
}
try {
  await build("next-external-css");
  await verify("external");
  await build("next-target-rejected", /cannot reach the complete StyleX union/, {
    STYLEX_TARGET_NONE: "1",
  });
  await build("next-manifest-rejected", /Unsupported Next route manifest/, {
    STYLEX_BAD_MANIFEST: "1",
  });
  const globalFallback =
    "import Page from '../server-page.jsx'; export default function Fallback(){return <html><body><Page/></body></html>}";
  await writeFile(resolve(root, "app/global-not-found.jsx"), globalFallback);
  await writeFile(resolve(root, "next.config.mjs"), config(false, false, true));
  await build("next-global-fallback-rejected", /Next route app\/_not-found\/page cannot reach/);
  await writeFile(resolve(root, "app/fallback.css"), ":root{--theme:3}");
  await writeFile(
    resolve(root, "app/global-not-found.jsx"),
    `import './fallback.css'; ${globalFallback}`,
  );
  await build("next-global-fallback-css");
  await verify("global-fallback", true);
  await rm(resolve(root, "app/global-not-found.jsx"));
  await writeFile(
    resolve(root, "app/global-error.jsx"),
    "'use client'; export default function Error(){return <html><body>Custom error</body></html>}",
  );
  await writeFile(resolve(root, "next.config.mjs"), config(false));
  await build("next-global-error-rejected", /Custom Next global-error delivery is unsupported/);
  await rm(resolve(root, "app/global-error.jsx"));
  await writeFile(resolve(root, "next.config.mjs"), config(true));
  await build("next-inline-css");
  await verify("inline");
  await writeFile(resolve(root, "next.config.mjs"), config(false, true));
  await build("next-custom-extensions");
  await verify("custom-extensions");
  await writeFile(
    resolve(output, "next-results.json"),
    JSON.stringify({ node: process.versions.node, hashes, results }, null, 2),
  );
  console.log(
    "PASS packed Next 16.3.8 sibling-root fail-closed, SSR maps/sources, encoded routes, inline CSS, custom extensions and native fallback",
  );
} finally {
  await browser.close();
}
