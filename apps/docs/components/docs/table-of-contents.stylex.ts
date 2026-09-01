import * as stylex from "@stylexjs/stylex";

export const styles = stylex.create({
  root: {
    display: "flex",
    flex: "none",
    flexDirection: "column",
    gap: "8px",
    position: "sticky",
    top: "40px",
    width: "220px",
  },
  label: {
    color: "var(--color-content-tertiary)",
    fontSize: "11px",
    fontWeight: 500,
    lineHeight: "16px",
    margin: 0,
    width: "220px",
  },
  items: {
    display: "flex",
    flexDirection: "column",
    gap: "2px",
    position: "relative",
    width: "220px",
  },
  item: {
    alignItems: "center",
    borderRadius: "var(--radius-control)",
    color: "var(--color-content-tertiary)",
    display: "flex",
    fontSize: "12px",
    height: "28px",
    lineHeight: "18px",
    padding: "0 8px 0 18px",
    textDecoration: "none",
    transition: "background-color 120ms ease-out, color 120ms ease-out",
    width: "220px",
    ":hover": {
      backgroundColor: "var(--docs-sidebar-hover)",
    },
    ":focus-visible": {
      boxShadow: "inset 0 0 0 1px var(--color-focus-ring)",
      outline: "none",
    },
    "@media (prefers-reduced-motion: reduce)": {
      transitionDuration: "0ms",
    },
  },
  activeItem: {
    color: "var(--docs-fg-primary)",
  },
  indicator: {
    backgroundColor: "var(--docs-fg-primary)",
    borderRadius: "1px",
    height: "16px",
    left: "8px",
    opacity: 0,
    pointerEvents: "none",
    position: "absolute",
    top: 0,
    transform: "translateY(6px)",
    transition:
      "transform 180ms cubic-bezier(0.22, 1, 0.36, 1), height 150ms ease-out, opacity 120ms ease-out",
    width: "2px",
    willChange: "transform",
    zIndex: 1,
    "@media (prefers-reduced-motion: reduce)": {
      transitionDuration: "0ms",
    },
  },
  readyIndicator: {
    opacity: 1,
  },
});
