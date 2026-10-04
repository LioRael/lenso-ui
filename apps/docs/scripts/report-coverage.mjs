import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { upstream } from "./upstream-contract.mjs";
import { format } from "oxfmt";
import { createExamplePlan } from "./example-proof-plan.mjs";
import { canonicalExampleName } from "./docs-projection.mjs";

const root = fileURLToPath(new URL("../", import.meta.url));
export async function reportCoverage(directory = root) {
  const source = JSON.parse(
    await readFile(path.join(directory, "content/source-index.json"), "utf8"),
  );
  const liveByLocale = JSON.parse(
    await readFile(path.join(directory, "src/demos/live-manifest.json"), "utf8"),
  );
  const projection = JSON.parse(
    await readFile(path.join(directory, "src/generated/lenso-docs-index.json"), "utf8"),
  );
  const provenance = JSON.parse(
    await readFile(path.join(directory, "src/demos/localization-provenance.json"), "utf8"),
  );
  const live = liveByLocale.en;
  const examples = Object.fromEntries(
    upstream.locales.map((locale) => [
      locale,
      Object.fromEntries(
        Object.entries(source.examples[locale]).map(([name, entry]) => [
          canonicalExampleName(name),
          entry,
        ]),
      ),
    ]),
  );
  // Match generated.ts and LivePreview, not unregistered localization artifacts.
  const excluded = new Set(
    source.excludedExamples.map(
      (example) => `${example.locale}:${canonicalExampleName(example.name)}`,
    ),
  );
  for (const name of Object.keys(live)) {
    if (!examples.en[name])
      throw new Error(`Live preview has no pinned source provenance: ${name}`);
  }
  const pageCoverage = projection.pages.map((page) => {
    const previews = page.examples.map(({ name }) => ({
      name,
      status: liveByLocale[page.locale]?.[name]
        ? page.locale === "cn" && liveByLocale.cn[name].startsWith("en/")
          ? "source-equivalent-reuse"
          : "local-adaptation"
        : page.locale !== "en" && live[name]
          ? "english-fallback"
          : excluded.has(`${page.locale}:${name}`)
            ? "intentionally-excluded"
            : examples[page.locale][name] || examples.en[name]
              ? "source-only"
              : "upstream-reference-missing",
    }));
    return { locale: page.locale, slug: page.slug, previews };
  });
  const locales = Object.fromEntries(
    upstream.locales.map((locale) => {
      const pages = projection.pages.filter((page) => page.locale === locale);
      const registry = Object.values(source.examples[locale]);
      const uniqueRegisteredFiles = new Set(registry.map((example) => example.source));
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
          uniqueRegisteredFiles: uniqueRegisteredFiles.size,
          preservedRegisteredSourceFiles: uniqueRegisteredFiles.size - excludedCount,
          intentionallyExcludedNativeExamples: excludedCount,
          unregisteredSourceFiles: source.unregisteredSources.filter(
            (example) => example.locale === locale,
          ).length,
        },
      ];
    }),
  );
  const componentPages = pageCoverage.filter(
    (page) => page.locale === "en" && page.slug.startsWith("react/components/"),
  );
  const report = {
    formatVersion: projection.formatVersion,
    lensoVersion: projection.lensoVersion,
    completeUpstreamRuntimeParity: false,
    locales,
    liveReferences: Object.keys(live).length,
    uniqueLiveModules: new Set(Object.values(live)).size,
    liveReferencesByLocale: Object.fromEntries(
      upstream.locales.map((locale) => [locale, Object.keys(liveByLocale[locale]).length]),
    ),
    translatedChineseReferences: Object.values(liveByLocale.cn).filter((file) =>
      file.startsWith("cn/"),
    ).length,
    sourceEquivalentChineseReferences: Object.values(liveByLocale.cn).filter((file) =>
      file.startsWith("en/"),
    ).length,
    independentlyProjectedArchivedExclusions: Object.entries(provenance.modules)
      .filter(([, module]) => module.sourceAvailability === "hash-pinned-public-upstream")
      .map(([file, module]) => ({
        file,
        output: module.output,
        archivedExclusions: module.archivedExclusions,
        status: module.status,
      })),
    verifiedChineseCompositionReferences: Object.keys(liveByLocale.cn).filter((name) => {
      const sourceFile = live[name];
      return Boolean(provenance.modules[sourceFile]?.verifiedComposition);
    }).length,
    blockedChineseReferences: Object.keys(examples.cn)
      .filter((name) => !liveByLocale.cn[name])
      .map((name) => {
        const sourceFile = live[name];
        const evidence = provenance.modules[sourceFile];
        return {
          name,
          status: evidence?.status ?? "no-local-adaptation",
          reason: evidence?.reason ?? "No applied source-backed Chinese translation was proven.",
        };
      }),
    uniqueLiveModulesByLocale: Object.fromEntries(
      upstream.locales.map((locale) => [locale, new Set(Object.values(liveByLocale[locale])).size]),
    ),
    localizationExceptions: {
      modules: Object.entries(provenance.modules)
        .filter(
          ([, module]) =>
            module.unresolved?.length ||
            module.literalSafetyExceptions?.length ||
            module.reachableHelpers?.some(
              (helper) =>
                helper.unresolved?.length ||
                helper.literalSafetyExceptions?.length ||
                helper.ambiguities?.length,
            ) ||
            module.ambiguities?.length ||
            module.structuralDifference ||
            module.status === "no-source-backed-translation-applied" ||
            module.status === "missing-pinned-source-code",
        )
        .map(([file, module]) => ({
          file,
          family: file.split("/")[1],
          status: module.status,
          verifiedComposition: Boolean(module.verifiedComposition),
          unresolvedTranslations: module.unresolved?.length ?? 0,
          preservedNonPresentationDifferences: module.literalSafetyExceptions?.length ?? 0,
          unresolvedHelperTranslations: (module.reachableHelpers ?? []).reduce(
            (count, helper) => count + (helper.unresolved?.length ?? 0),
            0,
          ),
          ambiguousTranslations: module.ambiguities?.length ?? 0,
          structuralDifference: module.structuralDifference ?? false,
        })),
      source: provenance.sourceExceptions.map((exception) => ({
        name: exception.name ? canonicalExampleName(exception.name) : undefined,
        family: exception.family,
        reason: exception.reason,
        ...(exception.sourceAvailability
          ? { sourceAvailability: exception.sourceAvailability }
          : {}),
        structuralDifferences: exception.structuralDifferences?.length ?? 0,
      })),
    },
    unimplementedReferencesByLocale: Object.fromEntries(
      upstream.locales.map((locale) => [
        locale,
        Object.keys(examples[locale]).filter((name) => !liveByLocale[locale][name]),
      ]),
    ),
    allReactExampleReferencesRunnable: upstream.locales.every((locale) =>
      Object.keys(examples[locale]).every((name) => liveByLocale[locale][name]),
    ),
    authoredPlacementProof: upstream.locales.map((locale) =>
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
      detail:
        "Integrity-checked archive and localization provenance remain internal source evidence.",
    },
    limitations: [
      "Runnable modules and successful builds are not proof of exhaustive source behavior or visual parity.",
      "Source-only examples are preserved and labeled; they are not executable local demos.",
      "Public pages use authored Lenso content and current native API; immutable reference content is private provenance.",
      "English fallback scenes on Chinese pages are reported separately from source-backed Chinese adaptations.",
      "Source-backed Chinese registration proves applied pinned presentation translations, not complete translation or behavioral parity; withheld literals and structural exceptions remain recorded.",
      "Reviewed CN-specific compositions pin exact EN/CN source, adapted implementation and projected output; they are separate from source-equivalent reuse and generic literal projection.",
      "Library-generated date text and other ambient-locale content are not translated by source projection.",
      "Native-product archive code remains intentionally excluded. Four disclosure examples are independently projected for React from separately hash-pinned public EN/CN source; no Native runtime or App Store functionality is implemented.",
    ],
  };
  const formatted = await format("coverage.json", JSON.stringify(report), { printWidth: 100 });
  if (formatted.errors.length)
    throw new Error("Cannot format the generated locale coverage report.");
  await writeFile(path.join(directory, "public/coverage.json"), formatted.code);
  console.log(
    `${report.liveReferences} live references (${report.uniqueLiveModules} modules); ${report.componentFamiliesWithDedicatedScenarios}/${componentPages.length} families have a dedicated source scenario.`,
  );
  if (report.familiesWithoutDedicatedScenarios.length)
    console.log(
      "Families without a dedicated source scenario:",
      report.familiesWithoutDedicatedScenarios,
    );
  return report;
}
