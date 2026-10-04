import { cp, mkdir, readFile, writeFile, rm, readdir, symlink } from "node:fs/promises";
import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";
import { parse } from "@babel/parser";

const root = fileURLToPath(new URL("../../../", import.meta.url));
const { values } = parseArgs({
  options: {
    core: { type: "string" },
    shell: { type: "string" },
    provider: { type: "string" },
    upgrade: { type: "string" },
    contracts: { type: "string" },
    accessibility: { type: "string" },
    legal: { type: "string" },
    output: { type: "string", default: "test-results/lenso-docs-projection/current-source" },
  },
});
if (!values.core || !values.shell || !values.provider)
  throw new Error(
    "Supply read-only current --core and --shell source checkouts and a third-party-only --provider.",
  );
const output = path.resolve(root, values.output);
if (!output.startsWith(path.join(root, "test-results") + path.sep))
  throw new Error("The validation mirror must be inside this checkout's ignored test-results.");
await mkdir(output, { recursive: false });
const excluded = new Set(["node_modules", "dist", ".next", "test-results", ".git"]);
const freshArtifacts = new Set([
  "api-reference.json",
  "lenso-docs-index.json",
  "lenso-contract.json",
]);
const filter = (source) =>
  !excluded.has(path.basename(source)) &&
  !(
    source.includes(`${path.sep}src${path.sep}generated${path.sep}`) &&
    freshArtifacts.has(path.basename(source))
  );
for (const folder of [
  "apps/docs",
  "packages/react",
  "packages/styles",
  "packages/stylex-build",
  "packages/standard",
  "third-party/heroui",
])
  await cp(path.join(root, folder), path.join(output, folder), { recursive: true, filter });
for (const file of ["package.json", "pnpm-lock.yaml", "pnpm-workspace.yaml", "tsconfig.base.json"])
  await cp(path.join(root, file), path.join(output, file));
const inputs = [];
async function copyInput(checkout, file, expected) {
  const content = await readFile(path.join(checkout, file));
  const sha256 = createHash("sha256").update(content).digest("hex");
  if (expected && sha256 !== expected)
    throw new Error(`Current source input hash changed: ${file}`);
  await mkdir(path.dirname(path.join(output, file)), { recursive: true });
  await writeFile(path.join(output, file), content);
  inputs.push({ checkout, file, sha256 });
}
if (values.upgrade) {
  for (const file of [
    "package.json",
    "pnpm-lock.yaml",
    "pnpm-workspace.yaml",
    "tsconfig.base.json",
    "packages/stylex-build/package.json",
  ])
    await copyInput(values.upgrade, file);
  for (const name of await readdir(path.join(values.upgrade, "packages/stylex-build/src")))
    await copyInput(values.upgrade, `packages/stylex-build/src/${name}`);
}
if (values.contracts) {
  for (const file of [
    "tooling/lenso-contracts/index.mjs",
    "tooling/lenso-contracts/index.test.mjs",
  ])
    await copyInput(values.contracts, file);
}
for (const file of [
  "packages/react/package.json",
  "packages/styles/package.json",
  "packages/react/src/components/index.ts",
  "packages/react/src/components/menu/menu.tsx",
  "packages/styles/src/components/menu/menu.styles.ts",
])
  await copyInput(values.core, file);
for (const folder of [
  "packages/react/src/components/dropdown",
  "packages/styles/src/components/dropdown",
])
  await rm(path.join(output, folder), { recursive: true, force: true });
const shell = JSON.parse(
  await readFile(
    path.join(values.shell, "test-results/lenso-docs-authorship/shell-owned-files.json"),
    "utf8",
  ),
);
for (const { path: file, sha256 } of shell.files) await copyInput(values.shell, file, sha256);
// Merge only the authorized navigation interface onto the current shell owner's bytes.
const headerFile = "apps/docs/src/components/fumadocs/layouts/notebook/index.tsx";
const ownHeader = await readFile(path.join(root, headerFile), "utf8");
let currentHeader = await readFile(path.join(output, headerFile), "utf8");
const ast = (code) => parse(code, { sourceType: "module", plugins: ["typescript", "jsx"] });
const nodes = (node, type) =>
  !node || typeof node !== "object"
    ? []
    : Array.isArray(node)
      ? node.flatMap((child) => nodes(child, type))
      : [
          ...(node.type === type ? [node] : []),
          ...Object.values(node).flatMap((child) => nodes(child, type)),
        ];
