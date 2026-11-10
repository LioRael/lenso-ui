import * as stylex from "@stylexjs/stylex";
import type { PresentationRule } from "@lenso/ui-exact/presentation";

const custom = stylex.create({
  count: {
    borderRadius: { default: 8, "@media (min-width: 700px)": 12 },
    fontWeight: 600,
    textDecorationLine: { default: "none", ":hover": "underline" },
  },
  toggles: {
    borderRadius: 10,
    fontWeight: 600,
    "--lenso-control-tint": "var(--lenso-status-success-indicator)",
  },
  strong: { fontWeight: 700 },
  square: { borderRadius: null },
  skeleton: { borderRadius: 16 },
  clear: { backgroundColor: null, borderRadius: 0 },
  wideAction: { width: "100%" },
  cardTitle: { fontWeight: 600 },
  switchIcon: { color: "#151515" },
  chip: { borderRadius: 8 },
  ring: { stroke: "var(--lenso-label-tertiary)" },
});

export const styleRules = [
  { kind: "switch-icon", xstyle: custom.switchIcon },
  { kind: "button", testId: "layout-create", xstyle: custom.wideAction },
  { kind: "button", testId: "layout-import", xstyle: custom.wideAction },
  { kind: "card-title", testId: "layout-card-title", xstyle: custom.cardTitle },
  { kind: "chip", testId: "content-chip", xstyle: custom.chip },
  { kind: "button", testId: "action", xstyle: custom.count },
  { kind: "toggle-button", xstyle: custom.toggles },
  { kind: "toggle-button", testId: "favorite", xstyle: [custom.strong, false, custom.square] },
  { kind: "skeleton", testId: "feedback-skeleton", xstyle: custom.skeleton },
  { kind: "skeleton", testId: "feedback-skeleton-line-two", xstyle: custom.clear },
  { kind: "progress-circle-track-circle", testId: "sync-track-circle", xstyle: custom.ring },
] satisfies readonly PresentationRule[];

const dynamic = stylex.create({
  radius: (value: number) => ({ borderRadius: value }),
});

// Exercise the unsupported inline-value boundary without using it in the UI.
export const inlineRule = { kind: "button", xstyle: dynamic.radius(13) } satisfies PresentationRule;
