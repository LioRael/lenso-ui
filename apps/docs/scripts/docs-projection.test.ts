import assert from "node:assert/strict";
import { afterEach, test } from "bun:test";

const cleanup: Array<() => Promise<void>> = [];
afterEach(async () => {
  for (const dispose of cleanup.splice(0).reverse()) await dispose();
});
import { readFile, writeFile, mkdir, mkdtemp, rm } from "node:fs/promises";
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { tmpdir } from "node:os";
import {
  generateDocsProjection,
  writeDocsProjection,
  canonicalDemoFile,
  canonicalExampleName,
  examplePresentation,
  exampleGroup,
} from "./docs-projection.ts";
import { createExamplePlan } from "./example-proof-plan.ts";

const root = fileURLToPath(new URL("../../../", import.meta.url));
const digest = (text: string | Buffer) => createHash("sha256").update(text).digest("hex");

test("scenario groups distinguish formatting and component names from form validation", () => {
  assert.equal(exampleGroup("date-picker-format-options", "date-picker"), "appearance");
  assert.equal(exampleGroup("form-render-function", "form"), "composition");
  assert.equal(exampleGroup("date-picker-form-example", "date-picker"), "validation");
});

test("example labels describe the scenario and only basic visual states are folded", () => {
  assert.deepEqual(examplePresentation("button-sizes", "button", "en"), {
    title: "Sizes",
    basic: true,
  });
  assert.deepEqual(examplePresentation("textfield-with-error", "textfield", "cn"), {
    title: "显示验证错误",
    basic: false,
  });
  assert.equal(examplePresentation("select-with-disabled-options", "select", "en").basic, false);
  assert.equal(examplePresentation("slider-range", "slider", "en").title, "Selecting a range");
});
async function fixture() {
  const directory = await mkdtemp(path.join(tmpdir(), "lenso-docs-fixture-"));
  cleanup.push(() => rm(directory, { recursive: true, force: true }));
  const write = async (file: string, content: unknown) => {
    const target = path.join(directory, file);
    await mkdir(path.dirname(target), { recursive: true });
    await writeFile(target, typeof content === "string" ? content : JSON.stringify(content));
  };
  await write("packages/ui/package.json", { version: "0.9.0" });
  await write(
    "packages/ui/src/components/index.ts",
    'export * from "./menu/index.js";\nexport * from "./chip/index.js";',
  );
  const part = (name: string) => ({
    name,
    signature: `${name}(props: NativeProps): React.JSX.Element`,
    members: [],
    native: ["@base-ui/react/menu"],
    source: { path: "packages/ui/src/components/menu/menu.tsx", line: 1 },
    properties: [0],
    states: {},
  });
  await write("apps/docs/src/generated/api-reference.json", {
    properties: [
      {
        name: "onOpenChange",
        expandedType: "(open: boolean, details: NativeDetails) => void",
        required: false,
        default: null,
        description: "",
        source: { path: "node_modules/@base-ui/react/menu/index.d.ts", line: 1 },
      },
    ],
    families: { chip: { parts: [part("Chip")] }, menu: { parts: [part("Menu")] } },
  });
  const archive = {
    pages: [
      { locale: "en", slug: "react/releases/v3", previews: ["chip-palette"] },
      {
        locale: "en",
        slug: "react/components/dropdown",
        file: "content/docs/en/react/components/(overlays)/dropdown.mdx",
        title: "Dropdown Menu",
        previews: ["dropdown-basic"],
      },
    ],
    examples: {} as Record<string, Record<string, { source: string }>>,
  };
  const manifests: Record<string, Record<string, string>> = {};
  for (const locale of ["en", "cn"]) {
    archive.examples[locale] = {
      "header-basic": { source: `apps/docs/src/demos/${locale}/header/basic.tsx` },
      "error-message-basic": { source: `apps/docs/src/demos/${locale}/error-message/basic.tsx` },
      "dropdown-custom-styles": {
        source: `apps/docs/src/demos/${locale}/dropdown/custom-styles.tsx`,
      },
      "dropdown-basic": { source: `apps/docs/src/demos/${locale}/dropdown/basic.tsx` },
      "chip-palette": { source: `apps/docs/src/demos/${locale}/chip/palette.tsx` },
    };
    manifests[locale] = {
      "menu-basic": `${locale}/menu/basic.tsx`,
      "chip-palette": `${locale}/chip/palette.tsx`,
    };
    await write(
      `apps/docs/src/demos/${locale}/menu/basic.tsx`,
      "export function Basic() { return null; }",
    );
    await write(
      `apps/docs/src/demos/${locale}/chip/palette.tsx`,
      "export function Palette() { return null; }",
    );
    await write(
      `apps/docs/content/lenso/${locale}/react/getting-started/index.mdx`,
      '---\ntitle: "Getting started"\ndescription: "Current Lenso contract"\n---\n\nInstall the local packages.\n',
    );
  }
  await write("apps/docs/content/example-catalog.json", archive);
  await write("apps/docs/content/docs/en/react/migration/index.mdx", "PRIVATE ARCHIVE — unchanged");
  await write("apps/docs/src/demos/live-manifest.json", manifests);
  return { directory, write, archive, manifests };
}

