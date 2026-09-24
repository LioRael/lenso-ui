import manifest from "./manifest.json";

export type DocsSectionId = string;
export type DocsPage = string;

export interface DocsNavPage {
  readonly aliases?: readonly string[];
  readonly href: string;
  readonly hidden?: boolean;
  readonly kind: "page";
  readonly label: string;
  readonly slug: DocsPage;
}

export type DocsNavItem = DocsNavPage;

export interface DocsSection {
  readonly defaultOpen?: boolean;
  readonly id: DocsSectionId;
  readonly items: readonly DocsNavItem[];
  readonly label: string;
  readonly order: number;
}

export const docsRegistry: readonly DocsSection[] = manifest.sections as DocsSection[];

export function getOrderedDocsSections(): readonly DocsSection[] {
  return [...docsRegistry].sort((left, right) => left.order - right.order);
}

export function getDocsPageItems(): readonly DocsNavPage[] {
  return getOrderedDocsSections().flatMap((section) => section.items);
}

export function getDocsPageItem(slug: DocsPage): DocsNavPage | undefined {
  return getDocsPageItems().find((item) => item.slug === slug);
}

export function getDocsPageForPath(pathname: string): DocsPage | undefined {
  const normalized = pathname.length > 1 ? pathname.replace(/\/$/, "") : pathname;
  return getDocsPageItems().find((item) =>
    [item.href, ...(item.aliases ?? [])].includes(normalized),
  )?.slug;
}

export function getDocsSectionForPage(slug: DocsPage): DocsSectionId | undefined {
  return getOrderedDocsSections().find((section) =>
    section.items.some((item) => item.slug === slug),
  )?.id;
}

export function getVisibleDocsItems(section: DocsSection): readonly DocsNavItem[] {
  return section.items.filter((item) => !item.hidden);
}

export function getDocsRouteParams(): Array<{ section: string; slug: string }> {
  return getDocsPageItems()
    .flatMap((item) => [item.href, ...(item.aliases ?? [])])
    .filter((href) => href !== "/")
    .flatMap((href) => {
      const [section, slug] = href.split("/").filter(Boolean);
      return section && slug ? [{ section, slug }] : [];
    });
}

export function getDocsPageForRoute(section: string, slug: string): DocsPage | undefined {
  return getDocsPageForPath(`/${section}/${slug}`);
}
