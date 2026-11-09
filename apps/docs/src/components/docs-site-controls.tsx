"use client";

import * as stylex from "@stylexjs/stylex";

import { useSearchContext } from "fumadocs-ui/contexts/search";
import { TabBar } from "@lenso/ui/tab-bar";
import Link from "fumadocs-core/link";
import type { DocumentationSiteLayoutProps } from "@lenso/docs/client";
import { Globe, LogoGithub, Magnifier } from "@gravity-ui/icons";
import { GlassButton } from "@lenso/ui";
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
      <LanguageToggle locale={locale} slug={slug} />
      <AppearanceControls locale={locale} />
      <RepositoryControl repository={repository} />
    </>
  );
}

export function AppearanceControls({ locale }: { locale: Locale }) {
  return (
    <fieldset aria-label={locale === "cn" ? "外观" : "Appearance"} {...stylex.props(s.appearance)}>
      <DocsThemePicker locale={locale} />
      <ThemeToggle />
    </fieldset>
  );
}

export function RepositoryControl({ repository }: { repository: string }) {
  return (
    <GlassButton
      nativeButton={false}
      // The render prop creates a real anchor; override Base Button’s default role.
      // oxlint-disable-next-line jsx-a11y/prefer-tag-over-role
      role="link"
      variant="default"
      isIconOnly
      render={<a href={repository} aria-label="Lenso UI on GitHub" />}
      xstyle={[s.control, s.icon, s.link]}
    >
      <LogoGithub width={16} height={16} aria-hidden="true" />
    </GlassButton>
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

export function HeaderNavigation({ locale }: { locale: Locale }) {
  const { setOpenSearch } = useSearchContext();
  const searchLabel = locale === "cn" ? "搜索文档" : "Search documentation";
  return (
    <GlassButton
      isIconOnly
      aria-label={searchLabel}
      aria-keyshortcuts="Meta+K Control+K"
      data-docs-search-trigger=""
      onClick={() => setOpenSearch(true)}
      xstyle={[s.control, s.icon, s.navigation]}
    >
      <Magnifier width={16} height={16} aria-hidden="true" />
    </GlassButton>
  );
}

export function MobileNavigation({
  locale,
  sections,
  activeSection,
}: {
  locale: Locale;
  sections: DocumentationSiteLayoutProps["sections"];
  activeSection?: string;
}) {
  const { setOpenSearch } = useSearchContext();
  const searchLabel = locale === "cn" ? "搜索文档" : "Search documentation";
  return (
    <TabBar
      layout="phone"
      autoMinimize
      expandLabel={locale === "cn" ? "展开导航" : "Expand navigation"}
      aria-label={locale === "cn" ? "文档导航" : "Documentation navigation"}
      xstyle={s.phoneNavigation}
    >
      <TabBar.Group>
        {sections.map((section) => (
          <TabBar.Link
            key={section.id}
            render={<Link href={section.url} />}
            isCurrent={section.id === activeSection}
            icon={section.icon}
            xstyle={s.phoneDestination}
          >
            {section.title}
          </TabBar.Link>
        ))}
      </TabBar.Group>
      <TabBar.Group separate>
        <TabBar.Button
          icon={<Magnifier aria-hidden="true" />}
          aria-label={searchLabel}
          aria-keyshortcuts="Meta+K Control+K"
          data-docs-search-trigger=""
          onClick={() => setOpenSearch(true)}
        >
          {searchLabel}
        </TabBar.Button>
      </TabBar.Group>
    </TabBar>
  );
}
