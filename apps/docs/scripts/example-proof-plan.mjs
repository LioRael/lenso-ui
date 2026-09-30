export function createExamplePlan(source, manifests, { locale, families = [] }) {
  const requested = Object.entries(source.examples[locale]).filter(([, example]) =>
    families.length ? families.includes(example.source.split("/")[5]) : true,
  );
  const pages = source.pages
    .filter((page) => page.locale === locale)
    .sort(
      (a, b) =>
        Number(!a.slug.startsWith("react/components/")) -
        Number(!b.slug.startsWith("react/components/")),
    );
  const plan = new Map();
  const missing = [];
  for (const [name] of requested) {
    const file = manifests[locale]?.[name];
    const page = pages.find((candidate) => candidate.previews.includes(name));
    if (!file || !page) {
      missing.push({
        locale,
        name,
        reason: !file ? "No local runnable module" : "No upstream page placement",
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
