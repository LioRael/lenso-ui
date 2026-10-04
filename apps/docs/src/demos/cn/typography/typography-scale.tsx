// Generated from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e); Apache-2.0.
"use client";

// Adapted from HeroUI v3.2.6 (Apache-2.0).
import { Typography } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
const scale = [
  {
    label: "h1",
    meta: "36px / 600 / 1.11 / tight",
    sample: "打造更出色的界面",
    type: "h1" as const,
  },
  {
    label: "h2",
    meta: "30px / 600 / 1.17 / tight",
    sample: "为智能时代而生",
    type: "h2" as const,
  },
  {
    label: "h3",
    meta: "24px / 600 / 1.25 / tight",
    sample: "按您的条件定价",
    type: "h3" as const,
  },
  {
    label: "h4",
    meta: "20px / 600 / 1.33 / tight",
    sample: "申请创业计划",
    type: "h4" as const,
  },
  {
    label: "h5",
    meta: "18px / 600 / 1.39 / tight",
    sample: "卡片标题",
    type: "h5" as const,
  },
  {
    label: "h6",
    meta: "16px / 600 / 1.50 / tight",
    sample: "较小的功能标题",
    type: "h6" as const,
  },
  {
    label: "body",
    meta: "16px / 400 / 1.75",
    sample: "用于文档、营销文案与描述的主要正文。",
    type: "body" as const,
  },
  {
    label: "body-sm",
    meta: "14px / 400 / 1.50",
    sample: "次要正文、表格单元格、导航与侧边栏项。",
    type: "body-sm" as const,
  },
  {
    label: "body-xs",
    meta: "12px / 400 / 1.25",
    sample: "说明文字、徽章、辅助文本与细则。",
    type: "body-xs" as const,
  },
  {
    label: "code",
    meta: "14px / mono",
    sample: "pnpm add @lenso/ui",
    type: "code" as const,
  },
] as const;
const styles = stylex.create({
  column: {
    display: "flex",
    width: "100%",
    flexDirection: "column",
  },
  row: {
    display: "grid",
    gridTemplateColumns: "160px 1fr",
    alignItems: "center",
    gap: 32,
    paddingBlock: 20,
    borderBlockEndWidth: {
      default: 1,
      ":last-child": 0,
    },
    borderBlockEndStyle: "solid",
    borderBlockEndColor: "var(--border)",
  },
  caption: {
    display: "flex",
    flexShrink: 0,
    flexDirection: "column",
    gap: 2,
  },
  label: {
    fontSize: 14,
    lineHeight: "20px",
    fontWeight: 600,
    color: "var(--foreground)",
  },
  meta: {
    fontSize: 12,
    lineHeight: "16px",
    whiteSpace: "nowrap",
    color: "var(--muted)",
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
