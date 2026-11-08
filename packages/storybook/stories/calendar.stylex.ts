// Copyright NextUI Inc. Apache-2.0.
import * as stylex from "@stylexjs/stylex";

export const calendarStoryStyles = stylex.create({
  stack: { display: "flex", flexDirection: "column", alignItems: "center", gap: 16 },
  stack6: { display: "flex", flexDirection: "column", alignItems: "center", gap: 24 },
  actions: { display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 8 },
  center: { textAlign: "center" },
  danger: { fontSize: 14, color: "var(--lenso-status-error-indicator)" },
  scroll: {
    width: "min(544px, calc(100vw - 32px))",
    maxWidth: "none",
    overflowX: "auto",
    containerType: "normal",
  },
  scrollThree: {
    width: "min(824px, calc(100vw - 32px))",
    maxWidth: "none",
    overflowX: "auto",
    containerType: "normal",
  },
  months: { display: "flex", width: "max-content", marginInline: "auto", gap: 32 },
  threeMonths: { display: "flex", width: "max-content", gap: 28 },
  month: { width: 256 },
  spacer: { width: 24, height: 24 },
  heading: { flex: "none" },
  select: { width: 160, display: "flex", flexDirection: "column", gap: 4 },
  legend: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
    fontSize: 12,
    color: "var(--lenso-label-secondary)",
  },
  legendColumn: { display: "flex", flexDirection: "column", gap: 8, textAlign: "center" },
  inline: { display: "inline-flex", alignItems: "center", gap: 4 },
  dotMuted: {
    width: 8,
    height: 8,
    borderRadius: "50%",
    backgroundColor: "var(--lenso-label-secondary)",
  },
  dotDefault: {
    width: 8,
    height: 8,
    borderRadius: "50%",
    backgroundColor: "var(--lenso-control-fill)",
  },
  events: {
    display: "flex",
    flexDirection: "column",
    gap: 4,
    fontSize: 12,
    color: "var(--lenso-label-secondary)",
  },
  currentYear: {
    color: "var(--lenso-tint)",
    boxShadow: "inset 0 0 0 1px color-mix(in oklab, var(--lenso-tint) 60%, transparent)",
  },
  accent: { color: "var(--lenso-tint)" },
  accentForeground: { color: "var(--lenso-label-on-tint)" },
});
