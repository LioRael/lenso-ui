// Generated from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e); Apache-2.0.
"use client";

// Adapted from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e), Apache-2.0.
import { Surface } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
import { s } from "../../en/card/display.stylex";
export function CustomStyles() {
  return (
    <Surface xstyle={s.surfaceCustom} variant="default">
      <h3 {...stylex.props(s.textSm, s.semibold, s.foreground)}>账单概览</h3>
      <p {...stylex.props(s.textSm, s.muted)}>在此查看发票和支付方式。</p>
    </Surface>
  );
}
