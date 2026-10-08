import { execFileSync } from "node:child_process";
import { access, mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { generateLiveRegistry, type LocalizedChoices } from "./generate-live-registry.ts";
import { generatePageDocuments } from "./generate-page-documents.ts";
import { fingerprint, apiSourceInputs, apiSnapshotCurrent } from "./api-artifact.ts";
export { fingerprint, apiSnapshotCurrent, apiSnapshotDigest } from "./api-artifact.ts";

const docs = fileURLToPath(new URL("../", import.meta.url));
const repository = path.resolve(docs, "../..");

type Target = "api" | "content" | "contract" | "all" | "dev";

export function apiSnapshotCompatible(
  reference: { families?: Record<string, unknown> } | null,
  publicIndex: string,
): boolean {
  // Match the projection's actual public family inventory, including aliases.
  const families = [...publicIndex.matchAll(/from\s+["']\.\/([^/]+)\/index\.js["']/g)]
    .map((match) => match[1])
    .sort();
  return Boolean(
    families.length &&
    reference?.families &&
    families.join() === Object.keys(reference.families).sort().join(),
  );
}

export async function generateDocs(
  target: Target = "all",
  {
    changedPaths = [],
    development = target === "dev",
  }: { changedPaths?: string[]; development?: boolean } = {},
): Promise<boolean> {
  const common = ["apps/docs/scripts/generate-docs.ts", "pnpm-lock.yaml"];
  const apiInputs = await apiSourceInputs(repository);
  const contentInputs = [
    ...common,
    "apps/docs/scripts/generate-live-registry.ts",
    "apps/docs/scripts/generate-page-documents.ts",
    "apps/docs/scripts/static-search.mjs",
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
    ...(!development ? ["apps/docs/src/demos/generated.ts"] : []),
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
  if (target === "dev" && !process.env.API_REFERENCE_DEPENDENCY_ROOT) {
    let compatible = false;
    try {
      const snapshot = JSON.parse(await readFile(path.join(repository, apiOutputs[0]!), "utf8"));
      compatible =
        apiSnapshotCompatible(
          snapshot,
          await readFile(path.join(repository, "packages/react/src/components/index.ts"), "utf8"),
        ) && apiSnapshotCurrent(snapshot, await fingerprint(repository, apiInputs));
    } catch (error) {
      if (!(error instanceof SyntaxError) && (error as NodeJS.ErrnoException).code !== "ENOENT")
        throw error;
    }
    if (compatible) {
      // The tracked API is a generated artifact for these exact inputs, rather
      // than a stale preview. Changed sources must finish extraction before ready.
      changed = false;
    } else {
      console.log("Preparing the missing, changed or incompatible component API artifact…");
      changed = await runIncremental(
        repository,
        apiInputs,
        apiOutputs,
        "apps/docs/.cache/api.json",
        writeApi,
      );
    }
  } else if (process.env.API_REFERENCE_DEPENDENCY_ROOT) {
    await writeApi();
    changed = true;
  } else {
    const snapshot = await readFile(path.join(repository, apiOutputs[0]!), "utf8")
      .then((text) => JSON.parse(text))
      .catch((error) => {
        if (error instanceof SyntaxError || error.code === "ENOENT") return null;
        throw error;
      });
    if (apiSnapshotCurrent(snapshot, await fingerprint(repository, apiInputs))) {
      changed = false;
    } else {
      changed = await runIncremental(
        repository,
        apiInputs,
        apiOutputs,
        "apps/docs/.cache/api.json",
        writeApi,
      );
    }
  }
  if (target === "api") return changed;
  if (target === "dev" && changedPaths.length) {
    const indexFile = path.join(docs, "src/generated/lenso-docs-index.json");
    const index = JSON.parse(await readFile(indexFile, "utf8"));
    const affected = index.pages.filter((page: { markdownFile: string }) =>
      changedPaths.includes(page.markdownFile),
    );
    const present = await Promise.all(
      changedPaths.map(async (file) => {
        try {
          await access(path.join(docs, file));
          return true;
        } catch (error) {
          if ((error as NodeJS.ErrnoException).code === "ENOENT") return false;
          throw error;
        }
      }),
    );
    if (
      affected.length === changedPaths.length &&
      present.every(Boolean) &&
      changedPaths.every((file) =>
        /^content\/lenso\/(?:en|cn)\/react\/(?!components\/).+\.mdx$/.test(file),
      )
    ) {
      for (const page of affected) {
        const text = await readFile(path.join(docs, page.markdownFile), "utf8");
        const fields = Object.fromEntries(
          [...text.matchAll(/^(title|description|navigationGroup|navigationOrder): (.+)$/gm)].map(
            (match) => [match[1], JSON.parse(match[2]!)],
          ),
        );
        if (!fields.title || !fields.description)
          throw new Error(`Missing authored metadata: ${page.markdownFile}`);
        if (!("navigationGroup" in fields)) delete page.navigationGroup;
        if (!("navigationOrder" in fields)) delete page.navigationOrder;
        Object.assign(page, fields);
      }
      await writeFile(indexFile, `${JSON.stringify(index, null, 2)}\n`);
      await generatePageDocuments(docs, {
        pageIds: affected.map(
          (page: { locale: string; slug: string }) => `${page.locale}/${page.slug}`,
        ),
      });
      const { writeStaticSearch } = await import("./static-search.mjs");
      await writeStaticSearch(index, {
        locales: [...new Set<string>(affected.map((page: { locale: string }) => page.locale))],
      });
      return true;
    }
  }
  changed =
    (await runIncremental(
      repository,
      contentInputs,
      contentOutputs,
      development ? "apps/docs/.cache/content-dev.json" : "apps/docs/.cache/content.json",
      async () => {
        const { writeDocsProjection } = await import("./docs-projection.mjs");
        const manifest: LocalizedChoices = JSON.parse(
          await readFile(path.join(docs, "src/demos/localized-manifest.json"), "utf8"),
        );
        await generateLiveRegistry(docs, manifest, { globalRegistry: !development });
        await writeDocsProjection(repository);
        await generatePageDocuments(docs);
      },
      contentOutputs.filter((file) => file.includes("content/lenso/")),
    )) || changed;
  if (target === "content") return changed;
  if (target !== "dev")
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
  if (!["api", "content", "contract", "all", "dev"].includes(target))
    throw new Error("Usage: tsx scripts/generate-docs.ts [api|content|contract|all|dev]");
  if (!process.argv.includes("--skip-build"))
    execFileSync(
      "pnpm",
      [
        "exec",
        "turbo",
        "run",
        target === "dev" ? "build:dev" : "build",
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
  const changedPaths = process.argv.slice(3).filter((argument) => !argument.startsWith("--"));
  await generateDocs(target as Target, {
    changedPaths,
    development: target === "dev" || process.argv.includes("--development"),
  });
}
