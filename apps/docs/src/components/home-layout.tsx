"use client";

// Copyright 2025 NextUI Inc.
// Modified: semantic navigation with StyleX and native Lenso disclosure behavior.
import { type ReactNode } from "react";
import * as stylex from "@stylexjs/stylex";
import NextLink from "fumadocs-core/link";
import { Disclosure, Link } from "@lenso/ui";
import { AppearanceControls, DesktopActions } from "./docs-site-controls";
import { CompactSearchTrigger, SearchDialog } from "./fumadocs/ui/search-dialog";
import { LanguageToggle } from "./fumadocs/ui/language-toggle";
import { homeLayout as s } from "@/styles/home-layout.stylex";
import { product } from "@/lib/product";
import type { Locale } from "@/lib/source";

export function HomeShell({ locale, children }: { locale: Locale; children: ReactNode }) {
  const cn = locale === "cn";
  const links = [
    { text: cn ? "文档" : "Docs", url: `/${locale}/docs/react/getting-started` },
    { text: cn ? "组件" : "Components", url: `/${locale}/docs/react/components` },
    { text: cn ? "代理工具" : "Agent tools", url: `/${locale}/docs/react/tools` },
  ];
  const navigation = links.map((link) => (
    <Link key={link.url} render={<NextLink href={link.url} />} xstyle={s.navLink}>
      {link.text}
    </Link>
  ));
  return (
    <SearchDialog locale={locale}>
      <div id="nd-home-layout" {...stylex.props(s.container)}>
        <header {...stylex.props(s.header)}>
          <div {...stylex.props(s.headerInner)}>
            <Link render={<NextLink href={cn ? "/cn" : "/"} />} xstyle={s.brand}>
              Lenso UI
            </Link>
            <nav aria-label={cn ? "主导航" : "Main navigation"} {...stylex.props(s.navigation)}>
              {navigation}
            </nav>
            <div {...stylex.props(s.desktopActions)}>
              <CompactSearchTrigger />
              <DesktopActions locale={locale} slug="" repository={product.repository} />
            </div>
            <div {...stylex.props(s.mobileActions)}>
              <CompactSearchTrigger />
            </div>
          </div>
          <Disclosure xstyle={s.mobileMenu}>
            <Disclosure.Trigger xstyle={s.menuTrigger}>
              {cn ? "导航与外观" : "Navigation & appearance"}
              <Disclosure.Indicator />
            </Disclosure.Trigger>
            <Disclosure.Content>
              <div {...stylex.props(s.mobileContent)}>
                <nav
                  aria-label={cn ? "移动端导航" : "Mobile navigation"}
                  {...stylex.props(s.mobileNavigation)}
                >
                  {navigation}
                </nav>
                <div {...stylex.props(s.mobilePreferences)}>
                  <LanguageToggle locale={locale} slug="" />
                  <AppearanceControls locale={locale} />
                </div>
              </div>
            </Disclosure.Content>
          </Disclosure>
        </header>
        {children}
      </div>
    </SearchDialog>
  );
}
