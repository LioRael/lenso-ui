import * as stylex from "@stylexjs/stylex";

// HeroUI v3.2.6 component-item/category geometry, translated to StyleX.
// Apache-2.0. One native link per card preserves a single keyboard stop.
export const gallery = stylex.create({
  grid: {
    display: "grid",
    gridTemplateColumns: {
      default: "minmax(0, 1fr)",
      "@media (min-width: 640px)": "repeat(2, minmax(0, 1fr))",
      "@media (min-width: 1024px)": "repeat(3, minmax(0, 1fr))",
    },
    columnGap: 16,
    rowGap: 40,
  },
  item: {
    display: "flex",
    flexDirection: "column",
    gap: 9,
    minWidth: 0,
    color: "var(--foreground)",
    textDecoration: "none",
    borderRadius: 12,
    ":focus-visible": { outline: "2px solid var(--focus)", outlineOffset: 4 },
  },
  title: {
    order: { default: 1, "@media (min-width: 640px)": 2 },
    fontSize: 16,
    fontWeight: 500,
    lineHeight: "28px",
  },
  preview: {
    position: "relative",
    order: { default: 2, "@media (min-width: 640px)": 1 },
    height: 198,
    overflow: "hidden",
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: "var(--separator)",
  },
  image: {
    position: "absolute",
    inset: 0,
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  light: { display: { default: "block", ":is(.dark *)": "none" } },
  dark: { display: { default: "none", ":is(.dark *)": "block" } },
  description: { order: 2, color: "var(--muted)", fontSize: 14, lineHeight: "24px" },
});
