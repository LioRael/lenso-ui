import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import {
  buildLensoContract,
  validateApiReference,
  type ContractInputs,
} from "../../../tooling/lenso-contracts/index.ts";
import {
  collectImplementationSource,
  collectTheme,
} from "../../../tooling/lenso-contracts/source.ts";

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
      "@lenso/stylex-build": "0.1.0",
    },
    compatibility: {
      schemaVersion: 1,
      node: { range: "^26.10.0", testedVersion: "26.10.0" },
      stylex: {
        compiler: "@stylexjs/babel-plugin",
        version: "0.19.1",
        metadataFormat: "@lenso/stylex-build/raw-rules",
        metadataVersion: 1,
        compileMode: {
          dev: false,
          styleResolution: "property-specificity",
          classNamePrefix: "x",
          runtimeInjection: false,
        },
      },
      next: {
        version: "16.3.8",
        router: "App Router",
        bundler: "Webpack",
        customGlobalError: "explicit-css",
        explicitCss: { api: "prepareNext", mode: "production", watch: false, cache: false },
        legacyAssetRewrite: { customGlobalError: "unsupported", version: "16.3.8" },
        unsupportedBundlers: ["Turbopack", "Rspack"],
      },
      vite: { testedVersion: "8.3.2" },
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
        file: "packages/styles/src/components/menu/menu.styles.ts",
        code: await readFile(
          new URL("../../../packages/styles/src/components/menu/menu.styles.ts", import.meta.url),
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
