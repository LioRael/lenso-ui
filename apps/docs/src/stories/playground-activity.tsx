"use client";

import { useCallback, useEffect, type ReactNode, type MouseEvent } from "react";
import { observe } from "@ui-sdk/core/observe";
import * as stylex from "@stylexjs/stylex";
import { useStoryLocale } from "./story-context";
import { PlaygroundConsole, usePlaygroundConsole } from "./playground-console";
import { PlaygroundLog } from "../demos/shared/playground-log";

const listeners = new Set<(message: string) => void>();
function format(value: unknown): string {
  if (typeof value === "string") return value;
  try {
    return JSON.stringify(value) ?? String(value);
  } catch {
    return String(value);
  }
}
// Register before SDK children mount so the stream includes their initial registration.
const stop =
  typeof window === "undefined"
    ? undefined
    : observe(
        (change) => {
          const message = `${change.label || change.component} · ${change.key}: ${format(change.value)} · ${change.source}`;
          for (const listener of listeners) listener(message);
        },
        { within: () => document.querySelector("[data-playground-activity] [data-story-preview]") },
      );
import.meta.hot?.dispose(() => stop?.());

const s = stylex.create({
  root: {
    display: "flex",
    flexDirection: "column",
    minWidth: 0,
    overflow: "hidden",
    borderRadius: "var(--lenso-shape-content-2xl)",
    backgroundColor: "var(--lenso-background-secondary)",
  },
  content: { flex: 1, display: "flex", alignItems: "center", minWidth: 0, width: "100%" },
});

export function PlaygroundActivity({
  children,
  enabled,
}: {
  children: ReactNode;
  enabled: boolean;
}) {
  const cn = useStoryLocale() === "cn";
  const { entries, log: append, clear } = usePlaygroundConsole();
  const log = useCallback(
    (...values: unknown[]) => {
      const message = values.map(format).join(" ");
      append(message);
    },
    [append],
  );
  useEffect(() => {
    if (!enabled) return;
    listeners.add(log);
    return () => {
      listeners.delete(log);
    };
  }, [enabled, log]);
  function action(event: MouseEvent) {
    if (!(event.target instanceof Element)) return;
    const button = event.target.closest('button, [role="menuitem"], [role="option"]');
    const role = button?.getAttribute("role");
    if (
      (role && role !== "button" && role !== "menuitem") ||
      button?.hasAttribute("aria-haspopup") ||
      button?.getAttribute("aria-disabled") === "true"
    )
      return;
    const name = button?.getAttribute("aria-label") || button?.textContent?.trim();
    if (name) log(`${name} · click`);
  }
  if (!enabled) return children;
  return (
    <PlaygroundLog value={log}>
      <div data-playground-activity {...stylex.props(s.root)}>
        <div onClickCapture={action} {...stylex.props(s.content)}>
          {children}
        </div>
        <PlaygroundConsole
          entries={entries}
          clear={clear}
          label={cn ? "交互记录" : "Interaction log"}
          empty={cn ? "等待交互…" : "Waiting for an interaction…"}
        />
      </div>
    </PlaygroundLog>
  );
}
