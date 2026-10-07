import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { generateLiveRegistry, type LocalizedChoices } from "./generate-live-registry.ts";
import { generatePageDocuments } from "./generate-page-documents.ts";

const docs = fileURLToPath(new URL("../", import.meta.url));
const repository = path.resolve(docs, "../..");

export async function fingerprint(
  directory: string,
  inputs: string[],
  excluded: string[] = [],
): Promise<string> {
  const hash = createHash("sha256");
  async function visit(relative: string): Promise<void> {
    if (excluded.includes(relative)) return;
    const absolute = path.join(directory, relative);
    let entries;
    try {
      entries = await readdir(absolute, { withFileTypes: true });
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "ENOTDIR") {
        hash
          .update(relative)
          .update("\0")
          .update(await readFile(absolute))
          .update("\0");
        return;
      }
      throw error;
    }
    for (const entry of entries.sort((a, b) => a.name.localeCompare(b.name))) {
      if (entry.isSymbolicLink())
        throw new Error(`Unexpected generation input symlink: ${relative}`);
      await visit(path.join(relative, entry.name));
    }
  }
  for (const input of inputs) await visit(input);
  return hash.digest("hex");
}

type Target = "api" | "content" | "contract" | "all";
export async function generateDocs(target: Target = "all"): Promise<boolean> {
  const common = ["apps/docs/scripts/generate-docs.ts", "pnpm-lock.yaml"];
  const typedSources = async (directory: string): Promise<string[]> =>
    (await readdir(path.join(repository, directory), { recursive: true }))
      .filter((file) => /\.(?:ts|tsx)$/.test(file) && !/\.(?:test|browser)\./.test(file))
      .sort()
      .map((file) => path.join(directory, file));
  const apiInputs = [
    ...common,
    "apps/docs/scripts/generate-api-reference.mjs",
    "packages/standard/oxfmt.json",
    ...(await typedSources("packages/react/src")),
    "packages/react/package.json",
    ...(await typedSources("packages/styles/src")),
  ];
  const contentInputs = [
    ...common,
    "apps/docs/scripts/generate-live-registry.ts",
    "apps/docs/scripts/generate-page-documents.ts",
    "apps/docs/src/lib/demo-locale.ts",
    "apps/docs/scripts/docs-projection.mjs",
    "apps/docs/src/lib/native-api-section.ts",
    "apps/docs/src/lib/api-property-groups.ts",
    "apps/docs/content/source-index.json",
    "apps/docs/content/lenso",
    "apps/docs/src/demos/en",
    "apps/docs/src/demos/cn",
    "apps/docs/src/demos/localized-manifest.json",
    "apps/docs/src/generated/api-reference.json",
    "packages/react/src/components/index.ts",
    "packages/react/package.json",
  ];
  const contractInputs = [
    ...common,
    "apps/docs/scripts/generate-lenso-contract.ts",
    "apps/docs/src/lib/local-example-files.ts",
    "apps/docs/src/lib/docs-directory.mjs",
    "apps/docs/src/generated/api-reference.json",
    "apps/docs/src/generated/lenso-docs-index.json",
    "apps/docs/content/lenso",
    "apps/docs/src/demos/demo.stylex.ts",
    "apps/docs/src/demos/en",
    "apps/docs/src/demos/cn",
    "packages/react/package.json",
    "packages/react/src",
    "packages/styles/src",
    "packages/styles/themes",
    "packages/styles/package.json",
    "packages/stylex-build/src",
    "packages/stylex-build/package.json",
    "tooling/lenso-contracts",
  ];
  const apiOutputs = ["apps/docs/src/generated/api-reference.json"];
  const contentOutputs = [
    "apps/docs/src/demos/generated.ts",
    "apps/docs/src/demos/live-manifest.json",
    "apps/docs/src/generated/lenso-docs-index.json",
    "apps/docs/src/generated/documents",
    "apps/docs/content/lenso/en/react/components",
    "apps/docs/content/lenso/cn/react/components",
  ];
  const writeApi = async () => {
    const { writeApiReference } = await import("./generate-api-reference.mjs");
    await writeApiReference(repository, process.env.API_REFERENCE_DEPENDENCY_ROOT ?? repository);
  };
  // An external dependency checkout is not described by this checkout's lockfile.
  // Preserve the override for isolated fixtures without caching its declarations.
  let changed: boolean;
  if (process.env.API_REFERENCE_DEPENDENCY_ROOT) {
    await writeApi();
    changed = true;
  } else {
    changed = await runIncremental(
      repository,
      apiInputs,
      apiOutputs,
      "apps/docs/.cache/api.json",
      writeApi,
    );
  }
  if (target === "api") return changed;
  changed =
    (await runIncremental(
      repository,
      contentInputs,
      contentOutputs,
      "apps/docs/.cache/content.json",
      async () => {
        const { writeDocsProjection } = await import("./docs-projection.mjs");
        const manifest: LocalizedChoices = JSON.parse(
          await readFile(path.join(docs, "src/demos/localized-manifest.json"), "utf8"),
        );
        await generateLiveRegistry(docs, manifest);
        await writeDocsProjection(repository);
        await generatePageDocuments(docs);
      },
      contentOutputs.filter((file) => file.includes("content/lenso/")),
    )) || changed;
  if (target === "content") return changed;
  changed =
    (await runIncremental(
      repository,
      contractInputs,
      ["apps/docs/src/generated/lenso-contract.json"],
      "apps/docs/.cache/contract.json",
      async () => {
        const { writeLensoContract } = await import("./generate-lenso-contract.ts");
        await writeLensoContract(repository);
      },
    )) || changed;
  if (target === "contract") return changed;
  changed =
    (await runIncremental(
      repository,
      [
        ...common,
        "apps/docs/scripts/static-search.mjs",
        "apps/docs/scripts/report-coverage.ts",
        "apps/docs/scripts/docs-projection.mjs",
        "apps/docs/scripts/example-proof-plan.mjs",
        "apps/docs/scripts/upstream-contract.mjs",
        "apps/docs/src/lib/heading-id.mjs",
        "apps/docs/src/lib/native-api-section.ts",
        "apps/docs/src/lib/api-property-groups.ts",
        "apps/docs/src/generated/lenso-docs-index.json",
        "apps/docs/content/lenso",
        "apps/docs/content/source-index.json",
        "apps/docs/src/demos/live-manifest.json",
      ],
      ["apps/docs/public/search", "apps/docs/public/coverage.json"],
      "apps/docs/.cache/search-coverage.json",
      async () => {
        const { writeStaticSearch } = await import("./static-search.mjs");
        const { reportCoverage } = await import("./report-coverage.ts");
        const authored = JSON.parse(
          await readFile(path.join(docs, "src/generated/lenso-docs-index.json"), "utf8"),
        );
        await writeStaticSearch(authored);
        await reportCoverage(docs);
      },
    )) || changed;
  return changed;
}

