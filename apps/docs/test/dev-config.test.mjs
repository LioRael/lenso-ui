import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { createServer } from "node:net";
import { mkdir, mkdtemp, rm, symlink, writeFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";

const application = path.resolve(import.meta.dirname, "..");
const packageSource = path.resolve(application, "../../packages/docs/src/cli.mjs");

test(
  "lenso-docs dev serves locale routes, custom routes, redirects, and trusted assets",
  { timeout: 90000 },
  async (t) => {
    const cache = path.join(application, ".cache");
    await mkdir(cache, { recursive: true });
    const root = await mkdtemp(path.join(cache, "lenso-docs-dev-"));
    let server;
    t.after(async () => {
      if (server && server.exitCode === null && server.signalCode === null) {
        const exited = new Promise((resolve) => server.once("exit", resolve));
        server.kill("SIGTERM");
        const timer = setTimeout(() => server.kill("SIGKILL"), 5000);
        await exited;
        clearTimeout(timer);
      }
      await rm(root, { recursive: true, force: true });
    });

    await symlink(
      path.join(application, "node_modules"),
      path.join(root, "node_modules"),
      "junction",
    );
    await writeFile(
      path.join(root, "docs.config.mjs"),
      `export default {
  title: "Fixture docs",
  source: "source.mjs",
  build: "build.mjs",
  locales: [
    { code: "en", label: "English", language: "en", routePrefix: "/en/docs" },
    { code: "cn", label: "中文", language: "zh-CN", routePrefix: "/cn/docs" },
  ],
  defaultLocale: "en",
  trailingSlash: false,
};\n`,
    );
    await writeFile(
      path.join(root, "source.mjs"),
      `export async function loadSource() {
  const pages = [
    { id: "en/guide", title: "English guide", url: "/en/docs/guide", locale: "en", slug: "guide", markdown: "## A section" },
    { id: "cn/guide", title: "中文指南", url: "/cn/docs/guide", locale: "cn", slug: "guide", markdown: "## 一节" },
  ];
  const routes = [
    { path: "/coverage", module: "coverage.jsx" },
  ];
  return { pages, routes, redirects: [{ from: "/docs", to: "/en/docs/guide" }] };
}\n`,
    );
    await writeFile(
      path.join(root, "coverage.jsx"),
      `export default function Coverage() { return <main>Custom route coverage</main>; }\n`,
    );
    await writeFile(
      path.join(root, "build.mjs"),
      `export default { allowedDevOrigins: ["127.0.0.1"] };\n`,
    );

    const reservation = createServer();
    await new Promise((resolve) => reservation.listen(0, "127.0.0.1", resolve));
    const port = reservation.address().port;
    await new Promise((resolve) => reservation.close(resolve));
    server = spawn(process.execPath, [packageSource, "dev", "--port", String(port)], {
      cwd: root,
      env: { ...process.env, NEXT_TELEMETRY_DISABLED: "1" },
      stdio: ["ignore", "pipe", "pipe"],
    });
    let logs = "";
    await new Promise((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error(`Dev startup timed out:\n${logs}`)), 30000);
      const onData = (chunk) => {
        logs += chunk;
        if (/Ready|ready/i.test(logs)) {
          clearTimeout(timer);
          resolve();
        }
      };
      server.stdout.on("data", onData);
      server.stderr.on("data", onData);
      server.once("error", reject);
      server.once("exit", (code) => {
        clearTimeout(timer);
        reject(new Error(`lenso-docs exited (${code}):\n${logs}`));
      });
    });

    const base = `http://127.0.0.1:${port}`;
    for (const route of ["/guides", "/fr/docs/guide"]) {
      const response = await fetch(`${base}${route}`, { signal: AbortSignal.timeout(25000) });
      assert.equal(response.status, 404, `${route} should be an ordinary 404.\n${logs}`);
    }
    for (const [route, language] of [
      ["/en/docs/guide", "en"],
      ["/cn/docs/guide", "zh-CN"],
    ]) {
      const response = await fetch(`${base}${route}`, { signal: AbortSignal.timeout(25000) });
      assert.equal(response.status, 200, `${route}\n${logs}`);
      assert.match(await response.text(), new RegExp(`<html[^>]*lang="${language}"`));
    }
    const custom = await fetch(`${base}/coverage`, { signal: AbortSignal.timeout(25000) });
    assert.equal(custom.status, 200);
    assert.match(await custom.text(), /Custom route coverage/);
    const redirect = await fetch(`${base}/docs`, { redirect: "manual" });
    assert.equal(redirect.status, 307);
    assert.equal(redirect.headers.get("location"), "/en/docs/guide");

    const asset = `${base}/_next/static/development/_buildManifest.js`;
    assert.equal((await fetch(asset, { headers: { origin: base } })).status, 200);
    assert.equal(
      (await fetch(asset, { headers: { origin: "https://untrusted.example" } })).status,
      403,
    );
  },
);
