interface Index {
  pages: { locale: string; slug: string }[];
  sourceFamilyMapping: Record<string, string>;
}
export function documentationRedirects(index: Index) {
  const redirects: [string, string][] = [
    ["/docs", "/en/docs/react/getting-started"],
    ...["en", "cn"].map(
      (locale) => [`/${locale}/docs`, `/${locale}/docs/react/getting-started`] as [string, string],
    ),
    ...index.pages
      .filter((page) => page.locale === "en")
      .map((page) => [`/docs/${page.slug}`, `/en/docs/${page.slug}`] as [string, string]),
  ];
  for (const [alias, canonical] of Object.entries(index.sourceFamilyMapping)) {
    if (alias === canonical) continue;
    redirects.push([`/docs/react/components/${alias}`, `/en/docs/react/components/${canonical}`]);
    for (const locale of ["en", "cn"])
      redirects.push([
        `/${locale}/docs/react/components/${alias}`,
        `/${locale}/docs/react/components/${canonical}`,
      ]);
  }
  return redirects;
}
