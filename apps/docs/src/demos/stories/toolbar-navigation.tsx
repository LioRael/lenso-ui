"use client";
import { useState, type ComponentProps } from "react";
import { ArrowLeft, Ellipsis, Plus } from "@gravity-ui/icons";
import { Toolbar } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
// Navigation is a page composition; Toolbar retains its native action/focus model.
const s = stylex.create({
  region: { width: "100%", minWidth: 0 },
  bar: { width: "100%", gridTemplateColumns: "1fr auto 1fr", gap: 8 },
  leading: { justifySelf: "start" },
  trailing: { justifySelf: "end" },
  title: { margin: 0, fontSize: 17, lineHeight: "22px", fontWeight: 600 },
  status: {
    display: "block",
    textAlign: "center",
    marginTop: 20,
    fontSize: 15,
    color: "var(--lenso-label-secondary)",
  },
});
export function NavigationToolbar(
  props: Pick<ComponentProps<typeof Toolbar>, "disabled" | "loopFocus">,
) {
  const [action, setAction] = useState("Album actions");
  return (
    <header {...stylex.props(s.region)}>
      <Toolbar {...props} aria-label="Album navigation and actions" xstyle={s.bar}>
        <Toolbar.Group xstyle={s.leading}>
          <Toolbar.Button
            isIconOnly
            aria-label="Back to library"
            onClick={() => setAction("Back to library requested")}
          >
            <ArrowLeft />
          </Toolbar.Button>
        </Toolbar.Group>
        <h2 {...stylex.props(s.title)}>Albums</h2>
        <Toolbar.Group xstyle={s.trailing}>
          <Toolbar.Button
            isIconOnly
            aria-label="New album"
            onClick={() => setAction("New album requested")}
          >
            <Plus />
          </Toolbar.Button>
          <Toolbar.Button
            isIconOnly
            aria-label="More album actions"
            onClick={() => setAction("More album actions requested")}
          >
            <Ellipsis />
          </Toolbar.Button>
        </Toolbar.Group>
      </Toolbar>
      <output {...stylex.props(s.status)}>{action}</output>
    </header>
  );
}
