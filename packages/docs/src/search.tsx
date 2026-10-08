"use client";

import { createContext, useContext, useMemo, useRef, type ReactNode, type RefObject } from "react";
import * as stylex from "@stylexjs/stylex";
import { Magnifier } from "@gravity-ui/icons";
import { kbdStyles } from "@lenso/tokens/kbd";
import { useDocsSearch, type StaticOptions } from "fumadocs-core/search/client";
import { SearchProvider, useSearchContext, type SharedProps } from "fumadocs-ui/contexts/search";
import {
  SearchDialog as FumaSearchDialog,
  SearchDialogContent,
  SearchDialogOverlay,
  SearchDialogHeader,
  SearchDialogInput,
  SearchDialogIcon,
  SearchDialogClose,
  SearchDialogList,
  SearchDialogListItem,
  useSearchList,
  type SearchItemType,
} from "fumadocs-ui/components/dialog/search";
import { notebook, search as styles } from "@lenso/docs/presentation";

// Adapted from the application's HeroUI e385ac2 visual overrides (Apache-2.0).
// Fumadocs owns dialog, selection, scrolling and static search (../LICENSE.FUMADOCS).
export interface DocumentationSearchProps {
  from: string;
  initOrama?: NonNullable<StaticOptions["initOrama"]>;
  compact?: boolean;
  allowEmpty?: boolean;
  children?: ReactNode;
  labels?: {
    input?: string;
    placeholder?: string;
    close?: string;
    empty?: string;
    error?: string;
  };
}

const SearchConfiguration = createContext<
  | (Pick<DocumentationSearchProps, "from" | "initOrama" | "labels" | "allowEmpty"> & {
      triggers: RefObject<Set<HTMLElement>>;
    })
  | null
>(null);

const SearchRevision = createContext("");

// Internal host boundary: Fumadocs caches static databases by their source URL.
export function DocumentationSearchRevision({
  revision,
  children,
}: {
  revision: string;
  children: ReactNode;
}) {
  return <SearchRevision value={revision}>{children}</SearchRevision>;
}

function useSearchTriggerRef() {
  const registry = useContext(SearchConfiguration)?.triggers;
  const previous = useRef<HTMLElement | null>(null);
  return (node: HTMLElement | null) => {
    if (previous.current) registry?.current.delete(previous.current);
    if (node) registry?.current.add(node);
    previous.current = node;
  };
}

function SearchResult({ item, onClick }: { item: SearchItemType; onClick: () => void }) {
  const { active } = useSearchList();
  return (
    <SearchDialogListItem
      item={item}
      onClick={onClick}
      aria-selected={undefined}
      aria-current={active === item.id ? "true" : undefined}
      data-docs-result=""
      data-docs-result-type={item.type}
      {...stylex.props(styles.result)}
    />
  );
}

