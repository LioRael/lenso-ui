import { readFile, writeFile, mkdir, readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { localExampleFiles } from "../src/lib/local-example-files.ts";
import assert from "node:assert/strict";
import * as core from "../../../tooling/lenso-contracts/index.ts";
import {
  collectImplementationSource,
  collectTheme,
} from "../../../tooling/lenso-contracts/source.ts";
import type {
  ContractInputs,
  DocsIndex,
  Doc,
  Example,
  SourceFile,
  Style,
} from "../../../tooling/lenso-contracts/index.ts";

const root = fileURLToPath(new URL("../../../", import.meta.url));
const json = async (file: string): Promise<unknown> => JSON.parse(await readFile(file, "utf8"));
function packageInfo(input: unknown): {
  name: string;
  version: string;
  dependencies: Record<string, string>;
} {
  if (
    !input ||
    typeof input !== "object" ||
    !("name" in input) ||
    typeof input.name !== "string" ||
    !("version" in input) ||
    typeof input.version !== "string"
  )
    throw new Error("Invalid package metadata");
  const dependencies: Record<string, string> = {};
  if ("dependencies" in input && input.dependencies && typeof input.dependencies === "object") {
    for (const [key, value] of Object.entries(input.dependencies)) {
      if (typeof value !== "string") throw new Error("Invalid package dependency");
      dependencies[key] = value;
    }
  }
  return { name: input.name, version: input.version, dependencies };
}

export async function collectContractInputs(
  directory = root,
  indexInput?: unknown,
  compatibilityInput?: unknown,
): Promise<ContractInputs & { styles: Style[] }> {
  directory = path.resolve(directory);
  const docsRoot = path.join(directory, "apps/docs");
  const apiReference = core.validateApiReference(
    await json(path.join(docsRoot, "src/generated/api-reference.json")),
  );
  const docsIndex = core.readDocsIndex(
    indexInput ?? (await json(path.join(docsRoot, "src/generated/lenso-docs-index.json"))),
    apiReference,
  );
  const packages = await Promise.all(
    ["react", "styles", "stylex-build"].map((name) =>
      json(path.join(directory, "packages", name, "package.json")).then(packageInfo),
    ),
  );
  if (!compatibilityInput) {
    const build: unknown = await import(
      pathToFileURL(path.join(directory, "packages/stylex-build/src/index.mjs")).href
    );
    if (build && typeof build === "object" && "buildSupport" in build)
      compatibilityInput = build.buildSupport;
  }
  if (!compatibilityInput)
    throw new Error(
      "The current @lenso/stylex-build source must export buildSupport; refusing invented compatibility metadata.",
    );
  const compatibility = core.validateCompatibility(compatibilityInput);
  const packageVersions = Object.fromEntries(packages.map((pkg) => [pkg.name, pkg.version]));
  const runtimeStylex = packages[0]!.dependencies["@stylexjs/stylex"];
  if (runtimeStylex !== "catalog:" && runtimeStylex !== compatibility.stylex.version)
    throw new Error(
      "React's StyleX runtime dependency differs from the supported compiler generation.",
    );
  // The installed runtime is evidence of the resolved catalog, not a second version list.
  const installedStylex = packageInfo(
    await json(path.join(docsRoot, "node_modules/@stylexjs/stylex/package.json")),
  );
  if (installedStylex.version !== compatibility.stylex.version)
    throw new Error(
      "Installed StyleX runtime differs from buildSupport. Regenerate with the current dependency graph.",
    );
  packageVersions["@stylexjs/stylex"] = installedStylex.version;
  const docs: Doc[] = [];
  const examples: Example[] = [];
  const graphCache = new Map<string, SourceFile[]>();
  for (const page of docsIndex.pages) {
    core.validateRepositoryPath(
      `apps/docs/${page.markdownFile}`,
      `apps/docs/content/lenso/${page.locale}/`,
      directory,
    );
    docs.push({
      locale: page.locale,
      slug: page.slug,
      title: page.title,
      description: page.description,
      markdown: await readFile(path.join(docsRoot, page.markdownFile), "utf8"),
    });
    for (const example of page.examples) {
      let files = graphCache.get(example.file);
      if (!files) {
        files = await localExampleFiles(example.file, docsRoot);
        graphCache.set(example.file, files);
      }
      examples.push({
        locale: page.locale,
        name: example.name,
        file: example.file,
        code: files[0]!.code,
        files: files.slice(1),
      });
    }
  }
  const styles: Style[] = [];
  const sources: ContractInputs["sources"] = [];
  for (const family of Object.keys(apiReference.families).sort()) {
    const folder = path.join(directory, "packages/styles/src/components", family);
    const files = (await readdir(folder)).filter(
      (file) => file.endsWith(".styles.ts") || file.endsWith(".stylex.ts"),
    );
    if (files.length !== 1)
      throw new Error(`Expected one actual style-map source for ${family}, found ${files.length}.`);
    const file = `packages/styles/src/components/${family}/${files[0]}`;
    core.validateRepositoryPath(file, "packages/styles/src/components/", directory);
    styles.push({ family, file, code: await readFile(path.join(directory, file), "utf8") });
    sources.push(
      await collectImplementationSource(directory, family, apiReference.families[family]!),
    );
  }
  return {
    apiReference,
    docsIndex,
    packageVersions,
    compatibility,
    docs,
    examples,
    styles,
    sources,
    theme: await collectTheme(directory),
    examplesRoot: path.join(docsRoot, "src/demos"),
    stylesRoot: directory,
  };
}

export async function writeLensoContract(directory = root, docsIndex?: DocsIndex) {
  const input = await collectContractInputs(directory, docsIndex);
  const contract = core.validateContract(core.buildLensoContract(input));
  assert.equal(
    contract.formatVersion,
    3,
    "Use the current pooled contract core, not an expanded draft.",
  );
  const docs = new Map(input.docs.map((doc) => [`${doc.locale}/${doc.slug}`, doc]));
  const examples = new Map(
    input.examples.map((example) => [`${example.locale}/${example.name}`, example]),
  );
  const styles = new Map(input.styles.map((style) => [style.family, style]));
  for (const doc of contract.docs)
    assert.deepEqual(core.resolveDoc(contract, doc), docs.get(`${doc.locale}/${doc.slug}`));
  for (const example of contract.examples)
    assert.deepEqual(
      core.resolveExample(contract, example),
      examples.get(`${example.locale}/${example.name}`),
    );
  for (const style of contract.styles)
    assert.deepEqual(core.resolveStyle(contract, style), styles.get(style.family));
  const sources = new Map(input.sources.map((source) => [source.family, source]));
  for (const source of contract.sources)
    assert.deepEqual(core.resolveSource(contract, source), sources.get(source.family));
  assert.deepEqual(core.resolveTheme(contract), input.theme);
  const file = path.join(directory, "apps/docs/src/generated/lenso-contract.json");
  await mkdir(path.dirname(file), { recursive: true });
  await writeFile(file, `${core.canonicalSerialize(contract)}\n`);
  console.log(
    `Contract ${contract.formatVersion}: ${contract.docs.length} exact Markdown documents, ${contract.examples.length} exact local example graphs and ${contract.styles.length} exact style maps round-tripped.`,
  );
  return contract;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const contract = await writeLensoContract();
  console.log(`Lenso ${contract.lensoVersion} contract: ${contract.digest}`);
}
