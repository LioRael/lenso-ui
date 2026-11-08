"use client";

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
    backgroundColor: "var(--lenso-background-grouped-secondary)",
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