function StaticSearchDialog({ open, onOpenChange }: SharedProps) {
  const configuration = useContext(SearchConfiguration);
  if (!configuration) throw new Error("Search dialog requires DocumentationSearch.");
  const { from, initOrama, triggers, labels, allowEmpty = false } = configuration;
  const restoreFocus = useRef<Element | null>(null);
  const { search, setSearch, query } = useDocsSearch(
    {
      type: "static",
      from,
      allowEmpty,
      search: { limit: 60 },
      ...(initOrama !== undefined ? { initOrama } : {}),
    },
    [from, initOrama, allowEmpty],
  );
  const items = query.data === "empty" ? (allowEmpty ? [] : null) : query.data;
  return (
    <FumaSearchDialog
      open={open}
      onOpenChange={(value) => {
        onOpenChange(value);
        if (!value) setSearch("");
      }}
      search={search}
      onSearchChange={setSearch}
      isLoading={query.isLoading}
    >
      <SearchDialogOverlay data-docs-search-overlay="" {...stylex.props(styles.backdrop)} />
      <SearchDialogContent
        aria-label="Search documentation"
        aria-labelledby={undefined}
        data-docs-search=""
        onOpenAutoFocus={() => {
          restoreFocus.current = document.activeElement;
        }}
        onCloseAutoFocus={(event) => {
          event.preventDefault();
          const original = restoreFocus.current;
          if (
            original instanceof HTMLElement &&
            original.isConnected &&
            original.getClientRects().length
          ) {
            original.focus();
          } else {
            [...triggers.current]
              .find((node) => node.isConnected && node.getClientRects().length)
              ?.focus();
          }
        }}
        {...stylex.props(styles.popup)}
      >
        <SearchDialogHeader {...stylex.props(styles.header)}>
          <SearchDialogIcon aria-hidden="true" {...stylex.props(styles.icon)} />
          <SearchDialogInput
            aria-label={labels?.input ?? "Search documentation"}
            placeholder={labels?.placeholder ?? "Search documentation…"}
          />
          <SearchDialogClose
            aria-label={labels?.close ?? "Close search"}
            {...stylex.props(styles.close)}
          >
            <kbd {...stylex.props(kbdStyles.root)}>
              <span {...stylex.props(kbdStyles.content)}>ESC</span>
            </kbd>
          </SearchDialogClose>
        </SearchDialogHeader>
        {query.error ? (
          <p role="alert">
            {labels?.error ?? "Unable to load search. Close this dialog and try again."}
          </p>
        ) : (
          <SearchDialogList
            items={items}
            Empty={() => (
              <output {...stylex.props(styles.empty)}>
                {labels?.empty ?? "No matching pages."}
              </output>
            )}
            Item={(props) => <SearchResult {...props} />}
            {...stylex.props(styles.list)}
          />
        )}
      </SearchDialogContent>
    </FumaSearchDialog>
  );
}

function SearchTriggers({ compact }: { compact: boolean }) {
  const desktopRef = useSearchTriggerRef();
  const mobileRef = useSearchTriggerRef();
  const { setOpenSearch, hotKey } = useSearchContext();
  if (compact) {
    return (
      <button
        ref={desktopRef}
        type="button"
        aria-label="Search documentation"
        data-docs-search-trigger=""
        onClick={() => setOpenSearch(true)}
        {...stylex.props(notebook.iconButton)}
      >
        <Magnifier width={16} height={16} aria-hidden="true" />
      </button>
    );
  }
  return (
    <>
      <div {...stylex.props(notebook.headerDesktop, notebook.searchContainer)}>
        <button
          ref={desktopRef}
          type="button"
          aria-label="Search documentation"
          data-docs-search-trigger=""
          onClick={() => setOpenSearch(true)}
          {...stylex.props(notebook.searchTrigger)}
        >
          <Magnifier width={16} height={16} aria-hidden="true" />
          <span {...stylex.props(notebook.searchLabel)}>Search</span>
          {hotKey.map((key, index) => (
            <kbd key={index} {...stylex.props(notebook.key)}>
              {key.display}
            </kbd>
          ))}
        </button>
      </div>
      <div {...stylex.props(notebook.headerMobile)}>
        <button
          ref={mobileRef}
          type="button"
          aria-label="Search documentation"
          data-docs-search-trigger=""
          onClick={() => setOpenSearch(true)}
          {...stylex.props(notebook.iconButton)}
        >
          <Magnifier width={18} height={18} aria-hidden="true" />
        </button>
      </div>
    </>
  );
}

export function DocumentationCompactSearchTrigger() {
  return <SearchTriggers compact />;
}

export function DocumentationSearch({
  from: source,
  initOrama,
  compact = false,
  children,
  labels,
  allowEmpty = false,
}: DocumentationSearchProps) {
  const revision = useContext(SearchRevision);
  const [resource = source, fragment] = source.split("#", 2);
  const from = revision
    ? `${resource}${resource.includes("?") ? "&" : "?"}v=${encodeURIComponent(revision)}${fragment ? `#${fragment}` : ""}`
    : source;
  const triggers = useRef(new Set<HTMLElement>());
  const configuration = useMemo(
    () => ({
      from,
      triggers,
      allowEmpty,
      ...(initOrama !== undefined ? { initOrama } : {}),
      ...(labels ? { labels } : {}),
    }),
    [from, triggers, allowEmpty, initOrama, labels],
  );
  return (
    <SearchConfiguration value={configuration}>
      <SearchProvider SearchDialog={StaticSearchDialog}>
        {children ?? <SearchTriggers compact={compact} />}
      </SearchProvider>
    </SearchConfiguration>
  );
}
