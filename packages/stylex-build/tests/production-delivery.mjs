// node production-delivery.mjs <empty ignored test-results directory> <read-only dependency checkout>
import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { createHash } from "node:crypto";
import { cp, mkdir, readFile, readdir, rename, symlink, writeFile } from "node:fs/promises";
import { createServer } from "node:http";
import { createRequire } from "node:module";
import { dirname, extname, resolve, sep } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { promisify } from "node:util";

const project = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const [outputArgument, providerArgument] = process.argv.slice(2);
assert(outputArgument && providerArgument, "Supply output and dependency checkout");
const output = resolve(outputArgument);
const provider = resolve(providerArgument);
assert(output.startsWith(resolve(project, "test-results") + sep));
assert(!output.startsWith(provider + sep), "Dependency checkout is read-only");
await mkdir(output, { recursive: true });
assert.deepEqual(await readdir(output), [], "Use a fresh durable evidence directory");
const exec = promisify(execFile);
const source = resolve(output, "producer");
await cp(resolve(project, "packages/stylex-build"), source, {
  recursive: true,
  filter: (path) => !path.includes(`${sep}node_modules`),
});
await cp(resolve(project, "pnpm-lock.yaml"), resolve(output, "pnpm-lock.yaml"));
const packed = await exec("npm", ["pack", "--ignore-scripts", "--pack-destination", output], {
  cwd: source,
});
await mkdir(resolve(output, "node_modules/@lenso"), { recursive: true });
await exec("tar", ["-xzf", resolve(output, packed.stdout.trim()), "-C", output]);
await rename(resolve(output, "package"), resolve(output, "node_modules/@lenso/stylex-build"));
async function linkDependencies(from, to) {
  await mkdir(to, { recursive: true });
  for (const entry of await readdir(from, { withFileTypes: true })) {
    if (entry.name.startsWith(".") || entry.name === "@lenso") continue;
    if (entry.name.startsWith("@") && entry.isDirectory())
      await linkDependencies(resolve(from, entry.name), resolve(to, entry.name));
    else
      await symlink(resolve(from, entry.name), resolve(to, entry.name)).catch((error) => {
        if (error.code !== "EEXIST") throw error;
      });
  }
}
await linkDependencies(resolve(provider, "node_modules"), resolve(output, "node_modules"));
await linkDependencies(
  resolve(provider, "packages/stylex-build/node_modules"),
  resolve(output, "node_modules"),
);
await linkDependencies(
  resolve(provider, "packages/testing/node_modules"),
  resolve(output, "node_modules"),
);
const testingRequire = createRequire(resolve(provider, "packages/testing/package.json"));
const docsRequire = createRequire(resolve(provider, "apps/docs/package.json"));
const { build } = await import(pathToFileURL(testingRequire.resolve("vite")));
const { chromium } = testingRequire("playwright");
const { default: stylex } = await import(
  pathToFileURL(resolve(output, "node_modules/@lenso/stylex-build/src/index.mjs"))
);
const browser = await chromium.launch({ headless: true });
const results = [];
async function serve(root, prefix, verify) {
  const server = createServer(async (request, response) => {
    try {
      const url = new URL(request.url, "http://localhost");
      assert(url.pathname.startsWith(prefix));
      const file = resolve(root, decodeURIComponent(url.pathname.slice(prefix.length)));
      assert(file.startsWith(root + sep));
      response.setHeader(
        "Content-Type",
        { ".css": "text/css", ".js": "text/javascript", ".html": "text/html" }[extname(file)] ??
          "application/octet-stream",
      );
      response.end(await readFile(file));
    } catch {
      response.statusCode = 404;
      response.end();
    }
  });
  await new Promise((done) => server.listen(0, "127.0.0.1", done));
  const page = await browser.newPage();
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  try {
    await verify(page, `http://127.0.0.1:${server.address().port}${prefix}`);
    assert.deepEqual(errors, []);
  } finally {
    await page.close();
    await new Promise((done) => server.close(done));
  }
}
async function fixture(root, ordinaryCss) {
  await mkdir(resolve(root, "pages"), { recursive: true });
  await writeFile(resolve(root, "theme.css"), ":root{--theme:1}");
  await writeFile(resolve(root, "lazy.css"), ".lazy{color:pink}");
  await writeFile(
    resolve(root, "lazy.js"),
    `${ordinaryCss ? "import './lazy.css';" : ""} import raw from './styles.js?raw'; window.raw=raw;`,
  );
  await writeFile(
    resolve(root, "styles.js"),
    "import * as stylex from '@stylexjs/stylex'; export const s=stylex.create({root:{color:'rgb(12, 34, 56)'}});",
  );
  for (const [name, color] of [
    ["a", "red"],
    ["b", "blue"],
  ]) {
    await writeFile(resolve(root, `${name}.css`), `.${name}{border:1px solid ${color}}`);
    await writeFile(
      resolve(root, name === "a" ? "a.html" : "pages/b.html"),
      `<html><head></head><body><div id="root"></div><div id="query"></div><script type="module" src="/${name}.js"></script></body></html>`,
    );
    await writeFile(
      resolve(root, `${name}.js`),
      `${ordinaryCss ? `import './theme.css'; import './${name}.css';` : ""}
       import * as stylex from '@stylexjs/stylex'; import {s as query} from './styles.js';
       const s=stylex.create({root:{color:'${color}'}});
       document.getElementById('root').className=stylex.props(s.root).className;
       document.getElementById('query').className=stylex.props(query.root).className;
       window.loadLazy=()=>import('./lazy.js');`,
    );
  }
}
async function verifyPage(page, url, color, theme) {
  await page.goto(url);
  assert.equal(await page.locator("#root").evaluate((node) => getComputedStyle(node).color), color);
  assert.equal(
    await page.locator("#query").evaluate((node) => getComputedStyle(node).color),
    "rgb(12, 34, 56)",
  );
  if (theme)
    assert.equal(
      await page.evaluate(() =>
        getComputedStyle(document.documentElement).getPropertyValue("--theme"),
      ),
      "1",
    );
  await page.evaluate(() => window.loadLazy());
  assert.match(await page.evaluate(() => window.raw), /@stylexjs\/stylex/);
  assert.equal(await page.locator("#root").evaluate((node) => getComputedStyle(node).color), color);
  return page.evaluate(() => [...document.styleSheets].map((sheet) => sheet.href));
}
try {
  for (const [name, base, ordinary] of [
    ["multipage-base", "/nested/", true],
    ["multipage-relative", "./", true],
    ["source-only", "/", false],
  ]) {
    const root = resolve(output, name);
    await fixture(root, ordinary);
    await build({
      root,
      configFile: false,
      base,
      logLevel: "warn",
      plugins: [stylex.vite({ sourceOnly: true })],
      build: {
        minify: false,
        rolldownOptions: {
          input: { a: resolve(root, "a.html"), b: resolve(root, "pages/b.html") },
        },
      },
    });
    const assets = await readdir(resolve(root, "dist/assets"));
    assert.equal(assets.filter((name) => /^stylex.*\.css$/.test(name)).length, 1);
    const prefix = base === "/nested/" ? base : "/";
    await serve(resolve(root, "dist"), prefix, async (page, origin) => {
      const a = await verifyPage(page, `${origin}a.html`, "rgb(255, 0, 0)", ordinary);
      const b = await verifyPage(page, `${origin}pages/b.html`, "rgb(0, 0, 255)", ordinary);
      const shared = a.find((href) => /\/stylex[^/]*\.css$/.test(href));
      assert(shared && b.includes(shared), "Both documents load the same hashed complete union");
      results.push({ name, a, b });
    });
  }

  const root = resolve(output, "webpack");
  await fixture(root, true);
  const wp = docsRequire("next/dist/compiled/webpack/webpack");
  const { default: MiniCssExtractPlugin } = await import(
    pathToFileURL(docsRequire.resolve("next/dist/compiled/mini-css-extract-plugin"))
  );
  const compiler = wp.webpack({
    name: "client",
    context: root,
    mode: "production",
    entry: { a: "./a.js", b: "./b.js" },
    output: { path: resolve(root, "dist"), filename: "[name].[contenthash].js", publicPath: "/" },
    optimization: { minimize: false },
    module: {
      rules: [
        {
          test: /\.css$/,
          use: [
            MiniCssExtractPlugin.loader,
            {
              loader: docsRequire.resolve("next/dist/build/webpack/loaders/css-loader/src"),
              options: {
                postcss: () => ({
                  postcss: createRequire(docsRequire.resolve("next/package.json"))("postcss"),
                }),
              },
            },
          ],
        },
        {
          resourceQuery: /raw/,
          type: "asset/source",
        },
      ],
    },
    plugins: [
      {
        apply(compiler) {
          compiler.hooks.compilation.tap("loader-trace-context", (compilation) => {
            wp.webpack.NormalModule.getCompilationHooks(compilation).loader.tap(
              "loader-trace-context",
              (context) => {
                context.currentTraceSpan = {
                  traceChild() {
                    return this;
                  },
                  traceAsyncFn(fn) {
                    return fn();
                  },
                  setAttribute() {},
                };
              },
            );
          });
        },
      },
      new MiniCssExtractPlugin({ filename: "[name].[contenthash].css" }),
      stylex.webpack({ sourceOnly: true }),
    ],
  });
  try {
    const stats = await new Promise((done, reject) =>
      compiler.run((error, value) => (error ? reject(error) : done(value))),
    );
    assert(!stats.hasErrors(), stats.toString({ all: false, errors: true }));
    for (const [name, entry] of stats.compilation.entrypoints) {
      const files = entry.getFiles();
      await writeFile(
        resolve(root, `dist/${name}.html`),
        `<html><head>${files
          .filter((file) => file.endsWith(".css"))
          .map((file) => `<link rel="stylesheet" href="/${file}">`)
          .join("")}</head><body><div id="root"></div><div id="query"></div>${files
          .filter((file) => file.endsWith(".js"))
          .map((file) => `<script src="/${file}"></script>`)
          .join("")}</body></html>`,
      );
    }
    await serve(resolve(root, "dist"), "/", async (page, origin) => {
      const a = await verifyPage(page, `${origin}a.html`, "rgb(255, 0, 0)", true);
      const b = await verifyPage(page, `${origin}b.html`, "rgb(0, 0, 255)", true);
      results.push({ name: "packed-webpack-multientry", a, b });
    });
  } finally {
    await new Promise((done, reject) =>
      compiler.close((error) => (error ? reject(error) : done())),
    );
  }
  const hashes = {};
  for (const file of ["index.mjs", "adapters.mjs", "metadata.mjs"]) {
    const current = await readFile(resolve(project, "packages/stylex-build/src", file));
    const packed = await readFile(resolve(output, "node_modules/@lenso/stylex-build/src", file));
    assert.deepEqual(packed, current);
    hashes[file] = createHash("sha256").update(current).digest("hex");
  }
  await writeFile(
    resolve(output, "results.json"),
    JSON.stringify({ node: process.versions.node, provider, hashes, results }, null, 2),
  );
  console.log(
    "PASS packed Vite multipage/base/relative/sourceOnly/query/lazy and Webpack multientry",
  );
} finally {
  await browser.close();
}
