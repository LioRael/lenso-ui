import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { mkdtemp, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { createServer } from "node:http";
import { createRequire } from "node:module";
import { dirname, extname, join, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";
import { chromium } from "playwright";
import { build } from "vite";
import type stylex from "@lenso/stylex-build";
import { legalPackages, validateLegalPackage } from "../../../scripts/legal-attribution.ts";

const workspace = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const run = promisify(execFile);
const directory = await mkdtemp(
  join(workspace, "packages/testing/node_modules/.installed-consumer-"),
);
const require = createRequire(import.meta.url);
const version = (name: string): string =>
  (require(`${name}/package.json`) as { version: string }).version;

try {
  for (const name of ["styles", "react", "stylex-build"]) {
    // Pack existing build outputs; no package builds or workspace dependency links.
    await run("pnpm", ["pack", "--pack-destination", directory, "--ignore-scripts"], {
      cwd: resolve(workspace, "packages", name),
    });
  }
  const tarballs = (await readdir(directory)).filter((name) => name.endsWith(".tgz"));
  assert.equal(tarballs.length, 3);
  const packages = Object.fromEntries(
    tarballs.map((file) => {
      const name = file.startsWith("lenso-ui-")
        ? "@lenso/ui"
        : file.startsWith("lenso-tokens-")
          ? "@lenso/tokens"
          : "@lenso/stylex-build";
      return [name, `file:./${file}`];
    }),
  );
  await writeFile(
    join(directory, "package.json"),
    JSON.stringify({
      name: "lenso-installed-consumer",
      private: true,
      type: "module",
      dependencies: {
        ...packages,
        react: version("react"),
        "react-dom": version("react-dom"),
        "@stylexjs/stylex": version("@stylexjs/stylex"),
        "@types/react": version("@types/react"),
        "@types/react-dom": version("@types/react-dom"),
        typescript: version("typescript"),
      },
    }),
  );
  // pnpm appends release-age exclusions for new dependencies; JSON-in-YAML is not editable.
  await writeFile(
    join(directory, "pnpm-workspace.yaml"),
    [
      "packages:",
      '  - "."',
      "overrides:",
      ...Object.entries(packages).map(
        ([name, specifier]) => `  ${JSON.stringify(name)}: ${JSON.stringify(specifier)}`,
      ),
      "",
    ].join("\n"),
  );
  await run("pnpm", ["install", "--prefer-offline", "--ignore-scripts"], { cwd: directory });
  const installed = createRequire(join(directory, "package.json"));
  const specifiers = [
    "@lenso/ui",
    "@lenso/ui/button",
    "@lenso/ui/hooks",
    "@lenso/ui/icons",
    "@lenso/tokens/styles.css",
    "@lenso/tokens/button",
    "@lenso/tokens/stylex-rules.json",
    "@lenso/stylex-build",
    "react",
    "react-dom/server",
  ];
  // ESM-only exports must be resolved with import conditions from the installation.
  const resolved = await run(
    process.execPath,
    [
      "--input-type=module",
      "--eval",
      `console.log(JSON.stringify(Object.fromEntries(${JSON.stringify(specifiers)}.map(id => [id, import.meta.resolve(id)]))))`,
    ],
    { cwd: directory },
  );
  const urls: Record<string, string> = JSON.parse(resolved.stdout);
  const installedImport = (specifier: string): string => {
    const url = urls[specifier];
    assert(url, `Missing ESM resolution for ${specifier}`);
    assert(
      fileURLToPath(url).startsWith(directory + sep),
      `${specifier} must resolve from installation`,
    );
    return url;
  };
  for (const specifier of specifiers) {
    await readFile(fileURLToPath(installedImport(specifier)));
  }
  const packageRoots: Record<string, URL> = {
    react: new URL("../", installedImport("@lenso/ui")),
    styles: new URL("../", installedImport("@lenso/tokens/styles.css")),
    "stylex-build": new URL("../", installedImport("@lenso/stylex-build")),
  };
  for (const entry of legalPackages) {
    await validateLegalPackage(packageRoots[entry.directory]!, entry);
  }
  await writeFile(
    join(directory, "index.html"),
    '<html><body><div id="root"></div><script type="module" src="/main.tsx"></script></body></html>',
  );
  await writeFile(
    join(directory, "main.tsx"),
    `
import {createRoot} from "react-dom/client";
import {Button, Modal, ThemeScope} from "@lenso/ui";
import {Button as SubpathButton} from "@lenso/ui/button";
import * as stylex from "@stylexjs/stylex";
import "@lenso/tokens/styles.css";
const styles = stylex.create({width: (value: number) => ({width: value})});
createRoot(document.getElementById("root")!).render(
  <ThemeScope theme="dark"><Modal.Root><Modal.Trigger render={<Button xstyle={styles.width(180)} />}>Open installed modal</Modal.Trigger>
    <Modal.Portal><Modal.Backdrop/><Modal.Viewport><Modal.Popup><Modal.Title>Installed package dialog</Modal.Title>
      <Modal.Close render={<SubpathButton />}>Close installed modal</Modal.Close>
    </Modal.Popup></Modal.Viewport></Modal.Portal>
  </Modal.Root></ThemeScope>);
`,
  );
  await writeFile(join(directory, "css.d.ts"), 'declare module "*.css";\n');
  await writeFile(
    join(directory, "tsconfig.json"),
    JSON.stringify({
      compilerOptions: {
        jsx: "react-jsx",
        module: "ESNext",
        moduleResolution: "Bundler",
        target: "ES2022",
        strict: true,
        noEmit: true,
        skipLibCheck: true,
      },
      include: ["main.tsx", "css.d.ts"],
    }),
  );
  await run(
    process.execPath,
    [join(dirname(installed.resolve("typescript/package.json")), "bin/tsc"), "--noEmit"],
    { cwd: directory },
  );
  const { default: installedStylex }: { default: typeof stylex } = await import(
    installedImport("@lenso/stylex-build")
  );
  await build({
    root: directory,
    configFile: false,
    logLevel: "error",
    plugins: [
      installedStylex.vite({
        metadata: [new URL(installedImport("@lenso/tokens/stylex-rules.json"))],
        lightningcssOptions: { exclude: 4 },
        unstable_moduleResolution: { type: "commonJS", rootDir: directory },
      }),
    ],
  });
  // Server rendering must work from the installed exports, without browser globals.
  const ui = await import(installedImport("@lenso/ui"));
  const react = await import(installedImport("react"));
  const serverReact = await import(installedImport("react-dom/server"));
  const markup: string = serverReact.renderToString(
    react.createElement(ui.Button, null, "Server action"),
  );
  assert.match(markup, /<button/);
  assert.match(markup, /Server action/);

  const root = join(directory, "dist");
  const mime: Record<string, string> = {
    ".html": "text/html",
    ".js": "text/javascript",
    ".css": "text/css",
  };
  const server = createServer(async (request, response) => {
    const path = new URL(request.url ?? "/", "http://localhost").pathname;
    const file = resolve(root, `.${path === "/" ? "/index.html" : path}`);
    if (!file.startsWith(root + sep)) {
      response.writeHead(403).end();
      return;
    }
    try {
      response.setHeader("Content-Type", mime[extname(file)] ?? "application/octet-stream");
      response.end(await readFile(file));
    } catch {
      response.writeHead(404).end();
    }
  });
  await new Promise<void>((done) => server.listen(0, "127.0.0.1", done));
  const address = server.address();
  assert(address && typeof address !== "string");
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage();
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.goto(`http://127.0.0.1:${address.port}`);
    const trigger = page.getByRole("button", { name: "Open installed modal" });
    await trigger.waitFor();
    assert.equal(await trigger.evaluate((node) => getComputedStyle(node).width), "180px");
    assert.notEqual(await trigger.evaluate((node) => getComputedStyle(node).borderRadius), "0px");
    await page.keyboard.press("Tab");
    assert(await trigger.evaluate((node) => node === document.activeElement));
    await page.keyboard.press("Enter");
    const dialog = page.getByRole("dialog");
    await dialog.waitFor();
    assert.equal(
      await dialog.evaluate((node) => node.closest("[data-theme]")?.getAttribute("data-theme")),
      "dark",
    );
    await page.keyboard.press("Escape");
    await dialog.waitFor({ state: "hidden" });
    assert(await trigger.evaluate((node) => node === document.activeElement));
    assert.deepEqual(errors, []);
    console.log(
      "PASS installed tarballs: exports, consumer types, SSR, production CSS, dynamic StyleX, portalled theme and keyboard focus",
    );
  } finally {
    await browser.close();
    await new Promise<void>((done) => server.close(() => done()));
  }
} finally {
  await rm(directory, { recursive: true, force: true });
}
