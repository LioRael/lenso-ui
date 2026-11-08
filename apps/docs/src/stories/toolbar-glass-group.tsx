"use client";

import { useState } from "react";
import { Button, Toolbar } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";

const s = stylex.create({
  root: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 12,
    maxWidth: "100%",
  },
  caption: {
    margin: 0,
    paddingBlock: 6,
    paddingInline: 8,
    borderRadius: 8,
    color: "var(--lenso-label-primary)",
    backgroundColor: "var(--lenso-background-primary)",
    fontSize: 13,
    textAlign: "center",
  },
});

export function ToolbarGlassGroupStory({
  orientation = "horizontal",
}: {
  orientation?: "horizontal" | "vertical";
}) {
  const [detached, setDetached] = useState(false);
  const [value, setValue] = useState(0);
  return (
    <section {...stylex.props(s.root)} aria-label="Detachable toolbar example">
      <Toolbar aria-label="Value controls" orientation={orientation}>
        <Toolbar.Group isDetached={detached} aria-label="Grouped actions">
          <Toolbar.Button onClick={() => setValue((current) => current - 1)}>
            Decrease
          </Toolbar.Button>
          <Toolbar.Button onClick={() => setValue((current) => current + 1)}>
            Increase
          </Toolbar.Button>
        </Toolbar.Group>
      </Toolbar>
      <Button size="sm" variant="bordered" onClick={() => setDetached((current) => !current)}>
        {detached ? "Join group" : "Split group"}
      </Button>
      <p {...stylex.props(s.caption)}>
        One toolbar group, two independent controls.{" "}
        <output aria-live="polite">Value: {value}</output>
      </p>
    </section>
  );
}
