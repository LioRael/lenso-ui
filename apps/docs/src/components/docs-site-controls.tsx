"use client";

import * as stylex from "@stylexjs/stylex";
import { ChevronDown, Globe, LogoGithub } from "@gravity-ui/icons";
import { Menu } from "@lenso/ui";
import type { Locale } from "@/lib/source";
import { notebook } from "@/styles/notebook.stylex";
import { LanguageToggle } from "./fumadocs/ui/language-toggle";
import { SearchDialog } from "./fumadocs/ui/search-dialog";
import { ThemeToggle } from "./fumadocs/ui/theme-toggle";
import { DocsThemePicker } from "./docs-theme-picker";

export function ReleaseMenu({ locale, version }: { locale: Locale; version: string }) {
  return (
    <Menu.Root>
      <Menu.Trigger aria-label="Lenso UI release" xstyle={notebook.version}>
        v{version} <ChevronDown width={14} height={14} aria-hidden="true" />
      </Menu.Trigger>
      <Menu.Portal>
        <Menu.Positioner sideOffset={8}>
          <Menu.Popup xstyle={notebook.menu}>
            <Menu.LinkItem
              href={`/${locale}/docs/react/getting-started/versioning`}
              xstyle={notebook.menuItem}
            >
              {locale === "cn" ? "版本策略" : "Versioning"}
            </Menu.LinkItem>
            <Menu.LinkItem href="/coverage" xstyle={notebook.menuItem}>
              {locale === "cn" ? "验证覆盖" : "Verification coverage"}
            </Menu.LinkItem>
          </Menu.Popup>
        </Menu.Positioner>
      </Menu.Portal>
    </Menu.Root>
  );
}

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
      <a href={repository} aria-label="Lenso UI on GitHub" {...stylex.props(notebook.iconButton)}>
        <LogoGithub width={16} height={16} aria-hidden="true" />
      </a>
      <LanguageToggle locale={locale} slug={slug} />
      <ThemeToggle />
    </>
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
