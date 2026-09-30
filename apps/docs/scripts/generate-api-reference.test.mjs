import assert from "node:assert/strict";
import { test } from "node:test";
import { mkdtemp, mkdir, writeFile, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { generateApiReference } from "./generate-api-reference.mjs";

const root = fileURLToPath(new URL("../../../", import.meta.url));
const dependencies = process.env.API_REFERENCE_DEPENDENCY_ROOT ?? root;
const contract = await generateApiReference(root, dependencies);
const part = (family, name) => {
  const found = contract.families[family]?.parts.find((entry) => entry.name === name);
  assert.ok(found, `Missing public part ${family}.${name}`);
  return found;
};
const rows = (entry) =>
  Object.fromEntries(
    entry.properties.map((id) => {
      const row = contract.properties[id];
      return [row.name, row];
    }),
  );

// Archived RAC tables cannot prove the replacement button's native event and composition API.
test("Button uses the actual Base UI props, callbacks, variants and defaults", () => {
  const button = part("button", "ButtonRoot");
  const props = rows(button);
  assert.match(props.disabled.type, /boolean/);
  assert.match(props.onClick.type, /MouseEvent<HTMLButtonElement/);
  assert.match(props.style.type, /\(state: ButtonState\)/);
  assert.match(props.render.type, /ButtonState/);
  assert.match(props.variant.expandedType, /"primary"/);
  assert.ok(props.ref);
  assert.ok(props.xstyle);
  assert.equal(props.isLoading.default, "false");
  assert.equal(props.variant.default, null);
  assert.equal(props.isDisabled, undefined);
  assert.equal(props.onPress, undefined);
  assert.equal(props.className, undefined);
  assert.ok(button.states.ButtonState.some((field) => field.name === "disabled"));
});

// Resolving a generic through ComponentProps would silently widen its date value.
test("DatePicker retains its generic RAC value and contextual supporting parts", () => {
  const picker = part("date-picker", "DatePickerRoot");
  assert.match(picker.signature, /<T extends DateValue>/);
  const props = rows(picker);
  assert.match(props.value.type, /^T \| null/);
  assert.match(props.onChange.type, /MappedDateValue<T>/);
  assert.ok(props.isDisabled);
  assert.ok(rows(part("date-picker", "DatePickerTrigger")).onPress);
  assert.ok(picker.states.DatePickerRenderProps.length);
});

// A list of styling slots is not evidence that public compound parts exist.
test("supporting tables and compound members come from callable public named exports", () => {
  assert.ok(part("button", "Button").members.includes("Icon"));
  assert.ok(rows(part("button", "ButtonIcon")).ref);
  assert.ok(part("accordion", "Accordion").members.includes("Trigger"));
  assert.ok(rows(part("accordion", "AccordionTrigger")).render);
  assert.equal(Object.keys(contract.families).length, 85);
  assert.equal(contract.upstream.commit, "e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e");
});

test("inference failure is actionable, never a placeholder table", async () => {
  const fixture = await mkdtemp(path.join(os.tmpdir(), "native-api-"));
  try {
    const directory = path.join(fixture, "packages/react/src/components/broken");
    await mkdir(directory, { recursive: true });
    await writeFile(path.join(directory, "../index.ts"), 'export * from "./broken/index.js";\n');
    await writeFile(
      path.join(directory, "index.ts"),
      "export function Broken(props: any) { return props; }\n",
    );
    await assert.rejects(
      generateApiReference(fixture, dependencies),
      /broken.Broken: props inference failed/,
    );
  } finally {
    await rm(fixture, { recursive: true, force: true });
  }
});
