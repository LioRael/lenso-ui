"use client";

import { useState, type ReactNode } from "react";
import * as stylex from "@stylexjs/stylex";
import { GlassButton } from "@lenso/ui/glass-button";
import { Sidebar } from "@lenso/ui/sidebar";
import { Modal as Dialog } from "@lenso/ui/modal";
import { Bars, Xmark } from "@gravity-ui/icons";
import Link from "fumadocs-core/link";
import { styles, notebook, sidebar } from "@lenso/docs/presentation";
import { DocsHeaderBackdrop } from "./header-backdrop";
import { HeaderTOCProvider, HeaderTOCSlot } from "@lenso/docs/toc";
import { DocumentationNavigation, type DocumentationNavigationItem } from "./site-navigation";
import { DesktopNavigationState, sidebarScope, useSidebarState } from "./sidebar-state";
import { useDocumentationMessages } from "./i18n";

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
    drawerFooter?: ReactNode;
  };
}

export function DocumentationSiteLayout({
  brand,
  currentUrl,
  locale,
  activeSection,
  sections,
  navigation,
  navigationStateKey,
  children,
  slots,
}: DocumentationSiteLayoutProps): ReactNode {
  const messages = useDocumentationMessages(locale);
  const browseLabel = messages.browse;
  const [drawerOpen, setDrawerOpen] = useState(false);
  const {
    ref: sidebarRef,
    branches,
    setBranch,
  } = useSidebarState(sidebarScope(brand, navigation, navigationStateKey), navigation, currentUrl);
  const dismissDrawer = () => setDrawerOpen(false);
  const isSelected = (section: DocumentationSection) =>
    activeSection === undefined ? section.url === currentUrl : section.id === activeSection;

  const hasSections = sections.length > 0;
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
        <div
          id="nd-notebook-layout"
          {...stylex.props(
            styles.shell,
            slots?.headerNavigation != null && styles.headerNavigationShell,
          )}
        >
          <header id="nd-subnav" data-lenso-backdrop="live" {...stylex.props(styles.header)}>
            {slots?.headerBackdrop ?? <DocsHeaderBackdrop />}
            <div {...stylex.props(notebook.headerBody)}>
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
            <HeaderTOCSlot />
          </header>
          <aside aria-label={messages.sidebar} {...stylex.props(styles.sidebar)}>
            <Sidebar aria-label={messages.documentation} xstyle={sidebar.pane}>
              <Sidebar.Header xstyle={sidebar.header}>
                <Link href={brand.url} {...stylex.props(styles.brand)}>
                  {brand.logo}
                  {brand.title}
                </Link>
                {slots?.identity}
              </Sidebar.Header>
              {hasSections && (
                <Sidebar
                  aria-label={messages.sections}
                  xstyle={[sidebar.sections, sidebar.pinnedSections]}
                >
                  <Sidebar.Group>{sectionLinks}</Sidebar.Group>
                </Sidebar>
              )}
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
        </div>
        <Dialog.Backdrop xstyle={notebook.backdrop} />
        <Dialog.Content
          xstyle={notebook.drawer}
          onClick={(event) => {
            // Also dismiss links supplied by the host's action/footer slots.
            if (event.target instanceof Element && event.target.closest("a[href]")) dismissDrawer();
          }}
        >
          <Dialog.Title xstyle={notebook.hidden}>{browseLabel}</Dialog.Title>
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
              aria-label={messages.closeNavigation}
              render={<GlassButton isIconOnly xstyle={notebook.glassIconButton} />}
            >
              <Xmark width={18} height={18} aria-hidden="true" />
            </Dialog.Close>
          </div>
          {slots?.drawerActions != null && (
            <div {...stylex.props(notebook.drawerHeader)}>{slots.drawerActions}</div>
          )}
          <div {...stylex.props(notebook.drawerScroll)}>
            {hasSections && (
              <Sidebar aria-label={messages.sections} xstyle={sidebar.sections}>
                <Sidebar.Group>{sectionLinks}</Sidebar.Group>
              </Sidebar>
            )}
            <DocumentationNavigation
              navigation={navigation}
              currentUrl={currentUrl}
              onNavigate={dismissDrawer}
            />
          </div>
          {slots?.drawerFooter != null && (
            <span {...stylex.props(sidebar.item)}>{slots.drawerFooter}</span>
          )}
        </Dialog.Content>
      </Dialog.Root>
    </HeaderTOCProvider>
  );
}
