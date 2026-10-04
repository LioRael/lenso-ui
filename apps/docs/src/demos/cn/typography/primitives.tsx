// Generated from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e); Apache-2.0.
"use client";

// Adapted from HeroUI v3.2.6 (Apache-2.0).
import { Typography } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
const styles = stylex.create({
  column: {
    display: "flex",
    maxWidth: 576,
    flexDirection: "column",
    gap: 16,
  },
});
export function Primitives() {
  return (
    <div {...stylex.props(styles.column)}>
      <Typography.Heading level={1}>仪表盘</Typography.Heading>
      <Typography.Paragraph>
        便捷原语是 Typography 的薄封装，可在不学习第二套样式系统的情况下选择显式组合。
      </Typography.Paragraph>
      <Typography.Paragraph color="muted" size="sm">
        Paragraph 支持 base、sm 和 xs 尺寸。
      </Typography.Paragraph>
      <Typography.Code>Typography.Code</Typography.Code>
    </div>
  );
}
export default Primitives;
