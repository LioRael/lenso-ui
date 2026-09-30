import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { upstream } from "./upstream-contract.mjs";

const root = fileURLToPath(new URL("../", import.meta.url));
export async function reportCoverage() {
  const source = JSON.parse(await readFile(path.join(root, "content/source-index.json"), "utf8"));
  const live = JSON.parse(await readFile(path.join(root, "src/demos/live-manifest.json"), "utf8"));
  // Match generated.ts and LivePreview, not unregistered localization artifacts.
  const liveByLocale = { en: live, cn: {} };
  const excluded = new Set(
    source.excludedExamples.map((example) => `${example.locale}:${example.name}`),
  );
  for (const name of Object.keys(live)) {
    if (!source.examples.en[name])
      throw new Error(`Live preview has no pinned source provenance: ${name}`);
  }
  const pageCoverage = source.pages.map((page) => {
    const previews = page.previews.map((name) => ({
      name,
      status: liveByLocale[page.locale]?.[name]
        ? "local-adaptation"
        : page.locale !== "en" && live[name]
          ? "english-reuse"
          : excluded.has(`${page.locale}:${name}`)
            ? "intentionally-excluded"
            : source.examples[page.locale][name] || source.examples.en[name]
              ? "source-only"
              : "upstream-reference-missing",
    }));
    return { locale: page.locale, slug: page.slug, previews };
  });
  const locales = Object.fromEntries(
    upstream.locales.map((locale) => {
      const pages = source.pages.filter((page) => page.locale === locale);
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
            ["getting-started", "components", "releases", "migration"].map((section) => [
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
    upstream,
    completeUpstreamRuntimeParity: false,
    locales,
    liveReferences: Object.keys(live).length,
    uniqueLiveModules: new Set(Object.values(live)).size,
    liveReferencesByLocale: Object.fromEntries(
      upstream.locales.map((locale) => [locale, Object.keys(liveByLocale[locale]).length]),
    ),
    unimplementedReferencesByLocale: Object.fromEntries(
      upstream.locales.map((locale) => [
        locale,
        Object.keys(source.examples[locale]).filter((name) => !liveByLocale[locale][name]),
      ]),
    ),
    allReactExampleReferencesRunnable: upstream.locales.every((locale) =>
      Object.keys(source.examples[locale]).every((name) => liveByLocale[locale][name]),
    ),
    componentPagesWithLocalAdaptation: componentPages.filter((page) =>
      page.previews.some((preview) => preview.status === "local-adaptation"),
    ).length,
    componentPagesWithoutLocalAdaptation: componentPages
      .filter((page) => !page.previews.some((preview) => preview.status === "local-adaptation"))
      .map((page) => page.slug),
    pageCoverage,
    unresolvedUpstreamReferences: source.unresolvedPreviews,
    limitations: [
      "Runnable modules and successful builds are not proof of exhaustive source behavior or visual parity.",
      "Source-only examples are preserved and labeled; they are not executable local demos.",
      "Imported API tables and Tailwind instructions remain historical upstream reference until migrated.",
      "English fallback scenes on Chinese pages are reported separately from source-backed Chinese adaptations.",
      "Native-product examples are intentionally excluded.",
    ],
  };
  await writeFile(path.join(root, "public/coverage.json"), `${JSON.stringify(report, null, 2)}\n`);
  console.log(
    `${report.liveReferences} live references (${report.uniqueLiveModules} modules); ${report.componentPagesWithLocalAdaptation}/${componentPages.length} component pages have a local adaptation.`,
  );
  if (report.componentPagesWithoutLocalAdaptation.length)
    console.log(
      "Missing component-page live adaptation:",
      report.componentPagesWithoutLocalAdaptation,
    );
  return report;
}
