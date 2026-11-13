import { test } from "bun:test";
import assert from "node:assert/strict";
import {
  packages as entries,
  shouldSkipExisting,
  validateContext,
  validatePackage,
  waitForPublication,
} from "../scripts/publish-packages.ts";
const env = {
  GITHUB_ACTIONS: "true",
  GITHUB_REF: "refs/heads/main",
  GITHUB_SHA: "abc123",
  LENSO_RELEASE_VERSION: "0.8.0",
};
const uiEntry = entries.find((entry) => entry.kind === "ui")!;
const glassEntry = entries.find((entry) => entry.kind === "glass")!;
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
      { ...manifests[0]!, name: "@lenso/primitives" },
      manifests[1]!,
    ]),
  );
  assert.throws(() =>
    validateContext(env, "abc123", "abc123", [{ ...manifests[0]!, private: true }, manifests[1]!]),
  );
  assert.throws(() =>
    validateContext(env, "abc123", "abc123", [
      { ...manifests[0]!, version: "0.7.0" },
      manifests[1]!,
    ]),
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
    "package/dist/THIRD_PARTY_NOTICES.md",
    "package/dist/tokens.stylex.const.js",
    "package/dist/components/button/index.d.ts",
    "package/dist/components/button/index.js",
  ];
  assert.doesNotThrow(() =>
    validatePackage(
      token,
      tokenFiles,
      { "package/dist/tokens.stylex.const.js": "export const tokens = {}" },
      entries[0]!,
      "0.8.0",
    ),
  );
  assert.throws(
    () =>
      validatePackage(
        { ...token, dependencies: { bad: "workspace:*" } },
        tokenFiles,
        {},
        entries[0]!,
        "0.8.0",
      ),
    /unresolved dependency protocol/,
  );
  assert.throws(
    () => validatePackage(token, tokenFiles.slice(1), {}, entries[0]!, "0.8.0"),
    /missing package/,
  );
  assert.throws(
    () =>
      validatePackage(
        { ...token, exports: { ".": "./dist/missing.js" } },
        tokenFiles,
        {},
        entries[0]!,
        "0.8.0",
      ),
    /missing package/,
  );
  assert.throws(
    () => validatePackage(token, tokenFiles, {}, entries[0]!, "0.8.0"),
    /declaration module is empty/,
  );

  const ui = {
    name: "@lenso/ui",
    version: "0.8.0",
    dependencies: {
      "@lenso/tokens": "0.8.0",
      "@lenso/glass": "0.2.0",
      "@lenso/primitives": "0.9.0",
    },
    exports: { ".": { types: "./dist/index.d.ts", import: "./dist/index.js" } },
  };
  const uiFiles = [
    "package/dist/index.js",
    "package/dist/index.d.ts",
    "package/dist/THIRD_PARTY_NOTICES.md",
  ];
  assert.doesNotThrow(() => validatePackage(ui, uiFiles, {}, uiEntry, "0.8.0"));
  assert.throws(
    () =>
      validatePackage(
        {
          ...ui,
          dependencies: {
            "@lenso/tokens": "workspace:*",
            "@lenso/glass": "0.2.0",
            "@lenso/primitives": "0.9.0",
          },
        },
        uiFiles,
        {},
        uiEntry,
        "0.8.0",
      ),
    /unresolved dependency protocol/,
  );
  assert.throws(
    () =>
      validatePackage(
        {
          ...ui,
          dependencies: {
            "@lenso/tokens": "0.7.0",
            "@lenso/glass": "0.2.0",
            "@lenso/primitives": "0.9.0",
          },
        },
        uiFiles,
        {},
        uiEntry,
        "0.8.0",
      ),
    /released @lenso\/tokens/,
  );
  assert.throws(
    () =>
      validatePackage(
        { ...ui, dependencies: { "@lenso/tokens": "0.8.0", "@lenso/glass": "0.0.9" } },
        uiFiles,
        {},
        uiEntry,
        "0.8.0",
      ),
    /released @lenso\/glass/,
  );
  assert.throws(
    () => validatePackage(ui, [...uiFiles, "package/screenshot.png"], {}, uiEntry, "0.8.0"),
    /credential, test, or screenshot/,
  );
});

