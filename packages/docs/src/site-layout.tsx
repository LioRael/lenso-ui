"use client";

import { useState, type ReactNode } from "react";
import * as stylex from "@stylexjs/stylex";
import { GlassButton } from "@lenso/ui/glass-button";
import { Sidebar } from "@lenso/ui/sidebar";
import { Tabs } from "@lenso/ui/tabs";
import { Dialog } from "@base-ui/react/dialog";
import { Bars, Xmark } from "@gravity-ui/icons";
import Link from "fumadocs-core/link";
import { styles, notebook, sidebar } from "@lenso/docs/presentation";
import { HeaderTOCProvider, HeaderTOCSlot } from "@lenso/docs/toc";
import { DocumentationNavigation, type DocumentationNavigationItem } from "./site-navigation";
import { DesktopNavigationState, sidebarScope, useSidebarState } from "./sidebar-state";

export type { DocumentationNavigationItem } from "./site-navigation";

// Product controls are additive slots, not replacements for navigation behavior.
export interface DocumentationSection {
  id: string;
  title: string;
  url: string;
  icon?: ReactNode;
}

export interface DocumentationSiteLayoutProps {
  brand: { title: string; url: string; docsUrl?: string; logo?: ReactNode };
  currentUrl: string;
  locale?: string;
  activeSection?: string;
  sections: readonly DocumentationSection[];
  navigation: readonly DocumentationNavigationItem[];
  /** Stable site-local locale + collection identity; never include the current article URL. */
  navigationStateKey?: string;
  children: ReactNode;
  slots?: {
    headerBackdrop?: ReactNode;
    identity?: ReactNode;
    search?: ReactNode;
    /** Responsive header navigation; narrow layouts may wrap below the identity and actions. */
    headerNavigation?: ReactNode;
    desktopActions?: ReactNode;
    mobileActions?: ReactNode;
    drawerActions?: ReactNode;
    sectionTrailing?: ReactNode;
    drawerFooter?: ReactNode;
  };
}

