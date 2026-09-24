"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import * as stylex from "@stylexjs/stylex";
import { SearchIcon } from "lucide-react";

import { Dialog } from "@lenso/ui/dialog";
import { CommandMenu } from "@lenso/ui/command-menu";
import { getDocsPageItems, getDocsSectionForPage } from "../../contents/catalog";
import { styles } from "./docs-search.stylex";

const pages = getDocsPageItems().filter((page) => !page.hidden);
const suggestedPages = ["overview", "quick-start", "tokens", "themes", "console-workspace"];
type SearchEntry = { href: string; title: string; description: string; body: string };

export function DocsSearch() {
  const triggerProps = stylex.props(styles.trigger);
  const labelProps = stylex.props(styles.triggerLabel);
  const shortcutProps = stylex.props(styles.shortcut);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [searchText, setSearchText] = useState<Record<string, string>>({});
  const normalizedQuery = query.trim().toLocaleLowerCase();
  const matches = normalizedQuery
    ? pages.filter((page) => {
        const section = getDocsSectionForPage(page.slug) ?? "";
        return `${page.label} ${section} ${searchText[page.href] ?? ""}`
          .toLocaleLowerCase()
          .includes(normalizedQuery);
      })
    : suggestedPages.flatMap((slug) => pages.filter((page) => page.slug === slug));

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLocaleLowerCase() === "k") {
        event.preventDefault();
        setOpen(true);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  useEffect(() => {
    if (!open || Object.keys(searchText).length > 0) return;
    const controller = new AbortController();
    fetch("/search.json", { signal: controller.signal })
      .then((response) => (response.ok ? (response.json() as Promise<SearchEntry[]>) : []))
      .then((entries) =>
        setSearchText(
          Object.fromEntries(
            entries.map((entry) => [entry.href, `${entry.description} ${entry.body}`]),
          ),
        ),
      )
      .catch(() => {});
    return () => controller.abort();
  }, [open, searchText]);

  return (
    <>
      <button
        aria-label="Search documentation"
        onClick={() => setOpen(true)}
        {...triggerProps}
        className={`${triggerProps.className} docs-search-trigger`}
        type="button"
      >
        <SearchIcon aria-hidden="true" {...stylex.props(styles.searchIcon)} />
        <span {...labelProps} className={`${labelProps.className} docs-search-label`}>
          Search documentation
        </span>
        <kbd {...shortcutProps} className={`${shortcutProps.className} docs-search-shortcut`}>
          ⌘ K
        </kbd>
      </button>
      <Dialog.Root
        onOpenChange={(nextOpen) => {
          setOpen(nextOpen);
          if (!nextOpen) setQuery("");
        }}
        open={open}
      >
        <Dialog.Portal container={open ? document.getElementById("docs-theme-root") : null}>
          <Dialog.Backdrop xstyle={styles.backdrop} />
          <Dialog.Viewport xstyle={styles.viewport}>
            <Dialog.Popup xstyle={styles.popup}>
              <CommandMenu.Root<(typeof pages)[number]>
                autoHighlight
                filter={() => true}
                inputValue={query}
                items={matches}
                onInputValueChange={setQuery}
                onValueChange={(page) => {
                  if (!page) return;
                  router.push(page.href);
                  setOpen(false);
                }}
              >
                <CommandMenu.Panel xstyle={styles.commandPanel}>
                  <Dialog.Title xstyle={styles.title}>Search documentation</Dialog.Title>
                  <CommandMenu.Search xstyle={styles.commandSearch}>
                    <SearchIcon aria-hidden="true" {...stylex.props(styles.searchIcon)} />
                    <CommandMenu.Input
                      aria-label="Search pages"
                      placeholder="Search pages…"
                      ref={inputRef}
                    />
                    <Dialog.Close aria-label="Close search" xstyle={styles.close} />
                  </CommandMenu.Search>
                  <CommandMenu.GroupLabel>
                    {normalizedQuery ? "Pages" : "Suggested pages"}
                  </CommandMenu.GroupLabel>
                  <CommandMenu.List xstyle={styles.results}>
                    {(page: (typeof pages)[number]) => (
                      <CommandMenu.Item key={page.slug} value={page}>
                        <CommandMenu.ItemText>{page.label}</CommandMenu.ItemText>
                        <span {...stylex.props(styles.resultSection)}>
                          {getDocsSectionForPage(page.slug)}
                        </span>
                      </CommandMenu.Item>
                    )}
                  </CommandMenu.List>
                  <CommandMenu.Empty>No matching pages.</CommandMenu.Empty>
                  <p {...stylex.props(styles.footer)}>Esc to close · Select a page to open</p>
                </CommandMenu.Panel>
              </CommandMenu.Root>
            </Dialog.Popup>
          </Dialog.Viewport>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
}