test("only skips an existing exact integrity and dependency pin", () => {
  const metadata = {
    versions: {
      "0.8.0": {
        version: "0.8.0",
        dist: { integrity: "sha512-exact" },
        dependencies: {
          "@lenso/tokens": "0.8.0",
          "@lenso/glass": "0.2.0",
          "@lenso/primitives": "0.9.0",
        },
      },
    },
  };
  assert.equal(shouldSkipExisting(metadata, "0.8.0", "sha512-exact", uiEntry), true);
  assert.equal(shouldSkipExisting({ versions: {} }, "0.8.0", "sha512-exact", entries[0]!), false);
  assert.throws(() => shouldSkipExisting(metadata, "0.8.0", "sha512-other", uiEntry), /collision/);
  assert.throws(
    () =>
      shouldSkipExisting(
        {
          versions: {
            "0.2.0": {
              version: "0.2.0",
              dist: { integrity: "sha512-exact" },
              dependencies: { "@lenso/tokens": "0.7.0" },
            },
          },
        },
        "0.2.0",
        "sha512-exact",
        glassEntry,
        "0.8.0",
      ),
    /dependency mismatch/,
  );
  assert.throws(
    () =>
      shouldSkipExisting(
        {
          versions: {
            "0.8.0": {
              version: "0.8.0",
              dist: { integrity: "sha512-exact" },
              dependencies: {
                "@lenso/tokens": "0.7.0",
                "@lenso/glass": "0.2.0",
                "@lenso/primitives": "0.9.0",
              },
            },
          },
        },
        "0.8.0",
        "sha512-exact",
        uiEntry,
      ),
    /dependency mismatch/,
  );
});

test("release list orders public packages by dependencies and excludes private experiments", () => {
  assert.deepEqual(
    entries.map(({ name }) => name),
    [
      "@lenso/tokens",
      "@lenso/glass",
      "@lenso/primitives",
      "@lenso/ui",
      "@lenso/docs",
      "create-lenso-docs",
    ],
  );
});

test("primitive release requires retained entries, client boundaries and an exact UI dependency", () => {
  const item = entries.find((entry) => entry.kind === "primitives")!;
  const files = [
    "package/LICENSE",
    "package/dist/sidebar/sidebar.js",
    "package/dist/sidebar/sidebar.d.ts",
    ...["sidebar"].flatMap((family) => [
      `package/dist/${family}/index.js`,
      `package/dist/${family}/index.d.ts`,
    ]),
  ];
  const manifest = { name: item.name, version: item.version! };
  const contents = Object.fromEntries(
    ["sidebar"].map((family) => [`package/dist/${family}/index.js`, '"use client";']),
  );
  assert.doesNotThrow(() => validatePackage(manifest, files, contents, item, item.version!));
  assert.throws(() => validatePackage(manifest, files, {}, item, item.version!), /use client/);
  assert.throws(
    () =>
      validatePackage(
        manifest,
        files.filter((file) => !file.includes("/sidebar/")),
        contents,
        item,
        item.version!,
      ),
    /sidebar/,
  );
  const ui = {
    name: uiEntry.name,
    version: "0.10.0",
    dependencies: { "@lenso/tokens": "0.10.0", "@lenso/glass": "0.2.0" },
  };
  const uiFiles = [
    "package/dist/index.js",
    "package/dist/index.d.ts",
    "package/dist/THIRD_PARTY_NOTICES.md",
  ];
  assert.throws(
    () => validatePackage(ui, uiFiles, {}, uiEntry, "0.10.0"),
    /released @lenso\/primitives/,
  );
  assert.throws(
    () =>
      shouldSkipExisting(
        {
          versions: {
            "0.10.0": {
              version: "0.10.0",
              dist: { integrity: "sha512-same" },
              dependencies: ui.dependencies,
            },
          },
        },
        "0.10.0",
        "sha512-same",
        uiEntry,
      ),
    /dependency mismatch/,
  );
});

test("accepted publication waits for registry version and latest without republishing", async () => {
  let time = 0;
  let reads = 0;
  const version = {
    version: "0.8.0",
    dist: { integrity: "sha512-exact" },
    dependencies: {
      "@lenso/tokens": "0.8.0",
      "@lenso/glass": "0.2.0",
      "@lenso/primitives": "0.9.0",
    },
  };
  const snapshots: Array<{
    versions: Record<string, typeof version>;
    "dist-tags": { latest: string };
  } | null> = [
    null,
    { versions: {}, "dist-tags": { latest: "0.7.0" } },
    { versions: { "0.8.0": version }, "dist-tags": { latest: "0.7.0" } },
    { versions: { "0.8.0": version }, "dist-tags": { latest: "0.8.0" } },
  ];
  const result = await waitForPublication(uiEntry, "0.8.0", "sha512-exact", {
    readMetadata: async () => snapshots[reads++] ?? null,
    now: () => time,
    sleep: async (ms) => {
      time += ms;
    },
    intervalMs: 5,
    timeoutMs: 20,
    log: () => {},
  });
  assert.equal(result["dist-tags"]?.latest, "0.8.0");
  assert.equal(reads, 4);
});

