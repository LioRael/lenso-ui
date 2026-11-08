import * as stylex from "@stylexjs/stylex";
export const styles = stylex.create({
  root: {
    borderRadius: 8,
    backgroundColor: "var(--lenso-control-subtle-fill)",
    paddingInline: 12,
    paddingBlock: 8,
  },
  link: { color: { default: "var(--lenso-label-secondary)", ":hover": "var(--lenso-tint)" } },
  current: { fontWeight: 500, color: "var(--lenso-label-primary)" },
});
