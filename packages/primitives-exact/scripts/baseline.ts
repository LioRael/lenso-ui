import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { lstat, mkdir, open, readlink, realpath } from "node:fs/promises";
import path from "node:path";
import { cacheRoot } from "./example";

const root = path.resolve(import.meta.dirname, "..");
const exact = process.env["EXACT_ROOT"];
assert.ok(exact, "Set EXACT_ROOT to an initialized, unmodified Exact checkout");
const base = "956ae33a35ffa5313d7be3cebc55ed84f9480e0a";
const hosts = process.argv.slice(2);
if (!hosts.length) hosts.push("web");
assert.ok(hosts.every((host) => ["web", "macos", "ios"].includes(host)));
if (hosts.includes("ios"))
  assert.ok(process.env["EXACT_SIM"], "Select a dedicated simulator with EXACT_SIM");
const evidence = path.join(cacheRoot, "baseline", hosts.join("-"));
await mkdir(evidence, { recursive: true });
const receipt = path.join(evidence, "results.json");
await Bun.write(receipt, JSON.stringify({ base, status: "running", hosts }, null, 2));

async function verifySource() {
  const git = Bun.spawn(
    ["git", "-C", process.env["EXACT_BASE_GIT"] ?? exact!, "ls-tree", "-r", base],
    { stdout: "pipe", stderr: "pipe" },
  );
  const [tree, error, code] = await Promise.all([
    new Response(git.stdout).text(),
    new Response(git.stderr).text(),
    git.exited,
  ]);
  assert.equal(code, 0, error);
  const files = tree
    .trim()
    .split("\n")
    .map((line) => {
      const [entry, file] = line.split("\t");
      const [mode, type, hash] = entry!.split(" ");
      return { mode, type, hash, file: file! };
    })
    .filter((entry) => entry.type === "blob");
  const changed: string[] = [];
  const missing: string[] = [];
  let verified = 0;
  for (const entry of files) {
    const file = path.resolve(exact!, entry.file);
    const stat = await lstat(file).catch((error: NodeJS.ErrnoException) => {
      if (error.code === "ENOENT") return null;
      throw error;
    });
    if (!stat) {
      missing.push(entry.file);
      continue;
    }
    const bytes = stat.isSymbolicLink()
      ? Buffer.from(await readlink(file))
      : await Bun.file(file).bytes();
    const hash = createHash("sha1").update(`blob ${bytes.length}\0`).update(bytes).digest("hex");
    if (hash !== entry.hash || stat.isSymbolicLink() !== (entry.mode === "120000"))
      changed.push(entry.file);
    verified++;
  }
  // SwiftPM also compiles untracked Swift sources, so tracked-file equality alone is insufficient there.
  const tracked = new Set(files.map((entry) => entry.file));
  for (const directory of ["host/apple/Sources", "contract/analyze/src"]) {
    for await (const file of new Bun.Glob(`${directory}/**/*.{swift,rs}`).scan({
      cwd: exact,
      onlyFiles: true,
    })) {
      if (!tracked.has(file)) changed.push(file);
    }
  }
  await Bun.write(
    path.join(evidence, "source.json"),
    JSON.stringify({ base, verified, missing, changed }, null, 2),
  );
  if (changed.length)
    await Bun.write(receipt, JSON.stringify({ base, status: "rejected", changed }, null, 2));
  assert.deepEqual(
    changed,
    [],
    "Baseline requires original SDK sources; use a separate stock checkout",
  );
  return { base, verified, missing: missing.length };
}
const before = await verifySource();
const compiler = process.env["EXACT_CONTRACT_BIN"] ?? path.join(exact, "target/debug/contract");
const tooling = {
  bun: Bun.version,
  playwrightModule: process.env["PLAYWRIGHT_MODULE"] ?? "docs workspace default",
  compiler: await realpath(compiler),
  compilerSha256: createHash("sha256")
    .update(await Bun.file(compiler).bytes())
    .digest("hex"),
  target: await realpath(path.join(exact, "target")),
};
const phases: { name: string; code: number; log: string }[] = [];
async function run(name: string, args: string[], overrides: Record<string, string> = {}) {
  const env = { ...process.env, ...overrides };
  delete env["EXACT_AGENT_TEST"];
  const log = path.join(evidence, `${name}.log`);
  const output = await open(log, "w");
  let code: number;
  try {
    const child = Bun.spawn(["bun", ...args], {
      cwd: root,
      env,
      stdout: output.fd,
      stderr: output.fd,
    });
    code = await child.exited;
  } finally {
    await output.close();
  }
  phases.push({ name, code, log });
  console.log(`${name}: ${code === 0 ? "passed" : `failed (${code}); see ${log}`}`);
  await Bun.write(
    receipt,
    JSON.stringify({ base, status: "running", hosts, source: before, tooling, phases }, null, 2),
  );
}
await run("contracts", ["scripts/contracts.ts"]);
for (const host of hosts) {
  if (host === "web") {
    for (const browser of ["chrome", "webkit"]) {
      for (const scope of ["core", "all"]) {
        await run(`agent-${browser}-${scope}`, ["scripts/agent.ts", "web"], {
          EXACT_WEB_BROWSER: browser,
          EXACT_AGENT_SCOPE: scope,
        });
      }
    }
    for (const engine of ["chromium", "webkit"]) {
      for (const scope of ["core", "lifecycle"]) {
        await run(`browser-${engine}-${scope}`, ["test/browser.mjs"], {
          EXACT_WEB_ENGINE: engine,
          EXACT_BROWSER_SCOPE: scope,
        });
      }
    }
    for (const scope of ["base", "lifecycle"]) {
      await run(
        `ax-web-${scope}`,
        ["test/accessibility.mjs", "web", path.join(cacheRoot, "example/app")],
        { EXACT_AX_SCOPE: scope, EXACT_WEB_DIST: path.join(cacheRoot, "example/dist") },
      );
    }
  } else {
    for (const scope of ["core", "all"]) {
      await run(`agent-${host}-${scope}`, ["scripts/native.ts", host], {
        EXACT_AGENT_SCOPE: scope,
        EXACT_AX_SCOPE: "none",
      });
    }
    for (const scope of ["base", "lifecycle"]) {
      await run(
        `ax-${host}-${scope}`,
        ["test/accessibility.mjs", host, path.join(cacheRoot, "native/primitives-fixture")],
        { EXACT_AX_SCOPE: scope },
      );
    }
  }
}
const after = await verifySource();
await Bun.write(
  receipt,
  JSON.stringify(
    {
      base,
      status: "observed",
      hosts,
      source: after,
      tooling,
      phases,
      linux: "Not run; Linux OS/AT-SPI gap retained",
    },
    null,
    2,
  ),
);
process.exitCode = phases.some((phase) => phase.code !== 0) ? 1 : 0;
