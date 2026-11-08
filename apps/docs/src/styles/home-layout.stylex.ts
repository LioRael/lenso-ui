// Copyright 2025 NextUI Inc.
// Modified: Lenso StyleX navigation and responsive disclosure.
import * as stylex from "@stylexjs/stylex";

export const homeLayout = stylex.create({
  container: {
    display: "flex",
    flexDirection: "column",
    minHeight: "100dvh",
    minWidth: 0,
    fontFamily: "var(--lenso-font-body)",
    color: "var(--lenso-label-primary)",
    backgroundColor: "var(--lenso-background-primary)",
  },
  header: {
    position: "relative",
    zIndex: 10,
    width: "100%",
    borderBottomWidth: 1,
    borderBottomStyle: "solid",
    borderBottomColor: "var(--lenso-separator)",
  },
  headerInner: {
    display: "flex",
    alignItems: "center",
    gap: 32,
    minHeight: 72,
    maxWidth: 1400,
    marginInline: "auto",
    paddingInline: 24,
  },
  brand: {
    flexShrink: 0,
    fontSize: 23,
    lineHeight: 1.2,
    fontWeight: 600,
    letterSpacing: "-0.04em",
    color: "var(--lenso-label-primary)",
    textDecorationLine: "none",
  },
  navigation: {
    display: { default: "none", "@media (min-width: 1024px)": "flex" },
    alignItems: "center",
    gap: 24,
  },
  navLink: {
    display: "inline-flex",
    alignItems: "center",
    minHeight: 44,
    fontSize: 14,
    color: "var(--lenso-label-primary)",
    textDecorationLine: "none",
    ":hover": { color: "var(--lenso-tint-text)" },
  },
  mobileActions: {
    display: { default: "flex", "@media (min-width: 1024px)": "none" },
    marginInlineStart: "auto",
    alignItems: "center",
  },
  desktopActions: {
    display: { default: "none", "@media (min-width: 1024px)": "flex" },
    marginInlineStart: "auto",
    alignItems: "center",
    gap: 6,
  },
  mobileMenu: { display: { default: "block", "@media (min-width: 1024px)": "none" } },
  menuTrigger: { paddingInline: 24, minHeight: 44, fontSize: 13 },
  mobileContent: { paddingInline: 24, paddingBlockEnd: 24 },
  mobileNavigation: { display: "flex", flexWrap: "wrap", columnGap: 24 },
  mobilePreferences: {
    display: "flex",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 12,
    marginTop: 16,
  },
});
