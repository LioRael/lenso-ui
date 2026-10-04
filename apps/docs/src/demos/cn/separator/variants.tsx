// Generated from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e); Apache-2.0.
"use client";

// Adapted from HeroUI v3.2.6 (Apache-2.0).
import { Separator } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
const styles = stylex.create({
  column: {
    display: "flex",
    maxWidth: 448,
    flexDirection: "column",
    alignItems: "center",
    gap: 12,
  },
});
export function Variants() {
  return (
    <div {...stylex.props(styles.column)}>
      <div>默认变体</div>
      <Separator variant="default" />
      <div>次要变体</div>
      <Separator variant="secondary" />
      <div>第三变体</div>
      <Separator variant="tertiary" />
    </div>
  );
}
export default Variants;
