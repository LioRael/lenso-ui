// Generated from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e); Apache-2.0.
"use client";

// Adapted from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e), Apache-2.0.
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
