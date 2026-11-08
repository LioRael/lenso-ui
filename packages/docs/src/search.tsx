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
import { Kbd } from "@lenso/ui/kbd";
import { Spinner } from "@lenso/ui/spinner";
import { Magnifier, FileText, Hashtag } from "@gravity-ui/icons";
import { useDocsSearch, useHighlightQuery, type StaticOptions } from "fumadocs-core/search/client";
import {
  SearchProvider,
  useSearchContext,
  type SharedProps,
  type SearchLink,
} from "fumadocs-ui/contexts/search";
import { notebook } from "@lenso/docs/presentation";
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

function SearchInput({ isLoading, onClose }: { isLoading: boolean; onClose: () => void }) {
  const labels = useContext(SearchConfiguration)?.labels;
  return (
    <Command.InputGroup>
      <Command.SearchIcon />
      <Command.Input
        aria-label={labels?.input ?? "Search documentation"}
        placeholder={labels?.placeholder ?? "Search components and guides"}
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            event.preventDefault();
            if (!event.nativeEvent.isComposing) onClose();
          }
        }}
      />
      {isLoading && <Spinner size="sm" aria-label={labels?.loading ?? "Searching…"} />}
      <Command.Clear aria-label={labels?.clear ?? "Clear search"} />
    </Command.InputGroup>
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
      indent={item.type !== "page"}
    >
      <Command.Icon aria-hidden="true">
        <Icon width={20} height={20} />
      </Command.Icon>
      <Command.ItemBody>
        <Command.ItemContent ref={highlightRef}>
          <Command.ItemText>{item.content}</Command.ItemText>
          {item.summary && <Command.ItemDescription>{item.summary}</Command.ItemDescription>}
        </Command.ItemContent>
      </Command.ItemBody>
      <Command.ItemMeta>
        {item.type === "heading" ? (labels?.section ?? "Section") : (labels?.page ?? "Page")}
      </Command.ItemMeta>
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
    <Command.Footer>
      <Command.Hint>
        <Command.Key>
          <Kbd.Abbr keyValue="up" />
          <Kbd.Abbr keyValue="down" />
        </Command.Key>
        {labels?.navigate ?? "Navigate"}
      </Command.Hint>
      <Command.Action disabled={!selected} onClick={() => selected && onSelect(selected)}>
        {selected?.type === "heading"
          ? (labels?.openSection ?? "Open section")
          : (labels?.openPage ?? "Open page")}
        <Command.ActionKey>
          <Kbd.Abbr keyValue="enter" />
        </Command.ActionKey>
      </Command.Action>
    </Command.Footer>
  );
}

function StaticSearchDialog({ open, onOpenChange }: SharedProps) {
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
      <Command.Portal>
        <Command.Backdrop data-docs-search-overlay="" />
        <Command.Popup<DocumentationSearchResult>
          popupProps={{
            "aria-label": labels?.trigger ?? "Search documentation",
            "aria-describedby": undefined,
            "data-docs-search": "",
            "data-docs-search-glass": "panel",
            initialFocus: () => {
              restoreFocus.current = document.activeElement;
              return true;
            },
            finalFocus: () => {
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
            },
          }}
          items={results}
          value={search}
          onValueChange={setSearch}
          filter={false}
          itemToStringValue={(item) => (typeof item.content === "string" ? item.content : item.url)}
          onItemHighlighted={(item) => setActive(item)}
        >
          <Command.Header>
            <SearchInput isLoading={query.isLoading} onClose={() => onOpenChange(false)} />
            <Command.Close aria-label={labels?.close ?? "Close search"} />
          </Command.Header>
          {!search.trim() && !items?.length ? (
            <Command.Message>
              {labels?.hint ?? "Search by component name or topic."}
            </Command.Message>
          ) : query.error ? (
            <Command.Message role="alert">
              {labels?.error ?? "Unable to load search. Close this dialog and try again."}
            </Command.Message>
          ) : (
            <>
              <Command.SectionLabel>
                {search.trim()
                  ? (labels?.results ?? "Results")
                  : (labels?.suggestions ?? "Quick access")}
              </Command.SectionLabel>
              <Command.Viewport data-docs-search-scroll="">
                <Command.Empty>{labels?.empty ?? "No matching pages."}</Command.Empty>
                <Command.List data-docs-search-results="" aria-label={labels?.results ?? "Results"}>
                  {(item: DocumentationSearchResult) => (
                    <SearchResult key={item.id} item={item} query={search} onSelect={onSelect} />
                  )}
                </Command.List>
              </Command.Viewport>
            </>
          )}
          <SearchActions selected={selected} onSelect={onSelect} />
        </Command.Popup>
      </Command.Portal>
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
