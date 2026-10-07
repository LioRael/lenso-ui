import type { DocumentationSiteLayoutProps, DocumentationNavigationItem } from "@lenso/docs/client";
import { BookOpen, Circles4Diamond } from "@gravity-ui/icons";
import type { DocSection, Locale } from "@/lib/source";
import type { SearchEntry } from "./fumadocs/ui/search-dialog";
import {
  DesktopActions,
  DrawerActions,
  MobileActions,
  ReactWebDrawerLabel,
  ReleaseMenu,
  SiteSearch,
  WebSectionLabel,
} from "./docs-site-controls";

export interface OptionsProps {
  locale: Locale;
  slug: string;
  version: string;
  repository: string;
  entries: SearchEntry[];
  sectionEntries: DocSection[];
}

function navigation(entries: SearchEntry[]): DocumentationNavigationItem[] {
  return entries.map(({ label, href, children, ...entry }) => ({
    ...entry,
    title: label,
    ...(href ? { url: href } : {}),
    ...(children ? { children: navigation(children) } : {}),
  }));
}

export function createLensoSiteOptions({
  locale,
  slug,
  version,
  repository,
  entries,
  sectionEntries,
}: OptionsProps): Omit<DocumentationSiteLayoutProps, "children"> {
  const section = slug.startsWith("react/tools") ? "getting-started" : slug.split("/")[1];
  return {
    brand: {
      title: "Lenso UI",
      url: locale === "en" ? "/" : "/cn",
      docsUrl: `/${locale}/docs/react/getting-started`,
    },
    currentUrl: slug === "theme-builder" ? `/${locale}/theme-builder` : `/${locale}/docs/${slug}`,
    activeSection: slug === "theme-builder" ? slug : `react/${section}`,
    navigationStateKey: `${locale}:${section ?? "getting-started"}`,
    sections: sectionEntries.map(({ slug: id, title, href: url }) => {
      const Icon = id === "react/components" ? Circles4Diamond : BookOpen;
      return { id, title, url, icon: <Icon width={16} height={16} aria-hidden="true" /> };
    }),
    navigation: navigation(entries),
    slots: {
      identity: <ReleaseMenu locale={locale} version={version} />,
      search: <SiteSearch locale={locale} />,
      desktopActions: <DesktopActions locale={locale} slug={slug} repository={repository} />,
      mobileActions: <MobileActions locale={locale} />,
      drawerActions: <DrawerActions locale={locale} slug={slug} />,
      sectionTrailing: <WebSectionLabel />,
      drawerFooter: <ReactWebDrawerLabel />,
    },
  };
}
