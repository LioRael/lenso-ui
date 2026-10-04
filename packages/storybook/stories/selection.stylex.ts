/**
 * HeroUI v3.2.6 story layout adaptation. Copyright 2026 HeroUI.
 * SPDX-License-Identifier: Apache-2.0
 */
import * as stylex from "@stylexjs/stylex";

export const selectionStyles = stylex.create({
  stack: { display: "flex", flexDirection: "column", gap: 16, maxWidth: "100%" },
  field: { display: "flex", flexDirection: "column", gap: 8, width: 256, maxWidth: "100%" },
  wide: { width: 400, maxWidth: "calc(100vw - 32px)" },
  full: { width: "100%" },
  userWidth: { width: 300, maxWidth: "100%" },
  row: { display: "flex", alignItems: "center", gap: 8 },
  itemRow: { gap: 12, width: "100%" },
  column: { display: "flex", flexDirection: "column", minWidth: 0 },
  muted: { fontSize: 14, lineHeight: "20px", color: "var(--muted)" },
  smallAvatar: { width: 16, height: 16 },
  value: { display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8, minWidth: 0 },
  trigger: { width: "100%" },
  clear: { marginInlineStart: "auto", flexShrink: 0 },
  popup: { maxWidth: "calc(100vw - 32px)" },
  search: { position: "sticky", top: 0, zIndex: 1, width: "100%" },
  list: { maxHeight: 420, overflowY: "auto" },
  surface: { width: 256, maxWidth: "100%", borderRadius: 24, boxShadow: "var(--surface-shadow)" },
  actionList: { padding: 8 },
  form: { width: 256, maxWidth: "calc(100vw - 32px)" },
  autocompleteSurface: {
    width: 380,
    maxWidth: "calc(100vw - 32px)",
    borderRadius: 24,
    padding: 24,
  },
  smallList: { width: 220, maxWidth: "100%" },
  callback: { border: "1px solid var(--border)", borderRadius: 12, padding: 16 },
  heading: { fontSize: 18, fontWeight: 600 },
  loadMore: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingBlock: 8,
  },
  shortcut: { marginInlineStart: "auto" },
  icon: { width: 16, height: 16, flexShrink: 0 },
  actionIcon: { width: 16, height: 16, flexShrink: 0, color: "var(--muted)" },
  dangerIcon: { color: "var(--danger)" },
  accentIcon: { color: "var(--accent)" },
  requiredIndicator: { color: "var(--danger)", marginInlineStart: 2 },
  indicator: { width: 12, height: 12 },
});
