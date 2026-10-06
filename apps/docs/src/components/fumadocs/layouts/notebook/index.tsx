"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import * as stylex from "@stylexjs/stylex";
import {
  Bars,
  BookOpen,
  ChevronDown,
  Circles4Diamond,
  Globe,
  LogoGithub,
  Xmark,
} from "@gravity-ui/icons";
import { Menu, Modal } from "@lenso/ui";
import type { Locale, DocSection } from "@/lib/source";
import { styles } from "@/styles/docs.stylex";
import { notebook } from "@/styles/notebook.stylex";
import { LanguageToggle } from "../../ui/language-toggle";
import { SearchDialog, type SearchEntry } from "../../ui/search-dialog";
import { ThemeToggle } from "../../ui/theme-toggle";
import { SidebarPageTree } from "./sidebar";
import { DocsThemePicker } from "@/components/docs-theme-picker";

const sectionIcon = (slug: string) => (slug === "react/components" ? Circles4Diamond : BookOpen);

// Source: HeroUI v3.2.6 notebook layout and locale docs layout, Apache-2.0.
// Native/paywall destinations are not presented as local products.
export function DocsLayout({
  locale,
  slug,
  version,
  repository,
  entries,
  sectionEntries,
  children,
}: {
  locale: Locale;
  slug: string;
  version: string;
  repository: string;
  entries: SearchEntry[];
  sectionEntries: DocSection[];
  children: ReactNode;
}) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const section = slug.startsWith("react/tools") ? "getting-started" : slug.split("/")[1];
  const current = slug === "theme-builder" ? `/${locale}/theme-builder` : `/${locale}/docs/${slug}`;
  return (
    <>
      <div id="nd-notebook-layout" {...stylex.props(styles.shell)}>
        <header id="nd-subnav" {...stylex.props(styles.header)}>
          <div {...stylex.props(notebook.headerBody)}>
            <div {...stylex.props(notebook.identity)}>
              <Link href={`/${locale}/docs/react/getting-started`} {...stylex.props(styles.brand)}>
                Lenso UI
              </Link>
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
            </div>
            <SearchDialog locale={locale} />
            <div {...stylex.props(notebook.actions)}>
              <div {...stylex.props(notebook.headerDesktop)}>
                <DocsThemePicker locale={locale} />
                <a
                  href={repository}
                  aria-label="Lenso UI on GitHub"
                  {...stylex.props(notebook.iconButton)}
                >
                  <LogoGithub width={16} height={16} aria-hidden="true" />
                </a>
                <LanguageToggle locale={locale} slug={slug} />
                <ThemeToggle />
              </div>
              <div {...stylex.props(notebook.headerMobile)}>
                <DocsThemePicker locale={locale} />
                <Modal.Root open={drawerOpen} onOpenChange={setDrawerOpen}>
                  <Modal.Trigger aria-label="Browse documentation" xstyle={notebook.iconButton}>
                    <Bars width={18} height={18} aria-hidden="true" />
                  </Modal.Trigger>
                  <Modal.Portal>
                    <Modal.Backdrop xstyle={notebook.backdrop} />
                    <Modal.Popup xstyle={notebook.drawer}>
                      <Modal.Title xstyle={notebook.hidden}>Browse documentation</Modal.Title>
                      <div {...stylex.props(notebook.drawerHeader)}>
                        <Link
                          href={`/${locale}/docs/react/getting-started`}
                          onClick={() => setDrawerOpen(false)}
                          {...stylex.props(styles.brand)}
                        >
                          Lenso UI
                        </Link>
                        <Modal.Close
                          aria-label="Close documentation navigation"
                          xstyle={notebook.iconButton}
                        >
                          <Xmark width={18} height={18} aria-hidden="true" />
                        </Modal.Close>
                      </div>
                      <div {...stylex.props(notebook.drawerHeader)}>
                        <LanguageToggle locale={locale} slug={slug} />
                        <ThemeToggle />
                      </div>
                      <div {...stylex.props(notebook.drawerScroll)}>
                        <nav
                          aria-label="Documentation sections"
                          {...stylex.props(notebook.drawerSections)}
                        >
                          {sectionEntries.map(({ slug: sectionSlug, title, href }) => {
                            const Icon = sectionIcon(sectionSlug);
                            return (
                              <Link
                                key={sectionSlug}
                                href={href}
                                onClick={() => setDrawerOpen(false)}
                                {...stylex.props(styles.navLink)}
                              >
                                <Icon width={16} height={16} aria-hidden="true" /> {title}
                              </Link>
                            );
                          })}
                        </nav>
                        <SidebarPageTree
                          entries={entries}
                          current={current}
                          onNavigate={() => setDrawerOpen(false)}
                        />
                      </div>
                      <span>
                        <Globe width={16} height={16} aria-hidden="true" /> React Web
                      </span>
                    </Modal.Popup>
                  </Modal.Portal>
                </Modal.Root>
              </div>
            </div>
          </div>
          <nav aria-label="Documentation sections" {...stylex.props(styles.sectionBar)}>
            {sectionEntries.map(({ slug: sectionSlug, title, href }) => {
              const Icon = sectionIcon(sectionSlug);
              const selected = sectionSlug === `react/${section}` || sectionSlug === slug;
              return (
                <Link
                  key={sectionSlug}
                  href={href}
                  aria-current={selected ? "page" : undefined}
                  {...stylex.props(notebook.tab, selected && notebook.selectedTab)}
                >
                  <Icon width={16} height={16} aria-hidden="true" />
                  {title}
                </Link>
              );
            })}
            <span {...stylex.props(notebook.framework)}>
              <Globe width={14} height={14} aria-hidden="true" /> Web
            </span>
          </nav>
        </header>
        <aside id="nd-sidebar" {...stylex.props(styles.sidebar)}>
          <SidebarPageTree entries={entries} current={current} />
        </aside>
        {children}
      </div>
    </>
  );
}
