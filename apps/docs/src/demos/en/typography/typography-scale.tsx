"use client";
import { Typography } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
const scale = [
  { label: "h1", meta: "36px / 600 / 1.11 / tight", sample: "Build better interfaces", type: "h1" },
  {
    label: "h2",
    meta: "30px / 600 / 1.17 / tight",
    sample: "Built for the intelligence age",
    type: "h2",
  },
  { label: "h3", meta: "24px / 600 / 1.25 / tight", sample: "Pricing on your terms", type: "h3" },
  {
    label: "h4",
    meta: "20px / 600 / 1.33 / tight",
    sample: "Apply to the startup program",
    type: "h4",
  },
  { label: "h5", meta: "18px / 600 / 1.39 / tight", sample: "Card titles", type: "h5" },
  { label: "h6", meta: "16px / 600 / 1.50 / tight", sample: "Smaller feature headers", type: "h6" },
  {
    label: "body",
    meta: "16px / 400 / 1.75",
    sample: "Primary body text used across documentation, marketing copy, and descriptions.",
    type: "body",
  },
  {
    label: "body-sm",
    meta: "14px / 400 / 1.50",
    sample: "Secondary body, table cells, navigation, and sidebar items.",
    type: "body-sm",
  },
  {
    label: "body-xs",
    meta: "12px / 400 / 1.25",
    sample: "Captions, badges, helper text, and fine print.",
    type: "body-xs",
  },
  { label: "code", meta: "14px / mono", sample: "bun add @lenso/ui", type: "code" },
] as const;
const styles = stylex.create({
  column: { display: "flex", width: "100%", flexDirection: "column" },
  row: {
    display: "grid",
    gridTemplateColumns: "160px 1fr",
    alignItems: "center",
    gap: 32,
    paddingBlock: 20,
    borderBlockEndWidth: { default: 1, ":last-child": 0 },
    borderBlockEndStyle: "solid",
    borderBlockEndColor: "var(--lenso-control-border)",
  },
  caption: { display: "flex", flexShrink: 0, flexDirection: "column", gap: 2 },
  label: { fontSize: 14, lineHeight: "20px", fontWeight: 600, color: "var(--lenso-label-primary)" },
  meta: {
    fontSize: 12,
    lineHeight: "16px",
    whiteSpace: "nowrap",
    color: "var(--lenso-label-secondary)",
  },
});
export function TypographyScale() {
  return (
    <div {...stylex.props(styles.column)}>
      {scale.map((row) => (
        <div key={row.label} {...stylex.props(styles.row)}>
          <div {...stylex.props(styles.caption)}>
            <span {...stylex.props(styles.label)}>{row.label}</span>
            <span {...stylex.props(styles.meta)}>{row.meta}</span>
          </div>
          <Typography type={row.type}>{row.sample}</Typography>
        </div>
      ))}
    </div>
  );
}
export default TypographyScale;
