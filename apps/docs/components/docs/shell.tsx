"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import * as stylex from "@stylexjs/stylex";

import { Breadcrumb } from "@lenso/ui/breadcrumb";
import { Button } from "@lenso/ui/button";
import { Disclosure } from "@lenso/ui/disclosure";
import { Sidebar } from "@lenso/ui/sidebar";

import uiPackage from "../../../../packages/ui/package.json";
import {
  getDocsPageForPath,
  getDocsSectionForPage,
  getOrderedDocsSections,
  type DocsNavItem,
  type DocsPage,
} from "../../contents/catalog";
import { ThemeToggle } from "./theme-toggle";
import { styles } from "./shell.stylex";
import { useDocsPageTheme } from "./use-docs-page-theme";

interface DocsShellProps {
  actions: readonly [string, string];
  breadcrumbs: readonly [string, string];
  children: ReactNode;
  current: DocsPage;
  theme: "dark" | "light";
}

function docsPageFromPathname(pathname: string): DocsPage {
  return getDocsPageForPath(pathname) ?? "overview";
}

function NavDisclosure({
  children,
  label,
  onOpenChange,
  open,
  value,
}: {
  children?: ReactNode;
  label: string;
  onOpenChange: (open: boolean) => void;
  open: boolean;
  value: string;
}) {
  return (
    <Disclosure.Root
      xstyle={styles.disclosureRoot}
      onValueChange={(nextValue) => onOpenChange(nextValue.includes(value))}
      value={open ? [value] : []}
    >
      <Disclosure.Item value={value} xstyle={styles.disclosureItem}>
        <Sidebar.Section xstyle={styles.navSection}>
          <Disclosure.Header xstyle={styles.navSectionHeader}>
            <Disclosure.Trigger xstyle={styles.navHeading}>
              {label}
              <Disclosure.Icon />
            </Disclosure.Trigger>
          </Disclosure.Header>
          <Sidebar.SectionContent
            contentXstyle={styles.navSectionContentInner}
            layout="auto"
            xstyle={[styles.navSectionContent, value === "start" && styles.navSectionContentStart]}
          >
            {children}
          </Sidebar.SectionContent>
        </Sidebar.Section>
      </Disclosure.Item>
    </Disclosure.Root>
  );
}

function NavMenu({ children }: { children: ReactNode }) {
  return <Sidebar.Menu>{children}</Sidebar.Menu>;
}

function NavItem({ item, selected }: { item: DocsNavItem; selected: boolean }) {
  return (
    <Sidebar.MenuItem>
      <Sidebar.Item
        render={<Link href={item.href} />}
        nativeButton={false}
        selected={selected}
        xstyle={[styles.navItem, selected && styles.selectedNavItem]}
      >
        {item.label}
      </Sidebar.Item>
    </Sidebar.MenuItem>
  );
}

function initialOpenSections(current: DocsPage): string[] {
  return getOrderedDocsSections()
    .filter(
      (section) =>
        section.defaultOpen ||
        section.items.some((item) => item.kind === "page" && item.slug === current),
    )
    .map((section) => section.id);
}

function DocumentationNavigation({ current }: { current: DocsPage }) {
  const sections = getOrderedDocsSections();
  const [openSections, setOpenSections] = useState(() => initialOpenSections(current));

  useEffect(() => {
    const activeSection = getDocsSectionForPage(current);
    if (!activeSection) return;
    setOpenSections((previous) =>
      previous.includes(activeSection) ? previous : [...previous, activeSection],
    );
  }, [current]);

  const toggleSection = (sectionId: string, open: boolean) => {
    setOpenSections((previous) => {
      if (open) return previous.includes(sectionId) ? previous : [...previous, sectionId];
      return previous.filter((value) => value !== sectionId);
    });
  };

  return (
    <>
      {sections.map((section) => (
        <div
          {...stylex.props(
            styles.navGroup,
            (section.id === "start" || section.id === "components") && styles.navGroupCompact,
          )}
          key={section.id}
        >
          <NavDisclosure
            label={section.label}
            onOpenChange={(open) => toggleSection(section.id, open)}
            open={openSections.includes(section.id)}
            value={section.id}
          >
            {section.items.length > 0 && (
              <NavMenu>
                {section.items.map((item) => (
                  <NavItem
                    item={item}
                    key={item.kind === "page" ? item.slug : item.id}
                    selected={item.kind === "page" && current === item.slug}
                  />
                ))}
              </NavMenu>
            )}
          </NavDisclosure>
        </div>
      ))}
    </>
  );
}

