// Generated from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e); Apache-2.0.
"use client";

// Adapted from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e), Apache-2.0.
import { Surface, TextArea } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
const styles = stylex.create({
  root: {
    width: "100%",
    borderRadius: 24,
    padding: 24,
  },
  field: {
    width: "100%",
    minWidth: 280,
  },
});
export function OnSurface() {
  return (
    <Surface xstyle={styles.root}>
      <TextArea xstyle={styles.field} placeholder="描述你的产品" variant="secondary" />
    </Surface>
  );
}
