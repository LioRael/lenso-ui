import * as stylex from "@stylexjs/stylex";
export const styles = stylex.create({
  root: { width: "100%", maxWidth: 384 },
  trigger: {
    width: "100%",
    justifyContent: "space-between",
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: "color-mix(in oklab,var(--border) 70%,transparent)",
    backgroundImage:
      "linear-gradient(to bottom,light-dark(#fafafae6,#171717cc),light-dark(#fff,#171717))",
    paddingInline: 16,
    paddingBlock: 12,
    fontWeight: 500,
    color: "var(--foreground)",
    boxShadow: "var(--shadow-sm),0 0 0 1px light-dark(#0000000d,#ffffff1a)",
    backgroundColor: {
      default: null,
      ":hover": "color-mix(in oklab,var(--muted) 30%,transparent)",
    },
  },
  label: { display: "flex", alignItems: "center", gap: 8 },
  icon: { width: 16, height: 16, color: "var(--muted)" },
  indicator: { color: "var(--muted)" },
  body: {
    marginTop: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: "color-mix(in oklab,var(--border) 70%,transparent)",
    backgroundColor: "color-mix(in oklab,var(--surface) 50%,transparent)",
    padding: 16,
    fontSize: 14,
    lineHeight: 1.625,
    color: "var(--muted)",
  },
});
