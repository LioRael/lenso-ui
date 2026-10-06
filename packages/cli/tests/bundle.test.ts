import assert from "node:assert/strict";
import test from "node:test";
import { build } from "esbuild";
import { mkdtemp, writeFile, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";
import { fixture, authoredMarkdown } from "./fixture.ts";

test("CLI fixture bundle runs outside the workspace with only node builtins", async () => {
  const root = await mkdtemp(join(tmpdir(), "lenso-cli-bundle-"));
  await writeFile(join(root, "package.json"), '{"type":"module"}\n');
  const contract = await fixture();
  await writeFile(join(root, "lenso-contract.json"), JSON.stringify(contract));
  const result = await build({
    entryPoints: [fileURLToPath(new URL("../src/cli.ts", import.meta.url))],
    outfile: join(root, "cli.js"),
    bundle: true,
    format: "esm",
    platform: "node",
    target: "node26",
    nodePaths: [fileURLToPath(new URL("../node_modules/", import.meta.url))],
    banner: {
      js: "import { createRequire as __createRequire } from 'node:module'; const require = __createRequire(import.meta.url);",
    },
    metafile: true,
    plugins: process.env["LENSO_TEST_CONTRACT_CORE"]
      ? [
          {
            name: "test-only-current-private-core",
            setup(builder) {
              builder.onResolve({ filter: /\/tooling\/lenso-contracts\/index\.ts$/ }, () => ({
                path: process.env["LENSO_TEST_CONTRACT_CORE"]!,
              }));
            },
          },
        ]
      : [],
  });
  for (const output of Object.values(result.metafile.outputs))
    for (const dependency of output.imports) assert.match(dependency.path, /^node:/);
  const run = (...args: string[]) =>
    execFileSync(process.execPath, [join(root, "cli.js"), ...args], {
      cwd: root,
      encoding: "utf8",
      maxBuffer: 32 * 1024 * 1024,
    });
  assert.match(run("--help"), /init/);
  assert.equal(JSON.parse(run("metadata", "--json")).digest, contract.digest);
  assert.equal(run("docs", "Menu"), authoredMarkdown("en"));
  const api: unknown = JSON.parse(run("info", "Menu"));
  assert.ok(api && typeof api === "object" && "parts" in api && Array.isArray(api.parts));
  assert.ok(
    api.parts.some(
      (part: unknown) =>
        part && typeof part === "object" && "name" in part && part.name === "MenuTrigger",
    ),
  );
  assert.equal(JSON.parse(run("list", "--json")).length, 1);
  const before =
    '{"name":"vite-app","private":true,"devDependencies":{"vite":"8.3.2","@vitejs/plugin-react":"6.0.1"}}\n';
  await writeFile(join(root, "package.json"), before);
  assert.equal(JSON.parse(run("init", "--framework", "vite", "--json")).dryRun, true);
  assert.equal(await readFile(join(root, "package.json"), "utf8"), before);
});