function DocumentationSidebar({ current }: { current: DocsPage }) {
  return (
    <Sidebar.Root defaultOpen id="documentation-sidebar" xstyle={styles.sidebarRoot}>
      <Sidebar.Panel aria-label="Documentation navigation" xstyle={styles.sidebarPanel}>
        <Sidebar.Header xstyle={styles.sidebarHeader}>
          <div {...stylex.props(styles.brandRow)}>
            <strong {...stylex.props(styles.brand)}>Lenso UI</strong>
            <span {...stylex.props(styles.version)}>v{uiPackage.version}</span>
          </div>
          <button {...stylex.props(styles.searchButton)} type="button">
            <span>Search documentation</span>
            <kbd {...stylex.props(styles.searchHint)}>⌘ K</kbd>
          </button>
        </Sidebar.Header>
        <Sidebar.Content xstyle={styles.sidebarContent}>
          <nav aria-label="Documentation" {...stylex.props(styles.nav)}>
            <DocumentationNavigation current={current} />
          </nav>
        </Sidebar.Content>
      </Sidebar.Panel>
    </Sidebar.Root>
  );
}

export function DocsFrame({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const current = docsPageFromPathname(pathname);
  const theme = useDocsPageTheme();

  return (
    <div {...stylex.props(styles.theme, theme === "dark" && styles.darkTheme)}>
      <div {...stylex.props(styles.shell)}>
        <DocumentationSidebar current={current} />
        {children}
      </div>
    </div>
  );
}

export function DocsShell({ actions, breadcrumbs, children, current, theme }: DocsShellProps) {
  const firstActionHref = current === "overview" ? "#components" : undefined;
  const secondActionHref = current === "overview" ? "#quick-start" : undefined;

  return (
    <div {...stylex.props(styles.mainInset)} data-current-page={current} data-preview-theme={theme}>
      <main {...stylex.props(styles.mainSurface)}>
        <header
          {...stylex.props(
            styles.header,
            (current === "tokens" || current === "theme-lab") && styles.workspaceHeader,
          )}
        >
          <Breadcrumb.Root xstyle={styles.breadcrumb}>
            <Breadcrumb.List xstyle={styles.breadcrumbList}>
              <Breadcrumb.Item>
                <Breadcrumb.Link
                  nativeButton={false}
                  render={<Link href="/" />}
                  xstyle={[styles.breadcrumbPart, styles.breadcrumbLink]}
                >
                  Lenso UI
                </Breadcrumb.Link>
              </Breadcrumb.Item>
              <Breadcrumb.Separator />
              <Breadcrumb.Item>
                <span {...stylex.props(styles.breadcrumbPart, styles.breadcrumbLabel)}>
                  {breadcrumbs[0]}
                </span>
              </Breadcrumb.Item>
              <Breadcrumb.Separator />
              <Breadcrumb.Item>
                <Breadcrumb.Page xstyle={[styles.breadcrumbPart, styles.breadcrumbPage]}>
                  {breadcrumbs[1]}
                </Breadcrumb.Page>
              </Breadcrumb.Item>
            </Breadcrumb.List>
          </Breadcrumb.Root>
          <div {...stylex.props(styles.headerActions)}>
            <ThemeToggle />
            <Button
              {...(firstActionHref
                ? { nativeButton: false, render: <Link href={firstActionHref} /> }
                : {})}
              variant="secondary"
              xstyle={styles.headerButton}
            >
              {actions[0]}
            </Button>
            <Button
              {...(secondActionHref
                ? { nativeButton: false, render: <Link href={secondActionHref} /> }
                : {})}
              disabled={actions[1] === "Planned"}
              xstyle={styles.headerButton}
            >
              {actions[1]}
            </Button>
          </div>
        </header>
        <div
          {...stylex.props(
            styles.scroll,
            (current === "tokens" || current === "theme-lab") && styles.workspaceScroll,
          )}
        >
          {children}
        </div>
      </main>
    </div>
  );
}

export type { DocsPage } from "../../contents/catalog";
