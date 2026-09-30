"use client";
// Adapted from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e), Apache-2.0.
import { FieldError, Input, Label, TextField } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
const styles = stylex.create({ field: { width: "100%", maxWidth: 256 } });
export function WithError() {
  return (
    <TextField invalid xstyle={styles.field} name="email">
      <Label>Email</Label>
      <Input type="email" placeholder="user@example.com" />
      <FieldError match>Please enter a valid email address</FieldError>
    </TextField>
  );
}
