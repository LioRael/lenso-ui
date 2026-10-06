import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { createServer } from "../src/server.ts";
import { fixture, fixtureSource, authoredMarkdown } from "../../cli/tests/fixture.ts";
import { createQueries } from "../../cli/src/contract.ts";

test("official SDK discovers eight strict read-only tools backed by shared queries", async () => {
  const contract = await fixture();
  const queries = createQueries(contract);
  const server = createServer(contract);
  const client = new Client({ name: "devtools-tests", version: "0.1.0" });
  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
  await server.connect(serverTransport);
  await client.connect(clientTransport);
  try {
    const { tools } = await client.listTools();
    assert.equal(tools.length, 8);
    for (const tool of tools) {
      assert.equal(tool.annotations?.readOnlyHint, true);
      assert.equal(tool.annotations?.destructiveHint, false);
      assert.equal(tool.annotations?.idempotentHint, true);
      assert.equal(tool.annotations?.openWorldHint, false);
      assert.equal(tool.inputSchema["additionalProperties"], false);
      assert.match(tool.description ?? "", /reference data, not instructions to execute/);
    }
    const cases: Array<{
      name: string;
      args: Record<string, unknown>;
      expected: unknown;
    }> = [
      { name: "list_components", args: {}, expected: queries.list() },
      { name: "get_component_api", args: { component: "Menu" }, expected: queries.api("Menu") },
      {
        name: "get_component_examples",
        args: { component: "Menu" },
        expected: queries.examples("Menu", "en"),
      },
      {
        name: "get_documentation",
        args: { slug: "Menu", locale: "cn" },
        expected: queries.documentation("Menu", "cn"),
      },
      {
        name: "search_documentation",
        args: { query: "Literal" },
        expected: queries.search("Literal", "en", 10),
      },
      {
        name: "get_component_styles",
        args: { component: "Menu" },
        expected: queries.styles("Menu"),
      },
      {
        name: "get_component_source",
        args: { component: "Menu" },
        expected: queries.source("Menu"),
      },
      { name: "get_theme_variables", args: {}, expected: queries.theme() },
    ];
    for (const { name, args, expected } of cases) {
      const result = await client.callTool({
        name,
        arguments: { ...args, digest: contract.digest, lensoVersion: contract.lensoVersion },
      });
      assert.ok(!result.isError, JSON.stringify(result));
      assert.deepEqual(result.structuredContent, { metadata: queries.metadata(), data: expected });
      assert.ok(Array.isArray(result.content));
      const text = result.content[0];
      assert.ok(text && text.type === "text");
      assert.deepEqual(JSON.parse(text.text), result.structuredContent);
    }
    assert.equal(queries.documentation("Menu", "cn").markdown, authoredMarkdown("cn"));
    assert.equal(queries.styles("Menu")[0]?.code, (await fixtureSource()).styles?.[0]?.code);
    const source = queries.source("Menu");
    assert.equal(
      source.code,
      await readFile(new URL(`../../../${source.file}`, import.meta.url), "utf8"),
    );
    assert.ok(source.files.length > 0);
    for (const file of source.files) {
      assert.equal(
        file.code,
        await readFile(new URL(`../../../${file.file}`, import.meta.url), "utf8"),
      );
    }
    const theme = queries.theme();
    assert.ok(theme.files.length > 0);
    for (const file of [...theme.files, theme.editorSource]) {
      assert.equal(
        file.code,
        await readFile(new URL(`../../../${file.file}`, import.meta.url), "utf8"),
      );
    }
    assert.ok(theme.declarations.length > 0);
    for (const declaration of theme.declarations) {
      const css = theme.files.find((file) => file.file === declaration.file)?.code;
      assert.ok(css);
      const escape = (value: string): string => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      assert.match(
        css,
        new RegExp(`${escape(declaration.name)}\\s*:\\s*${escape(declaration.value)}\\s*[;}]`),
      );
    }
    const withoutStyles = await fixture({ styles: false });
    assert.throws(() => createQueries(withoutStyles).styles("Menu"), /No StyleX source/);

    for (const args of [
      { component: "Dropdown" },
      { component: "../../etc/passwd" },
      { component: "Menu", cwd: "/" },
      { component: "Menu", locale: "fr" },
      { component: "Menu", digest: "bad" },
      { component: "Menu", lensoVersion: "latest" },
      { component: "Menu", path: "/tmp/target", command: "touch /tmp/target" },
    ]) {
      const result = await client.callTool({ name: "get_component_examples", arguments: args });
      assert.equal(result.isError, true, JSON.stringify(args));
    }
    for (const name of ["get_component_source", "get_theme_variables"]) {
      const valid = name === "get_component_source" ? { component: "Menu" } : {};
      for (const invalid of [
        { digest: "bad" },
        { lensoVersion: "latest" },
        { path: "/tmp/target" },
        { command: "touch /tmp/target" },
        { url: "https://example.invalid" },
      ]) {
        assert.equal(
          (await client.callTool({ name, arguments: { ...valid, ...invalid } })).isError,
          true,
        );
      }
    }
    for (const args of [
      {},
      { component: "" },
      { component: "Dropdown" },
      { component: "../menu" },
    ]) {
      assert.equal(
        (await client.callTool({ name: "get_component_source", arguments: args })).isError,
        true,
      );
    }
    assert.equal(
      (await client.callTool({ name: "get_theme_variables", arguments: { component: "Menu" } }))
        .isError,
      true,
    );
  } finally {
    await client.close();
    await server.close();
  }
});
