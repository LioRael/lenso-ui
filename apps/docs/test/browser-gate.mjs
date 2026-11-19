import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { once } from "node:events";
import { createWriteStream } from "node:fs";
import { mkdir } from "node:fs/promises";
import { resolve } from "node:path";
import { createFirstPaintServer } from "./first-paint-server.mjs";
import { startStaticServer } from "./static-server.mjs";

const sourceSuites = [
  "backdrop-paint-animation.mjs",
  "backdrop-scheduler-performance.mjs",
  "rim-preparation-performance.mjs",
];
const groups = {
  core: ["tabs-overflow.mjs", "model-behaviors.mjs"],
  glass: ["first-paint.mjs", "glass-canvas-navigation.mjs", ...sourceSuites],
  production: ["production-loading.mjs"],
  performance: ["tab-bar-performance.mjs", "loading-timing.mjs"],
};
const group = process.argv[2];
assert.ok(
  Object.hasOwn(groups, group),
  "Usage: node test/browser-gate.mjs core|glass|production|performance",
);
const output = process.env.BROWSER_ARTIFACTS;
if (output) await mkdir(output, { recursive: true });
let failed = false;
const server = group === "performance" ? await startStaticServer() : null;
let sourceServer;
try {
  for (const suite of groups[group]) {
    const sourceSuite = sourceSuites.includes(suite);
    if (sourceSuite && !sourceServer) {
      sourceServer = await createFirstPaintServer();
      await sourceServer.listen();
    }
    const start = performance.now();
    const log = output ? createWriteStream(resolve(output, `${suite}.log`)) : null;
    const child = spawn(process.execPath, [new URL(suite, import.meta.url).pathname], {
      stdio: ["ignore", "pipe", "pipe"],
      env: {
        ...process.env,
        ...(server ? { DOCS_URL: server.base } : {}),
        ...(sourceSuite ? { DOCS_URL: sourceServer.resolvedUrls.local[0], PERF_RUNS: "1" } : {}),
      },
    });
    for (const [stream, destination] of [
      [child.stdout, process.stdout],
      [child.stderr, process.stderr],
    ]) {
      stream.on("data", (data) => {
        destination.write(data);
        log?.write(data);
      });
    }
    const [code, signal] = await once(child, "close");
    if (log) await new Promise((done) => log.end(done));
    console.log(
      `${suite}: exit=${code} signal=${signal} ${(performance.now() - start).toFixed(0)}ms`,
    );
    if (code !== 0) failed = true;
  }
} finally {
  await server?.close();
  await sourceServer?.close();
}
process.exitCode = failed ? 1 : 0;
