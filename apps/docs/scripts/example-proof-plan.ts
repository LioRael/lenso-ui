import {
  canonicalFamily,
  canonicalExampleName,
  isCustomStyleExample,
  isRetiredExample,
} from "./docs-projection.ts";

interface ExampleSource {
  examples: Record<string, Record<string, { source: string }>>;
}
interface ExampleProjection {
  sourceFamilyMapping: Record<string, string>;
  pages: Array<{ locale: string; slug: string; examples?: Array<{ name: string; file: string }> }>;
}

export function createExamplePlan(
  source: ExampleSource,
  projection: ExampleProjection,
  manifests: Record<string, Record<string, string>>,
  options: { locale: string; families?: string[] },
) {
  const { locale, families = [] } = options;
  const canonical = (family: string) => canonicalFamily(family, projection.sourceFamilyMapping);
  const requested = Object.entries(source.examples[locale]).filter(
    ([name, example]) =>
      !isCustomStyleExample(name) &&
      !isRetiredExample(name) &&
      (!families.length ||
        families.map(canonical).includes(canonical(example.source.split("/")[5]))),
  );
  const pages = projection.pages.filter((page) => page.locale === locale);
  const plan = new Map<string, Array<{ name: string; file: string }>>();
  const missing: Array<{ locale: string; name: string; reason: string }> = [];
  const canonicalNames = new Map<string, number>();
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
      candidate.examples!.some((example) => example.name === name),
    );
    const page = placements[0];
    const placement = page?.examples!.find((example) => example.name === name);
    const family = canonical(source.examples[locale][rawSourceRef].source.split("/")[5]);
    const canonicalPlacement = page?.slug === `react/components/${family}`;
    if (
      !file ||
      !page ||
      placements.length !== 1 ||
      placement!.file !== file ||
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
              : placement!.file !== file
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
