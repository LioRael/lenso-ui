"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

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
  className,
  label,
  onOpenChange,
  open,
  value,
}: {
  children?: ReactNode;
  className?: string;
  label: string;
  onOpenChange: (open: boolean) => void;
  open: boolean;
  value: string;
}) {
  return (
    <Disclosure.Root
      className={["nav-disclosure-root", className].filter(Boolean).join(" ")}
      onValueChange={(nextValue) => onOpenChange(nextValue.includes(value))}
      value={open ? [value] : []}
    >
      <Disclosure.Item className="nav-disclosure-item" value={value}>
        <Sidebar.Section className="nav-section">
          <Sidebar.SectionHeader className="nav-section-header">
            <Disclosure.Header>
              <Disclosure.Trigger className="nav-heading">
                {label}
                <Disclosure.Icon />
              </Disclosure.Trigger>
            </Disclosure.Header>
          </Sidebar.SectionHeader>
          <Sidebar.SectionContent className="nav-section-content" layout="auto">
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
        className="nav-item"
        render={<Link href={item.href} />}
        nativeButton={false}
        selected={selected}
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
        <NavDisclosure
          className={["nav-group", `nav-group-${section.id}`].join(" ")}
          key={section.id}
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
      ))}
    </>
  );
}

function DocumentationSidebar({ current }: { current: DocsPage }) {
  return (
    <Sidebar.Root className="docs-sidebar" defaultOpen id="documentation-sidebar">
      <Sidebar.Panel aria-label="Documentation navigation" className="docs-sidebar-panel">
        <Sidebar.Header className="docs-sidebar-header">
          <div className="brand-row">
            <strong>Lenso UI</strong>
            <span className="version">v{uiPackage.version}</span>
          </div>
          <button className="search-button" type="button">
            <span>Search documentation</span>
            <kbd>⌘ K</kbd>
          </button>
        </Sidebar.Header>
        <Sidebar.Content className="docs-sidebar-content">
          <nav aria-label="Documentation" className="docs-nav">
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

  return (
    <div className="docs-theme">
      <div className="docs-shell">
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
    <div className="main-inset" data-current-page={current} data-preview-theme={theme}>
      <main className="main-surface">
        <header className="docs-header">
          <Breadcrumb.Root className="breadcrumb">
            <Breadcrumb.List className="breadcrumb-list">
              <Breadcrumb.Item>
                <Breadcrumb.Link
                  className="breadcrumb-link"
                  nativeButton={false}
                  render={<Link href="/" />}
                >
                  Lenso UI
                </Breadcrumb.Link>
              </Breadcrumb.Item>
              <Breadcrumb.Separator />
              <Breadcrumb.Item>
                <span className="breadcrumb-label">{breadcrumbs[0]}</span>
              </Breadcrumb.Item>
              <Breadcrumb.Separator />
              <Breadcrumb.Item>
                <Breadcrumb.Page className="breadcrumb-page">{breadcrumbs[1]}</Breadcrumb.Page>
              </Breadcrumb.Item>
            </Breadcrumb.List>
          </Breadcrumb.Root>
          <div className="header-actions">
            <ThemeToggle />
            <Button
              className="header-button"
              {...(firstActionHref
                ? { nativeButton: false, render: <Link href={firstActionHref} /> }
                : {})}
              variant="secondary"
            >
              {actions[0]}
            </Button>
            <Button
              className="header-button"
              {...(secondActionHref
                ? { nativeButton: false, render: <Link href={secondActionHref} /> }
                : {})}
              disabled={actions[1] === "Planned"}
            >
              {actions[1]}
            </Button>
          </div>
        </header>
        <div className="docs-scroll">{children}</div>
      </main>
    </div>
  );
}

export type { DocsPage } from "../../contents/catalog";
