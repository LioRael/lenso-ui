// node critical-consumers.mjs <built acceptance mirror> <read-only dependency workspace>
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { createServer } from "node:http";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { dirname, extname, resolve, sep } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { setTimeout as delay } from "node:timers/promises";

const project = resolve(dirname(fileURLToPath(import.meta.url)), "../../../..");
const [mirrorArgument, dependenciesArgument] = process.argv.slice(2);
const mirror = resolve(mirrorArgument);
assert(mirror.startsWith(resolve(project, "test-results") + sep));
const require = createRequire(resolve(dependenciesArgument, "packages/testing/package.json"));
const playwrightFile = resolve(dirname(require.resolve("playwright/package.json")), "index.mjs");
const playwright = await import(pathToFileURL(playwrightFile));
const { chromium } = playwright.default ?? playwright;
const report = { steps: [], serverOnlyStyles: [] };
const output = resolve(mirror, "test-results/critical-consumers");
await mkdir(output, { recursive: true });
const staticRoot = resolve(mirror, "packages/storybook/storybook-static");
const server = createServer(async (request, response) => {
  const pathname = new URL(request.url, "http://localhost").pathname;
  const file = resolve(staticRoot, `.${pathname === "/" ? "/index.html" : pathname}`);
  if (!file.startsWith(staticRoot + sep)) return response.writeHead(403).end();
  try {
    response.setHeader(
      "Content-Type",
      {
        ".html": "text/html",
        ".js": "text/javascript",
        ".css": "text/css",
        ".json": "application/json",
      }[extname(file)] ?? "application/octet-stream",
    );
    response.end(await readFile(file));
  } catch {
    response.writeHead(404).end();
  }
});
await new Promise((done) => server.listen(0, "127.0.0.1", done));
const sbUrl = `http://127.0.0.1:${server.address().port}`;
const reservation = createServer();
await new Promise((done) => reservation.listen(0, "127.0.0.1", done));
const port = reservation.address().port;
await new Promise((done) => reservation.close(done));
const nextRequire = createRequire(resolve(dependenciesArgument, "apps/docs/package.json"));
const next = resolve(dirname(nextRequire.resolve("next/package.json")), "dist/bin/next");
const docsUrl = `http://127.0.0.1:${port}`;
const env = {
  ...process.env,
  CI: "1",
  NEXT_TELEMETRY_DISABLED: "1",
  LENSO_DOCS_TEST_URL: docsUrl,
  LENSO_CHOICE_URL: sbUrl,
  LENSO_CHOICE_WORKSPACE: mirror,
  PLAYWRIGHT_MODULE: playwrightFile,
  DELTA_SCRATCH_DIR: output,
  LENSO_LOCALE_PROOF_OUTPUT: resolve(output, "locales"),
  LENSO_LOCALE_SCENARIOS: "button-basic,form-basic,select-default,calendar-basic",
};
const child = spawn(
  process.execPath,
  [next, "start", "--hostname", "127.0.0.1", "--port", String(port)],
  {
    cwd: resolve(mirror, "apps/docs"),
    env,
    stdio: "inherit",
  },
);
async function run(name, file, args = [], cwd = mirror) {
  const code = await new Promise((done, reject) => {
    const task = spawn(process.execPath, [file, ...args], { cwd, env, stdio: "inherit" });
    task.on("error", reject);
    task.on("exit", done);
  });
  report.steps.push({ name, code });
  await writeFile(resolve(output, "report.json"), JSON.stringify(report, null, 2));
  assert.equal(code, 0, `${name} failed`);
}
try {
  let ready = false;
  for (let attempt = 0; attempt < 100; attempt++) {
    try {
      ready = (await fetch(`${docsUrl}/robots.txt`)).ok;
      if (ready) break;
    } catch {}
    await delay(100);
  }
  assert(ready, "Owned production Next server did not start");
  await run(
    "Storybook choice production",
    resolve(mirror, "packages/storybook/stories/choice-proof.mjs"),
  );
  await run(
    "Storybook RTL consumer",
    resolve(mirror, "packages/storybook/stories/choice-rtl-proof.mjs"),
  );
  await run(
    "Storybook overlay production",
    resolve(mirror, "packages/storybook/stories/overlay-proof.mjs"),
    [staticRoot, playwrightFile],
  );
  await run("docs native API", resolve(mirror, "apps/docs/test/native-api.browser.mjs"));
  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage();
    for (const locale of ["en", "cn"]) {
      await page.goto(`${docsUrl}/${locale}/docs/react/components/button`, {
        waitUntil: "networkidle",
      });
      const api = page.locator('section[aria-labelledby="native-api-button"]');
      const value = await api
        .locator("table")
        .first()
        .evaluate((table) => {
          const cell = table.querySelector("th");
          return {
            fontSize: getComputedStyle(table).fontSize,
            borderCollapse: getComputedStyle(table).borderCollapse,
            cellMinWidth: getComputedStyle(cell).minWidth,
            cellPaddingLeft: getComputedStyle(cell).paddingLeft,
          };
        });
      assert.deepEqual(value, {
        fontSize: "13px",
        borderCollapse: "collapse",
        cellMinWidth: "80px",
        cellPaddingLeft: "12px",
      });
      report.serverOnlyStyles.push({ locale, ...value });
    }
  } finally {
    await browser.close();
  }
  await run(
    "docs scoped locale consumers",
    resolve(mirror, "apps/docs/scripts/locale-example-proof.mjs"),
    [],
    resolve(mirror, "apps/docs"),
  );
} finally {
  await new Promise((done) => server.close(done));
  child.kill("SIGTERM");
  await new Promise((done) => {
    if (child.exitCode !== null) return done();
    child.once("exit", done);
  });
  report.ownedServersClosed = true;
  await writeFile(resolve(output, "report.json"), JSON.stringify(report, null, 2));
}
