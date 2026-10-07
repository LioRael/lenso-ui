import assert from "node:assert/strict";
import test from "node:test";
import { readFile, writeFile, mkdir, mkdtemp, rm } from "node:fs/promises";
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";
import {
  generateDocsProjection,
  writeDocsProjection,
  canonicalDemoFile,
  canonicalExampleName,
} from "./docs-projection.mjs";
import { createExamplePlan } from "./example-proof-plan.mjs";

const root = fileURLToPath(new URL("../../../", import.meta.url));
const digest = (text) => createHash("sha256").update(text).digest("hex");
async function fixture(t) {
  await mkdir(path.join(root, "test-results/lenso-docs-projection"), { recursive: true });
  const directory = await mkdtemp(path.join(root, "test-results/lenso-docs-projection/fixture-"));
  t.after(() => rm(directory, { recursive: true, force: true }));
  const write = async (file, content) => {
    const target = path.join(directory, file);
    await mkdir(path.dirname(target), { recursive: true });
    await writeFile(target, typeof content === "string" ? content : JSON.stringify(content));
  };
  await write("packages/react/package.json", { version: "0.9.0" });
  await write(
    "packages/react/src/components/index.ts",
    'export * from "./menu/index.js";\nexport * from "./chip/index.js";',
  );
  const part = (name) => ({
    name,
    signature: `${name}(props: NativeProps): React.JSX.Element`,
    members: [],
    native: ["@base-ui/react/menu"],
    source: { path: "packages/react/src/components/menu/menu.tsx", line: 1 },
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
    examples: {},
  };
  const manifests = {};
  for (const locale of ["en", "cn"]) {
    archive.examples[locale] = {
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
  await write("apps/docs/content/source-index.json", archive);
  await write("apps/docs/content/docs/en/react/migration/index.mdx", "PRIVATE ARCHIVE — unchanged");
  await write("apps/docs/src/demos/live-manifest.json", manifests);
  return { directory, write, archive, manifests };
}

// Existing archive tests do not prove which content public rendering and tooling publish.
test("projects current version, canonical family placement, local API and all locale references without touching archive", async (t) => {
  const { directory, archive, manifests } = await fixture(t);
  const files = ["content/source-index.json", "content/docs/en/react/migration/index.mdx"];
  const before = await Promise.all(
    files.map((file) => readFile(path.join(directory, "apps/docs", file)).then(digest)),
  );
  const index = await writeDocsProjection(directory);
  assert.equal(index.formatVersion, 1);
  assert.equal(index.lensoVersion, "0.9.0");
  assert.deepEqual(index.sourceFamilyMapping, { dropdown: "menu" });
  assert.equal(index.pages.length, 8);
  for (const locale of ["en", "cn"]) {
    const plan = createExamplePlan(archive, index, manifests, { locale });
    assert.deepEqual(plan.missing, []);
    assert.equal(plan.requested, 2);
    const menu = index.pages.find(
      (page) => page.locale === locale && page.slug === "react/components/menu",
    );
    assert.equal(menu.componentCategory, locale === "en" ? "overlays" : "additional");
    assert.equal(menu.componentThumbnail, locale === "en" ? "dropdown" : undefined);
    const markdown = await readFile(path.join(directory, "apps/docs", menu.markdownFile), "utf8");
    assert.ok(markdown.includes('<ComponentPreview name="menu-basic" />'));
    assert.ok(!markdown.includes('<ComponentPreview name="dropdown-'));
    assert.ok(markdown.includes('import { Menu } from "@lenso/ui";'));
    const usage = markdown.indexOf(locale === "cn" ? "## 用法" : "## Usage");
    const examples = markdown.indexOf(locale === "cn" ? "## 示例" : "## Examples");
    const basic = markdown.indexOf('<ComponentPreview name="menu-basic" />');
    assert.ok(usage >= 0 && usage < basic && basic < examples);
    assert.equal(markdown.match(/<ComponentPreview name="menu-basic" \/>/g).length, 1);
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
  assert.match(overview, /## Overlays\n\n<ComponentsCategory category="overlays" \/>/);
  assert.match(
    overview,
    /## Additional components\n\n<ComponentsCategory category="additional" \/>/,
  );
  assert.doesNotMatch(overview, /\/docs\/react\/components\/dropdown/);
  for (const family of ["menu", "chip"]) {
    const page = index.pages.find((entry) => entry.slug === `react/components/${family}`);
    assert.ok(page);
    if (family === "chip") {
      assert.equal(page.componentCategory, "additional");
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

test("matches hyphenated archive names and keeps unknown categories in the overview", async (t) => {
  const { directory, write, archive } = await fixture(t);
  await write(
    "packages/react/src/components/index.ts",
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
  await write("apps/docs/content/source-index.json", archive);
  const { index, markdown } = await generateDocsProjection(directory);
  for (const locale of ["en", "cn"]) {
    const textfield = index.pages.find(
      (page) => page.locale === locale && page.slug === "react/components/textfield",
    );
    assert.equal(textfield.componentCategory, "forms");
    assert.equal(textfield.componentThumbnail, "textfield");
    const chip = index.pages.find(
      (page) => page.locale === locale && page.slug === "react/components/chip",
    );
    assert.equal(chip.componentCategory, "additional");
    const overview = markdown.get(`content/lenso/${locale}/react/components/index.mdx`);
    assert.match(overview, /<ComponentsCategory category="forms" \/>/);
    assert.match(overview, /<ComponentsCategory category="additional" \/>/);
    assert.doesNotMatch(overview, /future-category/);
  }
});

test("generation is cwd-independent and derives version from the active package", async (t) => {
  const { directory, write } = await fixture(t);
  const module = new URL("./docs-projection.mjs", import.meta.url).href;
  const script = `import {generateDocsProjection} from ${JSON.stringify(module)}; console.log(JSON.stringify((await generateDocsProjection(${JSON.stringify(directory)})).index));`;
  const run = (cwd) =>
    execFileSync(process.execPath, ["--input-type=module", "-e", script], {
      cwd,
      encoding: "utf8",
    });
  assert.equal(run(root), run(path.join(root, "apps/docs")));
  await write("packages/react/package.json", { version: "0.9.1-next.2" });
  assert.equal((await generateDocsProjection(directory)).index.lensoVersion, "0.9.1-next.2");
});

test("discovers authored tool sections in the same index without a maintained page list", async (t) => {
  const { directory, write } = await fixture(t);
  for (const locale of ["en", "cn"]) {
    await write(
      `apps/docs/content/lenso/${locale}/react/tools/index.mdx`,
      '---\ntitle: "Tools"\ndescription: "Candidate tools"\n---\n\nSource candidate.\n',
    );
    await write(
      `apps/docs/content/lenso/${locale}/react/tools/cli.mdx`,
      '---\ntitle: "CLI"\ndescription: "Contract queries"\n---\n\nUnpublished candidate.\n',
    );
  }
  const { index } = await generateDocsProjection(directory);
  for (const locale of ["en", "cn"]) {
    assert.ok(index.pages.some((page) => page.locale === locale && page.slug === "react/tools"));
    assert.ok(
      index.pages.some((page) => page.locale === locale && page.slug === "react/tools/cli"),
    );
    assert.equal(
      index.pages.filter((page) => page.locale === locale).flatMap((page) => page.examples).length,
      2,
    );
  }
});

test("fails closed for missing references, stale native inventory and a public Dropdown export", async (t) => {
  const { directory, write } = await fixture(t);
  await write("apps/docs/src/demos/live-manifest.json", { en: {}, cn: {} });
  await assert.rejects(generateDocsProjection(directory), /No runnable local example/);
  await write("packages/react/src/components/index.ts", 'export * from "./menu/index.js";');
  await assert.rejects(generateDocsProjection(directory), /Native API family inventory is stale/);
  await write("packages/react/src/components/index.ts", 'export * from "./dropdown/index.js";');
  await assert.rejects(generateDocsProjection(directory), /Public Dropdown export must be removed/);
  assert.equal(canonicalDemoFile("en/dropdown/basic.tsx"), "en/menu/basic.tsx");
  assert.equal(canonicalDemoFile("cn/dropdown/basic.tsx"), "cn/menu/basic.tsx");
  assert.equal(canonicalDemoFile("en/chip/palette.tsx"), "en/chip/palette.tsx");
  assert.equal(canonicalExampleName("dropdown-basic"), "menu-basic");
  assert.equal(canonicalExampleName("menu-item-basic"), "menu-item-basic");
});
