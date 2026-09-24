"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import * as stylex from "@stylexjs/stylex";
import { MenuIcon, XIcon } from "lucide-react";

import { Breadcrumb } from "@lenso/ui/breadcrumb";
import { Disclosure } from "@lenso/ui/disclosure";
import { Sidebar } from "@lenso/ui/sidebar";

import {
  getDocsPageForPath,
  getDocsSectionForPage,
  getVisibleDocsItems,
  getOrderedDocsSections,
  type DocsNavItem,
  type DocsPage,
} from "../../contents/catalog";
import { ThemeToggle } from "./theme-toggle";
import { DocsSearch } from "./docs-search";
import { styles } from "./shell.stylex";
import { useDocsPageTheme } from "./use-docs-page-theme";

interface DocsShellProps {
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
              <span {...stylex.props(styles.navHeadingLabel)}>{label}</span>
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

function NavItem({
  item,
  onNavigate,
  selected,
}: {
  item: DocsNavItem;
  onNavigate: () => void;
  selected: boolean;
}) {
  return (
    <Sidebar.MenuItem>
      <Sidebar.Item
        onClick={onNavigate}
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

function DocumentationNavigation({
  current,
  onNavigate,
}: {
  current: DocsPage;
  onNavigate: () => void;
}) {
  const sections = getOrderedDocsSections().filter(
    (section) => getVisibleDocsItems(section).length > 0,
  );
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
        <div {...stylex.props(styles.navGroup)} key={section.id}>
          <NavDisclosure
            label={section.label}
            onOpenChange={(open) => toggleSection(section.id, open)}
            open={openSections.includes(section.id)}
            value={section.id}
          >
            {getVisibleDocsItems(section).length > 0 && (
              <NavMenu>
                {getVisibleDocsItems(section).map((item) => (
                  <NavItem
                    item={item}
                    key={item.kind === "page" ? item.slug : item.id}
                    onNavigate={onNavigate}
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

function DocumentationSidebar({
  compact,
  current,
  mobileOpen,
  onNavigate,
}: {
  compact: boolean;
  current: DocsPage;
  mobileOpen: boolean;
  onNavigate: () => void;
}) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [scrollEdges, setScrollEdges] = useState({ top: false, bottom: false });

  const updateScrollEdges = () => {
    const content = contentRef.current;
    if (!content) return;
    const top = content.scrollTop > 1;
    const bottom = content.scrollTop + content.clientHeight < content.scrollHeight - 1;
    setScrollEdges((previous) =>
      previous.top === top && previous.bottom === bottom ? previous : { top, bottom },
    );
  };

  useEffect(() => {
    const content = contentRef.current;
    if (!content) return;
    const observer = new ResizeObserver(updateScrollEdges);
    observer.observe(content);
    const navigation = content.firstElementChild;
    if (navigation) observer.observe(navigation);
    updateScrollEdges();
    return () => observer.disconnect();
  }, []);

  return (
    <Sidebar.Panel
      aria-label="Documentation navigation"
      data-mobile-state={mobileOpen ? "open" : "closed"}
      hidden={false}
      inert={compact && !mobileOpen}
      xstyle={styles.sidebarPanel}
    >
      <Sidebar.Header xstyle={styles.sidebarHeader}>
        <div {...stylex.props(styles.brandRow)}>
          <strong {...stylex.props(styles.brand)}>Lenso UI</strong>
          <Sidebar.Trigger
            aria-label="Close documentation navigation"
            render={<button {...stylex.props(styles.mobileSidebarClose)} type="button" />}
          >
            <XIcon aria-hidden="true" {...stylex.props(styles.mobileHeaderIcon)} />
          </Sidebar.Trigger>
        </div>
      </Sidebar.Header>
      <Sidebar.Content onScroll={updateScrollEdges} ref={contentRef} xstyle={styles.sidebarContent}>
        <nav aria-label="Documentation" {...stylex.props(styles.nav)}>
          <DocumentationNavigation current={current} onNavigate={onNavigate} />
        </nav>
      </Sidebar.Content>
      {scrollEdges.top && <div aria-hidden="true" {...stylex.props(styles.scrollFadeTop)} />}
      {scrollEdges.bottom && <div aria-hidden="true" {...stylex.props(styles.scrollFadeBottom)} />}
    </Sidebar.Panel>
  );
}

export function DocsFrame({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const current = docsPageFromPathname(pathname);
  const theme = useDocsPageTheme();
  const [compact, setCompact] = useState(false);
  const [mobileNavigationOpen, setMobileNavigationOpen] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(max-width: 900px)");
    const update = () => {
      setCompact(query.matches);
      if (query.matches) setMobileNavigationOpen(false);
    };
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    setMobileNavigationOpen(false);
  }, [pathname]);

  return (
    <div id="docs-theme-root" {...stylex.props(styles.theme, theme === "dark" && styles.darkTheme)}>
      <Sidebar.Root
        id="documentation-sidebar"
        onOpenChange={setMobileNavigationOpen}
        open={compact ? mobileNavigationOpen : true}
        xstyle={styles.shell}
      >
        <DocumentationSidebar
          compact={compact}
          current={current}
          mobileOpen={mobileNavigationOpen}
          onNavigate={() => setMobileNavigationOpen(false)}
        />
        <button
          aria-label="Close documentation navigation"
          onClick={() => setMobileNavigationOpen(false)}
          {...stylex.props(
            styles.mobileNavigationScrim,
            !mobileNavigationOpen && styles.closedMobileNavigationScrim,
          )}
          tabIndex={mobileNavigationOpen ? 0 : -1}
          type="button"
        />
        {children}
      </Sidebar.Root>
    </div>
  );
}

export function DocsShell({ breadcrumbs, children, current, theme }: DocsShellProps) {
  return (
    <div {...stylex.props(styles.mainInset)} data-current-page={current} data-preview-theme={theme}>
      <main {...stylex.props(styles.mainSurface)}>
        <header
          {...stylex.props(
            styles.header,
            (current === "tokens" || current === "theme-lab") && styles.workspaceHeader,
          )}
        >
          <Sidebar.Trigger
            aria-label="Open documentation navigation"
            render={<button {...stylex.props(styles.mobileNavigationTrigger)} type="button" />}
          >
            <MenuIcon aria-hidden="true" {...stylex.props(styles.mobileHeaderIcon)} />
          </Sidebar.Trigger>
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
          <span {...stylex.props(styles.mobilePageTitle)}>{breadcrumbs[1]}</span>
          <DocsSearch />
          <div {...stylex.props(styles.headerActions)}>
            <ThemeToggle />
            <Link href="/start/installation" {...stylex.props(styles.installLink)}>
              Install
            </Link>
          </div>
        </header>
        <div
          data-docs-scroll=""
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
