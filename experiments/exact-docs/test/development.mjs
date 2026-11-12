import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { mkdir, mkdtemp, rm, stat, utimes } from "node:fs/promises";
import path from "node:path";
import { startDev } from "../src/server.ts";

const framework = path.resolve(import.meta.dirname, "..");
const require = createRequire(path.resolve(framework, "../../apps/docs/package.json"));
const { chromium } = require(process.env.PLAYWRIGHT_MODULE ?? "playwright");
await mkdir(path.join(framework, ".cache"), { recursive: true });
const root = await mkdtemp(path.join(framework, ".cache/dev-check-"));
let dev, browser;
try {
  const config = { name: "Dev check", theme: "lenso", pages: [{ path: "/", source: "index.md" }] };
  await Bun.write(path.join(root, "docs.json"), JSON.stringify(config));
  await Bun.write(path.join(root, "index.md"), "# Development\n\nInitial document.");
  dev = await startDev(root, 0);
  await dev.ready();
  browser = await chromium.launch();
  const page = await browser.newPage();
  const errors = [];
  page.on("pageerror", (error) => errors.push(String(error)));
  await page.goto(dev.url.href);
  await page.getByRole("heading", { name: "Development", exact: true }).waitFor();
  const assets = path.join(root, ".exact-docs/ui/browser.js");
  assert.ok((await stat(assets)).size > 0);
  await page.getByTestId("docs-appearance").click();
  await page.waitForFunction(() => document.querySelector('[data-theme="dark"]'));

  const originalAssets = (await stat(assets)).mtimeMs;
  await Bun.write(path.join(root, "index.md"), "# Updated automatically\n\nEdited document.");
  await page.getByRole("heading", { name: "Updated automatically", exact: true }).waitFor();
  assert.equal((await stat(assets)).mtimeMs, originalAssets, "Document edits must reuse UI assets");

  await Bun.write(path.join(root, "docs.json"), "{");
  await page.locator("#__docs-error").waitFor();
  assert.equal((await fetch(dev.url)).status, 200, "Failed builds must preserve the last page");
  await Bun.write(path.join(root, "docs.json"), JSON.stringify(config));
  await page.locator("#__docs-error").waitFor({ state: "detached" });

  // Touch real inputs without changing their content. The unit test exercises
  // content edits in isolated package fixtures; this checks the complete pipeline.
  for (const source of ["ui-exact/src/web.ts", "glass/src/refraction.ts"]) {
    const before = (await stat(assets)).mtimeMs;
    const reloaded = page.waitForEvent("framenavigated", { timeout: 90000 });
    const input = path.resolve(framework, "../../packages", source);
    const now = new Date();
    await utimes(input, now, now);
    await reloaded;
    await page.getByRole("heading", { name: "Updated automatically", exact: true }).waitFor();
    assert.ok((await stat(assets)).mtimeMs > before, `${source} must rebuild UI before reload`);
    await page.getByTestId("docs-appearance").click();
    await page.waitForFunction(() => document.querySelector('[data-theme="dark"]'));
  }
  assert.deepEqual(errors, []);
  console.log(
    "Development verified: document reload, UI reuse, build-error recovery, UI/Glass rebuild and browser activation.",
  );
} finally {
  await browser?.close();
  await dev?.stop();
  await rm(root, { recursive: true, force: true });
}
