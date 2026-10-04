import { readFile, writeFile, mkdir, readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { localExampleFiles } from "../src/lib/local-example-files.ts";
import assert from "node:assert/strict";

const root = fileURLToPath(new URL("../../../", import.meta.url));
const json = async (file) => JSON.parse(await readFile(file, "utf8"));

export async function collectContractInputs(directory = root, docsIndex, compatibility) {
  directory = path.resolve(directory);
  const docsRoot = path.join(directory, "apps/docs");
  docsIndex ??= await json(path.join(docsRoot, "src/generated/lenso-docs-index.json"));
  const apiReference = await json(path.join(docsRoot, "src/generated/api-reference.json"));
  const packages = await Promise.all(
    ["react", "styles", "stylex-build"].map((name) =>
      json(path.join(directory, "packages", name, "package.json")),
    ),
  );
  if (!compatibility) {
    const build = await import(
      pathToFileURL(path.join(directory, "packages/stylex-build/src/index.mjs")).href
    );
    compatibility = build.buildSupport;
  }
  if (!compatibility)
    throw new Error(
      "The current @lenso/stylex-build source must export buildSupport; refusing invented compatibility metadata.",
    );
  const packageVersions = Object.fromEntries(packages.map((pkg) => [pkg.name, pkg.version]));
  const runtimeStylex = packages[0].dependencies["@stylexjs/stylex"];
  if (runtimeStylex !== "catalog:" && runtimeStylex !== compatibility.stylex.version)
    throw new Error(
      "React's StyleX runtime dependency differs from the supported compiler generation.",
    );
  // The installed runtime is evidence of the resolved catalog, not a second version list.
  const installedStylex = await json(
    path.join(docsRoot, "node_modules/@stylexjs/stylex/package.json"),
  );
  if (installedStylex.version !== compatibility.stylex.version)
    throw new Error(
      "Installed StyleX runtime differs from buildSupport. Regenerate with the current dependency graph.",
    );
  packageVersions["@stylexjs/stylex"] = installedStylex.version;
  const docs = [];
  const examples = [];
  const graphCache = new Map();
  for (const page of docsIndex.pages) {
    if (
      !page.markdownFile.startsWith(`content/lenso/${page.locale}/`) ||
      page.markdownFile.split("/").includes("..")
    )
      throw new Error(`Non-authored Markdown input: ${page.markdownFile}`);
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
        code: files[0].code,
        files: files.slice(1),
      });
    }
  }
  const styles = [];
  for (const family of Object.keys(apiReference.families).sort()) {
    const folder = path.join(directory, "packages/styles/src/components", family);
    const files = (await readdir(folder)).filter(
      (file) => file.endsWith(".styles.ts") || file.endsWith(".stylex.ts"),
    );
    if (files.length !== 1)
      throw new Error(`Expected one actual style-map source for ${family}, found ${files.length}.`);
    const file = `packages/styles/src/components/${family}/${files[0]}`;
    styles.push({ family, file, code: await readFile(path.join(directory, file), "utf8") });
  }
  return {
    apiReference,
    docsIndex,
    packageVersions,
    compatibility,
    docs,
    examples,
    styles,
    examplesRoot: path.join(docsRoot, "src/demos"),
    stylesRoot: directory,
  };
}

export async function writeLensoContract(directory = root, docsIndex) {
  const core = await import(
    pathToFileURL(path.join(directory, "tooling/lenso-contracts/index.mjs")).href
  );
  const input = await collectContractInputs(directory, docsIndex);
  const contract = core.validateContract(core.buildLensoContract(input));
  assert.equal(
    contract.formatVersion,
    2,
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
