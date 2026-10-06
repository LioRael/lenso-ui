// HeroUI e385ac2 home navigation, Apache-2.0; modified for Lenso.
// Copyright 2025 NextUI Inc.
import * as stylex from "@stylexjs/stylex";

export const homeLayout = stylex.create({
  container: {
    display: "flex",
    flexDirection: "column",
    minHeight: "100dvh",
    color: "var(--foreground)",
    backgroundColor: "var(--background)",
  },
  header: {
    height: 56,
    borderBottomWidth: 0,
    backgroundColor: "var(--background)",
    backdropFilter: "none",
  },
  brand: { fontSize: 28, lineHeight: "32px", fontWeight: 600, letterSpacing: "-0.04em" },
  mobileActions: {
    display: { default: "flex", "@media (min-width: 1024px)": "none" },
    alignItems: "center",
    gap: 6,
  },
  desktopActions: {
    display: { default: "none", "@media (min-width: 1024px)": "flex" },
    alignItems: "center",
    gap: 6,
  },
  mobilePreferences: { display: "flex", alignItems: "center", gap: 12 },
});
