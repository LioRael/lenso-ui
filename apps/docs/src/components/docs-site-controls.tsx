"use client";
import { DocumentationButton } from "@lenso/docs/client";

import { useSyncExternalStore } from "react";
import { createPortal } from "react-dom";

import { useSearchContext } from "fumadocs-ui/contexts/search";
import { DocsPhoneNavigation } from "./docs-phone-navigation";
import type { DocumentationSiteLayoutProps } from "@lenso/docs/client";
import { Globe, LogoGithub, Magnifier } from "@gravity-ui/icons";

import type { Locale } from "@/lib/source";
import { headerControls as s } from "@/styles/header-controls.stylex";
import { LanguageToggle } from "./fumadocs/ui/language-toggle";
import { SearchDialog } from "./fumadocs/ui/search-dialog";
import { ThemeToggle } from "./fumadocs/ui/theme-toggle";
import { DocsThemePicker } from "./docs-theme-picker";

export function SiteSearch({ locale }: { locale: Locale }) {
  return <SearchDialog locale={locale} />;
}

export function DesktopActions({
  locale,
  slug,
  repository,
}: {
  locale: Locale;
  slug: string;
  repository: string;
}) {
  return (
    <>
      <DocsThemePicker locale={locale} />
      <RepositoryControl repository={repository} />
      <LanguageToggle locale={locale} slug={slug} />
      <ThemeToggle />
    </>
  );
}

export function RepositoryControl({ repository }: { repository: string }) {
  return (
    <DocumentationButton
      nativeButton={false}
      // The render prop creates a real anchor; override Base Button’s default role.
      // oxlint-disable-next-line jsx-a11y/prefer-tag-over-role
      role="link"
      variant="default"
      isIconOnly
      render={<a href={repository} aria-label="Lenso UI on GitHub" />}
      xstyle={[s.icon, s.link]}
    >
      <LogoGithub width={16} height={16} aria-hidden="true" />
    </DocumentationButton>
  );
}

export function MobileActions({ locale }: { locale: Locale }) {
  return <DocsThemePicker locale={locale} />;
}

export function DrawerActions({ locale, slug }: { locale: Locale; slug: string }) {
  return (
    <>
      <LanguageToggle locale={locale} slug={slug} />
      <ThemeToggle />
    </>
  );
}

export function WebSectionLabel() {
  return (
    <>
      <Globe width={14} height={14} aria-hidden="true" /> Web
    </>
  );
}

export function ReactWebDrawerLabel() {
  return (
    <>
      <Globe width={16} height={16} aria-hidden="true" /> React Web
    </>
  );
}

export function HeaderNavigation({
  locale,
  sections,
  activeSection,
}: {
  locale: Locale;
  sections: DocumentationSiteLayoutProps["sections"];
  activeSection: string;
}) {
  return (
    <SearchDialog locale={locale}>
      <HeaderNavigationControls locale={locale} sections={sections} activeSection={activeSection} />
    </SearchDialog>
  );
}

const subscribePortal = () => () => {};

function HeaderNavigationControls({
  locale,
  sections,
  activeSection,
}: {
  locale: Locale;
  sections: DocumentationSiteLayoutProps["sections"];
  activeSection: string;
}) {
  const { setOpenSearch } = useSearchContext();
  const portal = useSyncExternalStore(
    subscribePortal,
    () => document.body,
    () => null,
  );
  const searchLabel = locale === "cn" ? "搜索文档" : "Search documentation";
  return (
    <>
      <DocumentationButton
        isIconOnly
        aria-label={searchLabel}
        aria-keyshortcuts="Meta+K Control+K"
        data-docs-search-trigger=""
        onClick={() => setOpenSearch(true)}
        xstyle={[s.icon, s.navigation]}
      >
        <Magnifier width={16} height={16} aria-hidden="true" />
      </DocumentationButton>
      {portal &&
        createPortal(
          <DocsPhoneNavigation
            locale={locale}
            sections={sections}
            activeSection={activeSection}
            onSearch={() => setOpenSearch(true)}
          />,
          portal,
          "phone",
        )}
    </>
  );
}
