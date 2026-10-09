import assert from "node:assert/strict";
import { test } from "node:test";
import { mkdtemp, mkdir, writeFile, readFile, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
import { createHash } from "node:crypto";
import { generateApiReference } from "./generate-api-reference.mjs";
import {
  nativeApiFamily,
  nativeApiMarkdown,
  projectNativeApiMarkdown,
  replaceNativeApiSection,
} from "../src/lib/native-api-section.ts";

const root = fileURLToPath(new URL("../../../", import.meta.url));
const dependencies = process.env.API_REFERENCE_DEPENDENCY_ROOT ?? root;
const require = createRequire(import.meta.url);
const { compileMDX } = await import(
  require.resolve("next-mdx-remote/rsc", { paths: [path.join(dependencies, "apps/docs")] })
);
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
            source: { path: "packages/react/src/components/calendar/calendar.tsx", line: 1 },
            properties: [0],
            states: {},
          },
        ],
      },
    },
  };
  const markdown = nativeApiMarkdown(reference, "calendar", "en");
  assert.ok(markdown.includes(description));
  const compiled = await compileMDX({ source: markdown });
  assert.ok(compiled.content);
});

// Root CLI and docs preparation must publish the same inherited React prop contract.
test("API generation is independent of the caller's working directory", async () => {
  const previous = process.cwd();
  const digest = (value) => createHash("sha256").update(JSON.stringify(value)).digest("hex");
  try {
    process.chdir(root);
    const fromRoot = await generateApiReference(root, dependencies);
    process.chdir(path.join(root, "apps/docs"));
    const fromDocs = await generateApiReference(root, dependencies);
    assert.equal(digest(fromRoot), digest(fromDocs));
  } finally {
    process.chdir(previous);
  }
});

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
test("supporting tables and compound members come from callable public named exports", async () => {
  assert.ok(part("button", "Button").members.includes("Icon"));
  assert.ok(rows(part("button", "ButtonIcon")).ref);
  assert.ok(part("accordion", "Accordion").members.includes("Trigger"));
  assert.ok(rows(part("accordion", "AccordionTrigger")).render);
  for (const member of ["FilterProvider", "Input", "List", "Clear", "Empty"]) {
    assert.ok(part("menu", "Menu").members.includes(member));
    assert.ok(part("menu", `Menu${member}`).properties.length);
  }
  assert.ok(rows(part("menu", "MenuFilterProvider")).onValueChange);
  assert.ok(rows(part("menu", "MenuInput")).ref);
  assert.ok(rows(part("menu", "MenuInput")).render);
  assert.ok(rows(part("menu", "MenuInput")).xstyle);
  assert.ok(rows(part("menu", "MenuRoot")).onItemHighlighted);
  const publicBarrel = await readFile(
    path.join(root, "packages/react/src/components/index.ts"),
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
    assert.ok(!property.source.path.includes(".pnpm/"), property.source.path);
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

// Regex splitting previously mistook example headings for section boundaries
// and discarded the related content that follows a real API section.
test("parsed API replacement ignores fenced examples and retains the following section", async () => {
  let result;
  await compileMDX({
    source: [
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
    components: { NativeApiReference: () => null },
    options: {
      mdxOptions: {
        remarkPlugins: [
          () => (tree) => {
            replaceNativeApiSection(tree, "button", "en");
            result = tree.children;
          },
        ],
      },
    },
  });
  assert.equal(result.filter((node) => node.name === "NativeApiReference").length, 1);
  assert.ok(result.some((node) => node.type === "code" && node.value === "## API Reference"));
  assert.ok(
    result.some(
      (node) => node.type === "heading" && node.children[0].value === "Related Components",
    ),
  );
  assert.ok(
    result.some(
      (node) => node.type === "paragraph" && node.children[0].value === "Keep this content.",
    ),
  );
  assert.ok(!result.some((node) => node.type === "code" && node.value === "## Not a boundary"));
});

test("Chinese API sections use Chinese labels and aliases select only component routes", () => {
  const tree = {
    type: "root",
    children: [
      { type: "heading", depth: 2, children: [{ type: "text", value: "API 参考" }] },
      { type: "paragraph", children: [{ type: "text", value: "历史属性" }] },
      { type: "heading", depth: 2, children: [{ type: "text", value: "相关组件" }] },
    ],
  };
  replaceNativeApiSection(tree, "textarea", "zh");
  assert.equal(tree.children[0].attributes[1].value, "zh");
  assert.equal(tree.children[1].children[0].value, "相关组件");
  assert.equal(nativeApiFamily("react/components/text-area"), "textarea");
  assert.equal(nativeApiFamily("react/components/text-field"), "textfield");
  assert.equal(nativeApiFamily("react/components/date-picker"), "date-picker");
  assert.equal(nativeApiFamily("react/migration/button"), undefined);
});

test("clipboard Markdown projects native props without rewriting fenced examples or following content", async () => {
  for (const locale of ["en", "zh"]) {
    const title = locale === "zh" ? "API 参考" : "API Reference";
    const before = "## Examples\n\n~~~md\n## API Reference\nisDisabled example\n~~~\n\n";
    const after = "## Related Components\n\nKeep **this** content.\n";
    const source = `${before}## ${title}\n\n| isDisabled | onPress |\n\n### Historical props\n\nOld table\n\n${after}`;
    let projected;
    await compileMDX({
      source,
      options: {
        mdxOptions: {
          remarkPlugins: [
            () => (tree) => {
              projected = projectNativeApiMarkdown(
                source,
                tree,
                nativeApiMarkdown(contract, "button", locale),
              );
            },
          ],
        },
      },
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
  assert.match(markdown, /<T extends DateValue>/);
  assert.match(markdown, /MappedDateValue<T>/);
  assert.match(markdown, /DatePickerTrigger/);
  assert.match(markdown, /DatePickerRenderProps/);
  assert.match(markdown, /Only literal defaults/);
});
