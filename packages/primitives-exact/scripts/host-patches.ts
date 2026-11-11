import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdtemp, mkdir, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import series from "../patches/series.json" with { type: "json" };

const root = path.resolve(import.meta.dirname, "..");
process.env["EXACT_AGENT_SCOPE"] = "all";
process.env["EXACT_PRIMITIVES_CACHE"] ??= path.join(root, ".cache/proposal");
const exact = process.env["EXACT_ROOT"];
if (!exact) throw new Error("Set EXACT_ROOT to an initialized Exact checkout");
const original = process.env["EXACT_BASE_GIT"] ?? exact;
const [mode = "check", id, host] = process.argv.slice(2);
assert.ok(mode === "check" || mode === "regress", "Choose check or regress <change> <host>");
const selected = series.changes.find((change) => change.id === id);
const through = process.env["EXACT_PATCH_THROUGH"] ?? series.changes.at(-1)!.id;
const last = series.changes.findIndex((change) => change.id === through);
assert.ok(last >= 0, `Unknown series checkpoint: ${through}`);
const changes = series.changes.slice(0, last + 1);
if (mode === "regress") {
  assert.ok(
    selected && host && selected.hosts.includes(host),
    "Choose a change and one of its supported hosts (see patches/series.json)",
  );
  assert.ok(changes.includes(selected), "The selected change must exist at this checkpoint");
}

async function command(args: string[], cwd: string, env = process.env) {
  const child = Bun.spawn(args, { cwd, env, stdout: "inherit", stderr: "inherit" });
  assert.equal(await child.exited, 0, `Failed: ${args.join(" ")}`);
}
async function git(...args: string[]) {
  const child = Bun.spawn(["git", "-C", original, ...args], { stdout: "pipe", stderr: "pipe" });
  const [bytes, error, status] = await Promise.all([
    new Response(child.stdout).arrayBuffer(),
    new Response(child.stderr).text(),
    child.exited,
  ]);
  assert.equal(status, 0, error || `Unable to read pinned Exact source ${series.base}`);
  return new Uint8Array(bytes);
}
const scratch = await mkdtemp(path.join(os.tmpdir(), "exact-host-series-"));
const evidence = path.join(root, ".cache/host-patches");
await mkdir(evidence, { recursive: true });
await rm(path.join(evidence, "series.json"), { force: true });
const receipt = selected && host ? path.join(evidence, `${selected.id}-${host}.json`) : null;
if (mode === "regress" && receipt) await rm(receipt, { force: true });
const hashes: Record<string, string> = {};
try {
  await git("rev-parse", `${series.base}^{commit}`);
  // An isolated Git root prevents git apply from silently skipping paths inside this workspace.
  await command(["git", "init", "-q"], scratch);
  const seen = new Set<string>();
  const applied = new Set<string>();
  for (const change of changes) {
    for (const dependency of change.requires)
      assert.ok(applied.has(dependency), `${change.id} requires ${dependency} first`);
    const patch = path.join(root, "patches", change.patch);
    const source = await Bun.file(patch).text();
    const files = [...source.matchAll(/^\+\+\+ b\/(.+)$/gm)].map((match) => match[1]!);
    const additions = new Set(
      [...source.matchAll(/^--- \/dev\/null\n\+\+\+ b\/(.+)$/gm)].map((match) => match[1]!),
    );
    assert.ok(files.length, `Empty patch: ${change.patch}`);
    for (const file of files) {
      if (seen.has(file)) continue;
      seen.add(file);
      if (!additions.has(file))
        await Bun.write(path.join(scratch, file), await git("show", `${series.base}:${file}`));
    }
    await command(["git", "apply", "--check", patch], scratch);
    await command(["git", "apply", patch], scratch);
    await command(["git", "apply", "--reverse", "--check", patch], scratch);
    applied.add(change.id);
    hashes[change.id] = createHash("sha256").update(source).digest("hex");
    console.log(`${change.id}: apply and reverse checked (${files.length} files)`);
  }
  if (mode === "regress") {
    for (const file of seen) {
      assert.ok(
        Buffer.from(await Bun.file(path.resolve(exact, file)).bytes()).equals(
          await Bun.file(path.join(scratch, file)).bytes(),
        ),
        `Exact source differs from checkpoint ${through}: ${file}`,
      );
    }
    console.log(`SDK matches ${through} byte-for-byte (${seen.size} files)`);
  }
  await Bun.write(
    path.join(evidence, "series.json"),
    JSON.stringify({ base: series.base, through, hashes, status: "passed" }, null, 2),
  );
} finally {
  await rm(scratch, { recursive: true, force: true });
}
if (mode === "regress" && selected && host) {
  if (host === "compiler") {
    await command(["bun", "scripts/contracts.ts", "--proposal"], root);
  } else {
    const source = await Bun.file(path.join(root, "example/app.test.contract")).text();
    const tests = source
      .split(/(?=^test ")/m)
      .filter((block) => selected.tests.includes(/^test "([^"]+)"/.exec(block)?.[1] ?? ""));
    assert.equal(tests.length, selected.tests.length, "A named regression was removed or renamed");
    const suite = path.join(evidence, `${selected.id}.test.contract`);
    await Bun.write(suite, tests.join(""));
    const env = { ...process.env, EXACT_AGENT_TEST: suite, EXACT_AX_SCOPE: selected.ax };
    await command(
      ["bun", host === "web" ? "scripts/agent.ts" : "scripts/native.ts", host],
      root,
      env,
    );
    if (host === "web") {
      await command(
        [
          "bun",
          "test/accessibility.mjs",
          host,
          path.join(process.env["EXACT_PRIMITIVES_CACHE"], "example/app"),
        ],
        root,
        {
          ...env,
          EXACT_WEB_DIST: path.join(process.env["EXACT_PRIMITIVES_CACHE"], "example/dist"),
        },
      );
      await command(["bun", "test/browser.mjs"], root, {
        ...env,
        EXACT_BROWSER_SCOPE: selected.ax,
      });
    }
  }
  await Bun.write(
    receipt!,
    JSON.stringify(
      { change: selected.id, host, base: series.base, through, hashes, status: "passed" },
      null,
      2,
    ),
  );
}
