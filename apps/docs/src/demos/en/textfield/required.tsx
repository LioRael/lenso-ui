"use client";
// Adapted from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e), Apache-2.0.
import { Description, Input, Label, TextField } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
const styles = stylex.create({ field: { width: "100%", maxWidth: 256 } });
export function Required() {
  return (
    <TextField xstyle={styles.field} name="fullName">
      <Label>Full Name</Label>
      <Input required placeholder="John Doe" />
      <Description>This field is required</Description>
    </TextField>
  );
}
