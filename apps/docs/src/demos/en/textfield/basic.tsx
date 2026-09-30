"use client";

// Adapted from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e), Apache-2.0.
import { Input, Label, TextField } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
const styles = stylex.create({ field: { width: "100%", maxWidth: 256 } });

export function Basic() {
  return (
    <TextField name="email" xstyle={styles.field}>
      <Label>Email</Label>
      <Input type="email" placeholder="Enter your email" />
    </TextField>
  );
}
