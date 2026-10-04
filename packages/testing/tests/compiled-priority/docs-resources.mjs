// Verification-only derived config; never changes the repository's Next config.
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { readFile, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { dirname, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const project = resolve(dirname(fileURLToPath(import.meta.url)), "../../../..");
const [mirrorArgument, dependenciesArgument] = process.argv.slice(2);
const mirror = resolve(mirrorArgument);
assert(mirror.startsWith(resolve(project, "test-results") + sep));
const docs = resolve(mirror, "apps/docs");
const file = resolve(docs, "next.config.ts");
const original = await readFile(resolve(project, "apps/docs/next.config.ts"), "utf8");
assert(original.includes("  reactStrictMode: true,"));
const derived = original.replace(
  "  reactStrictMode: true,",
  "  reactStrictMode: true,\n  experimental: { cpus: 3 },\n  staticPageGenerationTimeout: 180,",
);
await writeFile(resolve(mirror, "docs-resource-config.txt"), derived);
await writeFile(file, derived);
const require = createRequire(resolve(dependenciesArgument, "apps/docs/package.json"));
const next = resolve(dirname(require.resolve("next/package.json")), "dist/bin/next");
try {
  const code = await new Promise((done, reject) => {
    const child = spawn(process.execPath, [next, "build", "--webpack"], {
      cwd: docs,
      stdio: "inherit",
      env: { ...process.env, CI: "1", NEXT_TELEMETRY_DISABLED: "1" },
    });
    child.on("error", reject);
    child.on("exit", done);
  });
  await writeFile(
    resolve(mirror, "docs-resource-result.json"),
    JSON.stringify({ code, cpus: 3, timeout: 180 }),
  );
  process.exitCode = code;
} finally {
  await writeFile(file, original);
}
