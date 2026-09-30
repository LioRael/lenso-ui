"use client";
// Adapted from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e), Apache-2.0.
import { Label, NumberField, TextField } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
import { Controls, styles } from "./parts";

export function Variants() {
  return (
    <div {...stylex.props(styles.column)}>
      {(["primary", "secondary"] as const).map((variant) => (
        <TextField key={variant} name={`${variant}-width`}>
          <NumberField defaultValue={100} min={0} name={`${variant}-width`} variant={variant}>
            <Label>{variant === "primary" ? "Primary variant" : "Secondary variant"}</Label>
            <Controls />
          </NumberField>
        </TextField>
      ))}
    </div>
  );
}
