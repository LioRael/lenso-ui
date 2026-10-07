import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { cp, mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import { createServer } from "node:net";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

// Production-only HTML checks missed dev fallback requests, repaired invalid
// Steps markup and the geometry change when the TOC is absent.
const repository = fileURLToPath(new URL("../../../", import.meta.url));
const root = await mkdtemp(path.join(tmpdir(), "lenso-docs-dev-"));
const socket = createServer();
await new Promise((resolve) => socket.listen(0, "127.0.0.1", resolve));
const port = socket.address().port;
await new Promise((resolve) => socket.close(resolve));
const origin = `http://127.0.0.1:${port}`;
let child;
let browser;
let logs = "";
try {
  for (const folder of ["content", "components"])
    await cp(path.join(repository, "apps/docs-starter", folder), path.join(root, folder), {
      recursive: true,
    });
  await writeFile(
    path.join(root, "docs.config.mjs"),
    'export default { title: "Development regression" };',
  );
  await mkdir(path.join(root, "content"), { recursive: true });
  await writeFile(
    path.join(root, "content", "plain.mdx"),
    "---\ntitle: Plain\n---\n\nA short page without a table of contents.\n",
  );
  await writeFile(
    path.join(root, "content", "outlined.mdx"),
    "---\ntitle: Outlined\n---\n\n## Section\n\nA short page with a table of contents.\n",
  );
  child = spawn(
    process.execPath,
    [path.join(repository, "packages/docs/src/cli.mjs"), "dev", "--port", String(port)],
    {
      cwd: root,
      stdio: ["ignore", "pipe", "pipe"],
    },
  );
  child.stdout.on("data", (data) => {
    logs += data;
  });
  child.stderr.on("data", (data) => {
    logs += data;
  });
  const deadline = Date.now() + 90000;
  while (true) {
    if (child.exitCode !== null) throw new Error(`Development server exited:\n${logs}`);
    try {
      const response = await fetch(origin, { signal: AbortSignal.timeout(2000) });
      if (response.status === 200) break;
    } catch {
      /* Wait only for this owned development server to become ready. */
    }
    if (Date.now() >= deadline)
      throw new Error(`Development server did not become ready:\n${logs}`);
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  const failures = [];
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (
      message.type() === "error" &&
      /hydration|descendant|nested|cannot contain/i.test(message.text())
    )
      errors.push(message.text());
  });
  const metrics = {};
  for (const route of ["/", "/guides/", "/guides/content/", "/outlined/", "/plain/"]) {
    const response = await page.goto(`${origin}${route}`, { waitUntil: "networkidle" });
    if (response.status() !== 200) failures.push(`${route}: HTTP ${response.status()}`);
    metrics[route] = await page.evaluate(() => {
      const main = document.querySelector("main").getBoundingClientRect();
      const article = document.querySelector("#nd-page").getBoundingClientRect();
      const shell = document.querySelector("#nd-notebook-layout");
      return {
        mainX: main.x,
        mainWidth: main.width,
        articleX: article.x,
        articleWidth: article.width,
        columns: getComputedStyle(shell).gridTemplateColumns,
        toc: Boolean(document.querySelector("#nd-toc")),
      };
    });
  }
  console.log("Development page geometry:", JSON.stringify(metrics));
  for (const [route, metric] of Object.entries(metrics))
    if (metric.articleWidth !== 816 || metric.articleX !== 288)
      failures.push(
        `${route}: expected full-frame article x288/width816, received x${metric.articleX}/width${metric.articleWidth}`,
      );
  for (const route of ["/guides/content/", "/plain/"])
    if (metrics[route].articleWidth !== metrics["/outlined/"].articleWidth)
      failures.push(
        `${route}: no-TOC width ${metrics[route].articleWidth} differs from outlined width ${metrics["/outlined/"].articleWidth}`,
      );
  for (const route of [
    "/favicon.ico",
    "/apple-touch-icon.png",
    "/apple-touch-icon-precomposed.png",
    "/missing-page/",
  ]) {
    const status = (await fetch(`${origin}${route}`)).status;
    console.log(route, status);
    if (status !== 404) failures.push(`${route}: expected 404, received ${status}`);
  }
  if (errors.length) failures.push(`Hydration/runtime diagnostics: ${errors.join("\n")}`);
  if (/missing param|Failed to generate static paths/.test(logs))
    failures.push("Missing assets or pages caused static-path errors in dev.");
  assert.deepEqual(failures, []);
  console.log(
    "Development regressions passed: missing assets, Steps hydration and no-TOC geometry.",
  );
} finally {
  if (browser) await browser.close();
  if (child && child.exitCode === null && child.signalCode === null) {
    const exited = new Promise((resolve) => child.once("exit", resolve));
    child.kill("SIGTERM");
    const timeout = setTimeout(() => child.kill("SIGKILL"), 10000);
    await exited;
    clearTimeout(timeout);
  }
  await rm(root, { recursive: true, force: true });
}
