import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { format } from "oxfmt";
import { createExamplePlan } from "./example-proof-plan.mjs";
import { canonicalExampleName } from "./docs-projection.mjs";
import type { LiveManifest } from "./generate-live-registry.ts";

type Locale = "en" | "cn";
const locales: Locale[] = ["en", "cn"];
const root = fileURLToPath(new URL("../", import.meta.url));
type Source = {
  examples: Record<Locale, Record<string, { source: string }>>;
  excludedExamples: { locale: Locale; name: string }[];
  unregisteredSources: { locale: Locale }[];
  unresolvedPreviews: unknown[];
};
type Projection = {
  formatVersion: number;
  lensoVersion: string;
  sourceFamilyMapping: Record<string, string>;
  pages: { locale: Locale; slug: string; examples: { name: string; file: string }[] }[];
};

export async function reportCoverage(directory = root) {
  const source: Source = JSON.parse(
    await readFile(path.join(directory, "content/source-index.json"), "utf8"),
  );
  const liveByLocale: LiveManifest = JSON.parse(
    await readFile(path.join(directory, "src/demos/live-manifest.json"), "utf8"),
  );
  const projection: Projection = JSON.parse(
    await readFile(path.join(directory, "src/generated/lenso-docs-index.json"), "utf8"),
  );
  const examples = Object.fromEntries(
    locales.map((locale) => [
      locale,
      Object.fromEntries(
        Object.entries(source.examples[locale]).map(([name, entry]) => [
          canonicalExampleName(name),
          entry,
        ]),
      ),
    ]),
  ) as Source["examples"];
  const excluded = new Set(
    source.excludedExamples.map(({ locale, name }) => `${locale}:${canonicalExampleName(name)}`),
  );
  for (const name of Object.keys(liveByLocale.en))
    if (!examples.en[name]) throw new Error(`Live preview has no source scenario: ${name}`);
  const pageCoverage = projection.pages.map((page) => ({
    locale: page.locale,
    slug: page.slug,
    previews: page.examples.map(({ name }) => ({
      name,
      status: liveByLocale[page.locale][name]
        ? page.locale === "cn" && liveByLocale.cn[name].startsWith("en/")
          ? "source-equivalent-reuse"
          : "local-adaptation"
        : page.locale === "cn" && liveByLocale.en[name]
          ? "english-fallback"
          : excluded.has(`${page.locale}:${name}`)
            ? "intentionally-excluded"
            : examples[page.locale][name] || examples.en[name]
              ? "source-only"
              : "upstream-reference-missing",
    })),
  }));
  const componentPages = pageCoverage.filter(
    (page) => page.locale === "en" && page.slug.startsWith("react/components/"),
  );
  const report = {
    formatVersion: projection.formatVersion,
    lensoVersion: projection.lensoVersion,
    completeUpstreamRuntimeParity: false,
    locales: Object.fromEntries(
      locales.map((locale) => {
        const pages = projection.pages.filter((page) => page.locale === locale);
        const registry = Object.values(examples[locale]);
        const unique = new Set(registry.map((example) => example.source)).size;
        const excludedCount = source.excludedExamples.filter(
          (example) => example.locale === locale,
        ).length;
        return [
          locale,
          {
            pages: pages.length,
            sections: Object.fromEntries(
              ["getting-started", "components"].map((section) => [
                section,
                pages.filter(
                  (page) =>
                    page.slug === `react/${section}` || page.slug.startsWith(`react/${section}/`),
                ).length,
              ]),
            ),
            registeredReferencesIncludingAliases: registry.length,
            uniqueRegisteredFiles: unique,
            preservedRegisteredSourceFiles: unique - excludedCount,
            intentionallyExcludedNativeExamples: excludedCount,
            unregisteredSourceFiles: source.unregisteredSources.filter(
              (example) => example.locale === locale,
            ).length,
          },
        ];
      }),
    ),
    liveReferences: Object.keys(liveByLocale.en).length,
    uniqueLiveModules: new Set(Object.values(liveByLocale.en)).size,
    liveReferencesByLocale: Object.fromEntries(
      locales.map((locale) => [locale, Object.keys(liveByLocale[locale]).length]),
    ),
    uniqueLiveModulesByLocale: Object.fromEntries(
      locales.map((locale) => [locale, new Set(Object.values(liveByLocale[locale])).size]),
    ),
    translatedChineseReferences: Object.values(liveByLocale.cn).filter((file) =>
      file.startsWith("cn/"),
    ).length,
    sourceEquivalentChineseReferences: Object.values(liveByLocale.cn).filter((file) =>
      file.startsWith("en/"),
    ).length,
    blockedChineseReferences: Object.keys(examples.cn)
      .filter((name) => !liveByLocale.cn[name])
      .map((name) => ({
        name,
        status: "no-local-adaptation",
        reason: "No maintained Chinese module is registered.",
      })),
    unimplementedReferencesByLocale: Object.fromEntries(
      locales.map((locale) => [
        locale,
        Object.keys(examples[locale]).filter((name) => !liveByLocale[locale][name]),
      ]),
    ),
    allReactExampleReferencesRunnable: locales.every((locale) =>
      Object.keys(examples[locale]).every((name) => liveByLocale[locale][name]),
    ),
    authoredPlacementProof: locales.map((locale) =>
      createExamplePlan(source, projection, liveByLocale, { locale }),
    ),
    componentFamiliesWithDedicatedScenarios: componentPages.filter((page) =>
      page.previews.some((preview) => preview.status === "local-adaptation"),
    ).length,
    familiesWithoutDedicatedScenarios: componentPages
      .filter((page) => !page.previews.some((preview) => preview.status === "local-adaptation"))
      .map((page) => page.slug.split("/").at(-1)),
    pageCoverage,
    archiveAudit: {
      unresolvedReferenceCount: source.unresolvedPreviews.length,
      excludedSourceRecordCount: source.excludedExamples.length,
      unregisteredSourceRecordCount: source.unregisteredSources.length,
      detail: "Import-time upstream provenance is separate from maintained local examples.",
    },
    limitations: [
      "Registration and successful builds do not prove exhaustive behavior, visual parity or translation.",
      "English fallbacks are reported separately from maintained Chinese modules.",
      "Source-only references are not executable demos.",
      "Native-product source remains excluded; independent React adaptations do not implement Native functionality.",
      "Browser results are run-specific artifacts, not daily source prerequisites.",
    ],
  };
  const formatted = await format("coverage.json", JSON.stringify(report), { printWidth: 100 });
  if (formatted.errors.length) throw new Error("Cannot format locale coverage report.");
  await writeFile(path.join(directory, "public/coverage.json"), formatted.code);
  return report;
}
