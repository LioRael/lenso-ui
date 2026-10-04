import assert from "node:assert/strict";
import test from "node:test";
import { mkdir, mkdtemp, readFile, writeFile, rm } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { collectContractInputs } from "./generate-lenso-contract.mjs";

const root = fileURLToPath(new URL("../../../", import.meta.url));
async function fixture(t) {
  await mkdir(path.join(root, "test-results/lenso-docs-projection"), { recursive: true });
  const directory = await mkdtemp(path.join(root, "test-results/lenso-docs-projection/producer-"));
  t.after(() => rm(directory, { recursive: true, force: true }));
  const write = async (file, content) => {
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
  await write("apps/docs/node_modules/@stylexjs/stylex/package.json", { version: "0.19.1" });
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
  const api = { upstream: {}, properties: [], families: { menu: { parts: [{ name: "Menu" }] } } };
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
  return { directory, write, index, api, markdown };
}

// Core digest tests cannot prove that the producer reads the same files as Copy Markdown and the source pane.
test("produces exact authored Markdown, canonical local helper graph, actual style source and active package versions", async (t) => {
  const { directory, index, api, markdown } = await fixture(t);
  const compatibility = {
    schemaVersion: 1,
    stylex: { version: "0.19.1" },
    marker: "fixture support descriptor",
  };
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
  const { directory, write, index } = await fixture(t);
  await assert.rejects(
    collectContractInputs(directory, index, { stylex: { version: "0.19.0" } }),
    /Installed StyleX runtime differs/,
  );
  await write("packages/styles/src/components/menu/other.stylex.ts", "export const other = {};");
  await assert.rejects(
    collectContractInputs(directory, index, { stylex: { version: "0.19.1" } }),
    /Expected one actual style-map source/,
  );
  index.pages[0].markdownFile = "content/docs/en/react/migration/index.mdx";
  await assert.rejects(
    collectContractInputs(directory, index, { stylex: { version: "0.19.1" } }),
    /Non-authored Markdown input/,
  );
});