// Existing archive tests do not prove which content public rendering and tooling publish.
// A maintained Story is a separate local playground, not a replacement or extra
// count for any pinned upstream example in the proof plan.
test("discovers local stories in both locales without changing the source scenario inventory", async () => {
  const { directory, write, archive, manifests } = await fixture();
  await write("apps/docs/src/stories/menu.story.tsx", "export const story = {};");
  const index = await writeDocsProjection(directory);
  for (const locale of ["en", "cn"]) {
    const markdown = await readFile(
      path.join(directory, `apps/docs/content/lenso/${locale}/react/components/menu.mdx`),
      "utf8",
    );
    assert.ok(markdown.includes(`<ComponentPlayground family="menu" locale="${locale}" />`));
    assert.ok(
      markdown.indexOf("<ComponentPlayground") <
        markdown.indexOf('<ComponentPreview name="menu-basic"'),
    );
    assert.equal(createExamplePlan(archive, index, manifests, { locale }).requested, 2);
    const chip = await readFile(
      path.join(directory, `apps/docs/content/lenso/${locale}/react/components/chip.mdx`),
      "utf8",
    );
    assert.ok(chip.includes("<ComponentPlayground"));
    assert.ok(
      chip.indexOf("<ComponentPlayground") < chip.indexOf(locale === "cn" ? "## 用法" : "## Usage"),
    );
  }
});

