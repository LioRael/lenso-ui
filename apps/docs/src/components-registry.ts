import { source, type Locale } from "@/lib/source";

const normalize = (name: string) => name.toLowerCase().replace(/[-_\s]/g, "");
export function getRelatedComponents(component: string, locale: Locale) {
  const related = source.relationships[normalize(component)] ?? [];
  const pages = source.pages.filter(
    (page) => page.locale === locale && page.slug.startsWith("react/components/"),
  );
  return related.flatMap((name) => {
    const page = pages.find(
      (candidate) => normalize(candidate.slug.split("/").at(-1) ?? "") === name,
    );
    return page ? [page] : [];
  });
}
