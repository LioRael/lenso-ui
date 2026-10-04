import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

const [sourceRoot, dependencyRoot, artifactDirectory] = process.argv.slice(2);
assert(
  sourceRoot && dependencyRoot && artifactDirectory,
  "Supply current source, readonly dependencies and artifacts",
);
const root = resolve(sourceRoot);
const dependencies = resolve(dependencyRoot);
const artifacts = resolve(artifactDirectory);
await mkdir(artifacts, { recursive: true });
const require = createRequire(resolve(dependencies, "packages/testing/package.json"));
const viteRequire = createRequire(require.resolve("vite"));
const { build } = await import(pathToFileURL(viteRequire.resolve("esbuild")).href);
const { chromium } = require("playwright");
const bundle = await build({
  stdin: {
    loader: "tsx",
    resolveDir: dependencies,
    contents: `
      import React from "react";
      import { createRoot } from "react-dom/client";
      import { createPortal } from "react-dom";
      import { ThemeScope, useThemePortalContainer } from ${JSON.stringify(resolve(root, "packages/react/src/utils/theme-scope.tsx"))};
      import { useCollectionWindow } from ${JSON.stringify(resolve(root, "packages/react/src/components/list-box/windowed.tsx"))};
      function Portal() {
        const host = useThemePortalContainer();
        return host && createPortal(<div id="surface" style={{ background: "var(--consumer-color)", position: "fixed", left: 32, top: 32, width: 64, height: 64 }} />, host);
      }
      const options = { height: 60, rowHeight: 20, overscan: 3 };
      function Window() {
        const node = React.useRef(null);
        const collection = useCollectionWindow(100, options, node);
        return <>
          <button id="down" onClick={() => collection.scrollTo(50)}>Down</button>
          <button id="up" onClick={() => collection.scrollTo(0)}>Up</button>
          <output id="indices">{collection.indices.join(",")}</output>
          <div id="viewport" ref={node} style={{ height: 60, overflow: "auto" }}>
            {Array.from({ length: 100 }, (_, index) => <div key={index} data-window-index={index} style={{ height: 20 }}>
              <button data-slot="list-box-item" id={"row-" + index} style={{ height: 20, boxSizing: "border-box", verticalAlign: "top" }}>{index}</button>
            </div>)}
          </div>
        </>;
      }
      window.root = createRoot(document.getElementById("root"));
      window.root.render(<React.StrictMode>
        <ThemeScope id="scope" theme="dark" style={{ "--consumer-color": "rgb(10, 20, 30)", width: 1, height: 1, overflow: "hidden", transform: "translateX(12px)", direction: "rtl", fontFamily: "monospace" }}><Portal /></ThemeScope>
        <Window />
      </React.StrictMode>);
    `,
  },
  bundle: true,
  write: false,
  format: "iife",
  jsx: "automatic",
  plugins: [
    {
      name: "installed-react",
      setup(plugin) {
        plugin.onResolve({ filter: /^(react(?:\/.*)?|react-dom(?:\/.*)?)$/ }, (args) => ({
          path: require.resolve(args.path),
        }));
        plugin.onResolve({ filter: /^@stylexjs\/stylex$/ }, () => ({
          path: "stylex",
          namespace: "boundary",
        }));
        plugin.onLoad({ filter: /.*/, namespace: "boundary" }, () => ({
          contents: "export function props() { return {}; }",
        }));
      },
    },
  ],
});
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
  await page.addScriptTag({ content: bundle.outputFiles[0].text });
  await page.locator("#surface").waitFor();
  assert.deepEqual(
    await page.locator("#surface").evaluate((node) => ({
      background: getComputedStyle(node).backgroundColor,
      direction: getComputedStyle(node).direction,
      font: getComputedStyle(node).fontFamily,
      theme: node.parentElement.dataset.theme,
      escaped: !document.getElementById("scope").contains(node),
      hit: document.elementFromPoint(40, 40) === node,
    })),
    {
      background: "rgb(10, 20, 30)",
      direction: "rtl",
      font: "monospace",
      theme: "dark",
      escaped: true,
      hit: true,
    },
  );
  await page.locator("#scope").evaluate((node) => {
    node.style.setProperty("--consumer-color", "rgb(30, 40, 50)");
    node.dataset.theme = "light";
    node.style.direction = "ltr";
  });
  await page.waitForFunction(() => {
    const node = document.getElementById("surface");
    return (
      getComputedStyle(node).backgroundColor === "rgb(30, 40, 50)" &&
      node.parentElement.dataset.theme === "light" &&
      getComputedStyle(node).direction === "ltr"
    );
  });
  await page.locator("#down").click();
  await page.waitForFunction(() => document.activeElement.id === "row-50");
  assert.equal(await page.locator("#viewport").evaluate((node) => node.scrollTop), 960);
  assert.ok((await page.locator("#indices").textContent()).split(",").includes("50"));
  await page.locator("#up").click();
  await page.waitForFunction(() => document.activeElement.id === "row-0");
  assert.equal(await page.locator("#viewport").evaluate((node) => node.scrollTop), 0);
  await page.evaluate(() => window.root.unmount());
  assert.equal(await page.locator('[data-slot="theme-portal-host"]').count(), 0);
  assert.deepEqual(errors, []);
  await writeFile(
    resolve(artifacts, "dom-result.json"),
    JSON.stringify(
      {
        passed: [
          "StrictMode portal host cleanup",
          "portal escapes clipping",
          "live consumer variables/theme/direction/font synchronization",
          "event scroll down/up and focused row",
        ],
        errors,
      },
      null,
      2,
    ),
  );
  console.log(
    "PASS actual portal DOM synchronization and event-time collection viewport scrolling",
  );
} finally {
  await browser.close();
}