export function DocumentationSiteLayout({
  brand,
  currentUrl,
  locale = "en",
  activeSection,
  sections,
  navigation,
  navigationStateKey,
  children,
  slots,
}: DocumentationSiteLayoutProps): ReactNode {
  const chinese = locale === "cn" || locale.startsWith("zh");
  const browseLabel = chinese ? "浏览文档" : "Browse documentation";
  const [drawerOpen, setDrawerOpen] = useState(false);
  const {
    ref: sidebarRef,
    branches,
    setBranch,
  } = useSidebarState(sidebarScope(brand, navigation, navigationStateKey), navigation, currentUrl);
  const dismissDrawer = () => setDrawerOpen(false);
  const isSelected = (section: DocumentationSection) =>
    activeSection === undefined ? section.url === currentUrl : section.id === activeSection;

  const selectedSection = sections.find(isSelected)?.id ?? currentUrl;
  const sectionLinks = sections.map((section) => (
    <Sidebar.Item
      key={section.id}
      render={<Link href={section.url} />}
      href={section.url}
      selected={isSelected(section)}
      xstyle={[sidebar.row, isSelected(section) && sidebar.selected]}
    >
      {section.icon && <Sidebar.Icon xstyle={sidebar.icon}>{section.icon}</Sidebar.Icon>}
      <Sidebar.Text>{section.title}</Sidebar.Text>
    </Sidebar.Item>
  ));

  return (
    <HeaderTOCProvider>
      <Dialog.Root open={drawerOpen} onOpenChange={setDrawerOpen}>
        <Tabs
          value={selectedSection}
          id="nd-notebook-layout"
          xstyle={[styles.shell, slots?.headerNavigation != null && styles.headerNavigationShell]}
        >
          <header id="nd-subnav" data-lenso-backdrop="live" {...stylex.props(styles.header)}>
            {slots?.headerBackdrop ?? (
              <div
                aria-hidden="true"
                data-docs-header-backdrop=""
                {...stylex.props(styles.headerBackdrop)}
              />
            )}
            <div
              {...stylex.props(
                notebook.headerBody,
                slots?.headerNavigation != null && styles.navigationHeaderBody,
              )}
            >
              <div {...stylex.props(notebook.identity, sidebar.mobileIdentity)}>
                <Link href={brand.url} {...stylex.props(styles.brand)}>
                  {brand.logo}
                  {brand.title}
                </Link>
                {slots?.identity}
              </div>
              {slots?.headerNavigation ?? slots?.search}
              <div {...stylex.props(notebook.actions)}>
                {slots?.desktopActions != null && (
                  <div {...stylex.props(notebook.headerDesktop)}>{slots.desktopActions}</div>
                )}
                <div {...stylex.props(notebook.headerMobile)}>
                  {slots?.mobileActions}
                  <Dialog.Trigger
                    aria-label={browseLabel}
                    render={<GlassButton isIconOnly xstyle={notebook.glassIconButton} />}
                  >
                    <Bars width={18} height={18} aria-hidden="true" />
                  </Dialog.Trigger>
                </div>
              </div>
            </div>
            <div
              {...stylex.props(
                styles.sectionBar,
                slots?.headerNavigation != null && styles.sectionBarNarrow,
              )}
            >
              <Tabs.ListContainer xstyle={styles.sectionTabs}>
                <Tabs.List
                  aria-label="Documentation sections"
                  activateOnFocus={false}
                  xstyle={[styles.sectionTabList, styles.sectionTabCount(sections.length)]}
                >
                  {sections.map((section) => (
                    <Tabs.Tab
                      key={section.id}
                      value={section.id}
                      nativeButton={false}
                      render={<Link href={section.url} />}
                      aria-current={isSelected(section) ? "page" : undefined}
                    >
                      <span {...stylex.props(styles.sectionTabContent)}>
                        {section.icon}
                        {section.title}
                      </span>
                    </Tabs.Tab>
                  ))}
                  <Tabs.Indicator />
                </Tabs.List>
              </Tabs.ListContainer>
              {slots?.sectionTrailing != null && (
                <span {...stylex.props(notebook.framework)}>{slots.sectionTrailing}</span>
              )}
            </div>
            <HeaderTOCSlot />
          </header>
          <Tabs.Panel value={selectedSection} xstyle={styles.sectionPanel}>
            <aside aria-label="Documentation sidebar" {...stylex.props(styles.sidebar)}>
              <Sidebar aria-label="Documentation" xstyle={sidebar.pane}>
                <Sidebar.Header xstyle={sidebar.header}>
                  <Link href={brand.url} {...stylex.props(styles.brand)}>
                    {brand.logo}
                    {brand.title}
                  </Link>
                  {slots?.identity}
                </Sidebar.Header>
                <Sidebar
                  aria-label="Documentation sections"
                  xstyle={[sidebar.sections, sidebar.pinnedSections]}
                >
                  <Sidebar.Group>{sectionLinks}</Sidebar.Group>
                </Sidebar>
                <Sidebar.Content id="nd-sidebar" ref={sidebarRef} xstyle={sidebar.scroll}>
                  <DesktopNavigationState.Provider value={{ branches, setBranch }}>
                    <DocumentationNavigation navigation={navigation} currentUrl={currentUrl} />
                  </DesktopNavigationState.Provider>
                </Sidebar.Content>
                {slots?.drawerFooter != null && (
                  <Sidebar.Footer xstyle={sidebar.footer}>{slots.drawerFooter}</Sidebar.Footer>
                )}
              </Sidebar>
            </aside>
            {children}
          </Tabs.Panel>
        </Tabs>
        <Dialog.Portal>
          <Dialog.Backdrop {...stylex.props(notebook.backdrop)} />
          <Dialog.Popup
            {...stylex.props(notebook.drawer)}
            onClick={(event) => {
              // Also dismiss links supplied by the host's action/footer slots.
              if (event.target instanceof Element && event.target.closest("a[href]"))
                dismissDrawer();
            }}
          >
            <Dialog.Title {...stylex.props(notebook.hidden)}>{browseLabel}</Dialog.Title>
            <div {...stylex.props(notebook.drawerHeader)}>
              <Link
                href={brand.docsUrl ?? brand.url}
                onClick={dismissDrawer}
                {...stylex.props(styles.brand)}
              >
                {brand.logo}
                {brand.title}
              </Link>
              <Dialog.Close
                aria-label={chinese ? "关闭文档导航" : "Close documentation navigation"}
                render={<GlassButton isIconOnly xstyle={notebook.glassIconButton} />}
              >
                <Xmark width={18} height={18} aria-hidden="true" />
              </Dialog.Close>
            </div>
            {slots?.drawerActions != null && (
              <div {...stylex.props(notebook.drawerHeader)}>{slots.drawerActions}</div>
            )}
            <div {...stylex.props(notebook.drawerScroll)}>
              <Sidebar aria-label="Documentation sections" xstyle={sidebar.sections}>
                <Sidebar.Group>{sectionLinks}</Sidebar.Group>
              </Sidebar>
              <DocumentationNavigation
                navigation={navigation}
                currentUrl={currentUrl}
                onNavigate={dismissDrawer}
              />
            </div>
            {slots?.drawerFooter != null && (
              <span {...stylex.props(sidebar.item)}>{slots.drawerFooter}</span>
            )}
          </Dialog.Popup>
        </Dialog.Portal>
      </Dialog.Root>
    </HeaderTOCProvider>
  );
}
