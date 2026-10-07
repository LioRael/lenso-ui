import * as stylex from "@stylexjs/stylex";

// Fumadocs 16.9.0 / @fumadocs/tailwind 0.0.5 (MIT), resolved with HeroUI
// e385ac2 global.css (Apache-2.0). Adapted to shared native HTML/StyleX rules.
// Original MIT notice: ../../LICENSE.FUMADOCS.
export const prose = stylex.create({
  scroll: {
    position: "relative",
    maxWidth: "100%",
    overflow: "auto",
    marginBlock: 24,
    ":focus-visible": { outline: "2px solid var(--focus)", outlineOffset: 3 },
  },
  table: {
    width: "100%",
    tableLayout: "auto",
    borderCollapse: "separate",
    borderSpacing: 0,
    borderWidth: 0,
    backgroundColor: "transparent",
    fontSize: 14,
    lineHeight: "24px",
    textAlign: "start",
  },
  cell: {
    padding: 10,
    borderWidth: 0,
    textAlign: "start",
    verticalAlign: "top",
    backgroundColor: "transparent",
    overflowWrap: "normal",
  },
  header: {
    fontWeight: 600,
    color: "var(--foreground)",
    backgroundColor: {
      default: "var(--default)",
      ":is(.dark *)": "color-mix(in oklab, var(--default) 50%, transparent)",
    },
    ":first-child": { borderStartStartRadius: 12, borderEndStartRadius: 12 },
    ":last-child": { borderStartEndRadius: 12, borderEndEndRadius: 12 },
  },
  code: {
    fontFamily:
      'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
    fontSize: 13,
    fontWeight: 400,
    color: "inherit",
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: "var(--separator)",
    borderRadius: 5,
    backgroundColor: "transparent",
    padding: 3,
  },
  link: {
    color: "var(--foreground)",
    fontWeight: 500,
    textDecoration: "underline",
    textUnderlineOffset: 3.5,
    textDecorationThickness: 1.5,
    textDecorationColor: "var(--color-fd-primary)",
    transitionProperty: "opacity",
    transitionDuration: "200ms",
    ":hover": { opacity: 0.8 },
    ":focus-visible": { outline: "2px solid var(--focus)", outlineOffset: 3 },
    "@media (prefers-reduced-motion: reduce)": { transitionDuration: "0ms" },
  },
});
