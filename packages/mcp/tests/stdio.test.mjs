import assert from "node:assert/strict";
import test from "node:test";
import { mkdtemp, writeFile, readdir } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { build } from "esbuild";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { fixture, fixtureSource, authoredMarkdown } from "../../cli/tests/fixture.mjs";

test("standalone fixture bundle speaks stdio JSON-RPC, returns code as data and rejects malicious requests", async () => {
  const root = await mkdtemp(join(tmpdir(), "lenso-stdio-test-"));
  const contract = await fixture();
  await writeFile(join(root, "lenso-contract.json"), JSON.stringify(contract));
  await build({
    entryPoints: [fileURLToPath(new URL("../src/server.mjs", import.meta.url))],
    outfile: join(root, "server.mjs"),
    bundle: true,
    format: "esm",
    platform: "node",
    target: "node24",
    banner: {
      js: "import { createRequire } from 'node:module'; const require = createRequire(import.meta.url);",
    },
    plugins: process.env.LENSO_TEST_CONTRACT_CORE
      ? [
          {
            name: "test-only-current-private-core",
            setup(builder) {
              builder.onResolve({ filter: /\/tooling\/lenso-contracts\/index\.mjs$/ }, () => ({
                path: process.env.LENSO_TEST_CONTRACT_CORE,
              }));
            },
          },
        ]
      : [],
  });
  const before = await readdir(root);
  const client = new Client({ name: "stdio-test", version: "0.1.0" });
  const transport = new StdioClientTransport({
    command: process.execPath,
    args: [join(root, "server.mjs")],
    cwd: root,
    stderr: "pipe",
    env: { PATH: process.env.PATH ?? "" },
  });
  let stderr = "";
  transport.stderr?.on("data", (chunk) => {
    stderr += chunk;
  });
  try {
    await client.connect(transport);
  } catch (error) {
    throw new Error(`${error.message}\n${stderr}`, { cause: error });
  }
  try {
    assert.equal((await client.listTools()).tools.length, 6);
    const doc = await client.callTool({ name: "get_documentation", arguments: { slug: "menu" } });
    assert.equal(JSON.parse(doc.content[0].text).data.markdown, authoredMarkdown("en"));
    const styles = await client.callTool({
      name: "get_component_styles",
      arguments: { component: "Menu" },
    });
    assert.ok(!styles.isError);
    assert.equal(
      JSON.parse(styles.content[0].text).data[0].code,
      (await fixtureSource()).styles[0].code,
    );
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
