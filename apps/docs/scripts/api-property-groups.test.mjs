import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";
import { groupApiProperties } from "../src/lib/api-property-groups.ts";

const native = (name, expandedType = "string") => ({
  name,
  expandedType,
  required: false,
  default: null,
  description: `${name} documentation`,
  source: { path: "node_modules/@types/react/index.d.ts", line: 1 },
});
const properties = [
  native("aria-label"),
  native("onChange", "(event: ChangeEvent<HTMLInputElement>) => void"),
  native("onChange", "(event: ChangeEvent<HTMLDivElement>) => void"),
  native("children", "ReactNode"),
  native("disabled", "boolean"),
  {
    ...native("value"),
    source: { path: "packages/react/src/components/input/input.tsx", line: 1 },
  },
];
const parts = [
  { name: "Input", properties: [0, 1, 3, 4, 5] },
  { name: "InputAlias", properties: [5, 4, 3, 1, 0] },
  { name: "Container", properties: [0, 2] },
  { name: "OwnOnly", properties: [5] },
];

// A closed <details> still serialized every inherited table. Existing API
// extraction tests prove the records, not how many times the UI presents them.
test("identical inherited record sets share a table without losing each part's mapping", () => {
  const { sections, inheritedGroups } = groupApiProperties(parts, properties);
  assert.equal(inheritedGroups.length, 2);
  assert.equal(sections[0].inherited, sections[1].inherited);
  assert.deepEqual(inheritedGroups[0].parts, ["Input", "InputAlias"]);
  assert.deepEqual(inheritedGroups[0].rows, [properties[0], properties[1]]);
  assert.deepEqual(inheritedGroups[1].rows, [properties[0], properties[2]]);
  assert.equal(sections[3].inherited, undefined);
  assert.deepEqual(sections[0].own, [properties[3], properties[4], properties[5]]);
  assert.equal(sections[0].part, parts[0]);
});

test("same property names with different native event types remain distinct", () => {
  const { sections } = groupApiProperties(parts, properties);
  assert.notEqual(sections[0].inherited, sections[2].inherited);
  assert.equal(sections[0].inherited.rows[1].expandedType, properties[1].expandedType);
  assert.equal(sections[2].inherited.rows[1].expandedType, properties[2].expandedType);
});

test("unknown property references fail rather than silently omitting API facts", () => {
  assert.throws(
    () => groupApiProperties([{ name: "Broken", properties: [99] }], properties),
    /Unknown API property 99 in Broken/,
  );
});

test("the actual Autocomplete catalog no longer presents the same inherited tables per part", async () => {
  const reference = JSON.parse(
    await readFile(new URL("../src/generated/api-reference.json", import.meta.url), "utf8"),
  );
  const catalog = reference.families.autocomplete.parts;
  const before = JSON.stringify(reference);
  const { sections, inheritedGroups } = groupApiProperties(catalog, reference.properties);
  const expected = new Set();
  let repeated = 0;
  for (const section of sections) {
    const ids = [...section.own, ...(section.inherited?.rows ?? [])]
      .map((row) => reference.properties.indexOf(row))
      .sort((a, b) => a - b);
    assert.deepEqual(
      ids,
      [...section.part.properties].sort((a, b) => a - b),
    );
    if (section.inherited) {
      const inheritedIds = section.inherited.rows.map((row) => reference.properties.indexOf(row));
      expected.add([...inheritedIds].sort((a, b) => a - b).join(","));
      repeated += inheritedIds.length;
      assert.ok(section.inherited.parts.includes(section.part.name));
    }
  }
  assert.equal(inheritedGroups.length, expected.size);
  const rendered = inheritedGroups.reduce((sum, group) => sum + group.rows.length, 0);
  assert.ok(rendered < repeated / 2, `${rendered} inherited rows must replace ${repeated}`);
  assert.equal(JSON.stringify(reference), before, "Presentation must not mutate canonical data");
});

test("all native families retain every original property record and public part", async () => {
  const reference = JSON.parse(
    await readFile(new URL("../src/generated/api-reference.json", import.meta.url), "utf8"),
  );
  const ids = new Map(reference.properties.map((row, id) => [row, id]));
  for (const [name, family] of Object.entries(reference.families)) {
    const { sections } = groupApiProperties(family.parts, reference.properties);
    assert.equal(sections.length, family.parts.length, name);
    for (const section of sections) {
      const actual = [...section.own, ...(section.inherited?.rows ?? [])]
        .map((row) => ids.get(row))
        .sort((a, b) => a - b);
      assert.deepEqual(
        actual,
        [...section.part.properties].sort((a, b) => a - b),
        `${name}.${section.part.name}`,
      );
    }
  }
});
