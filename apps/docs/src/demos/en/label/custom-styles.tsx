"use client";
// Adapted from HeroUI v3.2.6, e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e, Apache-2.0.
import { Input, Label } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
import { useId } from "react";

const styles = stylex.create({
  layout: { display: "flex", flexDirection: "column", gap: 6 },
  label: {
    fontSize: 12,
    fontWeight: 600,
    letterSpacing: "0.025em",
    color: "var(--accent)",
    textTransform: "uppercase",
  },
  input: { width: 256, maxWidth: "100%", backgroundColor: "var(--field-background)" },
});

export function CustomStyles() {
  const id = useId();
  return (
    <div {...stylex.props(styles.layout)}>
      <Label xstyle={styles.label} htmlFor={id}>
        Repository
      </Label>
      <Input xstyle={styles.input} id={id} placeholder="heroui/react" />
    </div>
  );
}
