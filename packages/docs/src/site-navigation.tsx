"use client";

import { useContext, type ReactNode } from "react";
import * as stylex from "@stylexjs/stylex";
import { Sidebar } from "@lenso/ui/sidebar";
import { sidebarStyles } from "@lenso/tokens/sidebar";
import { ChevronDown } from "@gravity-ui/icons";
import Link from "fumadocs-core/link";
import { sidebar } from "@lenso/docs/presentation";
import { DesktopNavigationState, navigationBranchId } from "./sidebar-state";
import { useDocumentationMessages } from "./i18n";

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
  const messages = useDocumentationMessages();
  if (!item.status || item.status === "new-dot") return null;
  return (
    <span {...stylex.props(sidebar.chip, sidebar[item.status])}>
      {item.statusLabel ?? messages[item.status]}
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
  const messages = useDocumentationMessages();
  const desktopState = useContext(DesktopNavigationState);
  const selected = item.url === currentUrl;
  const link = item.url ? (
    <Sidebar.Item
      render={<Link href={item.url} />}
      selected={selected}
      href={item.url}
      title={item.description}
      {...(onNavigate ? { onClick: onNavigate } : {})}
      xstyle={[sidebar.row, selected && sidebar.selected]}
    >
      <Sidebar.Text>{item.title}</Sidebar.Text>
      <Status item={item} />
    </Sidebar.Item>
  ) : null;

  if (item.children?.length) {
    return (
      <Sidebar.Disclosure
        {...(desktopState
          ? {
              open:
                desktopState.branches[branchId] ??
                item.defaultOpen ??
                containsCurrentUrl(item, currentUrl),
              onOpenChange: (open: boolean) => desktopState.setBranch(branchId, open),
            }
          : { defaultOpen: item.defaultOpen ?? containsCurrentUrl(item, currentUrl) })}
      >
        {link}
        <Sidebar.DisclosureTrigger
          title={item.description}
          aria-label={item.url ? messages.togglePages(item.title) : undefined}
          xstyle={[sidebar.row, sidebar.trigger]}
        >
          <Sidebar.Text>{item.title}</Sidebar.Text>
          {!item.url && <Status item={item} />}
          <ChevronDown
            width={16}
            height={16}
            aria-hidden="true"
            {...stylex.props(sidebarStyles.disclosureIndicator, sidebar.chevron)}
          />
        </Sidebar.DisclosureTrigger>
        <Sidebar.DisclosurePanel
          {...stylex.props(sidebar.children, !item.url && sidebar.categoryChildren)}
        >
          {item.children.map((child) => (
            <NavigationEntry
              key={child.url ?? child.title}
              branchId={navigationBranchId(child, branchId)}
              item={child}
              currentUrl={currentUrl}
              onNavigate={onNavigate}
            />
          ))}
        </Sidebar.DisclosurePanel>
      </Sidebar.Disclosure>
    );
  }

  return (
    link ?? (
      <Sidebar.Label title={item.description} xstyle={sidebar.label}>
        {item.title}
        <Status item={item} />
      </Sidebar.Label>
    )
  );
}

export function DocumentationNavigation({
  navigation,
  currentUrl,
  onNavigate,
}: DocumentationNavigationProps): ReactNode {
  const messages = useDocumentationMessages();
  return (
    <Sidebar aria-label={messages.pages} xstyle={sidebar.navigation}>
      {navigation.map((item) => (
        <NavigationEntry
          key={item.url ?? item.title}
          branchId={navigationBranchId(item)}
          item={item}
          currentUrl={currentUrl}
          onNavigate={onNavigate}
        />
      ))}
    </Sidebar>
  );
}
