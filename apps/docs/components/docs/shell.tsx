"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { MenuIcon, XIcon } from "lucide-react";

import {
  getDocsPageForPath,
  getDocsSectionForPage,
  getOrderedDocsSections,
  type DocsSection,
} from "../../contents/catalog";
import { DocsSearch } from "./docs-search";
import { ThemeToggle } from "./theme-toggle";

const sections = getOrderedDocsSections().filter((section) => section.items.length > 0);

function SectionLinks({
  section,
  currentPage,
  onNavigate,
}: {
  section: DocsSection;
  currentPage: string;
  onNavigate?: () => void;
}) {
  return (
    <nav aria-label={section.label}>
      <div className="docs-sidebar-group">
        {section.items.map((item) => (
          <Link
            aria-current={item.slug === currentPage ? "page" : undefined}
            className={`docs-sidebar-item${item.slug === currentPage ? " is-active" : ""}`}
            href={item.href}
            key={item.href}
            {...(onNavigate ? { onClick: onNavigate } : {})}
          >
            {item.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}

function SectionTabs({
  activeSection,
  onNavigate,
}: {
  activeSection: string;
  onNavigate?: () => void;
}) {
  return sections.map((section) => (
    <Link
      aria-current={section.id === activeSection ? "page" : undefined}
      className={`docs-tab${section.id === activeSection ? " is-active" : ""}`}
      href={section.items[0]!.href}
      key={section.id}
      {...(onNavigate ? { onClick: onNavigate } : {})}
    >
      {section.label}
    </Link>
  ));
}

export function DocsFrame({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const page = getDocsPageForPath(pathname) ?? "overview";
  const activeSection = getDocsSectionForPage(page) ?? sections[0]!.id;
  const section = sections.find((candidate) => candidate.id === activeSection) ?? sections[0]!;
  const navDialog = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    navDialog.current?.close();
  }, [pathname]);

  return (
    <div className="docs-shell" id="docs-theme-root">
      <header className="docs-header">
        <div className="docs-header-leading">
          <button
            aria-label="Open navigation"
            className="docs-icon-button docs-mobile-nav-trigger"
            onClick={() => navDialog.current?.showModal()}
            type="button"
          >
            <MenuIcon aria-hidden="true" />
          </button>
          <Link className="docs-brand" href="/">
            Lenso UI
          </Link>
          <span aria-hidden="true" className="docs-brand-divider" />
          <nav aria-label="Documentation sections" className="docs-tabs">
            <SectionTabs activeSection={activeSection} />
          </nav>
        </div>
        <DocsSearch />
        <div className="docs-theme-trigger">
          <ThemeToggle />
        </div>
      </header>
      <aside aria-label="Section navigation" className="docs-sidebar">
        <div className="docs-sidebar-inner">
          <p className="docs-sidebar-heading">{section.label}</p>
          <SectionLinks currentPage={page} section={section} />
        </div>
      </aside>
      <main className="docs-main" data-docs-scroll id="main-content">
        {children}
      </main>
      <dialog aria-label="Navigation" className="docs-mobile-nav" ref={navDialog}>
        <div className="docs-dialog-topline">
          <span>Lenso UI</span>
          <button
            aria-label="Close navigation"
            className="docs-icon-button"
            onClick={() => navDialog.current?.close()}
            type="button"
          >
            <XIcon aria-hidden="true" />
          </button>
        </div>
        <nav aria-label="Documentation sections">
          <SectionTabs
            activeSection={activeSection}
            onNavigate={() => navDialog.current?.close()}
          />
        </nav>
        <div className="docs-mobile-nav-pages">
          <SectionLinks
            currentPage={page}
            onNavigate={() => navDialog.current?.close()}
            section={section}
          />
        </div>
      </dialog>
    </div>
  );
}
