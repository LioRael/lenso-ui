// Generated from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e); Apache-2.0.
"use client";

import { Typography } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
const styles = stylex.create({
  column: {
    display: "flex",
    flexDirection: "column",
    gap: 16,
    maxWidth: 576,
  },
});
export function Default() {
  return (
    <div {...stylex.props(styles.column)}>
      <Typography type="h1">打造更出色的界面</Typography>
      <Typography type="h2">保持语义化的排版</Typography>
      <Typography type="h3">默认可组合</Typography>
      <Typography type="h4">小标题</Typography>
      <Typography>
        Lenso UI Typography provides semantic typography types and native element composition.
      </Typography>
      <Typography color="muted" type="body-sm">
        用于次要说明的较小弱化正文。
      </Typography>
      <Typography type="code">pnpm add @lenso/ui</Typography>
    </div>
  );
}
