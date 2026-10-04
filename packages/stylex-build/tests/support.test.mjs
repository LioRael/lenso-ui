import assert from "node:assert/strict";
import { createRequire } from "node:module";
import test from "node:test";
import { buildSupport } from "../src/index.mjs";
import { contract } from "../src/metadata.mjs";

test("public build support is serializable and shares the producer compiler contract", () => {
  const require = createRequire(import.meta.url);
  assert.equal(buildSupport.stylex.version, contract.compilerVersion);
  assert.equal(buildSupport.stylex.version, require("@stylexjs/babel-plugin/package.json").version);
  assert.deepEqual(buildSupport.stylex.compileMode, contract.compileMode);
  assert.deepEqual(JSON.parse(JSON.stringify(buildSupport)), buildSupport);
  assert.equal(buildSupport.next.version, "16.3.8");
  assert.equal(buildSupport.next.customGlobalError, "unsupported");
  assert.equal(buildSupport.vite.testedVersion, "8.3.2");
  assert(Object.isFrozen(buildSupport));
  assert(Object.isFrozen(buildSupport.next));
  assert(Object.isFrozen(buildSupport.stylex.compileMode));
});
