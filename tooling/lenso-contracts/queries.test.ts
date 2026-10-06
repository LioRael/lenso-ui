import assert from "node:assert/strict";
import test from "node:test";
import { fixture, fixtureSource } from "../../packages/cli/tests/fixture.ts";
import { createQueries, validateToolContract } from "../../packages/cli/src/contract.ts";

// Core codec tests do not prove that developer tools resolve native part names to the same release's source.
test("typed developer queries share one release identity and return exact source/theme data", async () => {
  const input = await fixtureSource();
  const contract = await fixture();
  const queries = createQueries(JSON.parse(JSON.stringify(contract)));
  assert.equal(validateToolContract(contract), contract);
  assert.deepEqual(queries.source("Menu"), input.sources[0]);
  assert.deepEqual(queries.source("menu"), queries.source("Menu"));
  assert.deepEqual(queries.theme(), input.theme);
  assert.equal(queries.metadata().digest, contract.digest);
  assert.equal(queries.metadata().lensoVersion, input.packageVersions["@lenso/ui"]);
  assert.equal(queries.api("Menu").slug, "menu");
  assert.equal(queries.list()[0]?.slug, "menu");
  assert.deepEqual(queries.documentation("Menu"), input.docs[0]);
  assert.deepEqual(queries.examples("Menu"), input.examples);
  assert.deepEqual(queries.styles("Menu"), input.styles);
  assert.equal(queries.search("Menu").length, 1);
  assert.throws(() => queries.source("Dropdown"), /Unknown component/);
  assert.throws(() => createQueries({ ...contract, formatVersion: 2 }), /require format 3/);
});
