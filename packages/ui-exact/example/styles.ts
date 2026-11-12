import * as stylex from "@stylexjs/stylex";
import type { PresentationRule } from "@lenso/ui-exact/presentation";

const custom = stylex.create({
  magnifierStage: {
    height: 300,
    display: "block",
    position: "relative",
    overflow: "hidden",
    borderRadius: 24,
  },
  magnifier: {
    position: "absolute",
    left: "calc(50% - 105px)",
    top: "calc(50% - 75px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  navigationScroll: {
    display: "block",
    height: 320,
    overflowY: "auto",
    position: "relative",
    borderRadius: 16,
    backgroundColor: "var(--lenso-background-secondary)",
    isolation: "isolate",
  },
  contextPreviewTarget: {
    width: 280,
    minHeight: 140,
    padding: 24,
    borderRadius: 24,
    boxSizing: "border-box",
    backgroundColor: "var(--lenso-background-secondary)",
    color: "var(--lenso-label-primary)",
    display: "grid",
    alignItems: "center",
    cursor: "context-menu",
    userSelect: "none",
  },
  contextPreviewBody: { padding: 24, display: "grid", alignItems: "center" },
  numericScrub: {
    cursor: { default: "ew-resize", ':is([data-lenso-direction="vertical"])': "ns-resize" },
  },
  popover: { width: 320, maxWidth: "calc(100vw - 16px)" },
  fusionRoot: { width: "fit-content", maxWidth: "100%" },
  fusionTile: { width: 88, height: 80, borderRadius: 24, padding: 16, boxSizing: "border-box" },
  toolbarAction: { fontWeight: 600 },
  pageLink: { borderRadius: 8 },
  searchInput: { fontWeight: 600 },
  scrollViewport: {
    height: 160,
    width: "100%",
    borderRadius: 8,
    backgroundColor: "var(--lenso-fill-tertiary)",
  },
  scrollFallback: {
    animationName: "none",
    "--scroll-shadow-before": "var(--scroll-shadow-observed-before)",
    "--scroll-shadow-after": "var(--scroll-shadow-observed-after)",
    borderRadius: 13,
  },
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
  groupTint: { "--lenso-control-tint": "rgb(130 50 180)" },
  tabsLift: { "--lg-lens-grow-x": "41px" },
  switchIcon: { color: "#151515" },
  chip: { borderRadius: 8 },
  ring: { stroke: "var(--lenso-label-tertiary)" },
});

export const styleRules = [
  { kind: "surface", testId: "magnifier-stage", xstyle: custom.magnifierStage },
  { kind: "glass-magnifier", testId: "magnifier-lens", xstyle: custom.magnifier },
  { kind: "surface", testId: "navigation-demo-scroll", xstyle: custom.navigationScroll },
  {
    kind: "context-menu-trigger",
    testId: "context-preview-target",
    xstyle: custom.contextPreviewTarget,
  },
  {
    kind: "context-menu-preview",
    testId: "context-preview-card",
    xstyle: custom.contextPreviewBody,
  },
  { kind: "number-scrub-area", testId: "numeric-scrub", xstyle: custom.numericScrub },
  { kind: "popover-popup", xstyle: custom.popover },
  { kind: "glass-container", xstyle: custom.fusionRoot },
  { kind: "glass-container-item", xstyle: custom.fusionTile },
  { kind: "toolbar-button", testId: "toolbar-copy", xstyle: custom.toolbarAction },
  { kind: "pagination-link", testId: "pagination-two", xstyle: custom.pageLink },
  { kind: "search-field-input", testId: "search-demo-input", xstyle: custom.searchInput },
  { kind: "number-field-input", testId: "numeric-amount-input", xstyle: custom.searchInput },
  { kind: "scroll-shadow", testId: "shadow-sample", xstyle: custom.scrollViewport },
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

export const tabsLiftRule = {
  kind: "tabs-list",
  xstyle: custom.tabsLift,
} satisfies PresentationRule;

export const buttonGroupTintRule = {
  kind: "button-group-item",
  testId: "actions-save",
  xstyle: custom.groupTint,
} satisfies PresentationRule;

export const scrollFallbackRule = {
  kind: "scroll-shadow",
  testId: "shadow-sample",
  xstyle: [custom.scrollViewport, custom.scrollFallback],
} satisfies PresentationRule;
