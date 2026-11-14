import { execFileSync } from "node:child_process";
import { access, readFile } from "node:fs/promises";
import { writeGeneratedFile } from "./write-generated-file.ts";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { LocalizedChoices } from "./generate-live-registry.ts";
import { fingerprint, apiSourceInputs } from "./api-artifact.ts";

const docs = fileURLToPath(new URL("../", import.meta.url));
const repository = path.resolve(docs, "../..");

type Target = "api" | "content" | "contract" | "all" | "dev" | "site";

export async function generateDocs(
  target: Target = "all",
  {
    changedPaths = [],
    development = target === "dev",
  }: { changedPaths?: string[]; development?: boolean } = {},
): Promise<boolean> {
  const common = [
    "apps/docs/scripts/generate-docs.ts",
    "apps/docs/scripts/write-generated-file.ts",
    "bun.lock",
  ];
  const apiInputs = target === "dev" ? [] : await apiSourceInputs(repository);
  const contentInputs = [
    ...common,
    "apps/docs/scripts/generate-live-registry.ts",
    "apps/docs/scripts/generate-page-documents.ts",
    "apps/docs/scripts/static-search.ts",
    "apps/docs/src/lib/demo-locale.ts",
    "apps/docs/scripts/docs-projection.ts",
    "apps/docs/scripts/keyboard-guidance.ts",
    "apps/docs/src/lib/redirects.ts",
    "apps/docs/src/lib/native-api-section.ts",
    "apps/docs/src/lib/api-property-groups.ts",
    "apps/docs/content/example-catalog.json",
    "apps/docs/content/lenso",
    "apps/docs/src/demos/en",
    "apps/docs/src/demos/cn",
    "apps/docs/src/stories",
    "apps/docs/src/demos/localized-manifest.json",
    "apps/docs/src/generated/api-reference.json",
    "packages/ui/src/components/index.ts",
    "packages/ui/package.json",
  ];
  const contractInputs = [
    ...common,
    "apps/docs/scripts/generate-lenso-contract.ts",
    "apps/docs/src/lib/local-example-files.ts",
    "apps/docs/src/lib/docs-directory.ts",
    "apps/docs/src/generated/api-reference.json",
    "apps/docs/src/generated/lenso-docs-index.json",
    "apps/docs/content/lenso",
    "apps/docs/src/demos/demo.stylex.ts",
    "apps/docs/src/demos/en",
    "apps/docs/src/demos/cn",
    "apps/docs/src/demos/shared",
    "packages/ui/package.json",
    "packages/ui/src",
    "packages/tokens/src",
    "packages/tokens/themes",
    "packages/tokens/package.json",
    "packages/devtools/src/contract",
  ];
  const apiOutputs = ["apps/docs/src/generated/api-reference.json"];
  const contentOutputs = [
    "apps/docs/public/_redirects",
    "apps/docs/src/demos/live-manifest.json",
    "apps/docs/src/generated/lenso-docs-index.json",
    "apps/docs/src/generated/documents",
    "apps/docs/content/lenso/en/react/components",
    "apps/docs/content/lenso/cn/react/components",
  ];
  const writeApi = async () => {
    const { writeApiReference } = await import("./generate-api-reference.ts");
    await writeApiReference(repository, process.env.API_REFERENCE_DEPENDENCY_ROOT ?? repository);
  };
  // External dependency inputs are not covered by this checkout's cache.
  let changed: boolean;
  if (target === "dev") {
    try {
      await access(path.join(repository, apiOutputs[0]!));
      changed = false;
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
      await writeApi();
      changed = true;
    }
  } else if (process.env.API_REFERENCE_DEPENDENCY_ROOT) {
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
      await writeGeneratedFile(indexFile, `${JSON.stringify(index, null, 2)}\n`);
      const { generatePageDocuments } = await import("./generate-page-documents.ts");
      await generatePageDocuments(docs, {
        pageIds: affected.map(
          (page: { locale: string; slug: string }) => `${page.locale}/${page.slug}`,
        ),
      });
      const { writeStaticSearch } = await import("./static-search.ts");
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
        const { writeDocsProjection } = await import("./docs-projection.ts");
        const { generateLiveRegistry } = await import("./generate-live-registry.ts");
        const { generatePageDocuments } = await import("./generate-page-documents.ts");
        const manifest: LocalizedChoices = JSON.parse(
          await readFile(path.join(docs, "src/demos/localized-manifest.json"), "utf8"),
        );
        await generateLiveRegistry(docs, manifest, { globalRegistry: false });
        await writeDocsProjection(repository);
        await generatePageDocuments(docs);
      },
      contentOutputs.filter((file) => file.includes("content/lenso/")),
    )) || changed;
  if (target === "content") return changed;
  if (target !== "dev" && target !== "site")
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
        "apps/docs/scripts/static-search.ts",
        "apps/docs/scripts/docs-projection.ts",
        "apps/docs/src/lib/redirects.ts",
        "apps/docs/scripts/example-proof-plan.ts",
        "apps/docs/src/lib/heading-id.ts",
        "apps/docs/src/lib/native-api-section.ts",
        "apps/docs/src/lib/api-property-groups.ts",
        "apps/docs/src/generated/lenso-docs-index.json",
        "apps/docs/content/lenso",
        "apps/docs/content/example-catalog.json",
        "apps/docs/src/demos/live-manifest.json",
      ],
      ["apps/docs/public/search"],
      "apps/docs/.cache/static-search.json",
      async () => {
        const { writeStaticSearch } = await import("./static-search.ts");
        const authored = JSON.parse(
          await readFile(path.join(docs, "src/generated/lenso-docs-index.json"), "utf8"),
        );
        await writeStaticSearch(authored);
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
  await writeGeneratedFile(
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
  if (!["api", "content", "contract", "all", "dev", "site"].includes(target))
    throw new Error("Usage: bun scripts/generate-docs.ts [api|content|contract|all|dev|site]");
  if (!process.argv.includes("--skip-build"))
    execFileSync(
      "bun",
      [
        "./node_modules/turbo/bin/turbo",
        "run",
        // Story's compiler needs package declarations even in development.
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
  const changedPaths = process.argv.slice(3).filter((argument) => !argument.startsWith("--"));
  await generateDocs(target as Target, {
    changedPaths,
    development: target === "dev" || process.argv.includes("--development"),
  });
}
