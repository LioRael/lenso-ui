"use client";

import { useRef } from "react";
import * as stylex from "@stylexjs/stylex";
import { Magnifier } from "@gravity-ui/icons";
import { Kbd } from "@lenso/ui";
import { useDocsSearch } from "fumadocs-core/search/client";
import { create } from "@orama/orama";
import { createTokenizer } from "@orama/tokenizers/mandarin";
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
import { notebook } from "@/styles/notebook.stylex";
import { search as styles } from "@/styles/search.stylex";

// HeroUI e385ac2 visual overrides (Apache-2.0). Fumadocs owns dialog, selection,
// scrolling and static search; MIT attribution remains in ../LICENSE.FUMADOCS.
export interface SearchEntry {
  label: string;
  href?: string;
  status?: "new" | "new-dot" | "preview" | "updated";
  statusLabel?: string;
  children?: SearchEntry[];
  defaultOpen?: boolean;
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

function StaticSearchDialog({ open, onOpenChange, locale }: SharedProps & { locale: string }) {
  const restoreFocus = useRef<Element | null>(null);
  const { search, setSearch, query } = useDocsSearch(
    {
      type: "static",
      from: `/search/${locale}.json`,
      allowEmpty: true,
      search: { limit: 60 },
      initOrama: () =>
        create({
          schema: { _: "string" },
          components: locale === "cn" ? { tokenizer: createTokenizer() } : undefined,
        }),
    },
    [locale],
  );
  const items = query.data === "empty" ? [] : query.data;
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
          if (restoreFocus.current instanceof HTMLElement) restoreFocus.current.focus();
        }}
        {...stylex.props(styles.popup)}
      >
        <SearchDialogHeader {...stylex.props(styles.header)}>
          <SearchDialogIcon aria-hidden="true" {...stylex.props(styles.icon)} />
          <SearchDialogInput aria-label="Find a page" placeholder="Search documentation…" />
          <SearchDialogClose aria-label="Close search" {...stylex.props(styles.close)}>
            <Kbd>
              <Kbd.Content>ESC</Kbd.Content>
            </Kbd>
          </SearchDialogClose>
        </SearchDialogHeader>
        <SearchDialogList
          items={items}
          Empty={() => <output {...stylex.props(styles.empty)}>No matching pages.</output>}
          Item={(props) => <SearchResult {...props} />}
          {...stylex.props(styles.list)}
        />
      </SearchDialogContent>
    </FumaSearchDialog>
  );
}

function SearchTriggers() {
  const { setOpenSearch, hotKey } = useSearchContext();
  return (
    <>
      <div {...stylex.props(notebook.headerDesktop, notebook.searchContainer)}>
        <button
          type="button"
          aria-label="Search documentation"
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
          type="button"
          aria-label="Search documentation"
          onClick={() => setOpenSearch(true)}
          {...stylex.props(notebook.iconButton)}
        >
          <Magnifier width={18} height={18} aria-hidden="true" />
        </button>
      </div>
    </>
  );
}

export function SearchDialog({ locale }: { locale: string }) {
  return (
    <SearchProvider SearchDialog={(props) => <StaticSearchDialog {...props} locale={locale} />}>
      <SearchTriggers />
    </SearchProvider>
  );
}
