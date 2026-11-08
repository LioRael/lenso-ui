import * as stylex from "@stylexjs/stylex";

export const headerControls = stylex.create({
  navigation: { display: { default: "none", "@media (min-width: 768px)": "flex" }, flexShrink: 0 },
  phoneDestination: {
    minWidth: 44,
    width: { default: "100%", ":is([data-minimized] *)": 44 },
  },
  phoneDestinations: { flexGrow: 1, flexBasis: 0 },
  phoneNavigation: {
    display: { default: "flex", "@media (min-width: 768px)": "none" },
    position: "fixed",
    zIndex: 30,
    bottom: "calc(12px + env(safe-area-inset-bottom, 0px))",
    insetInlineStart: {
      default: "max(16px, env(safe-area-inset-left, 0px))",
      "@media (max-width: 359px)": "max(10px, env(safe-area-inset-left, 0px))",
    },
    insetInlineEnd: {
      default: "max(16px, env(safe-area-inset-right, 0px))",
      "@media (max-width: 359px)": "max(10px, env(safe-area-inset-right, 0px))",
    },
    width: "auto",
    maxWidth: 600,
    marginInline: "auto",
  },
  control: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    boxSizing: "border-box",
    height: { default: 32, "@media (max-width: 767px)": 44 },
    minHeight: { default: 32, "@media (max-width: 767px)": 44 },
    paddingBlock: 0,
    borderWidth: 0,
  },
  icon: {
    width: { default: 32, "@media (max-width: 767px)": 44 },
    minWidth: { default: 32, "@media (max-width: 767px)": 44 },
    paddingInline: 0,
  },
  appearance: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    minWidth: 0,
    margin: 0,
    padding: 0,
    borderWidth: 0,
  },
  link: {
    color: "var(--lenso-label-primary)",
    textDecoration: "none",
    cursor: "pointer",

    ":focus-visible": { outline: "2px solid var(--lenso-focus-ring)", outlineOffset: 2 },
  },
  themeGroup: {
    display: "inline-flex",
    flexShrink: 0,
    "--lenso-glass-panel-shadow": "var(--lenso-material-action-shadow)",
  },
  themeList: {
    "--lg-tab-width": { default: "28px", "@media (max-width: 767px)": "40px" },
    "--lg-tab-height": { default: "28px", "@media (max-width: 767px)": "40px" },
    gap: 2,
  },
});
