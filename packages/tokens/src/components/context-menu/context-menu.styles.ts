// Context menu geometry follows the supplied iOS/iPadOS 27 reference.
import * as stylex from "@stylexjs/stylex";
export const contextMenuStyles = stylex.create({
  trigger: {
    WebkitTouchCallout: "none",
    outline: { default: "none", ":focus-visible": "2px solid var(--lenso-focus-ring)" },
    outlineOffset: 3,
  },
  positioner: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    gap: 8,
    maxWidth: "calc(100vw - 16px)",
  },
  trailing: { alignItems: "flex-end" },
  horizontal: { "@media (min-width: 768px)": { flexDirection: "row", alignItems: "flex-start" } },
  horizontalTrailing: {
    "@media (min-width: 768px)": { flexDirection: "row-reverse", alignItems: "flex-start" },
  },
  compactPopup: {
    width: "max-content",
    borderRadius: 22,
    "--lg-menu-content-padding-block": "4px",
    "--lg-menu-content-padding-inline": "4px",
  },
  bar: { display: "flex", alignItems: "center" },
  barItem: {
    width: "auto",
    height: 36,
    minHeight: 36,
    paddingBlock: 0,
    flexShrink: 0,
    "::after": { display: "none" },
  },
  popup: { width: 250, maxWidth: "calc(100vw - 16px)", flexShrink: 0 },
  preview: {
    boxSizing: "border-box",
    width: 351,
    maxWidth: "calc(100vw - 16px)",
    minHeight: 160,
    borderRadius: 30,
    overflow: "hidden",
    backgroundColor: "var(--lenso-background-primary)",
    color: "var(--lenso-label-primary)",
    boxShadow: "0 0 32px rgb(0 0 0 / .2)",
    flexShrink: 1,
    pointerEvents: "none",
  },
  backdrop: {
    position: "fixed",
    inset: 0,
    zIndex: "calc(var(--lenso-z-index-overlay) - 1)",
    backgroundColor: "rgb(0 0 0 / .23)",
    opacity: { default: 1, ":is([data-starting-style], [data-ending-style])": 0 },
    transition: {
      default: "opacity 140ms ease",
      "@media (prefers-reduced-motion: reduce)": "none",
    },
  },
});