test("projects current version, canonical family placement, local API and all locale references without touching archive", async () => {
  const { directory, archive, manifests } = await fixture();
  const files = ["content/example-catalog.json", "content/docs/en/react/migration/index.mdx"];
  const before = await Promise.all(
    files.map((file) => readFile(path.join(directory, "apps/docs", file)).then(digest)),
  );
  const index = await writeDocsProjection(directory);
  assert.equal(index.formatVersion, 1);
  assert.equal(index.lensoVersion, "0.9.0");
  assert.deepEqual(index.sourceFamilyMapping, { dropdown: "menu" });
  assert.deepEqual(index.families.menu, {
    source: "packages/ui/src/components/menu/menu.tsx",
    native: ["@base-ui/react/menu"],
    related: [],
  });
  assert.equal(Object.hasOwn(index.families, "dropdown"), false);
  assert.equal(index.pages.length, 8);
  for (const locale of ["en", "cn"]) {
    const plan = createExamplePlan(archive, index, manifests, { locale });
    assert.deepEqual(plan.missing, []);
    assert.equal(plan.requested, 2);
    const menu = index.pages.find(
      (page) => page.locale === locale && page.slug === "react/components/menu",
    );
    assert.ok(menu && "componentCategory" in menu);
    assert.equal(menu.componentCategory, "collections");
    assert.equal("componentThumbnail" in menu, false);
    const markdown = await readFile(path.join(directory, "apps/docs", menu.markdownFile), "utf8");
    assert.ok(markdown.includes('<ComponentPreview name="menu-basic" defaultView="source" />'));
    assert.ok(
      markdown.indexOf(locale === "cn" ? "## 使用与交互" : "## Use and interaction") <
        markdown.indexOf(locale === "cn" ? "## 示例" : "## Examples"),
    );
    assert.ok(!markdown.includes('<ComponentPreview name="dropdown-'));
    assert.ok(!markdown.includes('import { Menu } from "@lenso/ui";'));
    const usage = markdown.indexOf(locale === "cn" ? "## 用法" : "## Usage");
    const examples = markdown.indexOf(locale === "cn" ? "## 示例" : "## Examples");
    const basic = markdown.indexOf('<ComponentPreview name="menu-basic" defaultView="source" />');
    assert.ok(usage >= 0 && usage < basic && basic < examples);
    assert.equal(
      markdown.match(/<ComponentPreview name="menu-basic" defaultView="source" \/>/g)?.length,
      1,
    );
    assert.ok(!/^## (?:Local contract|本地契约|Runnable examples|运行示例)$/m.test(markdown));
    assert.ok(markdown.includes("(open: boolean, details: NativeDetails) => void"));
    assert.ok(
      !index.pages.some((page) => /releases|migration|components\/dropdown/.test(page.slug)),
    );
  }
  const overview = await readFile(
    path.join(directory, "apps/docs/content/lenso/en/react/components/index.mdx"),
    "utf8",
  );
  assert.match(overview, /## Collections\n\n<ComponentsCategory category="collections" \/>/);
  assert.match(overview, /## Data Display\n\n<ComponentsCategory category="data-display" \/>/);
  assert.doesNotMatch(overview, /\/docs\/react\/components\/dropdown/);
  for (const family of ["menu", "chip"]) {
    const page = index.pages.find((entry) => entry.slug === `react/components/${family}`);
    assert.ok(page);
    if (family === "chip") {
      assert.ok("componentCategory" in page);
      assert.equal(page.componentCategory, "data-display");
      assert.equal("componentThumbnail" in page, false);
    }
  }
  assert.deepEqual(
    await Promise.all(
      files.map((file) => readFile(path.join(directory, "apps/docs", file)).then(digest)),
    ),
    before,
  );
});

test("projects only link and relationship metadata while preserving the full API contract", async () => {
  const { directory, write } = await fixture();
  const apiFile = path.join(directory, "apps/docs/src/generated/api-reference.json");
  const api = JSON.parse(await readFile(apiFile, "utf8"));
  api.families.menu.parts[0].members = ["Item"];
  api.families.chip.parts.push({
    ...api.families.chip.parts[0],
    name: "MenuItem",
    native: ["react-aria-components", "@base-ui/react/menu"],
    source: { path: "packages/ui/src/components/chip/item.tsx", line: 17 },
  });
  await write("apps/docs/src/generated/api-reference.json", api);
  const before = await readFile(apiFile, "utf8");
  const index = await writeDocsProjection(directory);
  assert.deepEqual(index.families, {
    chip: {
      source: "packages/ui/src/components/menu/menu.tsx",
      native: ["@base-ui/react/menu", "react-aria-components"],
      related: [],
    },
    menu: {
      source: "packages/ui/src/components/menu/menu.tsx",
      native: ["@base-ui/react/menu"],
      related: ["chip"],
    },
  });
  assert.equal(await readFile(apiFile, "utf8"), before);
  const published = JSON.parse(
    await readFile(path.join(directory, "apps/docs/src/generated/lenso-docs-index.json"), "utf8"),
  );
  assert.deepEqual(published.families, index.families);
});

test("uses local component categories independently of archive paths", async () => {
  const { directory, write, archive } = await fixture();
  await write(
    "packages/ui/src/components/index.ts",
    'export * from "./menu/index.js";\nexport * from "./chip/index.js";\nexport * from "./textfield/index.js";',
  );
  const api = JSON.parse(
    await readFile(path.join(directory, "apps/docs/src/generated/api-reference.json"), "utf8"),
  );
  api.families.textfield = {
    parts: [{ ...api.families.chip.parts[0], name: "TextField" }],
  };
  await write("apps/docs/src/generated/api-reference.json", api);
  for (const locale of ["en", "cn"]) {
    archive.pages.push(
      {
        locale,
        slug: "react/components/text-field",
        file: `content/docs/${locale}/react/components/(forms)/text-field.mdx`,
        title: locale === "cn" ? "TextField 文本输入" : "TextField",
        previews: [],
      },
      {
        locale,
        slug: "react/components/chip",
        file: `content/docs/${locale}/react/components/(future-category)/chip.mdx`,
        title: "Chip",
        previews: [],
      },
    );
  }
  await write("apps/docs/content/example-catalog.json", archive);
  const { index, markdown } = await generateDocsProjection(directory);
  for (const locale of ["en", "cn"]) {
    const textfield = index.pages.find(
      (page) => page.locale === locale && page.slug === "react/components/textfield",
    );
    assert.ok(textfield && "componentCategory" in textfield);
    assert.equal(textfield.componentCategory, "forms");
    assert.equal("componentThumbnail" in textfield, false);
    const chip = index.pages.find(
      (page) => page.locale === locale && page.slug === "react/components/chip",
    );
    assert.ok(chip && "componentCategory" in chip);
    assert.equal(chip.componentCategory, "data-display");
    const overview = markdown.get(`content/lenso/${locale}/react/components/index.mdx`);
    assert.ok(overview);
    assert.match(overview, /<ComponentsCategory category="forms" \/>/);
    assert.match(overview, /<ComponentsCategory category="data-display" \/>/);
    assert.doesNotMatch(overview, /future-category/);
  }
});

test("generation is cwd-independent and derives version from the active package", async () => {
  const { directory, write } = await fixture();
  const module = new URL("./docs-projection.ts", import.meta.url).href;
  const script = `import {generateDocsProjection} from ${JSON.stringify(module)}; console.log(JSON.stringify((await generateDocsProjection(${JSON.stringify(directory)})).index));`;
  const run = (cwd: string) =>
    execFileSync(process.execPath, ["--input-type=module", "-e", script], {
      cwd,
      encoding: "utf8",
    });
  assert.equal(run(root), run(path.join(root, "apps/docs")));
  await write("packages/ui/package.json", { version: "0.9.1-next.2" });
  assert.equal((await generateDocsProjection(directory)).index.lensoVersion, "0.9.1-next.2");
});

test("discovers authored skill sections in the same index without a maintained page list", async () => {
  const { directory, write } = await fixture();
  for (const locale of ["en", "cn"]) {
    await write(
      `apps/docs/content/lenso/${locale}/react/getting-started/skills.mdx`,
      '---\ntitle: "Agent skills"\ndescription: "Portable skills"\n---\n\nSource candidate.\n',
    );
    await write(
      `apps/docs/content/lenso/${locale}/react/getting-started/skills-usage.mdx`,
      '---\ntitle: "Usage"\ndescription: "Skill usage"\n---\n\nLoad the local skill.\n',
    );
  }
  const { index } = await generateDocsProjection(directory);
  for (const locale of ["en", "cn"]) {
    assert.ok(
      index.pages.some(
        (page) => page.locale === locale && page.slug === "react/getting-started/skills",
      ),
    );
    assert.ok(
      index.pages.some(
        (page) => page.locale === locale && page.slug === "react/getting-started/skills-usage",
      ),
    );
    assert.equal(
      index.pages.filter((page) => page.locale === locale).flatMap((page) => page.examples).length,
      2,
    );
  }
});

test("fails closed for missing references, stale native inventory and a public Dropdown export", async () => {
  const { directory, write } = await fixture();
  await write("apps/docs/src/demos/live-manifest.json", { en: {}, cn: {} });
  await assert.rejects(generateDocsProjection(directory), /No runnable local example/);
  await write("packages/ui/src/components/index.ts", 'export * from "./menu/index.js";');
  await assert.rejects(generateDocsProjection(directory), /Native API family inventory is stale/);
  await write("packages/ui/src/components/index.ts", 'export * from "./dropdown/index.js";');
  await assert.rejects(generateDocsProjection(directory), /Public Dropdown export must be removed/);
  assert.equal(canonicalDemoFile("en/dropdown/basic.tsx"), "en/menu/basic.tsx");
  assert.equal(canonicalDemoFile("cn/dropdown/basic.tsx"), "cn/menu/basic.tsx");
  assert.equal(canonicalDemoFile("en/chip/palette.tsx"), "en/chip/palette.tsx");
  assert.equal(canonicalExampleName("dropdown-basic"), "menu-basic");
  assert.equal(canonicalExampleName("menu-item-basic"), "menu-item-basic");
});
