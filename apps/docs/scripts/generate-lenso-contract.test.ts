import assert from "node:assert/strict";
import test, { type TestContext } from "node:test";
import { mkdir, mkdtemp, readFile, writeFile, rm, symlink } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { collectContractInputs } from "./generate-lenso-contract.ts";
import { fixtureSource } from "../../../packages/cli/tests/fixture.ts";
import {
  buildLensoContract,
  resolveSource,
  resolveTheme,
  type ApiReference,
} from "../../../tooling/lenso-contracts/index.ts";

const root = fileURLToPath(new URL("../../../", import.meta.url));
async function fixture(t: TestContext) {
  await mkdir(path.join(root, "test-results/lenso-docs-projection"), { recursive: true });
  const directory = await mkdtemp(path.join(root, "test-results/lenso-docs-projection/producer-"));
  t.after(() => rm(directory, { recursive: true, force: true }));
  const write = async (file: string, content: unknown) => {
    await mkdir(path.dirname(path.join(directory, file)), { recursive: true });
    await writeFile(
      path.join(directory, file),
      typeof content === "string" ? content : JSON.stringify(content),
    );
  };
  for (const [folder, name] of [
    ["react", "@lenso/ui"],
    ["styles", "@lenso/tokens"],
    ["stylex-build", "@lenso/stylex-build"],
  ])
    await write(`packages/${folder}/package.json`, {
      name,
      version: folder === "stylex-build" ? "0.1.0" : "0.9.0",
      dependencies: { "@stylexjs/stylex": "catalog:" },
    });
  await write("apps/docs/node_modules/@stylexjs/stylex/package.json", {
    name: "@stylexjs/stylex",
    version: "0.19.1",
  });
  const markdownFile = "content/lenso/en/react/components/menu.mdx";
  const markdown =
    '---\ntitle: "Menu"\n---\n\nNative command contract.\n<ComponentPreview name="menu-default" />\n';
  const index = {
    formatVersion: 1,
    lensoVersion: "0.9.0",
    sourceFamilyMapping: { dropdown: "menu" },
    pages: [
      {
        locale: "en",
        slug: "react/components/menu",
        title: "Menu",
        description: "Popup commands",
        markdownFile,
        examples: [{ name: "menu-default", file: "en/menu/default.tsx" }],
      },
    ],
  };
  const implementation = "packages/react/src/components/menu/menu.tsx";
  const source = { path: implementation, line: 1 };
  const api: ApiReference = {
    upstream: {},
    properties: [
      {
        name: "children",
        type: "ReactNode",
        expandedType: "ReactNode",
        required: false,
        description: "",
        source,
        default: null,
      },
    ],
    families: {
      menu: {
        parts: [
          {
            name: "Menu",
            signature: "() => null",
            props: null,
            source,
            native: ["@base-ui/react"],
            members: [],
            states: {},
            properties: [0],
          },
        ],
      },
    },
  };
  await write("apps/docs/src/generated/lenso-docs-index.json", index);
  await write("apps/docs/src/generated/api-reference.json", api);
  await write(`apps/docs/${markdownFile}`, markdown);
  await write(
    "apps/docs/src/demos/en/menu/default.tsx",
    'import { Shared } from "./shared";\nexport const Default = Shared;\n',
  );
  await write(
    "apps/docs/src/demos/en/menu/shared.tsx",
    "export function Shared() { return null; }\n",
  );
  await write(
    "packages/styles/src/components/menu/menu.styles.ts",
    "export const menuStyles = { popup: { padding: 4 } };\n",
  );
  await write(
    implementation,
    'import { helper } from "../../utils/helper.js";\nexport const Menu = () => helper;\r\n',
  );
  await write("packages/react/src/utils/helper.ts", "export const helper = null;\n");
  await write(
    "packages/styles/themes/default/index.css",
    '@import "../shared/theme.css";\n@import "./variables.css";\n',
  );
  await write(
    "packages/styles/themes/default/variables.css",
    '@layer base { :root { --accent: oklch(0.62 0.195 253.83); } [data-theme="dark"] { --accent: var(--snow); } }\n',
  );
  await write(
    "packages/styles/themes/shared/theme.css",
    ":root { --accent-hover: color-mix(in oklch, var(--accent) 90%, transparent); }\n",
  );
  await write(
    "packages/styles/src/theme.ts",
    'export const themeTokens = [{ key: "accent", label: "Accent", category: "color" }];\n',
  );
  const compatibility = (await fixtureSource()).compatibility;
  return { directory, write, index, api, markdown, compatibility, implementation };
}

// Core digest tests cannot prove that the producer reads the same files as Copy Markdown and the source pane.
test("produces exact authored Markdown, canonical local helper graph, actual style source and active package versions", async (t) => {
  const { directory, index, api, markdown, compatibility } = await fixture(t);
  const input = await collectContractInputs(directory, index, compatibility);
  assert.equal(input.compatibility, compatibility);
  assert.deepEqual(input.apiReference, api);
  assert.deepEqual(input.packageVersions, {
    "@lenso/ui": "0.9.0",
    "@lenso/tokens": "0.9.0",
    "@lenso/stylex-build": "0.1.0",
    "@stylexjs/stylex": "0.19.1",
  });
  assert.equal(input.docs[0].markdown, markdown);
  assert.equal(input.examples[0].file, "en/menu/default.tsx");
  assert.deepEqual(
    input.examples[0].files.map((file) => file.file),
    ["en/menu/shared.tsx"],
  );
  assert.equal(
    input.examples[0].code,
    await readFile(path.join(directory, "apps/docs/src/demos/en/menu/default.tsx"), "utf8"),
  );
  assert.equal(
    input.styles[0].code,
    await readFile(path.join(directory, input.styles[0].file), "utf8"),
  );
  assert.equal(input.styles[0].family, "menu");
});

