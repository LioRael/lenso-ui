"use client";

// Adapted from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e), Apache-2.0.
import { TextArea } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";

const styles = stylex.create({ field: { width: 384, height: 128 } });
export function Basic() {
  return (
    <TextArea
      aria-label="Quick project update"
      xstyle={styles.field}
      placeholder="Share a quick project update..."
    />
  );
}
