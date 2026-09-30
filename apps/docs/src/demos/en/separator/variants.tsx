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
      <div>Default Variant</div>
      <Separator variant="default" />
      <div>Secondary Variant</div>
      <Separator variant="secondary" />
      <div>Tertiary Variant</div>
      <Separator variant="tertiary" />
    </div>
  );
}
export default Variants;
