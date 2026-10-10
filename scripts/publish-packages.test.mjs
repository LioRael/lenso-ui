import test from "node:test";
import assert from "node:assert/strict";
import {
  packages as entries,
  selectPackages,
  shouldSkipExisting,
  validateContext,
  validatePackage,
  waitForPublication,
} from "./publish-packages.mjs";
const env = {
  GITHUB_ACTIONS: "true",
  GITHUB_REF: "refs/heads/main",
  GITHUB_SHA: "abc123",
  LENSO_RELEASE_VERSION: "0.8.0",
};
const manifests = entries.map((entry) => ({ name: entry.name, version: entry.version ?? "0.8.0" }));

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
      "0.8.0": {
        version: "0.8.0",
        dist: { integrity: "sha512-exact" },
        dependencies: { "@lenso/tokens": "0.8.0" },
      },
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
              version: "0.8.0",
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

test("release list orders public packages by dependencies and excludes primitives", () => {
  assert.deepEqual(
    entries.map(({ name }) => name),
    ["@lenso/tokens", "@lenso/ui", "@lenso/stylex-build", "@lenso/docs", "create-lenso-docs"],
  );
});

test("UI-only releases exclude Docs/tooling before validation, packing and publication", () => {
  const selected = selectPackages("ui");
  assert.deepEqual(selected, entries.slice(0, 2));
  assert.deepEqual(selectPackages(), entries);
  assert.deepEqual(selectPackages("all"), entries);
  for (const scope of ["", "docs", "@lenso/ui", "UI", "ui,all"])
    assert.throws(() => selectPackages(scope), /LENSO_RELEASE_SCOPE/);
  const scopedEnv = { ...env, LENSO_RELEASE_SCOPE: "ui" };
  assert.equal(validateContext(scopedEnv, "abc123", "abc123", manifests.slice(0, 2)), "0.8.0");
  for (const supplied of [manifests, manifests.slice(0, 1), []])
    assert.throws(
      () => validateContext(scopedEnv, "abc123", "abc123", supplied),
      /selected release scope/,
    );
  for (const patch of [
    { GITHUB_ACTIONS: "false" },
    { GITHUB_REF: "refs/heads/other" },
    { LENSO_RELEASE_VERSION: "0.8.0-rc.1" },
    { LENSO_RELEASE_SCOPE: "docs" },
  ])
    assert.throws(() =>
      validateContext({ ...scopedEnv, ...patch }, "abc123", "abc123", manifests.slice(0, 2)),
    );
  assert.throws(
    () => validateContext(scopedEnv, "wrong", "abc123", manifests.slice(0, 2)),
    /GITHUB_SHA/,
  );
  assert.throws(
    () => validateContext(scopedEnv, "abc123", "wrong", manifests.slice(0, 2)),
    /GITHUB_SHA/,
  );
  for (const patch of [{ name: "@lenso/primitives" }, { private: true }, { version: "0.7.0" }])
    assert.throws(
      () =>
        validateContext(scopedEnv, "abc123", "abc123", [
          { ...manifests[0], ...patch },
          manifests[1],
        ]),
      /unexpected package identity or version/,
    );
});

test("accepted publication waits for registry version and latest without republishing", async () => {
  let time = 0;
  let reads = 0;
  const version = {
    version: "0.8.0",
    dist: { integrity: "sha512-exact" },
    dependencies: { "@lenso/tokens": "0.8.0" },
  };
  const snapshots = [
    null,
    { versions: {}, "dist-tags": { latest: "0.7.0" } },
    { versions: { "0.8.0": version }, "dist-tags": { latest: "0.7.0" } },
    { versions: { "0.8.0": version }, "dist-tags": { latest: "0.8.0" } },
  ];
  const result = await waitForPublication(entries[1], "0.8.0", "sha512-exact", {
    readMetadata: async () => snapshots[reads++],
    now: () => time,
    sleep: async (ms) => {
      time += ms;
    },
    intervalMs: 5,
    timeoutMs: 20,
    log: () => {},
  });
  assert.equal(result["dist-tags"].latest, "0.8.0");
  assert.equal(reads, 4);
});

