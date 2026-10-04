import { canonicalFamily, canonicalExampleName } from "./docs-projection.mjs";

export function createExamplePlan(source, projection, manifests, { locale, families = [] }) {
  const canonical = (family) => canonicalFamily(family, projection.sourceFamilyMapping);
  const requested = Object.entries(source.examples[locale]).filter(([, example]) =>
    families.length
      ? families.map(canonical).includes(canonical(example.source.split("/")[5]))
      : true,
  );
  const pages = projection.pages.filter((page) => page.locale === locale);
  const plan = new Map();
  const missing = [];
  const canonicalNames = new Map();
  for (const [rawSourceRef] of requested) {
    const name = canonicalExampleName(rawSourceRef, projection.sourceFamilyMapping);
    canonicalNames.set(name, (canonicalNames.get(name) ?? 0) + 1);
  }
  for (const [rawSourceRef] of requested) {
    const name = canonicalExampleName(rawSourceRef, projection.sourceFamilyMapping);
    if (canonicalNames.get(name) !== 1) {
      missing.push({ locale, name, reason: "Canonical example name collision" });
      continue;
    }
    const file = manifests[locale]?.[name];
    const placements = pages.filter((candidate) =>
      candidate.examples.some((example) => example.name === name),
    );
    const page = placements[0];
    const placement = page?.examples.find((example) => example.name === name);
    const family = canonical(source.examples[locale][rawSourceRef].source.split("/")[5]);
    const canonicalPlacement = page?.slug === `react/components/${family}`;
    if (
      !file ||
      !page ||
      placements.length !== 1 ||
      placement.file !== file ||
      !canonicalPlacement
    ) {
      missing.push({
        locale,
        name,
        reason: !file
          ? "No local runnable module"
          : !page
            ? "No authored public placement"
            : placements.length !== 1
              ? "Ambiguous authored public placement"
              : placement.file !== file
                ? "Authored placement differs from runnable module"
                : "Noncanonical authored public placement",
      });
      continue;
    }
    const cases = plan.get(page.slug) ?? [];
    cases.push({ name, file });
    plan.set(page.slug, cases);
  }
  return {
    locale,
    requested: requested.length,
    missing,
    pages: [...plan].map(([slug, cases]) => ({ slug, cases })),
  };
}
