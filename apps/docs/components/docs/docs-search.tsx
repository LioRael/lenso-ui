"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import * as stylex from "@stylexjs/stylex";
import { SearchIcon } from "lucide-react";

import { Dialog } from "@lenso/ui/dialog";
import { getDocsPageItems, getDocsSectionForPage } from "../../contents/catalog";
import { styles } from "./docs-search.stylex";

const pages = getDocsPageItems().filter((page) => !page.hidden);
const suggestedPages = [
  "overview",
  "quick-start",
  "tokens",
  "themes",
  "application-sidebar",
  "agent-page",
];

export function DocsSearch() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const normalizedQuery = query.trim().toLocaleLowerCase();
  const matches = normalizedQuery
    ? pages.filter((page) => {
        const section = getDocsSectionForPage(page.slug) ?? "";
        return `${page.label} ${section}`.toLocaleLowerCase().includes(normalizedQuery);
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

  return (
    <>
      <button
        aria-label="Search documentation"
        onClick={() => setOpen(true)}
        {...stylex.props(styles.trigger)}
        type="button"
      >
        <SearchIcon aria-hidden="true" {...stylex.props(styles.searchIcon)} />
        <span {...stylex.props(styles.triggerLabel)}>Search documentation</span>
        <kbd {...stylex.props(styles.shortcut)}>⌘ K</kbd>
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
              <Dialog.Title xstyle={styles.title}>Search documentation</Dialog.Title>
              <div {...stylex.props(styles.inputRow)}>
                <SearchIcon aria-hidden="true" {...stylex.props(styles.searchIcon)} />
                <input
                  aria-label="Search pages"
                  onChange={(event) => setQuery(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" && matches[0]) {
                      router.push(matches[0].href);
                      setOpen(false);
                    }
                  }}
                  placeholder="Search pages…"
                  ref={inputRef}
                  type="search"
                  value={query}
                  {...stylex.props(styles.input)}
                />
                <Dialog.Close aria-label="Close search" xstyle={styles.close} />
              </div>
              <div {...stylex.props(styles.results)}>
                {matches.length === 0 ? (
                  <p {...stylex.props(styles.empty)}>No matching pages.</p>
                ) : (
                  matches.map((page) => (
                    <Link
                      href={page.href}
                      key={page.slug}
                      onClick={() => setOpen(false)}
                      {...stylex.props(styles.result)}
                    >
                      <span>{page.label}</span>
                      <span {...stylex.props(styles.resultSection)}>
                        {getDocsSectionForPage(page.slug)}
                      </span>
                    </Link>
                  ))
                )}
              </div>
              <p {...stylex.props(styles.footer)}>Esc to close · Select a page to open</p>
            </Dialog.Popup>
          </Dialog.Viewport>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
}
