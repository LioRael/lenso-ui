"use client";
import { Surface, TextArea } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
const styles = stylex.create({
  root: { width: "100%", borderRadius: 24, padding: 24 },
  field: { width: "100%", minWidth: 280 },
});
export function OnSurface() {
  return (
    <Surface xstyle={styles.root}>
      <TextArea xstyle={styles.field} placeholder="Describe your product" variant="secondary" />
    </Surface>
  );
}