export async function runIncremental(
  directory: string,
  inputs: string[],
  outputs: string[],
  cacheFile: string,
  generate: () => Promise<void>,
  excludedInputs: string[] = [],
): Promise<boolean> {
  const cache = path.join(directory, cacheFile);
  const inputHash = await fingerprint(directory, inputs, excludedInputs);
  try {
    const previous: { inputs: string; outputs: string } = JSON.parse(await readFile(cache, "utf8"));
    if (
      previous.inputs === inputHash &&
      previous.outputs === (await fingerprint(directory, outputs))
    ) {
      console.log("Docs generation is current.");
      return false;
    }
  } catch (error) {
    if (!(error instanceof SyntaxError) && (error as NodeJS.ErrnoException).code !== "ENOENT")
      throw error;
  }
  await generate();
  await mkdir(path.dirname(cache), { recursive: true });
  await writeFile(
    cache,
    JSON.stringify({
      inputs: inputHash,
      outputs: await fingerprint(directory, outputs),
    }),
  );
  return true;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const target = process.argv[2] ?? "all";
  if (!["api", "content", "contract", "all"].includes(target))
    throw new Error("Usage: tsx scripts/generate-docs.ts [api|content|contract|all]");
  execFileSync(
    "pnpm",
    [
      "exec",
      "turbo",
      "run",
      "build",
      "--filter=@lenso/ui",
      "--filter=@lenso/tokens",
      "--filter=@lenso/docs",
      "--output-logs=errors-only",
    ],
    {
      cwd: repository,
      stdio: "inherit",
    },
  );
  await generateDocs(target as Target);
}
