"use client";
// Adapted from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e), Apache-2.0.
import { InputOTP, Label, TextField } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
import { Slots, styles } from "./parts";
export function Variants() {
  return (
    <div {...stylex.props(styles.variants)}>
      {(["primary", "secondary"] as const).map((variant) => (
        <TextField key={variant} name={`${variant}-code`} xstyle={styles.field}>
          <Label>{variant === "primary" ? "Primary variant" : "Secondary variant"}</Label>
          <InputOTP length={6} name={`${variant}-code`} variant={variant}>
            <Slots />
          </InputOTP>
        </TextField>
      ))}
    </div>
  );
}
