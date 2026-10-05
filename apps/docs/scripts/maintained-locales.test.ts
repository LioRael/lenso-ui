import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import ts from "typescript-api";
import type { LiveManifest } from "./generate-live-registry.ts";
import { localExampleFiles } from "../src/lib/local-example-files.ts";
import { fileURLToPath } from "node:url";

const root = new URL("../", import.meta.url);
const readDemo = (file: string) => readFile(new URL(`src/demos/${file}`, root), "utf8");
function attributes(code: string, name: string): string[] {
  const source = ts.createSourceFile(
    "demo.tsx",
    code,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX,
  );
  const values: string[] = [];
  function visit(node: ts.Node): void {
    if (
      ts.isJsxAttribute(node) &&
      node.name.getText(source) === name &&
      node.initializer &&
      ts.isStringLiteral(node.initializer)
    )
      values.push(node.initializer.text);
    ts.forEachChild(node, visit);
  }
  visit(source);
  return values.sort();
}

// Byte pins previously caught all edits, but did not express the form-submission invariant.
test("maintained Chinese examples preserve programmatic form field names", async () => {
  const live: LiveManifest = JSON.parse(
    await readFile(new URL("src/demos/live-manifest.json", root), "utf8"),
  );
  const visited = new Set<string>();
  const fieldNames = async (file: string) =>
    [
      ...new Set(
        (await localExampleFiles(file, fileURLToPath(root))).flatMap(({ code }) =>
          attributes(code, "name"),
        ),
      ),
    ].sort();
  for (const [name, file] of Object.entries(live.cn)) {
    if (!file.startsWith("cn/") || visited.has(file)) continue;
    visited.add(file);
    assert.deepEqual(
      await fieldNames(file),
      await fieldNames(live.en[name]),
      `Translated programmatic field name in ${file}`,
    );
  }
});

test("Status accessible names are localized without translating their submitted key", async () => {
  for (const [locale, label] of [
    ["en", "Status"],
    ["cn", "状态"],
  ]) {
    const code = await readDemo(`${locale}/input-group/with-loading-suffix.tsx`);
    assert.deepEqual(attributes(code, "name"), ["status"]);
    assert.ok(attributes(code, "aria-label").includes(label));
  }
});

function programChoices(
  code: string,
  collections: Record<string, string>,
  selectionBindings: string[] = [],
): string[] {
  const source = ts.createSourceFile(
    "demo.tsx",
    code,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX,
  );
  const values = new Set<string>();
  const choiceParts = new Set([
    "Select",
    "Select.Root",
    "Select.Item",
    "SelectExample",
    "ListBoxItem",
    "ListBox.Item",
    "Radio",
    "RadioGroup",
    "PlanGroup",
    "Tabs",
    "Tabs.Root",
    "Tabs.Tab",
    "Tabs.Panel",
  ]);
  const literal = (node: ts.Node | undefined): string | undefined =>
    node && (ts.isStringLiteral(node) || ts.isNumericLiteral(node)) ? node.text : undefined;
  function collectProperties(node: ts.Node, property: string): void {
    if (ts.isPropertyAssignment(node) && node.name.getText(source) === property) {
      const value = literal(node.initializer);
      if (value !== undefined) values.add(`collection:${property}:${value}`);
    }
    ts.forEachChild(node, (child) => collectProperties(child, property));
  }
  function visit(node: ts.Node): void {
    if (ts.isVariableDeclaration(node) && ts.isIdentifier(node.name) && node.initializer) {
      const property = collections[node.name.text];
      if (property) collectProperties(node.initializer, property);
    }
    if (ts.isJsxOpeningElement(node) || ts.isJsxSelfClosingElement(node)) {
      const part = node.tagName.getText(source);
      if (choiceParts.has(part))
        for (const attribute of node.attributes.properties) {
          if (!ts.isJsxAttribute(attribute) || !attribute.initializer) continue;
          const name = attribute.name.getText(source);
          if (!["value", "defaultValue", "itemKey", "id"].includes(name)) continue;
          const value = literal(
            ts.isJsxExpression(attribute.initializer)
              ? attribute.initializer.expression
              : attribute.initializer,
          );
          if (value !== undefined) values.add(`${part}:${name}:${value}`);
        }
    }
    if (
      ts.isVariableDeclaration(node) &&
      ts.isArrayBindingPattern(node.name) &&
      selectionBindings.includes(node.name.elements[0]?.getText(source) ?? "") &&
      node.initializer &&
      ts.isCallExpression(node.initializer) &&
      node.initializer.expression.getText(source) === "useState"
    ) {
      const value = literal(node.initializer.arguments[0]);
      if (value !== undefined) values.add(`initial-selection:${value}`);
    }
    ts.forEachChild(node, visit);
  }
  visit(source);
  return [...values].sort();
}

// These scenes cover helper-backed options, collection keys, controlled defaults
// and Tab/Panel matching. Labels, text inputs and layout are deliberately outside
// the comparison; both locales can evolve their composition and choice sets.
test("localized selectable scenes preserve option keys, selection values and Tab/Panel IDs", async () => {
  const fixtures: {
    file: string;
    collections: Record<string, string>;
    selections: string[];
    required: string[];
  }[] = [
    {
      file: "select/controlled.tsx",
      collections: { states: "value", controlledStates: "value" },
      selections: ["state"],
      required: ["collection:value:", "initial-selection:"],
    },
    {
      file: "list-box/default.tsx",
      collections: { users: "key" },
      selections: [],
      required: ["collection:key:"],
    },
    {
      file: "radio-group/basic.tsx",
      collections: {
        plans: "value",
        subscriptions: "value",
        deliveryOptions: "value",
        paymentOptions: "value",
      },
      selections: ["value", "selection"],
      required: ["collection:value:", "RadioGroup:defaultValue:", "initial-selection:"],
    },
    {
      file: "tabs/basic.tsx",
      collections: {},
      selections: [],
      required: ["Tabs.Tab:value:", "Tabs.Panel:value:"],
    },
  ];
  for (const { file, collections, selections, required } of fixtures) {
    const choices = async (locale: string) =>
      [
        ...new Set(
          (await localExampleFiles(`${locale}/${file}`, fileURLToPath(root))).flatMap(({ code }) =>
            programChoices(code, collections, selections),
          ),
        ),
      ].sort();
    const english = await choices("en");
    for (const prefix of required)
      assert.ok(
        english.some((value) => value.startsWith(prefix)),
        `Missing ${prefix} in ${file}`,
      );
    assert.deepEqual(await choices("cn"), english, `Localized selectable keys changed: ${file}`);
  }
});

test("program-choice comparison allows translated input text but detects translated option IDs", () => {
  const english = `<><Input value="Sending..." /><Tabs.Tab value="overview">Overview</Tabs.Tab><Tabs.Panel value="overview" /></>`;
  const chinese = `<><Input value="发送中…" /><Tabs.Tab value="overview">概览</Tabs.Tab><Tabs.Panel value="overview" /></>`;
  assert.deepEqual(programChoices(chinese, {}), programChoices(english, {}));
  assert.notDeepEqual(
    programChoices(chinese.replaceAll('value="overview"', 'value="概览"'), {}),
    programChoices(english, {}),
  );
  assert.notDeepEqual(
    programChoices('const users = [{ key: "一", textValue: "用户" }];', { users: "key" }),
    programChoices('const users = [{ key: "1", textValue: "User" }];', { users: "key" }),
  );
});
