"use client";

import * as stylex from "@stylexjs/stylex";

import { useSearchContext } from "fumadocs-ui/contexts/search";
import { TabBar } from "@lenso/ui/tab-bar";
import Link from "fumadocs-core/link";
import {
  DocumentationCompactSearchTrigger,
  DocumentationLanguageToggle,
  type DocumentationSiteLayoutProps,
} from "@lenso/docs/client";
import { Globe, LogoGithub, Magnifier } from "@gravity-ui/icons";
import { GlassButton } from "@lenso/ui";
import type { Locale } from "@/lib/source";
import { headerControls as s } from "@/styles/header-controls.stylex";
import { SearchDialog } from "./fumadocs/ui/search-dialog";
import { ThemeToggle } from "./fumadocs/ui/theme-toggle";
import { DocsThemePicker } from "./docs-theme-picker";

export function SiteSearch({ locale }: { locale: Locale }) {
  return <SearchDialog locale={locale} />;
}

export function DesktopActions({
  locale,
  alternates,
  repository,
}: {
  locale: Locale;
  alternates: Parameters<typeof DocumentationLanguageToggle>[0]["alternates"];
  repository: string;
}) {
  return (
    <>
      <DocumentationLanguageToggle locale={locale} alternates={alternates} />
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

export function DrawerActions({
  locale,
  alternates,
}: Parameters<typeof DocumentationLanguageToggle>[0]) {
  return (
    <>
      <DocumentationLanguageToggle locale={locale} alternates={alternates} />
      <ThemeToggle />
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

export function HeaderNavigation({ locale: _locale }: { locale: Locale }) {
  return (
    <span {...stylex.props(s.navigation)}>
      <DocumentationCompactSearchTrigger />
    </span>
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
