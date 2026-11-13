"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useEffectEvent,
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
import { useDocumentationMessages } from "./i18n";

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

function SearchWarmup() {
  const configuration = useContext(SearchConfiguration)!;
  const { open, setOpenSearch, hotKey } = useSearchContext();
  const { from, initDB } = configuration;
  const prepareDialog = useEffectEvent(() => {
    // Initializing Fumadocs' deferred open state mounts the dialog without showing it.
    if (!open) setOpenSearch(false);
  });
  useEffect(() => {
    let started = false;
    const prepare = () => {
      if (started) return;
      started = true;
      prepareDialog();
      // Warm the same URL-keyed database used by the dialog, in parallel with its code.
      void import("fumadocs-core/search/client/orama-static")
        .then(({ staticClient }) =>
          staticClient({ from, ...(initDB !== undefined ? { initDB } : {}) }).search(""),
        )
        .catch(() => {
          // Speculative loading must not interrupt reading; the dialog owns search errors.
        });
    };
    const onIntent = (event: Event) => {
      if (event.target instanceof Element && event.target.closest("[data-docs-search-trigger]"))
        prepare();
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (
        !event.defaultPrevented &&
        !event.isComposing &&
        hotKey.every(({ key }) => (typeof key === "string" ? event.key === key : key(event)))
      )
        prepare();
    };
    document.addEventListener("pointerover", onIntent);
    document.addEventListener("pointerdown", onIntent);
    document.addEventListener("focusin", onIntent);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerover", onIntent);
      document.removeEventListener("pointerdown", onIntent);
      document.removeEventListener("focusin", onIntent);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [from, initDB, hotKey]);
  return null;
}

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

export function useDocumentationSearchTrigger() {
  const configuration = useContext(SearchConfiguration);
  const { setOpenSearch } = useSearchContext();
  const registry = configuration?.triggers;
  const previous = useRef<HTMLElement | null>(null);
  const ref = useCallback(
    (node: HTMLElement | null) => {
      if (previous.current) registry?.current.delete(previous.current);
      if (node) registry?.current.add(node);
      previous.current = node;
    },
    [registry],
  );
  return {
    ref,
    onClick: (event: MouseEvent<HTMLElement>) => {
      configuration?.rememberTrigger(event.currentTarget);
      setOpenSearch(true);
    },
  };
}

function SearchTriggers({ compact }: { compact: boolean }) {
  const desktopTrigger = useDocumentationSearchTrigger();
  const mobileTrigger = useDocumentationSearchTrigger();
  const { hotKey } = useSearchContext();
  const configuration = useContext(SearchConfiguration);
  const label = configuration?.labels?.trigger ?? "Search documentation";
  if (compact) {
    return (
      <GlassButton
        isIconOnly
        {...desktopTrigger}
        type="button"
        aria-label={label}
        aria-keyshortcuts="Meta+K Control+K"
        data-docs-search-trigger=""
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
          {...desktopTrigger}
          type="button"
          aria-label={label}
          data-docs-search-trigger=""
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
          {...mobileTrigger}
          type="button"
          aria-label={label}
          data-docs-search-trigger=""
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
  labels: customLabels,
  allowEmpty = false,
  links,
}: DocumentationSearchProps) {
  const messages = useDocumentationMessages();
  const labels = useMemo(() => ({ ...messages.search, ...customLabels }), [messages, customLabels]);
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
        <SearchWarmup />
        {children ?? <SearchTriggers compact={compact} />}
      </SearchProvider>
    </SearchConfiguration>
  );
}
