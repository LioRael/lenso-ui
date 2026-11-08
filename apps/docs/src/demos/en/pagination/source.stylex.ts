import * as stylex from "@stylexjs/stylex";
export const styles = stylex.create({
  center: { justifyContent: "center" },
  full: { width: "100%" },
  column: { display: "flex", flexDirection: "column", gap: 24 },
  section: { display: "flex", flexDirection: "column", gap: 8 },
  caption: {
    fontSize: 12,
    fontWeight: 500,
    color: "var(--lenso-label-secondary)",
    textTransform: "capitalize",
  },
  overflow: {
    width: "100%",
    maxWidth: { default: 288, "@media (min-width: 640px)": "100%" },
    overflowX: "auto",
  },
  customContent: {
    gap: 4,
    borderRadius: 12,
    backgroundColor: "var(--lenso-control-fill)",
    padding: 4,
  },
  link: {
    color: { default: "var(--lenso-label-secondary)", ":hover": "var(--lenso-label-primary)" },
    backgroundColor: { default: null, ":hover": "var(--lenso-background-grouped-secondary)" },
  },
  active: {
    backgroundColor: {
      default: "var(--lenso-tint)",
      ":hover": "var(--lenso-control-tint-hover-fill)",
    },
    color: "var(--lenso-label-on-tint)",
  },
});
