// Runs the canonical demo with real React lifecycle and a controlled transport.
// Native Select/portal/keyboard behavior remains covered by the live collection proofs.
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { readFile, mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

const [sourceFile, dependencyRoot, artifactDirectory] = process.argv.slice(2);
assert(
  sourceFile && dependencyRoot && artifactDirectory,
  "Supply demo source, readonly dependencies and artifacts",
);
const dependencies = resolve(dependencyRoot);
const require = createRequire(resolve(dependencies, "packages/testing/package.json"));
const viteRequire = createRequire(require.resolve("vite"));
const { build } = await import(pathToFileURL(viteRequire.resolve("esbuild")).href);
const { chromium } = require("playwright");
const source = resolve(sourceFile);
const artifacts = resolve(artifactDirectory);
await mkdir(artifacts, { recursive: true });
const bundle = await build({
  stdin: {
    contents: `
      import React from "react";
      import { createRoot } from "react-dom/client";
      import { AsynchronousLoading } from ${JSON.stringify(source)};
      window.root = createRoot(document.getElementById("root"));
      window.root.render(<React.StrictMode><AsynchronousLoading /></React.StrictMode>);
    `,
    resolveDir: dependencies,
    loader: "tsx",
  },
  bundle: true,
  write: false,
  format: "iife",
  jsx: "automatic",
  nodePaths: [
    resolve(dependencies, "apps/docs/node_modules"),
    resolve(dependencies, "node_modules"),
  ],
  plugins: [
    {
      name: "request-lifecycle-boundary",
      setup(plugin) {
        plugin.onResolve({ filter: /^(react(?:\/.*)?|react-dom(?:\/.*)?)$/ }, (args) => ({
          path: require.resolve(args.path),
        }));
        plugin.onResolve(
          { filter: /^(@lenso\/ui|@stylexjs\/stylex|\.\/select-example)$/ },
          (args) => ({ path: args.path, namespace: "boundary" }),
        );
        plugin.onLoad({ filter: /.*/, namespace: "boundary" }, ({ path }) => ({
          loader: "jsx",
          resolveDir: dependencies,
          contents:
            path === "@lenso/ui"
              ? "export function Spinner() { return null; }"
              : path === "@stylexjs/stylex"
                ? "export function props() { return {}; }"
                : `export const exampleStyles = {};
               export function SelectExample(props) {
                 window.choices = props.choices;
                 return <><output>{props.choices.map(item => item.label).join(",")}</output>{props.footer}</>;
               }`,
        }));
      },
    },
  ],
});
await writeFile(resolve(artifacts, "demo.js"), bundle.outputFiles[0].contents);
const browser = await chromium.launch({
  headless: true,
  ...(process.env.LENSO_BROWSER_EXECUTABLE
    ? { executablePath: process.env.LENSO_BROWSER_EXECUTABLE }
    : {}),
});
try {
  const page = await browser.newPage();
  page.setDefaultTimeout(5000);
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.setContent('<div id="root"></div>');
  await page.evaluate(() => {
    window.requests = [];
    window.fetch = (url, { signal }) =>
      new Promise((respond) => {
        const request = { url, signal };
        window.requests.push(request);
        request.respond = (page) => respond({ ok: true, json: async () => page });
      });
  });
  await page.addScriptTag({ content: bundle.outputFiles[0].text });
  await page.waitForFunction(() => window.requests.length === 2);
  assert.equal(await page.evaluate(() => window.requests[0].signal.aborted), true);
  await page.evaluate(() =>
    window.requests[1].respond({
      next: "https://pokeapi.co/api/v2/pokemon?page=2",
      results: [{ name: "current" }],
    }),
  );
  await page.getByRole("button", { name: "Load more", exact: true }).waitFor();
  await page.evaluate(() =>
    window.requests[0].respond({
      next: null,
      results: [{ name: "stale" }],
    }),
  );
  await page.waitForTimeout(100);
  assert.deepEqual(await page.evaluate(() => window.choices), [
    { value: "current", label: "current" },
  ]);
  assert.equal(
    await page.evaluate(() => window.requests.length),
    2,
    "Cursor commits must not trigger automatic pagination",
  );
  await page.getByRole("button", { name: "Load more", exact: true }).click();
  await page.waitForFunction(() => window.requests.length === 3);
  assert.equal(
    await page.evaluate(() => window.requests[2].url),
    "https://pokeapi.co/api/v2/pokemon?page=2",
  );
  await page.evaluate(() =>
    window.requests[2].respond({ next: null, results: [{ name: "last" }] }),
  );
  await page.waitForFunction(() => window.choices.length === 2);
  assert.equal(await page.getByRole("button", { name: "Load more", exact: true }).count(), 0);
  assert.deepEqual(await page.evaluate(() => window.choices.map((item) => item.value)), [
    "current",
    "last",
  ]);
  await page.evaluate(() => window.root.unmount());
  assert.deepEqual(errors, []);
  await writeFile(
    resolve(artifacts, "result.json"),
    JSON.stringify(
      {
        source,
        sourceBytes: (await readFile(source)).length,
        passed: [
          "StrictMode cancellation rejects stale response",
          "reactive cursor hides terminal action",
          "stable initial effect does not auto-paginate",
          "event pagination uses current cursor",
        ],
        errors,
      },
      null,
      2,
    ),
  );
  console.log(
    "PASS stale cancellation, reactive cursor, explicit event pagination, no auto-pagination",
  );
} finally {
  await browser.close();
}
