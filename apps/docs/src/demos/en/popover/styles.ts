// Adapted from HeroUI v3.2.6 popover examples (Apache-2.0).
import * as stylex from "@stylexjs/stylex";

export const styles = stylex.create({
  row: { display: "flex", alignItems: "center", gap: 16 },
  profileRow: { display: "flex", alignItems: "center", gap: 24 },
  popup: { maxWidth: 256 },
  description: { marginTop: 8, fontSize: 14, color: "var(--muted)" },
  grid: { display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 16 },
  fullWidth: { width: "100%" },
  center: { display: "flex", alignItems: "center", justifyContent: "center" },
  muted: { fontSize: 14, color: "var(--muted)" },
  small: { fontSize: 14 },
  customPopup: {
    maxWidth: 224,
    overflow: "hidden",
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: {
      default: "color-mix(in oklab, var(--border) 80%, transparent)",
      ':is([data-theme="dark"] *)': "color-mix(in oklab, var(--border) 90%, transparent)",
    },
    backgroundColor: {
      default: "color-mix(in oklab, var(--surface) 90%, transparent)",
      ':is([data-theme="dark"] *)': "color-mix(in oklab, var(--surface) 85%, transparent)",
    },
    padding: 0,
    boxShadow: {
      default:
        "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1), 0 0 0 1px rgb(0 0 0 / 0.05)",
      ':is([data-theme="dark"] *)':
        "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1), 0 0 0 1px rgb(255 255 255 / 0.1)",
    },
    backdropFilter: "blur(24px)",
  },
  customDialog: { position: "relative", padding: 16 },
  highlight: {
    pointerEvents: "none",
    position: "absolute",
    insetInline: 0,
    top: 0,
    height: 48,
    backgroundImage: {
      default: "linear-gradient(to bottom, oklch(0.556 0 0 / 0.06), transparent)",
      ':is([data-theme="dark"] *)':
        "linear-gradient(to bottom, oklch(0.708 0 0 / 0.08), transparent)",
    },
  },
  customHeading: {
    position: "relative",
    fontWeight: 500,
    color: { default: "oklch(0.269 0 0)", ':is([data-theme="dark"] *)': "oklch(0.97 0 0)" },
  },
  shortcuts: {
    position: "relative",
    display: "flex",
    flexDirection: "column",
    gap: 8,
    marginTop: 12,
    fontSize: 14,
  },
  shortcut: { display: "flex", justifyContent: "space-between", gap: 16 },
  key: {
    fontFamily: "monospace",
    color: { default: "oklch(0.371 0 0)", ':is([data-theme="dark"] *)': "oklch(0.87 0 0)" },
  },
  profilePopup: { width: 320 },
  identity: { display: "flex", alignItems: "center", gap: 8 },
  identityLarge: { display: "flex", alignItems: "center", gap: 12 },
  identityText: { display: "flex", flexDirection: "column" },
  name: { fontSize: 14, fontWeight: 500 },
  handle: { fontSize: 12, color: "var(--muted)" },
  strong: { fontWeight: 600 },
  profileHeading: { display: "flex", alignItems: "center", justifyContent: "space-between" },
  follow: { borderRadius: 9999 },
  bio: { marginTop: 12, fontSize: 14, color: "var(--muted)" },
  statistics: { display: "flex", gap: 16, marginTop: 12 },
  statisticLabel: { marginInlineStart: 4, fontSize: 14, color: "var(--muted)" },
});
