import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import test from "node:test";

function run(fixture, ...options) {
  return spawnSync(
    process.execPath,
    [
      ...process.execArgv.filter((argument) => argument !== "--test"),
      fileURLToPath(new URL("./cli.mjs", import.meta.url)),
      "consumer",
      ...options,
      fileURLToPath(new URL(`./fixtures/${fixture}.ts`, import.meta.url)),
    ],
    { encoding: "utf8" },
  );
}

test("CI adapter emits located diagnostics and fails without executing source imports", () => {
  const result = run("legacy");
  assert.equal(result.status, 1);
  const output = JSON.parse(result.stdout);
  assert.equal(output.diagnostics[0].ruleId, "lenso/no-legacy-import");
  assert.equal(output.diagnostics[0].line, 1);
  assert.deepEqual(output.skipped, []);
});

test("unresolved consumer modules stay visible; only explicit strict mode fails them", () => {
  const result = run("unresolved");
  assert.equal(result.status, 0);
  const output = JSON.parse(result.stdout);
  assert.deepEqual(output.diagnostics, []);
  assert.equal(output.skipped[0].ruleId, "lenso/runtime-import");
  const strict = run("unresolved", "--strict");
  assert.equal(strict.status, 1);
  assert.deepEqual(JSON.parse(strict.stdout), output);
});