test("registry waiting fails immediately on wrong integrity and read errors", async () => {
  await assert.rejects(
    waitForPublication(entries[0]!, "0.8.0", "sha512-exact", {
      readMetadata: async () => ({
        versions: { "0.8.0": { version: "0.8.0", dist: { integrity: "sha512-other" } } },
      }),
      sleep: async () => assert.fail("must not retry an immutable collision"),
    }),
    /immutable version collision/,
  );
  await assert.rejects(
    waitForPublication(entries[0]!, "0.8.0", "sha512-exact", {
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
    waitForPublication(entries[0]!, "0.8.0", "sha512-exact", {
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
          entries[0]!,
        ),
      /registry version mismatch/,
    );
  }
});

test("waiting rejects wrong UI dependency and limits latest-tag lag to its deadline", async () => {
  await assert.rejects(
    waitForPublication(uiEntry, "0.8.0", "sha512-exact", {
      readMetadata: async () => ({
        versions: {
          "0.8.0": {
            version: "0.8.0",
            dist: { integrity: "sha512-exact" },
            dependencies: {
              "@lenso/tokens": "0.7.0",
              "@lenso/glass": "0.2.0",
              "@lenso/primitives": "0.9.0",
            },
          },
        },
      }),
      sleep: async () => assert.fail("must not retry a dependency mismatch"),
    }),
    /registry dependency mismatch/,
  );
  let time = 0;
  const sleeps: number[] = [];
  const budgets: number[] = [];
  await assert.rejects(
    waitForPublication(entries[0]!, "0.8.0", "sha512-exact", {
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
  assert.ok(item?.version);
  const manifest = {
    name: item.name,
    version: "0.2.0",
    bin: { "create-lenso-docs": "./src/cli.ts" },
  };
  const files = ["package/LICENSE", "package/template/package.json", "package/src/cli.ts"];
  assert.doesNotThrow(() => validatePackage(manifest, files, {}, item, "0.2.0"));
  assert.throws(
    () => validatePackage(manifest, files.slice(0, 2), {}, item, "0.2.0"),
    /missing.*cli.ts/,
  );
  assert.throws(
    () =>
      validatePackage(
        manifest,
        files.filter((file) => !file.includes("template")),
        {},
        item,
        "0.2.0",
      ),
    /missing.*template/,
  );
  const docs = entries.find((entry) => entry.kind === "docs");
  assert.ok(docs?.version);
  assert.throws(
    () => validatePackage({ name: docs.name, version: "0.2.0" }, [], {}, docs, "0.2.0"),
    /missing.*LICENSE/,
  );
});

test("glass distribution requires exact token pin, original source and LGPL notice", () => {
  const files = [
    "package/dist/index.js",
    "package/dist/index.d.ts",
    "package/dist/react/index.js",
    "package/dist/THIRD_PARTY_NOTICES.md",
    "package/dist/source/src/gpu-blur.ts",
    "package/dist/source/src/gpu-optics.ts",
    "package/dist/source/tsdown.config.ts",
  ];
  const contents = {
    ...Object.fromEntries(files.map((file) => [file, "LGPL-2.0-or-later"])),
    "package/dist/react/index.js": '"use client";\nexport {};',
  };
  const manifest = {
    name: glassEntry.name,
    version: "0.2.0",
    dependencies: { "@lenso/tokens": "0.8.0" },
  };
  assert.doesNotThrow(() =>
    validatePackage(manifest, files, contents, glassEntry, "0.2.0", "0.8.0"),
  );
  assert.throws(
    () =>
      validatePackage(
        { ...manifest, dependencies: { "@lenso/tokens": "0.7.0" } },
        files,
        contents,
        glassEntry,
        "0.2.0",
        "0.8.0",
      ),
    /released @lenso\/tokens/,
  );
  assert.throws(
    () =>
      validatePackage(
        manifest,
        files.filter((file) => !file.endsWith("gpu-blur.ts")),
        contents,
        glassEntry,
        "0.2.0",
        "0.8.0",
      ),
    /gpu-blur/,
  );
  assert.throws(
    () =>
      validatePackage(
        manifest,
        files,
        { ...contents, "package/dist/react/index.js": "export {};" },
        glassEntry,
        "0.2.0",
        "0.8.0",
      ),
    /use client/,
  );
  assert.throws(
    () =>
      validatePackage(
        manifest,
        files,
        { ...contents, "package/dist/THIRD_PARTY_NOTICES.md": "missing" },
        glassEntry,
        "0.2.0",
        "0.8.0",
      ),
    /LGPL notice/,
  );
});
