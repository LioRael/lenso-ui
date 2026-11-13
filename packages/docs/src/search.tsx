"use client";

import {
  createContext,
  useContext,
  useMemo,
  useRef,
  lazy,
  type ReactNode,
  type RefObject,
  type MouseEvent,
} from "react";
import * as stylex from "@stylexjs/stylex";
import { GlassButton } from "@lenso/ui/glass-button";
import { Magnifier } from "@gravity-ui/icons";
import type { StaticOptions } from "fumadocs-core/search/client";
import { SearchProvider, useSearchContext, type SearchLink } from "fumadocs-ui/contexts/search";
import { notebook, headerControls } from "@lenso/docs/presentation";

// Fumadocs owns static search; Command and UI SDK own interactive behavior.
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

export const SearchConfiguration = createContext<
  | (Pick<DocumentationSearchProps, "from" | "initDB" | "labels" | "allowEmpty" | "links"> & {
      triggers: RefObject<Set<HTMLElement>>;
      rememberTrigger: (element: HTMLElement) => void;
      takeTrigger: () => HTMLElement | null;
    })
  | null
>(null);

const SearchRevision = createContext("");
const StaticSearchDialog = lazy(() => import("./search-dialog"));

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

function SearchTriggers({ compact }: { compact: boolean }) {
  const desktopRef = useSearchTriggerRef();
  const mobileRef = useSearchTriggerRef();
  const { setOpenSearch, hotKey } = useSearchContext();
  const configuration = useContext(SearchConfiguration);
  const label = configuration?.labels?.trigger ?? "Search documentation";
  const openSearch = (event: MouseEvent<HTMLElement>) => {
    configuration?.rememberTrigger(event.currentTarget);
    setOpenSearch(true);
  };
  if (compact) {
    return (
      <GlassButton
        isIconOnly
        ref={desktopRef}
        type="button"
        aria-label={label}
        aria-keyshortcuts="Meta+K Control+K"
        data-docs-search-trigger=""
        onClick={openSearch}
        xstyle={[headerControls.control, headerControls.icon]}
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
          onClick={openSearch}
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
          onClick={openSearch}
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
  const returnFocus = useRef<HTMLElement | null>(null);
  const configuration = useMemo(
    () => ({
      from,
      triggers,
      rememberTrigger: (element: HTMLElement) => {
        returnFocus.current = element;
      },
      takeTrigger: () => {
        const element = returnFocus.current;
        returnFocus.current = null;
        return element;
      },
      allowEmpty,
      ...(links ? { links } : {}),
      ...(initDB !== undefined ? { initDB } : {}),
      ...(labels ? { labels } : {}),
    }),
    [from, triggers, returnFocus, allowEmpty, initDB, labels, links],
  );
  return (
    <SearchConfiguration value={configuration}>
      <SearchProvider SearchDialog={StaticSearchDialog} preload={false}>
        {children ?? <SearchTriggers compact={compact} />}
      </SearchProvider>
    </SearchConfiguration>
  );
}
