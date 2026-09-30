"use client";
// Adapted from HeroUI v3.2.6, e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e, Apache-2.0.
import { Description, Input, Label } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
import { useId } from "react";

const styles = stylex.create({
  layout: { display: "flex", width: 256, maxWidth: "100%", flexDirection: "column", gap: 4 },
  description: { lineHeight: 1.625, letterSpacing: "0.025em" },
});

export function CustomStyles() {
  const id = useId();
  const hint = useId();
  return (
    <div {...stylex.props(styles.layout)}>
      <Label htmlFor={id}>Workspace URL</Label>
      <Input id={id} aria-describedby={hint} placeholder="acme" type="text" />
      <Description xstyle={styles.description} id={hint}>
        Lowercase letters and hyphens only. Used in app.heroui.com/acme
      </Description>
    </div>
  );
}
