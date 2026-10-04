import assert from "node:assert/strict";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { tmpdir } from "node:os";
import test from "node:test";
import { reportCoverage } from "./report-coverage.mjs";

test("coverage counts actual locale registrations, not visible English fallbacks or aliases as modules", async (t) => {
  const directory = await mkdtemp(path.join(tmpdir(), "lenso-locale-coverage-"));
  t.after(() => rm(directory, { recursive: true, force: true }));
  for (const folder of ["content", "src/demos", "src/generated", "public"])
    await mkdir(path.join(directory, folder), { recursive: true });
  const entries = Object.fromEntries(
    ["basic", "alias", "reuse", "missing"].map((name) => [
      name,
      { source: `apps/docs/src/demos/en/button/${name}.tsx` },
    ]),
  );
  await writeFile(
    path.join(directory, "content/source-index.json"),
    JSON.stringify({
      examples: { en: entries, cn: entries },
      pages: ["en", "cn"].map((locale) => ({
        locale,
        slug: "react/components/button",
        previews: Object.keys(entries),
      })),
      excludedExamples: [],
      unregisteredSources: [],
      unresolvedPreviews: [],
    }),
  );
  await writeFile(
    path.join(directory, "src/generated/lenso-docs-index.json"),
    JSON.stringify({
      formatVersion: 1,
      lensoVersion: "0.9.0",
      sourceFamilyMapping: { dropdown: "menu" },
      pages: ["en", "cn"].map((locale) => ({
        locale,
        slug: "react/components/button",
        examples: Object.keys(entries).map((name) => ({
          name,
          file:
            name === "alias"
              ? `${locale}/basic.tsx`
              : name === "reuse"
                ? "en/reuse.tsx"
                : `${locale}/${name}.tsx`,
        })),
      })),
    }),
  );
  await writeFile(
    path.join(directory, "src/demos/live-manifest.json"),
    JSON.stringify({
      en: {
        basic: "en/basic.tsx",
        alias: "en/basic.tsx",
        reuse: "en/reuse.tsx",
        missing: "en/missing.tsx",
      },
      cn: { basic: "cn/basic.tsx", alias: "cn/basic.tsx", reuse: "en/reuse.tsx" },
    }),
  );
  await writeFile(
    path.join(directory, "src/demos/localization-provenance.json"),
    JSON.stringify({
      modules: {
        "en/missing.tsx": {
          status: "no-source-backed-translation-applied",
          unresolved: [{}],
          structuralDifference: true,
        },
      },
      sourceExceptions: [{ family: "button" }],
    }),
  );
  const report = await reportCoverage(directory);
  assert.deepEqual(report.liveReferencesByLocale, { en: 4, cn: 3 });
  assert.deepEqual(report.uniqueLiveModulesByLocale, { en: 3, cn: 2 });
  assert.equal(report.translatedChineseReferences, 2);
  assert.equal(report.sourceEquivalentChineseReferences, 1);
  assert.equal(report.verifiedChineseCompositionReferences, 0);
  assert.deepEqual(
    report.blockedChineseReferences.map((entry) => entry.name),
    ["missing"],
  );
  assert.equal(report.blockedChineseReferences[0].status, "no-source-backed-translation-applied");
  assert.deepEqual(report.unimplementedReferencesByLocale.cn, ["missing"]);
  assert.equal(report.allReactExampleReferencesRunnable, false);
  assert.equal(report.authoredPlacementProof[1].missing.length, 1);
  assert.equal(report.lensoVersion, "0.9.0");
  assert.deepEqual(
    report.pageCoverage[1].previews.map((preview) => preview.status),
    ["local-adaptation", "local-adaptation", "source-equivalent-reuse", "english-fallback"],
  );
  assert.equal(report.localizationExceptions.modules[0].unresolvedTranslations, 1);
});