test("registry waiting fails immediately on wrong integrity and read errors", async () => {
  await assert.rejects(
    waitForPublication(entries[0], "0.8.0", "sha512-exact", {
      readMetadata: async () => ({
        versions: { "0.8.0": { version: "0.8.0", dist: { integrity: "sha512-other" } } },
      }),
      sleep: async () => assert.fail("must not retry an immutable collision"),
    }),
    /immutable version collision/,
  );
  await assert.rejects(
    waitForPublication(entries[0], "0.8.0", "sha512-exact", {
      readMetadata: async () => {
        throw new Error("HTTP 503");
      },
      sleep: async () => assert.fail("must not hide registry errors"),
    }),
    /HTTP 503/,
  );
});

test("registry waiting is bounded and does not publish again after processing timeout", async () => {
  let time = 0;
  await assert.rejects(
    waitForPublication(entries[0], "0.8.0", "sha512-exact", {
      readMetadata: async () => ({ versions: {} }),
      now: () => time,
      sleep: async (ms) => {
        time += ms;
      },
      intervalMs: 5,
      timeoutMs: 10,
      log: () => {},
    }),
    /processing timed out.*do not republish blindly/,
  );
  assert.equal(time, 10);
});

test("registry version records cannot disguise missing or different versions", () => {
  for (const version of [undefined, "0.7.0"]) {
    assert.throws(
      () =>
        shouldSkipExisting(
          { versions: { "0.8.0": { version, dist: { integrity: "sha512-exact" } } } },
          "0.8.0",
          "sha512-exact",
          entries[0],
        ),
      /registry version mismatch/,
    );
  }
});

test("waiting rejects wrong UI dependency and limits latest-tag lag to its deadline", async () => {
  await assert.rejects(
    waitForPublication(entries[1], "0.8.0", "sha512-exact", {
      readMetadata: async () => ({
        versions: {
          "0.8.0": {
            version: "0.8.0",
            dist: { integrity: "sha512-exact" },
            dependencies: { "@lenso/tokens": "0.7.0" },
          },
        },
      }),
      sleep: async () => assert.fail("must not retry a dependency mismatch"),
    }),
    /registry dependency mismatch/,
  );
  let time = 0;
  const sleeps = [];
  const budgets = [];
  await assert.rejects(
    waitForPublication(entries[0], "0.8.0", "sha512-exact", {
      readMetadata: async (_name, budget) => {
        budgets.push(budget);
        return {
          versions: { "0.8.0": { version: "0.8.0", dist: { integrity: "sha512-exact" } } },
          "dist-tags": { latest: "0.7.0" },
        };
      },
      now: () => time,
      sleep: async (ms) => {
        sleeps.push(ms);
        time += ms;
      },
      intervalMs: 6,
      timeoutMs: 10,
      log: () => {},
    }),
    /processing timed out/,
  );
  assert.deepEqual(sleeps, [6, 4]);
  assert.deepEqual(budgets, [10, 4]);
});

test("new package validation requires runtime binaries, templates and notices", () => {
  const item = entries.find((entry) => entry.kind === "initializer");
  const manifest = {
    name: item.name,
    version: "0.1.0",
    bin: { "create-lenso-docs": "./src/cli.mjs" },
  };
  const files = ["package/LICENSE", "package/template/package.json", "package/src/cli.mjs"];
  assert.doesNotThrow(() => validatePackage(manifest, files, {}, item, "0.1.0"));
  assert.throws(
    () => validatePackage(manifest, files.slice(0, 2), {}, item, "0.1.0"),
    /missing.*cli.mjs/,
  );
  assert.throws(
    () =>
      validatePackage(
        manifest,
        files.filter((file) => !file.includes("template")),
        {},
        item,
        "0.1.0",
      ),
    /missing.*template/,
  );
  const docs = entries.find((entry) => entry.kind === "docs");
  assert.throws(
    () => validatePackage({ name: docs.name, version: "0.1.0" }, [], {}, docs, "0.1.0"),
    /missing.*LICENSE/,
  );
});
