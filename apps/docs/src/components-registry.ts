import { source, type Locale } from "@/lib/source";

const normalize = (name: string) => name.toLowerCase().replace(/[-_\s]/g, "");
export function getRelatedComponents(component: string, locale: Locale) {
  const family = Object.keys(source.relationships).find(
    (name) => normalize(name) === normalize(component),
  );
  const related = family ? (source.relationships[family] ?? []) : [];
  const pages = source.pages.filter(
    (page) => page.locale === locale && page.slug.startsWith("react/components/"),
  );
  return related.flatMap((name) => {
    const page = pages.find(
      (candidate) => normalize(candidate.slug.split("/").at(-1) ?? "") === normalize(name),
    );
    return page ? [page] : [];
  });
}
