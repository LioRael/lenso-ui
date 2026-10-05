import assert from "node:assert/strict";
import { createRequire } from "node:module";
import test from "node:test";
import { buildSupport } from "@lenso/stylex-build";

test("public build support distinguishes explicit production CSS from legacy asset rewriting", () => {
  const require = createRequire(import.meta.url);
  assert.equal(buildSupport.stylex.version, require("@stylexjs/babel-plugin/package.json").version);
  assert.deepEqual(JSON.parse(JSON.stringify(buildSupport)), buildSupport);
  assert.equal(buildSupport.next.version, "16.3.8");
  assert.equal(buildSupport.next.customGlobalError, "explicit-css");
  assert.deepEqual(buildSupport.next.explicitCss, {
    api: "prepareNext",
    mode: "production",
    watch: false,
    cache: false,
  });
  assert.equal(buildSupport.next.legacyAssetRewrite.customGlobalError, "unsupported");
  assert.equal(buildSupport.vite.testedVersion, "8.3.2");
  assert(Object.isFrozen(buildSupport));
  assert(Object.isFrozen(buildSupport.next));
  assert(Object.isFrozen(buildSupport.stylex.compileMode));
});
