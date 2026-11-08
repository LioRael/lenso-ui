"use client";

import { Button } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
import type { DemoPhoto } from "../lib/photos-library";
import { PhotoImage } from "./photos-image";

export type LibraryView = "years" | "months" | "all";
const s = stylex.create({
  root: { padding: "12px 20px 24px", minHeight: "calc(100dvh - 240px)" },
  note: { margin: "0 0 20px", fontSize: 13, color: "var(--lenso-label-secondary)" },
  cover: {
    display: "block",
    position: "relative",
    paddingInline: 0,
    paddingBlock: 0,
    width: "100%",
    maxWidth: 640,
    height: "min(58dvh, 480px)",
    overflow: "hidden",
    borderRadius: 28,
    textAlign: "start",
  },
  caption: {
    position: "absolute",
    inset: 0,
    display: "flex",
    flexDirection: "column",
    justifyContent: "end",
    padding: 24,
    color: "white",
    backgroundImage: "linear-gradient(transparent 40%, rgb(0 0 0 / .72))",
  },
  title: { fontSize: 32, fontWeight: 700, letterSpacing: "-.025em" },
  count: { fontSize: 15, marginTop: 6 },
});

export function PhotosLibraryOverview({
  view,
  photos,
  onViewChange,
}: {
  view: Exclude<LibraryView, "all">;
  photos: DemoPhoto[];
  onViewChange: (view: LibraryView) => void;
}) {
  const cover = photos.at(-1);
  if (!cover) return null;
  // The asset manifest records acquisition on November 4, 2026, not capture dates.
  const label = view === "years" ? "2026" : "November 2026";
  return (
    <section
      aria-label={view === "years" ? "Photos by year added" : "Photos by month added"}
      {...stylex.props(s.root)}
    >
      <p {...stylex.props(s.note)}>Sample library · grouped by date added</p>
      <Button
        variant="borderless"
        xstyle={s.cover}
        aria-label={`Open ${label}, ${photos.length} photos`}
        onClick={() => onViewChange(view === "years" ? "months" : "all")}
      >
        <PhotoImage photo={cover} />
        <span {...stylex.props(s.caption)}>
          <span {...stylex.props(s.title)}>{label}</span>
          <span {...stylex.props(s.count)}>
            {photos.length} {photos.length === 1 ? "photo" : "photos"}
          </span>
        </span>
      </Button>
    </section>
  );
}
