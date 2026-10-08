"use client";

import { useState, type ReactNode } from "react";
import * as stylex from "@stylexjs/stylex";
import { Dialog } from "@base-ui/react/dialog";
import { Bars, Xmark } from "@gravity-ui/icons";
import Link from "fumadocs-core/link";
import { styles, notebook } from "@lenso/docs/presentation";
import { DocumentationNavigation, type DocumentationNavigationItem } from "./site-navigation";
import { DesktopNavigationState, sidebarScope, useSidebarState } from "./sidebar-state";

export type { DocumentationNavigationItem } from "./site-navigation";

// Adapted from the Lenso UI notebook layout; HeroUI v3.2.6, Apache-2.0.
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
  activeSection?: string;
  sections: readonly DocumentationSection[];
  navigation: readonly DocumentationNavigationItem[];
  /** Stable site-local locale + collection identity; never include the current article URL. */
  navigationStateKey?: string;
  children: ReactNode;
  slots?: {
    identity?: ReactNode;
    search?: ReactNode;
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
  activeSection,
  sections,
  navigation,
  navigationStateKey,
  children,
  slots,
}: DocumentationSiteLayoutProps): ReactNode {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const {
    ref: sidebarRef,
    branches,
    setBranch,
  } = useSidebarState(sidebarScope(brand, navigation, navigationStateKey), navigation, currentUrl);
  const dismissDrawer = () => setDrawerOpen(false);
  const isSelected = (section: DocumentationSection) =>
    activeSection === undefined ? section.url === currentUrl : section.id === activeSection;

  return (
    <Dialog.Root open={drawerOpen} onOpenChange={setDrawerOpen}>
      <div id="nd-notebook-layout" {...stylex.props(styles.shell)}>
        <header id="nd-subnav" {...stylex.props(styles.header)}>
          <div {...stylex.props(notebook.headerBody)}>
            <div {...stylex.props(notebook.identity)}>
              <Link href={brand.url} {...stylex.props(styles.brand)}>
                {brand.logo}
                {brand.title}
              </Link>
              {slots?.identity}
            </div>
            {slots?.search}
            <div {...stylex.props(notebook.actions)}>
              {slots?.desktopActions != null && (
                <div {...stylex.props(notebook.headerDesktop)}>{slots.desktopActions}</div>
              )}
              <div {...stylex.props(notebook.headerMobile)}>
                {slots?.mobileActions}
                <Dialog.Trigger
                  aria-label="Browse documentation"
                  {...stylex.props(notebook.iconButton)}
                >
                  <Bars width={18} height={18} aria-hidden="true" />
                </Dialog.Trigger>
              </div>
            </div>
          </div>
          <nav aria-label="Documentation sections" {...stylex.props(styles.sectionBar)}>
            {sections.map((section) => (
              <Link
                key={section.id}
                href={section.url}
                aria-current={isSelected(section) ? "page" : undefined}
                {...stylex.props(notebook.tab, isSelected(section) && notebook.selectedTab)}
              >
                {section.icon}
                {section.title}
              </Link>
            ))}
            {slots?.sectionTrailing != null && (
              <span {...stylex.props(notebook.framework)}>{slots.sectionTrailing}</span>
            )}
          </nav>
        </header>
        <aside id="nd-sidebar" ref={sidebarRef} {...stylex.props(styles.sidebar)}>
          <DesktopNavigationState.Provider value={{ branches, setBranch }}>
            <DocumentationNavigation navigation={navigation} currentUrl={currentUrl} />
          </DesktopNavigationState.Provider>
        </aside>
        {children}
      </div>
      <Dialog.Portal>
        <Dialog.Backdrop {...stylex.props(notebook.backdrop)} />
        <Dialog.Popup
          {...stylex.props(notebook.drawer)}
          onClick={(event) => {
            // Also dismiss links supplied by the host's action/footer slots.
            if (event.target instanceof Element && event.target.closest("a[href]")) dismissDrawer();
          }}
        >
          <Dialog.Title {...stylex.props(notebook.hidden)}>Browse documentation</Dialog.Title>
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
              aria-label="Close documentation navigation"
              {...stylex.props(notebook.iconButton)}
            >
              <Xmark width={18} height={18} aria-hidden="true" />
            </Dialog.Close>
          </div>
          {slots?.drawerActions != null && (
            <div {...stylex.props(notebook.drawerHeader)}>{slots.drawerActions}</div>
          )}
          <div {...stylex.props(notebook.drawerScroll)}>
            <nav aria-label="Documentation sections" {...stylex.props(notebook.drawerSections)}>
              {sections.map((section) => (
                <Link
                  key={section.id}
                  href={section.url}
                  onClick={dismissDrawer}
                  aria-current={isSelected(section) ? "page" : undefined}
                  {...stylex.props(styles.navLink)}
                >
                  {section.icon} {section.title}
                </Link>
              ))}
            </nav>
            <DocumentationNavigation
              navigation={navigation}
              currentUrl={currentUrl}
              onNavigate={dismissDrawer}
            />
          </div>
          {slots?.drawerFooter != null && <span>{slots.drawerFooter}</span>}
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
