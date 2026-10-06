import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import test from "node:test";

function parseOutput(source: string) {
  const value: unknown = JSON.parse(source);
  assert.ok(value && typeof value === "object" && "diagnostics" in value && "skipped" in value);
  assert.ok(Array.isArray(value.diagnostics) && Array.isArray(value.skipped));
  const diagnostics: { ruleId: string; line: number }[] = value.diagnostics.map(
    (entry: unknown) => {
      assert.ok(entry && typeof entry === "object" && "ruleId" in entry && "line" in entry);
      assert.equal(typeof entry.ruleId, "string");
      assert.equal(typeof entry.line, "number");
      return { ruleId: String(entry.ruleId), line: Number(entry.line) };
    },
  );
  const skipped: { ruleId: string }[] = value.skipped.map((entry: unknown) => {
    assert.ok(entry && typeof entry === "object" && "ruleId" in entry);
    assert.equal(typeof entry.ruleId, "string");
    return { ruleId: String(entry.ruleId) };
  });
  return { diagnostics, skipped, raw: value };
}

function run(fixture: string, ...options: string[]) {
  return spawnSync(
    process.execPath,
    [
      ...process.execArgv.filter((argument) => argument !== "--test"),
      fileURLToPath(new URL("./cli.ts", import.meta.url)),
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
  const output = parseOutput(result.stdout);
  assert.equal(output.diagnostics[0]?.ruleId, "lenso/no-legacy-import");
  assert.equal(output.diagnostics[0]?.line, 1);
  assert.deepEqual(output.skipped, []);
});

test("unresolved consumer modules stay visible; only explicit strict mode fails them", () => {
  const result = run("unresolved");
  assert.equal(result.status, 0);
  const output = parseOutput(result.stdout);
  assert.deepEqual(output.diagnostics, []);
  assert.equal(output.skipped[0]?.ruleId, "lenso/runtime-import");
  const strict = run("unresolved", "--strict");
  assert.equal(strict.status, 1);
  assert.deepEqual(parseOutput(strict.stdout), output);
});
