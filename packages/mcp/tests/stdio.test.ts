import assert from "node:assert/strict";
import { afterEach, test } from "bun:test";
import { mkdtemp, writeFile, readdir, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { fixture, authoredMarkdown } from "@lenso/ui-devtools/testing";
import { createQueries } from "@lenso/ui-devtools/queries";

const temporaryDirectories: string[] = [];
afterEach(async () => {
  await Promise.all(
    temporaryDirectories
      .splice(0)
      .map((directory) => rm(directory, { recursive: true, force: true })),
  );
});

test("standalone fixture bundle speaks stdio JSON-RPC, returns code as data and rejects malicious requests", async () => {
  const root = await mkdtemp(join(tmpdir(), "lenso-stdio-test-"));
  temporaryDirectories.push(root);
  const contract = await fixture();
  const queries = createQueries(contract);
  await writeFile(join(root, "package.json"), '{"type":"module"}\n');
  await writeFile(join(root, "lenso-contract.json"), JSON.stringify(contract));
  await Bun.build({
    entrypoints: [fileURLToPath(new URL("../src/server.ts", import.meta.url))],
    outdir: root,
    naming: "server.js",
    format: "esm",
    target: "bun",
    plugins: process.env["LENSO_TEST_CONTRACT_CORE"]
      ? [
          {
            name: "test-only-current-private-core",
            setup(builder) {
              builder.onResolve(
                { filter: /^(?:@lenso\/ui-devtools\/contract|\.\/contract\/index\.ts)$/ },
                () => ({
                  path: process.env["LENSO_TEST_CONTRACT_CORE"] ?? "",
                }),
              );
            },
          },
        ]
      : [],
  });
  const before = await readdir(root);
  const client = new Client({ name: "stdio-test", version: "0.1.0" });
  const transport = new StdioClientTransport({
    command: process.execPath,
    args: [join(root, "server.js")],
    cwd: root,
    stderr: "pipe",
    env: { PATH: process.env["PATH"] ?? "" },
  });
  let stderr = "";
  transport.stderr?.on("data", (chunk) => {
    stderr += chunk;
  });
  try {
    await client.connect(transport);
  } catch (error) {
    throw new Error(`${error instanceof Error ? error.message : String(error)}\n${stderr}`, {
      cause: error,
    });
  }
  try {
    assert.equal((await client.listTools()).tools.length, 8);
    const doc = await client.callTool({ name: "get_documentation", arguments: { slug: "menu" } });
    assert.deepEqual(doc.structuredContent, {
      metadata: queries.metadata(),
      data: queries.documentation("menu", "en"),
    });
    assert.equal(queries.documentation("menu", "en").markdown, authoredMarkdown("en"));
    const styles = await client.callTool({
      name: "get_component_styles",
      arguments: { component: "Menu" },
    });
    assert.ok(!styles.isError);
    assert.deepEqual(styles.structuredContent, {
      metadata: queries.metadata(),
      data: queries.styles("Menu"),
    });
    for (const [name, args, expected] of [
      ["get_component_source", { component: "Menu" }, queries.source("Menu")],
      ["get_theme_variables", {}, queries.theme()],
    ] as const) {
      const result = await client.callTool({ name, arguments: args });
      assert.ok(!result.isError);
      assert.deepEqual(result.structuredContent, { metadata: queries.metadata(), data: expected });
      for (const invalid of [
        { digest: "bad" },
        { lensoVersion: "latest" },
        { path: "../../private", command: "touch SHOULD_NOT_EXIST" },
        { url: "https://example.invalid" },
      ]) {
        assert.equal(
          (await client.callTool({ name, arguments: { ...args, ...invalid } })).isError,
          true,
        );
      }
    }
    for (const args of [
      { slug: "../../private" },
      { slug: "menu", shell: "touch SHOULD_NOT_EXIST" },
      { slug: "menu", url: "https://example.invalid" },
      { slug: "menu", locale: "fr" },
    ])
      assert.equal(
        (await client.callTool({ name: "get_documentation", arguments: args })).isError,
        true,
      );
    assert.equal(stderr, "");
    assert.deepEqual(await readdir(root), before);
  } finally {
    await client.close();
  }
});
