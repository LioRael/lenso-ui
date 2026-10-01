import test from "node:test";
import assert from "node:assert/strict";
import {
  packages as entries,
  shouldSkipExisting,
  validateContext,
  validatePackage,
} from "./publish-packages.mjs";
const env = {
  GITHUB_ACTIONS: "true",
  GITHUB_REF: "refs/heads/main",
  GITHUB_SHA: "abc123",
  LENSO_RELEASE_VERSION: "0.8.0",
};
const manifests = entries.map((entry) => ({ name: entry.name, version: "0.8.0" }));

test("accepts only the authorized CI context and exact package identities", () => {
  assert.equal(validateContext(env, "abc123", "abc123", manifests), "0.8.0");
  for (const patch of [
    { GITHUB_ACTIONS: "false" },
    { GITHUB_REF: "refs/heads/other" },
    { LENSO_RELEASE_VERSION: "v0.8.0" },
    { LENSO_RELEASE_VERSION: "0.8.0-rc.1" },
  ]) {
    assert.throws(() => validateContext({ ...env, ...patch }, "abc123", "abc123", manifests));
  }
  assert.throws(() => validateContext(env, "wrong", "abc123", manifests), /GITHUB_SHA/);
  assert.throws(() => validateContext(env, "abc123", "wrong", manifests), /GITHUB_SHA/);
  assert.throws(() =>
    validateContext(env, "abc123", "abc123", [
      { ...manifests[0], name: "@lenso/primitives" },
      manifests[1],
    ]),
  );
  assert.throws(() =>
    validateContext(env, "abc123", "abc123", [{ ...manifests[0], private: true }, manifests[1]]),
  );
  assert.throws(() =>
    validateContext(env, "abc123", "abc123", [{ ...manifests[0], version: "0.7.0" }, manifests[1]]),
  );
});

test("validates packed exports, required files, dependency protocols and release pin", () => {
  const token = {
    name: "@lenso/tokens",
    version: "0.8.0",
    exports: {
      ".": { types: "./dist/index.d.ts", import: "./dist/index.js" },
      "./styles.css": "./dist/styles.css",
      "./*": {
        types: "./dist/components/*/index.d.ts",
        import: "./dist/components/*/index.js",
      },
    },
    dependencies: {},
  };
  const tokenFiles = [
    "package/dist/index.d.ts",
    "package/dist/index.js",
    "package/dist/styles.css",
    "package/dist/assets/stylex.css",
    "package/dist/third-party/heroui/LICENSE.txt",
    "package/src/tokens.stylex.const.ts",
    "package/dist/components/button/index.d.ts",
    "package/dist/components/button/index.js",
  ];
  assert.doesNotThrow(() =>
    validatePackage(
      token,
      tokenFiles,
      { "package/src/tokens.stylex.const.ts": "export const tokens = {}" },
      entries[0],
      "0.8.0",
    ),
  );
  assert.throws(
    () =>
      validatePackage(
        { ...token, dependencies: { bad: "workspace:*" } },
        tokenFiles,
        {},
        entries[0],
        "0.8.0",
      ),
    /unresolved dependency protocol/,
  );
  assert.throws(
    () => validatePackage(token, tokenFiles.slice(1), {}, entries[0], "0.8.0"),
    /missing package/,
  );
  assert.throws(
    () =>
      validatePackage(
        { ...token, exports: { ".": "./dist/missing.js" } },
        tokenFiles,
        {},
        entries[0],
        "0.8.0",
      ),
    /missing package/,
  );
  assert.throws(
    () => validatePackage(token, tokenFiles, {}, entries[0], "0.8.0"),
    /source const is empty/,
  );

  const ui = {
    name: "@lenso/ui",
    version: "0.8.0",
    dependencies: { "@lenso/tokens": "0.8.0" },
    exports: { ".": { types: "./dist/index.d.ts", import: "./dist/index.js" } },
  };
  const uiFiles = [
    "package/dist/index.js",
    "package/dist/index.d.ts",
    "package/dist/HEROUI-LICENSE.txt",
    "package/dist/HEROUI-NOTICE.md",
  ];
  assert.doesNotThrow(() => validatePackage(ui, uiFiles, {}, entries[1], "0.8.0"));
  assert.throws(
    () =>
      validatePackage(
        { ...ui, dependencies: { "@lenso/tokens": "workspace:*" } },
        uiFiles,
        {},
        entries[1],
        "0.8.0",
      ),
    /unresolved dependency protocol/,
  );
  assert.throws(
    () =>
      validatePackage(
        { ...ui, dependencies: { "@lenso/tokens": "0.7.0" } },
        uiFiles,
        {},
        entries[1],
        "0.8.0",
      ),
    /released @lenso\/tokens/,
  );
  assert.throws(
    () => validatePackage(ui, [...uiFiles, "package/screenshot.png"], {}, entries[1], "0.8.0"),
    /credential, test, or screenshot/,
  );
});

test("only skips an existing exact integrity and dependency pin", () => {
  const metadata = {
    versions: {
      "0.8.0": { dist: { integrity: "sha512-exact" }, dependencies: { "@lenso/tokens": "0.8.0" } },
    },
  };
  assert.equal(shouldSkipExisting(metadata, "0.8.0", "sha512-exact", entries[1]), true);
  assert.equal(shouldSkipExisting({ versions: {} }, "0.8.0", "sha512-exact", entries[0]), false);
  assert.throws(
    () => shouldSkipExisting(metadata, "0.8.0", "sha512-other", entries[1]),
    /collision/,
  );
  assert.throws(
    () =>
      shouldSkipExisting(
        {
          versions: {
            "0.8.0": {
              dist: { integrity: "sha512-exact" },
              dependencies: { "@lenso/tokens": "0.7.0" },
            },
          },
        },
        "0.8.0",
        "sha512-exact",
        entries[1],
      ),
    /dependency mismatch/,
  );
});

test("release list contains only tokens then UI; primitives are never selected", () => {
  assert.deepEqual(
    entries.map(({ name }) => name),
    ["@lenso/tokens", "@lenso/ui"],
  );
});
