"use client";

import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import Link from "next/link";
import * as stylex from "@stylexjs/stylex";
import { BookOpen, Magnifier, Xmark } from "@gravity-ui/icons";
import { Modal } from "@lenso/ui";
import { notebook } from "@/styles/notebook.stylex";

export interface SearchEntry {
  label: string;
  href?: string;
  status?: "new" | "new-dot" | "preview" | "updated";
  statusLabel?: string;
  children?: SearchEntry[];
  defaultOpen?: boolean;
}

const normalize = (value: string) => value.toLocaleLowerCase().replace(/[\s_-]+/g, "");

export function SearchDialog({ entries }: { entries: SearchEntry[] }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const input = useRef<HTMLInputElement>(null);
  const results = useRef<HTMLDivElement>(null);
  const filtered = query.trim()
    ? entries.filter((entry) => normalize(entry.label).includes(normalize(query)))
    : entries.slice(0, 12);

  useEffect(() => {
    const shortcut = (event: globalThis.KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen((value) => !value);
      }
    };
    document.addEventListener("keydown", shortcut);
    return () => document.removeEventListener("keydown", shortcut);
  }, []);

  function navigateResults(event: KeyboardEvent<HTMLElement>) {
    if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
    const links = [...(results.current?.querySelectorAll<HTMLAnchorElement>("a") ?? [])];
    if (links.length === 0) return;
    event.preventDefault();
    const index = links.findIndex((link) => link === document.activeElement);
    if (index === 0 && event.key === "ArrowUp") input.current?.focus();
    else
      links[(index + (event.key === "ArrowDown" ? 1 : -1) + links.length) % links.length]?.focus();
  }

  return (
    <Modal.Root
      open={open}
      onOpenChange={(value) => {
        setOpen(value);
        if (!value) setQuery("");
      }}
    >
      <div {...stylex.props(notebook.headerDesktop, notebook.searchContainer)}>
        <Modal.Trigger aria-label="Search documentation" xstyle={notebook.searchTrigger}>
          <Magnifier width={16} height={16} aria-hidden="true" />
          <span {...stylex.props(notebook.searchLabel)}>Search</span>
          <kbd {...stylex.props(notebook.key)}>⌘</kbd>
          <kbd {...stylex.props(notebook.key)}>K</kbd>
        </Modal.Trigger>
      </div>
      <div {...stylex.props(notebook.headerMobile)}>
        <Modal.Trigger aria-label="Search documentation" xstyle={notebook.iconButton}>
          <Magnifier width={18} height={18} aria-hidden="true" />
        </Modal.Trigger>
      </div>
      <Modal.Portal>
        <Modal.Backdrop xstyle={notebook.backdrop} />
        <Modal.Popup initialFocus={input} xstyle={notebook.searchPopup}>
          <Modal.Title xstyle={notebook.hidden}>Search documentation</Modal.Title>
          <Modal.Description xstyle={notebook.hidden}>
            Search page titles. Use arrow keys to browse results and Enter to open a page.
          </Modal.Description>
          <div {...stylex.props(notebook.searchBar)}>
            <Magnifier width={20} height={20} aria-hidden="true" />
            <input
              ref={input}
              type="search"
              aria-label="Find a page"
              placeholder="Search documentation…"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onKeyDown={navigateResults}
              {...stylex.props(notebook.searchInput)}
            />
            <Modal.Close
              aria-label="Close search"
              xstyle={[notebook.iconButton, notebook.staticClose]}
            >
              <Xmark width={16} height={16} aria-hidden="true" />
            </Modal.Close>
          </div>
          <div ref={results} {...stylex.props(notebook.searchResults)}>
            {filtered.map(
              (entry) =>
                entry.href && (
                  <Link
                    key={entry.href}
                    href={entry.href}
                    onClick={() => setOpen(false)}
                    onKeyDown={navigateResults}
                    {...stylex.props(notebook.searchResult)}
                  >
                    <BookOpen width={16} height={16} aria-hidden="true" />
                    {entry.label}
                  </Link>
                ),
            )}
            {filtered.length === 0 && <output>No matching pages.</output>}
          </div>
          <p {...stylex.props(notebook.searchHelp)}>↑ ↓ Navigate · Enter Open · Esc Close</p>
        </Modal.Popup>
      </Modal.Portal>
    </Modal.Root>
  );
}
