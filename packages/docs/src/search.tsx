"use client";

import {
  createContext,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from "react";
import * as stylex from "@stylexjs/stylex";
import { GlassButton } from "@lenso/ui/glass-button";
import { Command } from "@lenso/ui/command";
import { Dialog } from "@base-ui/react/dialog";
import { useRouter } from "fumadocs-core/framework";
import { SearchField } from "@lenso/ui/search-field";
import { CloseButton } from "@lenso/ui/close-button";
import { Kbd } from "@lenso/ui/kbd";
import { Spinner } from "@lenso/ui/spinner";
import { ScrollShadow } from "@lenso/ui/scroll-shadow";
import { useGlassRef } from "@lenso/glass/react";
import { liquidMaterialStyles, materialStyles } from "@lenso/tokens/materials";
import { Magnifier, FileText, Hashtag } from "@gravity-ui/icons";
import { useDocsSearch, useHighlightQuery, type StaticOptions } from "fumadocs-core/search/client";
import {
  SearchProvider,
  useSearchContext,
  type SharedProps,
  type SearchLink,
} from "fumadocs-ui/contexts/search";
import { notebook, search as styles } from "@lenso/docs/presentation";
import { compactSearchResults, type DocumentationSearchResult } from "./search-results.ts";

// Fumadocs owns static search; Command and Base UI own interactive behavior.
export interface DocumentationSearchProps {
  from: string;
  initDB?: NonNullable<StaticOptions["initDB"]>;
  compact?: boolean;
  allowEmpty?: boolean;
  links?: SearchLink[];
  children?: ReactNode;
  labels?: {
    input?: string;
    trigger?: string;
    placeholder?: string;
    close?: string;
    empty?: string;
    error?: string;
    clear?: string;
    loading?: string;
    navigate?: string;
    select?: string;
    dismiss?: string;
    hint?: string;
    suggestions?: string;
    results?: string;
    page?: string;
    section?: string;
    openPage?: string;
    openSection?: string;
  };
}

const SearchConfiguration = createContext<
  | (Pick<DocumentationSearchProps, "from" | "initDB" | "labels" | "allowEmpty" | "links"> & {
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

function SearchInput({
  search,
  isLoading,
  onClose,
}: {
  search: string;
  isLoading: boolean;
  onClose: () => void;
}) {
  const labels = useContext(SearchConfiguration)?.labels;
  return (
    <SearchField fullWidth xstyle={styles.field}>
      <div {...stylex.props(styles.inputRow)}>
        <SearchField.SearchIcon xstyle={styles.searchIcon} />
        <Command.Input
          render={<SearchField.Input value={search} />}
          xstyle={styles.input}
          aria-label={labels?.input ?? "Search documentation"}
          placeholder={labels?.placeholder ?? "Search components and guides"}
          // Escape dismisses the search overlay, including when the query is nonempty.
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              event.preventDefault();
              if (!event.nativeEvent.isComposing) onClose();
            }
          }}
        />
        {isLoading && <Spinner size="sm" aria-label={labels?.loading ?? "Searching…"} />}
        <SearchField.ClearButton aria-label={labels?.clear ?? "Clear search"} />
      </div>
    </SearchField>
  );
}

function SearchResult({
  item,
  query,
  onSelect,
}: {
  item: DocumentationSearchResult;
  query: string;
  onSelect: (item: DocumentationSearchResult) => void;
}) {
  const highlightRef = useHighlightQuery(query);
  const labels = useContext(SearchConfiguration)?.labels;
  const Icon = item.type === "heading" ? Hashtag : FileText;
  return (
    <Command.Item
      value={item}
      onSelect={onSelect}
      data-docs-result=""
      data-docs-result-type={item.type}
      xstyle={[styles.result, item.type === "page" ? styles.pageResult : styles.childResult]}
    >
      <span {...stylex.props(styles.resultIcon)} aria-hidden="true">
        <Icon width={20} height={20} />
      </span>
      <span {...stylex.props(styles.resultBody)}>
        <span ref={highlightRef} {...stylex.props(styles.resultContent)}>
          <span {...stylex.props(styles.resultText)}>{item.content}</span>
          {item.summary && <span {...stylex.props(styles.summary)}>{item.summary}</span>}
        </span>
      </span>
      <span {...stylex.props(styles.resultType)}>
        {item.type === "heading" ? (labels?.section ?? "Section") : (labels?.page ?? "Page")}
      </span>
    </Command.Item>
  );
}

