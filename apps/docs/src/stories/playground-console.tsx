"use client";

/* oxlint-disable jsx-a11y/no-noninteractive-tabindex -- The scrollable log needs keyboard access. */
/* oxlint-disable jsx-a11y/no-redundant-roles -- Safari needs an explicit list role when list-style is none. */

import { useCallback, useLayoutEffect, useRef, useState } from "react";
import { Button } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
import { useStoryLocale } from "./story-context";

interface Entry {
  id: number;
  message: string;
}

export function usePlaygroundConsole() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const nextId = useRef(0);
  const log = useCallback((message: string) => {
    const entry = { id: nextId.current++, message };
    setEntries((entries) => [...entries.slice(-199), entry]);
  }, []);
  const clear = useCallback(() => setEntries([]), []);
  return { entries, log, clear };
}

const s = stylex.create({
  root: {
    width: "100%",
    minWidth: 0,
    backgroundColor: "var(--lenso-background-secondary)",
    borderTopWidth: 1,
    borderTopStyle: "solid",
    borderTopColor: "var(--lenso-separator)",
  },
  toolbar: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    minHeight: 40,
    paddingInline: 16,
    fontSize: 12,
    color: "var(--lenso-label-secondary)",
  },
  clear: { fontSize: 12, minHeight: 32, paddingInline: 8 },
  output: {
    height: 112,
    minWidth: 0,
    overflowY: "auto",
    overscrollBehaviorY: "contain",
    scrollbarGutter: "stable",
    paddingInline: 16,
    paddingBottom: 8,
    fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
    fontSize: 12,
    lineHeight: "18px",
    color: "var(--lenso-label-primary)",
    overflowWrap: "anywhere",
    outline: { default: "none", ":focus-visible": "2px solid var(--lenso-focus-ring)" },
    outlineOffset: -2,
  },
  list: { listStyle: "none", padding: 0, margin: 0 },
  row: {
    paddingBlock: 3,
    borderBottomWidth: { default: 1, ":last-child": 0 },
    borderBottomStyle: "solid",
    borderBottomColor: "var(--lenso-separator)",
  },
  empty: { margin: 0, paddingBlock: 3, color: "var(--lenso-label-secondary)" },
});

export function PlaygroundConsole({
  entries,
  clear,
  label,
  empty,
}: {
  entries: readonly Entry[];
  clear: () => void;
  label: string;
  empty: string;
}) {
  const cn = useStoryLocale() === "cn";
  const viewport = useRef<HTMLDivElement>(null);
  const follow = useRef(true);
  useLayoutEffect(() => {
    const node = viewport.current;
    if (!node) return;
    if (!entries.length) {
      follow.current = true;
      node.scrollTop = 0;
    } else if (follow.current) node.scrollTop = node.scrollHeight;
  }, [entries]);
  return (
    <section aria-label="Console" {...stylex.props(s.root)}>
      <div {...stylex.props(s.toolbar)}>
        <span>Console</span>
        <Button variant="borderless" xstyle={s.clear} disabled={!entries.length} onClick={clear}>
          {cn ? "清空" : "Clear"}
        </Button>
      </div>
      <div
        ref={viewport}
        role="log"
        aria-label={label}
        tabIndex={0}
        onScroll={(event) => {
          const node = event.currentTarget;
          follow.current = node.scrollHeight - node.clientHeight - node.scrollTop <= 4;
        }}
        {...stylex.props(s.output)}
      >
        {entries.length ? (
          <ul role="list" {...stylex.props(s.list)}>
            {entries.map(({ id, message }) => (
              <li key={id} {...stylex.props(s.row)}>
                {message}
              </li>
            ))}
          </ul>
        ) : (
          <p {...stylex.props(s.empty)}>{empty}</p>
        )}
      </div>
    </section>
  );
}