const ownTree = ast(ownHeader);
const currentTree = ast(currentHeader);
const sectionsDeclaration = currentTree.program.body.find(
  (node) => node.type === "VariableDeclaration" && node.declarations[0]?.id.name === "sections",
);
if (sectionsDeclaration) {
  const replacements = [];
  const replace = (node, text) => replacements.push({ start: node.start, end: node.end, text });
  const ownIcon = ownTree.program.body.find(
    (node) =>
      node.type === "VariableDeclaration" && node.declarations[0]?.id.name === "sectionIcon",
  );
  replace(sectionsDeclaration, ownHeader.slice(ownIcon.start, ownIcon.end));
  const sourceImport = currentTree.program.body.find(
    (node) => node.type === "ImportDeclaration" && node.source.value === "@/lib/source",
  );
  replace(sourceImport, 'import type { Locale, DocSection } from "@/lib/source";');
  const icons = currentTree.program.body.find(
    (node) => node.type === "ImportDeclaration" && node.source.value === "@gravity-ui/icons",
  );
  replace(
    icons,
    `import { ${icons.specifiers
      .map((item) => item.imported.name)
      .filter((name) => !["Rocket", "ArrowRightArrowLeft"].includes(name))
      .join(", ")} } from "@gravity-ui/icons";`,
  );
  const layout = nodes(currentTree, "FunctionDeclaration").find(
    (node) => node.id.name === "DocsLayout",
  );
  const parameter = layout.params[0];
  const parameterText = currentHeader.slice(parameter.start, parameter.end);
  if (
    !parameterText.includes("searchEntries,") ||
    !parameterText.includes("searchEntries: SearchEntry[];")
  )
    throw new Error("Current DocsLayout interface changed; review the scoped navigation merge.");
  replace(
    parameter,
    parameterText
      .replace("searchEntries,", "searchEntries,\nsectionEntries,")
      .replace(
        "searchEntries: SearchEntry[];",
        "searchEntries: SearchEntry[];\nsectionEntries: DocSection[];",
      ),
  );
  const maps = (tree, name) =>
    nodes(tree, "JSXExpressionContainer").filter(
      (node) =>
        node.expression.type === "CallExpression" &&
        node.expression.callee.type === "MemberExpression" &&
        node.expression.callee.object.name === name &&
        node.expression.callee.property.name === "map",
    );
  const currentMaps = maps(currentTree, "sections");
  const ownMaps = maps(ownTree, "sectionEntries");
  if (currentMaps.length !== 2 || ownMaps.length !== 2)
    throw new Error("Expected the two reviewed section navigation loops.");
  currentMaps.forEach((node, index) =>
    replace(node, ownHeader.slice(ownMaps[index].start, ownMaps[index].end)),
  );
  for (const change of replacements.sort((a, b) => b.start - a.start))
    currentHeader =
      currentHeader.slice(0, change.start) + change.text + currentHeader.slice(change.end);
  await writeFile(path.join(output, headerFile), currentHeader);
}
inputs.push({
  checkout: "current shell + authored index interface only",
  file: headerFile,
  sha256: createHash("sha256").update(currentHeader).digest("hex"),
});
if (values.accessibility) {
  for (const [file, sha256] of [
    [
      "apps/docs/src/demos/en/input-group/with-loading-suffix.tsx",
      "de1e737e4a6de0bbc9544ce9ddff0cda74d13efca37c27ca174ff7c48ff010cb",
    ],
    [
      "apps/docs/src/demos/en/list-box/actions.tsx",
      "be1461f77ea515ad699298eb2ce76301e47bb7f54b8a8eece30748b05a335daa",
    ],
  ])
    await copyInput(values.accessibility, file, sha256);
}
if (values.legal) {
  const plan = JSON.parse(
    await readFile(
      path.join(values.legal, "test-results/legal-attribution/provenance/header-plan.json"),
      "utf8",
    ),
  );
  for (const entry of plan.proposed) {
    const existing = await readFile(path.join(output, entry.file));
    if (createHash("sha256").update(existing).digest("hex") !== entry.originalSha256)
      throw new Error(`Legal header input conflicts with another source owner: ${entry.file}`);
    await copyInput(values.legal, entry.file, entry.newSha256);
  }
}
await cp(
  path.join(output, "apps/docs/src/demos/en/dropdown"),
  path.join(output, "apps/docs/src/demos/en/menu"),
  { recursive: true },
);
await rm(path.join(output, "apps/docs/src/demos/en/dropdown"), { recursive: true });
// The projection's additional stale-version check retains the shell's exact payload.
await cp(
  path.join(root, "apps/docs/src/lib/product.ts"),
  path.join(output, "apps/docs/src/lib/product.ts"),
);
async function dependencies(target, bases) {
  const seen = new Set();
  await mkdir(path.join(target, "node_modules"), { recursive: true });
  for (const base of bases) {
    const names = await readdir(path.join(base, "node_modules")).catch((error) => {
      if (error.code === "ENOENT") return [];
      throw error;
    });
    for (const name of names) {
      if (name === ".bin" || name === ".pnpm" || name === "@lenso") continue;
      const packages = name.startsWith("@")
        ? (await readdir(path.join(base, "node_modules", name))).map((entry) => `${name}/${entry}`)
        : [name];
      for (const pkg of packages) {
        if (seen.has(pkg)) continue;
        seen.add(pkg);
        await mkdir(path.dirname(path.join(target, "node_modules", pkg)), { recursive: true });
        await symlink(path.join(base, "node_modules", pkg), path.join(target, "node_modules", pkg));
      }
    }
  }
}
const dependencyBases = [
  values.provider,
  path.join(values.provider, "apps/docs"),
  path.join(values.provider, "packages/react"),
  path.join(values.provider, "packages/styles"),
  path.join(values.provider, "packages/stylex-build"),
];
await dependencies(output, dependencyBases);
await dependencies(path.join(output, "apps/docs"), [
  path.join(values.provider, "apps/docs"),
  ...dependencyBases,
]);
const buildPackage = JSON.parse(
  await readFile(path.join(output, "packages/stylex-build/package.json"), "utf8"),
);
const store = path.join(values.provider, "node_modules/.pnpm");
const installed = await readdir(store);
for (const [name, version] of Object.entries(buildPackage.dependencies)) {
  const identity = `${name.replace("/", "+")}@${version}`;
  const entry = installed.find(
    (candidate) => candidate === identity || candidate.startsWith(`${identity}_`),
  );
  if (!entry)
    throw new Error(`Provider has no exact third-party build dependency ${name}@${version}.`);
  const dependency = path.join(store, entry, "node_modules", name);
  const target = path.join(output, "packages/stylex-build/node_modules", name);
  await mkdir(path.dirname(target), { recursive: true });
  await symlink(dependency, target);
}
for (const name of ["react", "styles", "stylex-build", "standard"]) {
  const pkg = JSON.parse(
    await readFile(path.join(output, "packages", name, "package.json"), "utf8"),
  );
  for (const directory of [output, path.join(output, "apps/docs")]) {
    await mkdir(path.join(directory, "node_modules/@lenso"), { recursive: true });
    await symlink(
      path.join(output, "packages", name),
      path.join(directory, "node_modules", pkg.name),
    );
  }
}
await writeFile(
  path.join(output, "validation-inputs.json"),
  JSON.stringify(
    {
      scope: `${values.upgrade ? "current dependency-contract source and installed upgraded third-party dependencies" : "old third-party provider dependency evidence"}; current core/shell overlays; ${values.accessibility ? "final approved EN accessibility sources included" : "not final EN accessibility regeneration"}`,
      inputs,
      provider: values.provider,
    },
    null,
    2,
  ),
);
function run(args, cwd, log) {
  const result = spawnSync(process.execPath, args, {
    cwd,
    encoding: "utf8",
    maxBuffer: 32 * 1024 * 1024,
  });
  return writeFile(path.join(output, log), `${result.stdout ?? ""}${result.stderr ?? ""}`).then(
    () => {
      if (result.status !== 0)
        throw new Error(`${args.join(" ")} failed; see ${path.join(output, log)}`);
    },
  );
}
await run(["scripts/prepare-docs.mjs"], path.join(output, "apps/docs"), "prepare.log");
console.log(
  `Current-source mirror prepared at ${output}. Build it from current source; provider workspace packages are never linked.`,
);
