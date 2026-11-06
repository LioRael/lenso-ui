"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useSyncExternalStore,
  type ReactNode,
  type RefObject,
} from "react";
import * as stylex from "@stylexjs/stylex";
import { DocumentationButton } from "./header-button";
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
  useSearch,
  type SearchItemType,
} from "fumadocs-ui/components/dialog/search";
import { notebook, search as styles } from "@lenso/docs/presentation";
import { prioritizeSearchPages } from "./search-results";

// Adapted from the application's HeroUI e385ac2 visual overrides (Apache-2.0).
// Fumadocs owns dialog, selection, scrolling and static search (../LICENSE.FUMADOCS).
export interface DocumentationSearchProps {
  from: string;
  initDB?: NonNullable<StaticOptions["initDB"]>;
  compact?: boolean;
  allowEmpty?: boolean;
  children?: ReactNode;
  labels?: {
    input?: string;
    trigger?: string;
    placeholder?: string;
    close?: string;
    empty?: string;
    error?: string;
  };
}

const SearchConfiguration = createContext<
  | (Pick<DocumentationSearchProps, "from" | "initDB" | "labels" | "allowEmpty"> & {
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
  const { subscribeActive, getActive } = useSearch();
  const active = useSyncExternalStore(subscribeActive, getActive, getActive) === item.id;
  const scrollActive = useCallback(
    (node: HTMLDivElement | null) => {
      // The StyleX wrapper owns scrolling instead of Fumadocs' Tailwind listbox.
      if (node && active) node.scrollIntoView({ block: "nearest" });
    },
    [active],
  );
  return (
    <SearchDialogListItem
      ref={scrollActive}
      item={item}
      onClick={onClick}
      data-docs-result=""
      data-docs-result-type={item.type}
      {...stylex.props(
        styles.result,
        item.type === "page" ? styles.pageResult : styles.childResult,
      )}
    >
      <span {...stylex.props(styles.resultText)}>
        {item.type === "action" ? item.node : item.content}
      </span>
    </SearchDialogListItem>
  );
}

function StaticSearchDialog({ open, onOpenChange }: SharedProps) {
  const configuration = useContext(SearchConfiguration);
  if (!configuration) throw new Error("Search dialog requires DocumentationSearch.");
  const { from, initDB, triggers, labels, allowEmpty = false } = configuration;
  const restoreFocus = useRef<Element | null>(null);
  const { search, setSearch, query } = useDocsSearch(
    {
      type: "static",
      from,
      allowEmpty,
      search: { limit: 40, groupBy: { properties: ["page_id"], maxResult: 2 } },
      ...(initDB !== undefined ? { initDB } : {}),
    },
    [from, initDB, allowEmpty],
  );
  const items = useMemo(
    () =>
      query.data === "empty"
        ? allowEmpty
          ? []
          : null
        : query.data && prioritizeSearchPages(query.data, search),
    [query.data, search, allowEmpty],
  );
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
        aria-label={labels?.trigger ?? "Search documentation"}
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
            // Fumadocs replaces className on this native input; style is its forwarding boundary.
            style={{
              flex: 1,
              minWidth: 0,
              width: 0,
              border: 0,
              background: "transparent",
              color: "inherit",
              font: "inherit",
              outline: "none",
            }}
            aria-label={labels?.input ?? "Search documentation"}
            placeholder={labels?.placeholder ?? "Search documentation…"}
          />
          <SearchDialogClose
            aria-label={`${labels?.close ?? "Close search"} Esc`}
            {...stylex.props(styles.close)}
          >
            <kbd {...stylex.props(kbdStyles.root)}>
              <span {...stylex.props(kbdStyles.content)}>ESC</span>
            </kbd>
          </SearchDialogClose>
        </SearchDialogHeader>
        {!search.trim() ? (
          <p {...stylex.props(styles.empty)}>
            {labels?.placeholder ?? "Search components and guides"}
          </p>
        ) : query.error ? (
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
  const label = useContext(SearchConfiguration)?.labels?.trigger ?? "Search documentation";
  if (compact) {
    return (
      <DocumentationButton
        isIconOnly
        ref={desktopRef}
        type="button"
        aria-label={label}
        data-docs-search-trigger=""
        onClick={() => setOpenSearch(true)}
        xstyle={notebook.glassIconButton}
      >
        <Magnifier width={16} height={16} aria-hidden="true" />
      </DocumentationButton>
    );
  }
  return (
    <>
      <div {...stylex.props(notebook.headerDesktop, notebook.searchContainer)}>
        <button
          ref={desktopRef}
          type="button"
          aria-label={label}
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
        <DocumentationButton
          isIconOnly
          ref={mobileRef}
          type="button"
          aria-label={label}
          data-docs-search-trigger=""
          onClick={() => setOpenSearch(true)}
          xstyle={notebook.glassIconButton}
        >
          <Magnifier width={18} height={18} aria-hidden="true" />
        </DocumentationButton>
      </div>
    </>
  );
}

export function DocumentationCompactSearchTrigger() {
  return <SearchTriggers compact />;
}

export function DocumentationSearch({
  from: source,
  initDB,
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
      ...(initDB !== undefined ? { initDB } : {}),
      ...(labels ? { labels } : {}),
    }),
    [from, triggers, allowEmpty, initDB, labels],
  );
  return (
    <SearchConfiguration value={configuration}>
      <SearchProvider SearchDialog={StaticSearchDialog}>
        {children ?? <SearchTriggers compact={compact} />}
      </SearchProvider>
    </SearchConfiguration>
  );
}
