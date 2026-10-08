"use client";

import { useContext, type ReactNode } from "react";
import * as stylex from "@stylexjs/stylex";
import { Collapsible } from "@base-ui/react/collapsible";
import { ChevronDown } from "@gravity-ui/icons";
import Link from "fumadocs-core/link";
import { styles, sidebar } from "@lenso/docs/presentation";
import { DesktopNavigationState, navigationBranchId } from "./sidebar-state";

// Adapted from the Lenso UI notebook sidebar; HeroUI v3.2.6, Apache-2.0.
// Navigation data and route identity belong to the application adapter.
export interface DocumentationNavigationItem {
  title: string;
  url?: string;
  description?: string;
  children?: DocumentationNavigationItem[];
  defaultOpen?: boolean;
  status?: "new" | "preview" | "updated" | "new-dot";
  statusLabel?: string;
}

export interface DocumentationNavigationProps {
  navigation: readonly DocumentationNavigationItem[];
  currentUrl: string;
  onNavigate?: () => void;
}

function containsCurrentUrl(item: DocumentationNavigationItem, currentUrl: string): boolean {
  return (
    item.url === currentUrl ||
    (item.children?.some((child) => containsCurrentUrl(child, currentUrl)) ?? false)
  );
}

function Status({ item }: { item: DocumentationNavigationItem }): ReactNode {
  if (!item.status || item.status === "new-dot") return null;
  return (
    <span {...stylex.props(sidebar.chip, sidebar[item.status])}>
      {item.statusLabel ?? { new: "New", preview: "Preview", updated: "Updated" }[item.status]}
    </span>
  );
}

function NavigationEntry({
  item,
  branchId,
  currentUrl,
  onNavigate,
}: {
  item: DocumentationNavigationItem;
  branchId: string;
  currentUrl: string;
  onNavigate?: (() => void) | undefined;
}): ReactNode {
  const desktopState = useContext(DesktopNavigationState);
  const selected = item.url === currentUrl;
  const link = item.url ? (
    <Link
      href={item.url}
      title={item.description}
      {...(onNavigate ? { onClick: onNavigate } : {})}
      aria-current={selected ? "page" : undefined}
      {...stylex.props(styles.navLink, sidebar.item, selected && styles.active)}
    >
      {item.title}
      <Status item={item} />
    </Link>
  ) : null;

  if (item.children?.length) {
    return (
      <Collapsible.Root
        defaultOpen={item.defaultOpen ?? containsCurrentUrl(item, currentUrl)}
        {...(desktopState
          ? {
              open:
                desktopState.branches[branchId] ??
                item.defaultOpen ??
                containsCurrentUrl(item, currentUrl),
              onOpenChange: (open: boolean) => desktopState.setBranch(branchId, open),
            }
          : {})}
      >
        {link}
        <Collapsible.Trigger
          title={item.description}
          aria-label={item.url ? `Toggle ${item.title} pages` : undefined}
          {...stylex.props(styles.navLink, sidebar.item, sidebar.trigger)}
        >
          {item.title}
          {!item.url && <Status item={item} />}
          <ChevronDown
            width={16}
            height={16}
            aria-hidden="true"
            {...stylex.props(sidebar.chevron)}
          />
        </Collapsible.Trigger>
        <Collapsible.Panel {...stylex.props(sidebar.children)}>
          {item.children.map((child) => (
            <NavigationEntry
              key={child.url ?? child.title}
              branchId={navigationBranchId(child, branchId)}
              item={child}
              currentUrl={currentUrl}
              onNavigate={onNavigate}
            />
          ))}
        </Collapsible.Panel>
      </Collapsible.Root>
    );
  }

  return (
    link ?? (
      <p title={item.description} {...stylex.props(styles.navHeading)}>
        {item.title}
        <Status item={item} />
      </p>
    )
  );
}

export function DocumentationNavigation({
  navigation,
  currentUrl,
  onNavigate,
}: DocumentationNavigationProps): ReactNode {
  return (
    <nav aria-label="Documentation pages" {...stylex.props(styles.navigation)}>
      {navigation.map((item) => (
        <NavigationEntry
          key={item.url ?? item.title}
          branchId={navigationBranchId(item)}
          item={item}
          currentUrl={currentUrl}
          onNavigate={onNavigate}
        />
      ))}
    </nav>
  );
}
