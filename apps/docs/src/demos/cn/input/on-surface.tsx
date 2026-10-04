// Generated from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e); Apache-2.0.
"use client";

// Adapted from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e), Apache-2.0.
import { Input, Surface } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
const styles = stylex.create({
  root: {
    display: "flex",
    height: 180,
    width: 280,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 24,
    backgroundColor: "var(--surface)",
    padding: 16,
  },
});
export function OnSurface() {
  return (
    <Surface xstyle={styles.root}>
      <Input fullWidth placeholder="你的姓名" variant="secondary" />
    </Surface>
  );
}
