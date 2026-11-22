"use client";

// Copyright 2025 NextUI Inc.
// Modified: floating Liquid Glass navigation with native Lenso popover behavior.
import { type ReactNode, useEffect, useMemo, useState, useSyncExternalStore } from "react";
import * as stylex from "@stylexjs/stylex";
import NextLink from "fumadocs-core/link";
import { Glass, GlassButton, Link, Popover, ScrollEdge, ThemeScope } from "@lenso/ui";
import { ChevronDown } from "@gravity-ui/icons";
import { RepositoryControl } from "./docs-site-controls";
import { CompactSearchTrigger, SearchDialog } from "./fumadocs/ui/search-dialog";
import { DocsSettings } from "@lenso/docs/appearance";
import { documentationLocales } from "@/lib/locale";
import { homeLayout as s } from "@/styles/home-layout.stylex";
import { product } from "@/lib/product";
import type { Locale } from "@/lib/source";

const subscribe = () => () => {};
const getViewport = () => document.scrollingElement as HTMLElement | null;
const getServerViewport = () => null;

export function HomeShell({ locale, children }: { locale: Locale; children: ReactNode }) {
  const cn = locale === "cn";
  const alternates = documentationLocales.map((language) => ({
    ...language,
    url: language.code === "en" ? "/" : "/cn",
  }));
  const [menuOpen, setMenuOpen] = useState(false);
  const viewport = useSyncExternalStore(subscribe, getViewport, getServerViewport);
  const scrollRef = useMemo(() => ({ current: viewport }), [viewport]);
  useEffect(() => {
    const desktop = matchMedia("(min-width: 1024px)");
    const closeDesktopMenu = () => {
      if (desktop.matches) setMenuOpen(false);
    };
    desktop.addEventListener("change", closeDesktopMenu);
    return () => desktop.removeEventListener("change", closeDesktopMenu);
  }, []);
  const links = [
    { text: cn ? "文档" : "Docs", url: `/${locale}/docs/react/getting-started` },
    { text: cn ? "组件" : "Components", url: `/${locale}/docs/react/components` },
    { text: "Agent skills", url: `/${locale}/docs/react/getting-started/skills` },
  ];
  const navigation = links.map((link) => (
    <Link key={link.url} render={<NextLink href={link.url} />} xstyle={s.navLink}>
      {link.text}
    </Link>
  ));
  return (
    <SearchDialog locale={locale}>
      <div id="nd-home-layout" {...stylex.props(s.container)}>
        <div {...stylex.props(s.headerRegion)}>
          {viewport && <ScrollEdge variant="soft" scrollRef={scrollRef} xstyle={s.headerEdge} />}
          <header {...stylex.props(s.header)}>
            <ThemeScope>
              <div {...stylex.props(s.headerInner)}>
                <div {...stylex.props(s.identityGroup)}>
                  <Glass elastic render={<NextLink href={cn ? "/cn" : "/"} />} xstyle={s.brand}>
                    <span>Lenso</span>
                    <span {...stylex.props(s.brandSuffix)}>UI</span>
                  </Glass>
                  <Glass
                    elastic
                    render={<nav aria-label={cn ? "主导航" : "Main navigation"} />}
                    xstyle={s.navigation}
                  >
                    {navigation}
                  </Glass>
                </div>
                <div {...stylex.props(s.desktopActions)}>
                  <CompactSearchTrigger />
                  <DocsSettings locale={locale} alternates={alternates} />
                  <RepositoryControl repository={product.repository} />
                </div>
                <div {...stylex.props(s.mobileActions)}>
                  <Popover.Root open={menuOpen} onOpenChange={setMenuOpen}>
                    <Popover.Trigger render={<GlassButton size="lg" xstyle={s.menuTrigger} />}>
                      {cn ? "导航" : "Menu"}
                      <ChevronDown width={14} height={14} aria-hidden="true" />
                    </Popover.Trigger>
                    <Popover.Content
                      xstyle={s.mobileContent}
                      align="end"
                      sideOffset={12}
                      collisionPadding={24}
                    >
                      <Popover.Title xstyle={s.mobileTitle}>
                        {cn ? "导航" : "Navigation"}
                      </Popover.Title>
                      <nav
                        aria-label={cn ? "移动端导航" : "Mobile navigation"}
                        {...stylex.props(s.mobileNavigation)}
                      >
                        {navigation}
                      </nav>
                    </Popover.Content>
                  </Popover.Root>
                  <CompactSearchTrigger />
                  <div {...stylex.props(s.phoneSettings)}>
                    <DocsSettings presentation="sheet" locale={locale} alternates={alternates} />
                  </div>
                  <div {...stylex.props(s.tabletSettings)}>
                    <DocsSettings locale={locale} alternates={alternates} />
                  </div>
                </div>
              </div>
            </ThemeScope>
          </header>
        </div>
        {children}
      </div>
    </SearchDialog>
  );
}