test("refuses stale runtime/compiler versions and ambiguous style-map sources", async (t) => {
  const { directory, write, index, compatibility } = await fixture(t);
  await assert.rejects(
    collectContractInputs(directory, index, {
      ...compatibility,
      stylex: { ...compatibility.stylex, version: "0.19.0" },
    }),
    /Installed StyleX runtime differs/,
  );
  await write("packages/styles/src/components/menu/other.stylex.ts", "export const other = {};");
  await assert.rejects(
    collectContractInputs(directory, index, compatibility),
    /Expected one actual style-map source/,
  );
  index.pages[0].markdownFile = "content/docs/en/react/migration/index.mdx";
  await assert.rejects(
    collectContractInputs(directory, index, compatibility),
    /outside apps\/docs\/content\/lenso\/en/,
  );
});

// Lexical prefixes do not constrain a symlink's target; reject both file and directory links before reading.
test("rejects authored Markdown symlinks even when their targets stay inside docs", async (t) => {
  const { directory, index, compatibility, write } = await fixture(t);
  const markdownFile = index.pages[0]!.markdownFile;
  await write("apps/docs/content/lenso/en/real.mdx", "authored target");
  await rm(path.join(directory, "apps/docs", markdownFile));
  await symlink(
    path.join(directory, "apps/docs/content/lenso/en/real.mdx"),
    path.join(directory, "apps/docs", markdownFile),
  );
  await assert.rejects(collectContractInputs(directory, index, compatibility), /symlink/);
  await rm(path.join(directory, "apps/docs", markdownFile));
  await rm(path.join(directory, "apps/docs/content/lenso/en/react/components"), {
    recursive: true,
  });
  await symlink(
    path.join(directory, "apps/docs/content/lenso/en"),
    path.join(directory, "apps/docs/content/lenso/en/react/components"),
  );
  await assert.rejects(collectContractInputs(directory, index, compatibility), /symlink/);
});

test("reads exact actual implementation/helper graphs, CSS scopes and editor metadata without resolved colors", async (t) => {
  const { directory, index, compatibility, implementation, write } = await fixture(t);
  const first = await collectContractInputs(directory, index, compatibility);
  assert.equal(first.sources[0].file, implementation);
  assert.equal(first.sources[0].code, await readFile(path.join(directory, implementation), "utf8"));
  assert.deepEqual(
    first.sources[0].files.map((source) => source.file),
    ["packages/react/src/utils/helper.ts"],
  );
  assert.deepEqual(first.theme.editableTokens, [
    { key: "accent", label: "Accent", category: "color" },
  ]);
  assert.equal(
    first.theme.declarations.find((declaration) => declaration.name === "--accent-hover")?.value,
    "color-mix(in oklch, var(--accent) 90%, transparent)",
  );
  assert.deepEqual(first.theme.declarations.at(-1)?.scope, ["@layer base", '[data-theme="dark"]']);
  const contract = buildLensoContract(first);
  assert.deepEqual(resolveSource(contract, contract.sources[0]), first.sources[0]);
  assert.deepEqual(resolveTheme(contract), first.theme);
  await write("packages/react/src/utils/helper.ts", "export const helper = 'changed';\n");
  await write(
    "packages/styles/themes/default/variables.css",
    ":root { --accent: var(--changed); }\n",
  );
  await write(
    "packages/styles/src/theme.ts",
    'export const themeTokens = [{ key: "accent", label: "Changed accent", category: "color" }];\n',
  );
  const changedInput = await collectContractInputs(directory, index, compatibility);
  assert.equal(changedInput.theme.editableTokens[0].label, "Changed accent");
  const changed = buildLensoContract(changedInput);
  assert.notEqual(changed.digest, contract.digest);
});

test("rejects local helpers outside the implementation root and any source symlink, including internal targets", async (t) => {
  const { directory, index, compatibility, implementation, write } = await fixture(t);
  await write(implementation, 'export { value } from "../../../../outside";\n');
  await assert.rejects(
    collectContractInputs(directory, index, compatibility),
    /outside packages\/react\/src/,
  );
  await write(implementation, 'export { value } from "./link";\n');
  await write("packages/react/src/components/menu/real.ts", "export const value = 1;\n");
  await symlink("real.ts", path.join(directory, "packages/react/src/components/menu/link.ts"));
  await assert.rejects(collectContractInputs(directory, index, compatibility), /symlink/);
  await write(implementation, "export const Menu = () => null;\n");
  await rm(path.join(directory, "packages/styles/themes/default/variables.css"));
  await symlink(
    "../shared/theme.css",
    path.join(directory, "packages/styles/themes/default/variables.css"),
  );
  await assert.rejects(collectContractInputs(directory, index, compatibility), /symlink/);
});

// Compound API assembly has distinct provenance; choosing the first API path returned index.ts for Autocomplete.
test("chooses the actual canonical implementation rather than compound index assembly and includes both", async (t) => {
  const { directory, index, api, compatibility, write, implementation } = await fixture(t);
  const assembly = "packages/react/src/components/menu/index.ts";
  api.families["menu"]!.parts.unshift({
    ...api.families["menu"]!.parts[0]!,
    name: "MenuCompound",
    source: { path: assembly, line: 1 },
  });
  await write("apps/docs/src/generated/api-reference.json", api);
  await write(assembly, 'export { Menu } from "./menu.js";\n');
  const input = await collectContractInputs(directory, index, compatibility);
  assert.equal(input.sources[0].file, implementation);
  assert.ok(input.sources[0].files.some((file) => file.file === assembly));
  assert.doesNotThrow(() => buildLensoContract(input));
});
