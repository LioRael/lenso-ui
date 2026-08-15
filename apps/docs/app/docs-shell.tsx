"use client";

import type { ReactNode } from "react";
import Link from "next/link";

import { Button } from "@lenso/ui/button";
import { ThemeScope } from "@lenso/ui/theme-scope";

type DocsPage =
  | "avatar"
  | "breadcrumb"
  | "button"
  | "checkbox"
  | "combobox"
  | "command-menu"
  | "disclosure"
  | "icon-button"
  | "label"
  | "menu"
  | "overview"
  | "page-header"
  | "popover"
  | "quick-link"
  | "settings-row"
  | "radio"
  | "select"
  | "sidebar"
  | "switch"
  | "tabs"
  | "text-field"
  | "tooltip";

interface DocsShellProps {
  actions: readonly [string, string];
  breadcrumbs: readonly [string, string];
  children: ReactNode;
  current: DocsPage;
  theme: "dark" | "light";
}

const startItems = [
  ["Overview", "/"],
  ["Installation", "#installation"],
  ["Quick start", "#quick-start"],
  ["Package vs Registry", "#package-vs-registry"],
  ["Release status", "#release-status"],
] as const;

const collapsedGroups = [
  "Foundations",
  "Components",
  "Primitives",
  "Recipes",
  "Templates",
  "Guides",
  "Reference",
];

function NavHeading({
  children,
  expanded = false,
  nested = false,
}: {
  children: ReactNode;
  expanded?: boolean;
  nested?: boolean;
}) {
  return (
    <button className={nested ? "nav-heading nav-heading-nested" : "nav-heading"} type="button">
      {children} <span aria-hidden="true">{expanded ? "▾" : "▸"}</span>
    </button>
  );
}

function OverviewNavigation() {
  return (
    <>
      <div className="nav-group nav-group-start">
        <NavHeading expanded>Start</NavHeading>
        {startItems.map(([label, href]) => (
          <Link
            aria-current={label === "Overview" ? "page" : undefined}
            className="nav-item"
            href={href}
            key={label}
          >
            {label}
          </Link>
        ))}
      </div>
      {collapsedGroups.slice(0, 1).map((group) => (
        <div className="nav-group" key={group}>
          <NavHeading>{group}</NavHeading>
        </div>
      ))}
      <div className="nav-group">
        <Link className="nav-heading nav-heading-link" href="/components/button">
          Components <span aria-hidden="true">▸</span>
        </Link>
      </div>
      {collapsedGroups.slice(2).map((group) => (
        <div className="nav-group" key={group}>
          <NavHeading>{group}</NavHeading>
        </div>
      ))}
    </>
  );
}

