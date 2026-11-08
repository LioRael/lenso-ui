"use client";

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
