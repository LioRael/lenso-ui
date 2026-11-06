import * as stylex from "@stylexjs/stylex";

export const headerControls = stylex.create({
  navigation: { display: { default: "none", "@media (min-width: 768px)": "flex" }, flexShrink: 0 },
  phoneDestination: {
    minWidth: { default: 112, ":is([data-minimized] *)": 44 },
    width: { default: "max-content", ":is([data-minimized] *)": 44 },
  },
  phoneDestinations: { flexGrow: 0, flexBasis: "auto" },
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
  icon: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    boxSizing: "border-box",
    width: { default: 32, "@media (max-width: 767px)": 44 },
    height: { default: 32, "@media (max-width: 767px)": 44 },
    minWidth: { default: 32, "@media (max-width: 767px)": 44 },
    minHeight: { default: 32, "@media (max-width: 767px)": 44 },
    paddingInline: 0,
    paddingBlock: 0,
    borderWidth: 0,
  },
  link: {
    color: "var(--lenso-label-primary)",
    textDecoration: "none",
    cursor: "pointer",

    ":focus-visible": { outline: "2px solid var(--lenso-focus-ring)", outlineOffset: 2 },
  },
  themeGroup: { display: "inline-flex", flexShrink: 0 },
  themeList: {
    "--lg-tab-width": { default: "30px", "@media (pointer: coarse)": "44px" },
    "--lg-tab-height": { default: "30px", "@media (pointer: coarse)": "44px" },
    gap: 2,
  },
});
