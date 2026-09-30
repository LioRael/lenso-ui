"use client";
// Adapted from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e), Apache-2.0.
import { Surface } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
import { s } from "../card/display.stylex";

export function Basic() {
  return (
    <Surface xstyle={s.surface} variant="default">
      <h3 {...stylex.props(s.textBase, s.semibold, s.foreground)}>Surface Content</h3>
      <p {...stylex.props(s.textSm, s.muted)}>
        This is a default surface variant. It uses bg-surface styling.
      </p>
    </Surface>
  );
}
