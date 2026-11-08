"use client";

import { useState } from "react";
import { Button, GlassButton, GlassContainer } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
import { ToolbarGlassGroupStory } from "./toolbar-glass-group.js";

const s = stylex.create({
  root: { display: "flex", flexDirection: "column", alignItems: "center", gap: 24, width: "100%" },
  group: (gap: number) => ({
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexWrap: "wrap",
    gap,
    padding: 32,
    maxWidth: "100%",
    boxSizing: "border-box",
    transitionProperty: "gap",
    transitionDuration: { default: "650ms", "@media (prefers-reduced-motion: reduce)": "0ms" },
    transitionTimingFunction: "cubic-bezier(.22, 1, .36, 1)",
  }),
  note: {
    fontSize: 13,
    color: "var(--lenso-label-primary)",
    textAlign: "center",
    margin: 0,
    backgroundColor: "var(--lenso-background-primary)",
    borderRadius: 8,
    paddingBlock: 6,
    paddingInline: 8,
  },
});

export interface GlassContainerStoryProps {
  spacing?: number;
  gap?: number;
  elastic?: boolean;
  disabled?: boolean;
}

export function GlassContainerStory({
  spacing = 18,
  gap = 12,
  elastic = true,
  disabled = false,
}: GlassContainerStoryProps) {
  const [separated, setSeparated] = useState(false);
  const [count, setCount] = useState(0);
  return (
    <div {...stylex.props(s.root)}>
      <GlassButton
        elastic={elastic}
        aria-label="Standalone Add"
        onClick={() => setCount(count + 1)}
      >
        Add
      </GlassButton>
      <GlassContainer spacing={spacing} disabled={disabled} xstyle={s.group(separated ? 48 : gap)}>
        <GlassButton
          elastic={elastic}
          onClick={() => setCount(count + 1)}
          aria-label="Circle action"
          isIconOnly
          icon={
            <svg viewBox="0 0 28 28" fill="none">
              <path
                d="M5 8h18M7 14h14M10 20h8"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          }
        ></GlassButton>
        <GlassButton elastic={elastic} aria-label="Add" onClick={() => setCount(count + 1)}>
          Add
        </GlassButton>
      </GlassContainer>
      <Button
        variant="bordered"
        size="sm"
        onClick={() => setSeparated(!separated)}
        aria-expanded={separated}
      >
        {separated ? "Connect" : "Separate"}
      </Button>
      <p {...stylex.props(s.note)}>
        Hold either glass control to enlarge. Change spacing with the separate control.{" "}
        <output aria-live="polite">{count} added</output>
      </p>
      <ToolbarGlassGroupStory />
    </div>
  );
}
