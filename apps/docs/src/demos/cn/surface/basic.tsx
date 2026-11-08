"use client";

import { Surface } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
import { s } from "../../en/card/display.stylex";
export function Basic() {
  return (
    <Surface xstyle={s.surface} variant="default">
      <h3 {...stylex.props(s.textBase, s.semibold, s.foreground)}>表面内容</h3>
      <p {...stylex.props(s.textSm, s.muted)}>这是默认表面变体，使用 bg-surface 样式。</p>
    </Surface>
  );
}
