"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import * as stylex from "@stylexjs/stylex";
import {
  ArrowRightArrowLeft,
  Bars,
  BookOpen,
  ChevronDown,
  Circles4Diamond,
  Globe,
  LogoGithub,
  Rocket,
  Xmark,
} from "@gravity-ui/icons";
import { Dropdown, Modal } from "@lenso/ui";
import type { Locale } from "@/lib/source";
import { styles } from "@/styles/docs.stylex";
import { notebook } from "@/styles/notebook.stylex";
import { LanguageToggle } from "../../ui/language-toggle";
import { SearchDialog, type SearchEntry } from "../../ui/search-dialog";
import { ThemeToggle } from "../../ui/theme-toggle";
import { SidebarPageTree } from "./sidebar";

const sections = [
  { key: "getting-started", label: "Getting Started", cn: "开始使用", icon: BookOpen },
  { key: "components", label: "Components", cn: "组件", icon: Circles4Diamond },
  { key: "releases", label: "Releases", cn: "更新日志", icon: Rocket },
  { key: "migration", label: "Migration", cn: "迁移指南", icon: ArrowRightArrowLeft },
];

// Source: HeroUI v3.2.6 notebook layout and locale docs layout, Apache-2.0.
// Native/paywall/theme-builder destinations are not presented as local products.
export function DocsLayout({
  locale,
  slug,
  entries,
  searchEntries,
  children,
}: {
  locale: Locale;
  slug: string;
  entries: SearchEntry[];
  searchEntries: SearchEntry[];
  children: ReactNode;
}) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const section = slug.split("/")[1];
  const current = `/${locale}/docs/${slug}`;
  return (
    <>
      <aside aria-label="Source attribution" {...stylex.props(notebook.banner)}>
        <span {...stylex.props(notebook.bannerBadge)}>Lenso UI</span>
        <Link href="/coverage" {...stylex.props(notebook.bannerLink)}>
          <span {...stylex.props(notebook.bannerDetail)}>Independent </span>
          HeroUI v3.2.6 derivation · Coverage
        </Link>
      </aside>
      <div id="nd-notebook-layout" {...stylex.props(styles.shell)}>
        <header id="nd-subnav" {...stylex.props(styles.header)}>
          <div {...stylex.props(notebook.headerBody)}>
            <div {...stylex.props(notebook.identity)}>
              <Link href={`/${locale}/docs/react/getting-started`} {...stylex.props(styles.brand)}>
                Lenso UI
              </Link>
              <Dropdown.Root>
                <Dropdown.Trigger aria-label="Upstream source version" xstyle={notebook.version}>
                  v3.2.6 <ChevronDown width={14} height={14} aria-hidden="true" />
                </Dropdown.Trigger>
                <Dropdown.Portal>
                  <Dropdown.Positioner sideOffset={8}>
                    <Dropdown.Popup xstyle={notebook.menu}>
                      <Dropdown.LinkItem
                        href="https://github.com/heroui-inc/heroui/tree/e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e"
                        xstyle={notebook.menuItem}
                      >
                        Pinned HeroUI source
                      </Dropdown.LinkItem>
                      <Dropdown.LinkItem href="/coverage" xstyle={notebook.menuItem}>
                        Reconstruction coverage
                      </Dropdown.LinkItem>
                    </Dropdown.Popup>
                  </Dropdown.Positioner>
                </Dropdown.Portal>
              </Dropdown.Root>
            </div>
            <SearchDialog entries={searchEntries} />
            <div {...stylex.props(notebook.actions)}>
              <div {...stylex.props(notebook.headerDesktop)}>
                <a
                  href="https://github.com/heroui-inc/heroui/tree/e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e"
                  aria-label="HeroUI source on GitHub"
                  {...stylex.props(notebook.iconButton)}
                >
                  <LogoGithub width={16} height={16} aria-hidden="true" />
                </a>
                <LanguageToggle locale={locale} slug={slug} />
                <ThemeToggle />
              </div>
              <div {...stylex.props(notebook.headerMobile)}>
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
                          {sections.map(({ key, label, cn, icon: Icon }) => (
                            <Link
                              key={key}
                              href={`/${locale}/docs/react/${key}`}
                              onClick={() => setDrawerOpen(false)}
                              {...stylex.props(styles.navLink)}
                            >
                              <Icon width={16} height={16} aria-hidden="true" />{" "}
                              {locale === "cn" ? cn : label}
                            </Link>
                          ))}
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
            {sections.map(({ key, label, cn, icon: Icon }) => (
              <Link
                key={key}
                href={`/${locale}/docs/react/${key}`}
                aria-current={section === key ? "page" : undefined}
                {...stylex.props(notebook.tab, section === key && notebook.selectedTab)}
              >
                <Icon width={16} height={16} aria-hidden="true" />
                {locale === "cn" ? cn : label}
              </Link>
            ))}
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
