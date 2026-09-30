// Generated from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e); Apache-2.0.
"use client";

import { ColorSwatch } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
const styles = stylex.create({
  row: {
    display: "flex",
    alignItems: "center",
    gap: 12,
  },
});
export function ColorSwatchBasic() {
  return (
    <div {...stylex.props(styles.row)}>
      <ColorSwatch aria-label="蓝色" color="#0485F7" />
      <ColorSwatch aria-label="红色" color="#EF4444" />
      <ColorSwatch aria-label="琥珀色" color="#F59E0B" />
      <ColorSwatch aria-label="绿色" color="#10B981" />
      <ColorSwatch aria-label="品红" color="#D946EF" />
    </div>
  );
}