function ComponentNavigation({
  current,
}: {
  current:
    | "avatar"
    | "breadcrumb"
    | "button"
    | "checkbox"
    | "combobox"
    | "command-menu"
    | "disclosure"
    | "icon-button"
    | "label"
    | "menu"
    | "page-header"
    | "popover"
    | "quick-link"
    | "settings-row"
    | "radio"
    | "select"
    | "sidebar"
    | "switch"
    | "tabs"
    | "text-field"
    | "tooltip";
}) {
  const formsCurrent =
    current === "checkbox" ||
    current === "combobox" ||
    current === "label" ||
    current === "radio" ||
    current === "select" ||
    current === "switch" ||
    current === "text-field";
  const navigationCurrent =
    current === "breadcrumb" ||
    current === "command-menu" ||
    current === "disclosure" ||
    current === "page-header" ||
    current === "quick-link" ||
    current === "settings-row" ||
    current === "sidebar";
  const tabsCurrent = current === "tabs";
  const overlaysCurrent = current === "menu" || current === "popover" || current === "tooltip";
  const contentCurrent = current === "avatar";

  return (
    <>
      <div className="nav-group">
        <Link className="nav-heading nav-heading-link" href="/">
          Start <span aria-hidden="true">▸</span>
        </Link>
      </div>
      <div className="nav-group">
        <NavHeading>Foundations</NavHeading>
      </div>
      <div className="nav-group nav-group-components">
        <NavHeading expanded>Components</NavHeading>
        <div className="nav-category nav-category-actions">
          <NavHeading expanded={!formsCurrent} nested>
            Actions
          </NavHeading>
          {!formsCurrent && (
            <>
              <Link
                aria-current={current === "button" ? "page" : undefined}
                className="nav-item nav-item-deep"
                href="/components/button"
              >
                Button
              </Link>
              <Link
                aria-current={current === "icon-button" ? "page" : undefined}
                className="nav-item nav-item-deep"
                href="/components/icon-button"
              >
                Icon Button
              </Link>
            </>
          )}
        </div>
        <div className="nav-category">
          <NavHeading expanded={formsCurrent} nested>
            Forms
          </NavHeading>
          {formsCurrent && (
            <>
              {(
                [
                  ["Label", "/components/label"],
                  ["Text Field", "/components/text-field"],
                  ["Checkbox", "/components/checkbox"],
                  ["Radio", "/components/radio"],
                  ["Switch", "/components/switch"],
                  ["Select", "/components/select"],
                  ["Combobox", "/components/combobox"],
                ] as const
              ).map(([label, href]) => (
                <Link
                  aria-current={
                    (label === "Label" && current === "label") ||
                    (label === "Text Field" && current === "text-field") ||
                    (label === "Checkbox" && current === "checkbox") ||
                    (label === "Combobox" && current === "combobox") ||
                    (label === "Radio" && current === "radio") ||
                    (label === "Switch" && current === "switch") ||
                    (label === "Select" && current === "select")
                      ? "page"
                      : undefined
                  }
                  className="nav-item nav-item-deep"
                  href={href}
                  key={label}
                >
                  {label}
                </Link>
              ))}
            </>
          )}
        </div>
        <div className="nav-category">
          <NavHeading expanded={navigationCurrent || tabsCurrent} nested>
            Navigation
          </NavHeading>
          {(navigationCurrent || tabsCurrent) && (
            <>
              <Link
                aria-current={current === "tabs" ? "page" : undefined}
                className="nav-item nav-item-deep"
                href="/components/tabs"
              >
                Tabs
              </Link>
              <Link
                aria-current={current === "breadcrumb" ? "page" : undefined}
                className="nav-item nav-item-deep"
                href="/components/breadcrumb"
              >
                Breadcrumb
              </Link>
              <Link
                aria-current={current === "command-menu" ? "page" : undefined}
                className="nav-item nav-item-deep"
                href="/components/command-menu"
              >
                Command Menu
              </Link>
              <Link
                aria-current={current === "disclosure" ? "page" : undefined}
                className="nav-item nav-item-deep"
                href="/components/disclosure"
              >
                Disclosure
              </Link>
              <Link
                aria-current={current === "page-header" ? "page" : undefined}
                className="nav-item nav-item-deep"
                href="/components/page-header"
              >
                Page Header
              </Link>
              <Link
                aria-current={current === "quick-link" ? "page" : undefined}
                className="nav-item nav-item-deep"
                href="/components/quick-link"
              >
                Quick Link
              </Link>
              <Link
                aria-current={current === "settings-row" ? "page" : undefined}
                className="nav-item nav-item-deep"
                href="/components/settings-row"
              >
                Settings Row
              </Link>
              <Link
                aria-current={current === "sidebar" ? "page" : undefined}
                className="nav-item nav-item-deep"
                href="/components/sidebar"
              >
                Sidebar
              </Link>
            </>
          )}
        </div>
        <div className="nav-category">
          <NavHeading expanded={overlaysCurrent} nested>
            Overlays
          </NavHeading>
          {overlaysCurrent && (
            <>
              <Link
                aria-current={current === "tooltip" ? "page" : undefined}
                className="nav-item nav-item-deep"
                href="/components/tooltip"
              >
                Tooltip
              </Link>
              <Link
                aria-current={current === "menu" ? "page" : undefined}
                className="nav-item nav-item-deep"
                href="/components/menu"
              >
                Menu
              </Link>
              <Link
                aria-current={current === "popover" ? "page" : undefined}
                className="nav-item nav-item-deep"
                href="/components/popover"
              >
                Popover
              </Link>
            </>
          )}
        </div>
        <div className="nav-category">
          <NavHeading nested>Feedback</NavHeading>
        </div>
        <div className="nav-category">
          <NavHeading expanded={contentCurrent} nested>
            Content
          </NavHeading>
          {contentCurrent && (
            <Link aria-current="page" className="nav-item nav-item-deep" href="/components/avatar">
              Avatar
            </Link>
          )}
        </div>
      </div>
      {(["Primitives", "Recipes", "Templates", "Guides", "Reference"] as const).map((group) => (
        <div className="nav-group" key={group}>
          <NavHeading>{group}</NavHeading>
        </div>
      ))}
    </>
  );
}

export function DocsShell({ actions, breadcrumbs, children, current, theme }: DocsShellProps) {
  return (
    <ThemeScope className="docs-theme" theme={theme}>
      <div className="docs-shell">
        <aside className="docs-sidebar">
          <div className="sidebar-header">
            <div className="brand-row">
              <strong>Lenso UI</strong>
              <span className="version">v0.1</span>
            </div>
            <button className="search-button" type="button">
              <span>Search documentation</span>
              <kbd>⌘ K</kbd>
            </button>
          </div>
          <nav aria-label="Documentation" className="docs-nav">
            {current === "overview" ? (
              <OverviewNavigation />
            ) : (
              <ComponentNavigation current={current} />
            )}
          </nav>
        </aside>

        <div className="main-inset">
          <main className="main-surface">
            <header className="docs-header">
              <nav aria-label="Breadcrumb" className="breadcrumb">
                <span>Lenso UI</span>
                <span aria-hidden="true" className="breadcrumb-chevron" />
                <span>{breadcrumbs[0]}</span>
                <span aria-hidden="true" className="breadcrumb-chevron" />
                <strong>{breadcrumbs[1]}</strong>
              </nav>
              <div className="header-actions">
                <Button className="header-button" variant="secondary">
                  {actions[0]}
                </Button>
                <Button className="header-button" disabled={actions[1] === "Planned"}>
                  {actions[1]}
                </Button>
              </div>
            </header>
            {children}
          </main>
        </div>
      </div>
    </ThemeScope>
  );
}
