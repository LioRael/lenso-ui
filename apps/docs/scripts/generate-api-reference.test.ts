import assert from "node:assert/strict";
import { test } from "bun:test";
import { mkdtemp, mkdir, writeFile, readFile, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
import { createHash } from "node:crypto";
import { generateApiReference } from "./generate-api-reference.ts";
import type { ApiPart, ApiProperty } from "@lenso/ui-devtools/contract/types";
import {
  nativeApiFamily,
  nativeApiMarkdown,
  projectNativeApiMarkdown,
  replaceNativeApiSection,
} from "../src/lib/native-api-section.ts";

const root = fileURLToPath(new URL("../../../", import.meta.url));
const dependencies = process.env.API_REFERENCE_DEPENDENCY_ROOT ?? root;
const require = createRequire(import.meta.url);
const { compile } = await import(
  require.resolve("@mdx-js/mdx", { paths: [path.join(dependencies, "packages/docs")] })
);
const contract = await generateApiReference(root, dependencies);
const part = (family: string, name: string) => {
  const found = contract.families[family]?.parts.find((entry) => entry.name === name);
  assert.ok(found, `Missing public part ${family}.${name}`);
  return found;
};
const rows = (entry: ApiPart): Record<string, ApiProperty> =>
  Object.fromEntries(
    entry.properties.map((id) => {
      const row = contract.properties[id];
      return [row.name, row];
    }),
  );

// Native JSDoc can contain unmatched Markdown delimiters; it must remain text, not executable MDX.
test("API Markdown safely quotes native descriptions containing JSX and broken backticks", async () => {
  const description =
    "Children containing a `<CalendarGridHeader>`` and `<CalendarGridBody>` or {callback}.";
  const reference = {
    properties: [
      {
        name: "children",
        expandedType: "ReactNode",
        required: false,
        default: null,
        description,
        source: { path: "node_modules/native/Calendar.d.ts", line: 1 },
      },
    ],
    families: {
      calendar: {
        parts: [
          {
            name: "Calendar",
            signature: "Calendar(props: CalendarProps): React.JSX.Element",
            members: [],
            native: [],
            source: { path: "packages/ui/src/components/calendar/calendar.tsx", line: 1 },
            properties: [0],
            states: {},
          },
        ],
      },
    },
  };
  const markdown = nativeApiMarkdown(reference, "calendar", "en");
  assert.ok(markdown.includes(description));
  const compiled = await compile(markdown);
  assert.ok(compiled.value);
});

// Root CLI and docs preparation must publish the same inherited React prop contract.
test("API generation is independent of the caller's working directory", async () => {
  const previous = process.cwd();
  const digest = (value: unknown) =>
    createHash("sha256").update(JSON.stringify(value)).digest("hex");
  try {
    process.chdir(root);
    const fromRoot = await generateApiReference(root, dependencies);
    process.chdir(path.join(root, "apps/docs"));
    const fromDocs = await generateApiReference(root, dependencies);
    assert.equal(digest(fromRoot), digest(fromDocs));
  } finally {
    process.chdir(previous);
  }
}, 120000);

// Archived RAC tables cannot prove the replacement button's native event and composition API.
test("Button uses native UI SDK props, callbacks, variants and defaults", () => {
  const button = part("button", "ButtonRoot");
  const props = rows(button);
  assert.match(props.disabled.type, /boolean/);
  assert.match(props.onClick.type, /MouseEvent<HTMLElement/);
  assert.match(props.style.type, /\(state: ButtonState\)/);
  assert.match(props.render.type, /ButtonState/);
  for (const variant of ["prominent", "bordered", "borderless"])
    assert.ok(props.variant.expandedType.includes(`"${variant}"`));
  assert.doesNotMatch(
    props.variant.expandedType,
    /"(?:primary|secondary|tertiary|ghost|outline|danger|danger-soft)"/,
  );
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
test("DatePicker retains its generic date model and native supporting parts", () => {
  const picker = part("date-picker", "DatePickerRoot");
  assert.match(picker.signature, /<T extends DateValue = DateValue>/);
  const props = rows(picker);
  assert.match(props.value.type, /^T \| null/);
  assert.match(props.onChange.type, /MappedDateValue<T>/);
  assert.ok(props.isDisabled);
  assert.ok(rows(part("date-picker", "DatePickerTrigger")).onClick);
  assert.ok(rows(part("date-picker", "DatePickerTrigger")).render);
  assert.equal(rows(part("date-picker", "DatePickerTrigger")).onPress, undefined);
  assert.ok(picker.states.DatePickerRenderState.length);
});

test("calendar callback state keeps stable private member names", () => {
  const fields = part("calendar", "CalendarGrid").states.CalendarDate;
  assert.ok(fields.some((field) => field.name === "#private"));
  assert.ok(fields.every((field) => !/^__#\d+@#/.test(field.name)));
});

// A list of styling slots is not evidence that public compound parts exist.
test("supporting tables and compound members come from callable public named exports", async () => {
  assert.ok(part("button", "Button").members.includes("Icon"));
  assert.ok(rows(part("button", "ButtonIcon")).ref);
  assert.ok(part("accordion", "Accordion").members.includes("Trigger"));
  assert.ok(rows(part("accordion", "AccordionTrigger")).render);
  const publicBarrel = await readFile(
    path.join(root, "packages/ui/src/components/index.ts"),
    "utf8",
  );
  const families = [...publicBarrel.matchAll(/from\s+["']\.\/([^/]+)\/index\.js["']/g)].map(
    (match) => match[1],
  );
  assert.deepEqual(Object.keys(contract.families).sort(), families.sort());
  assert.equal(contract.upstream.commit, "e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e");
});

test("native declaration provenance is independent of the package manager store path", () => {
  for (const property of contract.properties) {
    assert.ok(!property.source.path.includes(".bun/"), property.source.path);
    assert.ok(!property.source.path.startsWith("../"), property.source.path);
  }
  assert.match(
    rows(part("button", "ButtonRoot")).disabled.source.path,
    /^node_modules\/@types\/react\//,
  );
});

test("inference failure is actionable, never a placeholder table", async () => {
  const fixture = await mkdtemp(path.join(os.tmpdir(), "native-api-"));
  try {
    const directory = path.join(fixture, "packages/ui/src/components/broken");
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

test("isolated sources resolve React types from the dependency checkout", async () => {
  const fixture = await mkdtemp(path.join(os.tmpdir(), "native-api-dependencies-"));
  try {
    const directory = path.join(fixture, "packages/ui/src/components/example");
    await mkdir(directory, { recursive: true });
    await writeFile(path.join(directory, "../index.ts"), 'export * from "./example/index.js";\n');
    await writeFile(
      path.join(directory, "index.ts"),
      'import type { ReactNode } from "react"; export function Example({children}:{children?:ReactNode}) { return children; }\n',
    );
    const result = await generateApiReference(fixture, dependencies);
    assert.match(
      result.properties.find((property) => property.name === "children")!.type,
      /ReactNode/,
    );
  } finally {
    await rm(fixture, { recursive: true, force: true });
  }
});

// Regex splitting previously mistook example headings for section boundaries
// and discarded the related content that follows a real API section.
test("parsed API replacement ignores fenced examples and retains the following section", async () => {
  let result: Parameters<typeof replaceNativeApiSection>[0]["children"] = [];
  await compile(
    [
      "## Examples",
      "~~~md",
      "## API Reference",
      "~~~",
      "API Reference",
      "-------------",
      "Historical table",
      "### Button props",
      "```md",
      "## Not a boundary",
      "```",
      "## Related Components",
      "Keep this content.",
    ].join("\n"),
    {
      remarkPlugins: [
        () => (tree: Parameters<typeof replaceNativeApiSection>[0]) => {
          replaceNativeApiSection(tree, "button", "en");
          result = tree.children ?? [];
        },
      ],
    },
  );
  assert(result);
  assert.equal(result.filter((node) => node.name === "NativeApiReference").length, 1);
  assert.ok(result.some((node) => node.type === "code" && node.value === "## API Reference"));
  assert.ok(
    result.some(
      (node) => node.type === "heading" && node.children?.[0]?.value === "Related Components",
    ),
  );
  assert.ok(
    result.some(
      (node) => node.type === "paragraph" && node.children?.[0]?.value === "Keep this content.",
    ),
  );
  assert.ok(!result.some((node) => node.type === "code" && node.value === "## Not a boundary"));
});

test("Chinese API sections use Chinese labels and aliases select only component routes", () => {
  const tree: Parameters<typeof replaceNativeApiSection>[0] = {
    type: "root",
    children: [
      { type: "heading", depth: 2, children: [{ type: "text", value: "API 参考" }] },
      { type: "paragraph", children: [{ type: "text", value: "历史属性" }] },
      { type: "heading", depth: 2, children: [{ type: "text", value: "相关组件" }] },
    ],
  };
  replaceNativeApiSection(tree, "textarea", "zh");
  assert.equal(tree.children?.[0]?.attributes?.[1]?.value, "zh");
  assert.equal(tree.children?.[1]?.children?.[0]?.value, "相关组件");
  assert.equal(nativeApiFamily("react/components/text-area"), "textarea");
  assert.equal(nativeApiFamily("react/components/text-field"), "textfield");
  assert.equal(nativeApiFamily("react/components/date-picker"), "date-picker");
  assert.equal(nativeApiFamily("react/migration/button"), undefined);
});

test("clipboard Markdown projects native props without rewriting fenced examples or following content", async () => {
  for (const locale of ["en", "zh"] as const) {
    const title = locale === "zh" ? "API 参考" : "API Reference";
    const before = "## Examples\n\n~~~md\n## API Reference\nisDisabled example\n~~~\n\n";
    const after = "## Related Components\n\nKeep **this** content.\n";
    const source = `${before}## ${title}\n\n| isDisabled | onPress |\n\n### Historical props\n\nOld table\n\n${after}`;
    let projected = "";
    await compile(source, {
      remarkPlugins: [
        () => (tree: Parameters<typeof replaceNativeApiSection>[0]) => {
          projected = projectNativeApiMarkdown(
            source,
            tree,
            nativeApiMarkdown(contract, "button", locale),
          );
        },
      ],
    });
    assert.ok(projected.startsWith(before));
    assert.ok(projected.endsWith(after));
    assert.ok(!projected.includes("| isDisabled | onPress |"));
    assert.ok(!projected.includes("Historical props"));
    assert.match(projected, /\| ` disabled ` \|/);
    assert.match(projected, /\| ` onClick ` \|/);
    assert.match(projected, /\| ` render ` \|/);
    assert.match(projected, /ButtonState/);
    assert.match(projected, /Button\.Icon/);
    assert.match(
      projected,
      locale === "zh" ? /\| 属性 \| 类型 \| 必填 \|/ : /\| Property \| Type \| Required \|/,
    );
  }
});

test("clipboard picker Markdown retains generic signatures and contextual supporting exports", () => {
  const markdown = nativeApiMarkdown(contract, "date-picker", "en");
  assert.match(markdown, /<T extends DateValue = DateValue>/);
  assert.match(markdown, /MappedDateValue<T>/);
  assert.match(markdown, /DatePickerTrigger/);
  assert.match(markdown, /DatePickerRenderState/);
  assert.match(markdown, /Only literal defaults/);
});