function SearchActions({
  selected,
  onSelect,
}: {
  selected: DocumentationSearchResult | undefined;
  onSelect: (item: DocumentationSearchResult) => void;
}) {
  const labels = useContext(SearchConfiguration)?.labels;
  return (
    <footer {...stylex.props(styles.footer)}>
      <span {...stylex.props(styles.hint)}>
        <Kbd variant="light" xstyle={styles.key}>
          <Kbd.Abbr keyValue="up" />
          <Kbd.Abbr keyValue="down" />
        </Kbd>
        {labels?.navigate ?? "Navigate"}
      </span>
      <GlassButton
        size="sm"
        disabled={!selected}
        onClick={() => selected && onSelect(selected)}
        xstyle={styles.openAction}
      >
        {selected?.type === "heading"
          ? (labels?.openSection ?? "Open section")
          : (labels?.openPage ?? "Open page")}
        <Kbd variant="light" xstyle={styles.actionKey}>
          <Kbd.Abbr keyValue="enter" />
        </Kbd>
      </GlassButton>
    </footer>
  );
}

function StaticSearchDialog({ open, onOpenChange }: SharedProps) {
  const glassRef = useGlassRef<HTMLDivElement>(
    undefined,
    true,
    false,
    "glass-medium",
    undefined,
    false,
    true,
  );
  const configuration = useContext(SearchConfiguration);
  if (!configuration) throw new Error("Search dialog requires DocumentationSearch.");
  const { from, initDB, triggers, labels, links, allowEmpty = false } = configuration;
  const restoreFocus = useRef<Element | null>(null);
  const router = useRouter();
  const [active, setActive] = useState<DocumentationSearchResult>();
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
      !search.trim() && links?.length
        ? links.map(([content, url]) => ({ id: url, type: "page" as const, content, url }))
        : query.data === "empty"
          ? allowEmpty
            ? []
            : null
          : query.data && compactSearchResults(query.data, search),
    [query.data, search, allowEmpty, links],
  );
  const results = query.error ? [] : (items ?? []);
  const selected = results.find((item) => item.id === active?.id);
  const onSelect = (item: DocumentationSearchResult) => {
    router.push(item.url);
    onOpenChange(false);
  };
  return (
    <Dialog.Root
      open={open}
      onOpenChange={(next, details) => {
        if (details.reason === "escape-key" && details.event.isComposing) {
          details.cancel();
          return;
        }
        onOpenChange(next);
      }}
      onOpenChangeComplete={(next) => {
        if (!next) setSearch("");
      }}
    >
      <Dialog.Portal>
        <div data-lenso-backdrop="live" {...stylex.props(styles.opticalScope)}>
          <Dialog.Backdrop
            data-state={open ? "open" : "closed"}
            data-docs-search-overlay=""
            {...stylex.props(styles.backdrop)}
          />
          <Dialog.Popup
            ref={glassRef}
            aria-label={labels?.trigger ?? "Search documentation"}
            aria-describedby={undefined}
            data-state={open ? "open" : "closed"}
            data-docs-search=""
            data-docs-search-glass="panel"
            initialFocus={() => {
              restoreFocus.current = document.activeElement;
              return true;
            }}
            finalFocus={() => {
              const original = restoreFocus.current;
              if (
                original instanceof HTMLElement &&
                original.isConnected &&
                original.getClientRects().length
              )
                return original;
              return (
                [...triggers.current].find(
                  (node) => node.isConnected && node.getClientRects().length,
                ) ?? false
              );
            }}
            {...stylex.props(
              materialStyles.root,
              liquidMaterialStyles.small,
              liquidMaterialStyles.medium,
              materialStyles.accessible,
              styles.popup,
            )}
          >
            <Command.Root<DocumentationSearchResult>
              xstyle={styles.opticalScope}
              items={results}
              value={search}
              onValueChange={setSearch}
              filter={false}
              itemToStringValue={(item) =>
                typeof item.content === "string" ? item.content : item.url
              }
              onItemHighlighted={(item) => setActive(item)}
            >
              <div {...stylex.props(styles.header)}>
                <SearchInput
                  search={search}
                  isLoading={query.isLoading}
                  onClose={() => onOpenChange(false)}
                />
                <CloseButton
                  xstyle={styles.close}
                  aria-label={labels?.close ?? "Close search"}
                  onClick={() => onOpenChange(false)}
                >
                  <Kbd variant="light" xstyle={styles.key}>
                    <Kbd.Content>esc</Kbd.Content>
                  </Kbd>
                </CloseButton>
              </div>
              {!search.trim() && !items?.length ? (
                <p {...stylex.props(styles.empty)}>
                  {labels?.hint ?? "Search by component name or topic."}
                </p>
              ) : query.error ? (
                <p role="alert" {...stylex.props(styles.empty)}>
                  {labels?.error ?? "Unable to load search. Close this dialog and try again."}
                </p>
              ) : (
                <>
                  <div {...stylex.props(styles.sectionLabel)}>
                    {search.trim()
                      ? (labels?.results ?? "Results")
                      : (labels?.suggestions ?? "Quick access")}
                  </div>
                  <ScrollShadow size={24} data-docs-search-scroll="" xstyle={styles.list}>
                    <Command.Empty xstyle={styles.listEmpty}>
                      <output {...stylex.props(styles.empty)}>
                        {labels?.empty ?? "No matching pages."}
                      </output>
                    </Command.Empty>
                    <Command.List
                      data-docs-search-results=""
                      aria-label={labels?.results ?? "Results"}
                      xstyle={styles.listContent}
                    >
                      {(item: DocumentationSearchResult) => (
                        <SearchResult
                          key={item.id}
                          item={item}
                          query={search}
                          onSelect={onSelect}
                        />
                      )}
                    </Command.List>
                  </ScrollShadow>
                </>
              )}
              <SearchActions selected={selected} onSelect={onSelect} />
            </Command.Root>
          </Dialog.Popup>
        </div>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function SearchTriggers({ compact }: { compact: boolean }) {
  const desktopRef = useSearchTriggerRef();
  const mobileRef = useSearchTriggerRef();
  const { setOpenSearch, hotKey } = useSearchContext();
  const label = useContext(SearchConfiguration)?.labels?.trigger ?? "Search documentation";
  if (compact) {
    return (
      <GlassButton
        isIconOnly
        ref={desktopRef}
        type="button"
        aria-label={label}
        data-docs-search-trigger=""
        onClick={() => setOpenSearch(true)}
        xstyle={notebook.glassIconButton}
      >
        <Magnifier width={16} height={16} aria-hidden="true" />
      </GlassButton>
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
          <span {...stylex.props(notebook.searchLabel)}>{label}</span>
          {hotKey.map((key, index) => (
            <kbd key={index} {...stylex.props(notebook.key)}>
              {key.display}
            </kbd>
          ))}
        </button>
      </div>
      <div {...stylex.props(notebook.headerMobile)}>
        <GlassButton
          isIconOnly
          ref={mobileRef}
          type="button"
          aria-label={label}
          data-docs-search-trigger=""
          onClick={() => setOpenSearch(true)}
          xstyle={notebook.glassIconButton}
        >
          <Magnifier width={18} height={18} aria-hidden="true" />
        </GlassButton>
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
  links,
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
      ...(links ? { links } : {}),
      ...(initDB !== undefined ? { initDB } : {}),
      ...(labels ? { labels } : {}),
    }),
    [from, triggers, allowEmpty, initDB, labels, links],
  );
  return (
    <SearchConfiguration value={configuration}>
      <SearchProvider SearchDialog={StaticSearchDialog}>
        {children ?? <SearchTriggers compact={compact} />}
      </SearchProvider>
    </SearchConfiguration>
  );
}
