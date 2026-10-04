import assert from "node:assert/strict";
import test from "node:test";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { createServer } from "../src/server.mjs";
import { fixture, fixtureSource, authoredMarkdown } from "../../cli/tests/fixture.mjs";
import { createQueries } from "../../cli/src/contract.mjs";

test("official SDK client discovers six read-only tools and calls actual native queries", async () => {
  const contract = await fixture();
  const server = createServer(contract);
  const client = new Client({ name: "devtools-tests", version: "0.1.0" });
  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
  await server.connect(serverTransport);
  await client.connect(clientTransport);
  try {
    const { tools } = await client.listTools();
    assert.equal(tools.length, 6);
    for (const tool of tools) {
      assert.equal(tool.annotations.readOnlyHint, true);
      assert.equal(tool.annotations.destructiveHint, false);
      assert.equal(tool.annotations.openWorldHint, false);
      assert.equal(tool.inputSchema.additionalProperties, false);
    }
    const call = async (name, args) => {
      const result = await client.callTool({ name, arguments: args });
      assert.ok(!result.isError, JSON.stringify(result));
      return JSON.parse(result.content[0].text);
    };
    assert.equal((await call("list_components", {})).metadata.digest, contract.digest);
    const api = await call("get_component_api", { component: "Menu" });
    assert.ok(api.data.parts.some((part) => part.properties.some((row) => row.name === "render")));
    assert.equal(
      (await call("get_component_examples", { component: "Menu" })).data[0].name,
      "dropdown-basic",
    );
    assert.equal(
      (await call("get_documentation", { slug: "Menu", locale: "cn" })).data.markdown,
      authoredMarkdown("cn"),
    );
    assert.equal((await call("search_documentation", { query: "Literal" })).data.length, 1);
    const styles = await call("get_component_styles", { component: "Menu" });
    assert.equal(styles.data[0].code, (await fixtureSource()).styles[0].code);
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
  } finally {
    await client.close();
    await server.close();
  }
});
