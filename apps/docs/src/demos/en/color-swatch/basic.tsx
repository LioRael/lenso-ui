"use client";

import { ColorSwatch } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";

const styles = stylex.create({ row: { display: "flex", alignItems: "center", gap: 12 } });
export function ColorSwatchBasic() {
  return (
    <div {...stylex.props(styles.row)}>
      <ColorSwatch aria-label="Blue" color="#0485F7" />
      <ColorSwatch aria-label="Red" color="#EF4444" />
      <ColorSwatch aria-label="Amber" color="#F59E0B" />
      <ColorSwatch aria-label="Green" color="#10B981" />
      <ColorSwatch aria-label="Fuchsia" color="#D946EF" />
    </div>
  );
}
