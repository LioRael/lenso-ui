import * as stylex from "@stylexjs/stylex";
export const styles = stylex.create({
  root: {
    borderRadius: 8,
    backgroundColor: "var(--default-soft)",
    paddingInline: 12,
    paddingBlock: 8,
  },
  link: { color: { default: "var(--muted)", ":hover": "var(--accent)" } },
  current: { fontWeight: 500, color: "var(--foreground)" },
});
