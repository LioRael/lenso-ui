import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { buildLensoContract, validateApiReference, type ContractInputs } from "./contract/index.ts";
import { collectImplementationSource, collectTheme } from "./contract/source.ts";

export const authoredMarkdown = (locale: string) =>
  `# Menu (${locale})\n\nLiteral test data: $(touch SHOULD_NOT_EXIST).\n`;

// Test-only: native API is real; prose and setup descriptor are deliberately synthetic.
export async function fixtureSource({
  styles = true,
}: { styles?: boolean } = {}): Promise<ContractInputs> {
  const api = validateApiReference(
    JSON.parse(
      await readFile(
        new URL("../../../apps/docs/src/generated/api-reference.json", import.meta.url),
        "utf8",
      ),
    ),
  );
  api.families = { menu: api.families["menu"]! };
  const directory = fileURLToPath(new URL("../../../", import.meta.url));
  const source: ContractInputs = {
    packageVersions: {
      "@lenso/ui": "0.9.0",
      "@lenso/tokens": "0.9.0",
    },
    compatibility: {
      schemaVersion: 2,
      bun: { range: ">=1.4.4", testedVersion: "1.4.4" },
      stylex: { version: "0.19.1" },
      next: { version: "16.3.8", router: "App Router" },
      vite: { testedVersion: "8.3.5" },
    },
    apiReference: api,
    sources: [await collectImplementationSource(directory, "menu", api.families["menu"]!)],
    theme: await collectTheme(directory),
    docsIndex: {
      formatVersion: 1,
      lensoVersion: "0.9.0",
      sourceFamilyMapping: { dropdown: "menu" },
      pages: [],
    },
    docs: ["en", "cn"].map((locale) => ({
      locale,
      slug: "menu",
      title: "Menu",
      description: "Test-only authored page",
      markdown: authoredMarkdown(locale),
    })),
    examples: [
      {
        locale: "en",
        name: "dropdown-basic",
        file: "menu/basic.tsx",
        code: "export const fixture = 'test only';",
        files: [{ file: "menu/helper.ts", code: "export {};" }],
      },
    ],
  };
  if (styles)
    source.styles = [
      {
        family: "menu",
        file: "packages/tokens/src/components/menu/menu.styles.ts",
        code: await readFile(
          new URL("../../tokens/src/components/menu/menu.styles.ts", import.meta.url),
          "utf8",
        ),
      },
    ];
  source.docsIndex = {
    formatVersion: 1,
    lensoVersion: source.packageVersions["@lenso/ui"]!,
    sourceFamilyMapping: { dropdown: "menu" },
    pages: source.docs.map(({ markdown: _markdown, ...doc }) => ({
      ...doc,
      markdownFile: `${doc.locale}/${doc.slug}.md`,
      examples: source.examples
        .filter((example) => example.locale === doc.locale)
        .map(({ name, file }) => ({ name, file })),
    })),
  };
  return source;
}

export async function fixture(options?: { styles?: boolean }) {
  return buildLensoContract(await fixtureSource(options));
}
