import * as stylex from "@stylexjs/stylex";
export const styles = stylex.create({
  root: { width: "100%", maxWidth: 384 },
  trigger: {
    width: "100%",
    justifyContent: "space-between",
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: "color-mix(in oklab,var(--lenso-control-border) 70%,transparent)",
    backgroundImage:
      "linear-gradient(to bottom,var(--lenso-background-secondary),var(--lenso-background-tertiary))",
    paddingInline: 16,
    paddingBlock: 12,
    fontWeight: 500,
    color: "var(--lenso-label-primary)",
    boxShadow: "var(--lenso-surface-shadow)",
    backgroundColor: {
      default: null,
      ":hover": "color-mix(in oklab,var(--lenso-label-secondary) 30%,transparent)",
    },
  },
  label: { display: "flex", alignItems: "center", gap: 8 },
  icon: { width: 16, height: 16, color: "var(--lenso-label-secondary)" },
  indicator: { color: "var(--lenso-label-secondary)" },
  body: {
    marginTop: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: "color-mix(in oklab,var(--lenso-control-border) 70%,transparent)",
    backgroundColor:
      "color-mix(in oklab,var(--lenso-background-grouped-secondary) 50%,transparent)",
    padding: 16,
    fontSize: 14,
    lineHeight: 1.625,
    color: "var(--lenso-label-secondary)",
  },
});
