"use client";
// Adapted from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e), Apache-2.0.
import { Description, Input, Label, TextField } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
const styles = stylex.create({ field: { width: "100%", maxWidth: 256 } });
export function Disabled() {
  return (
    <TextField disabled xstyle={styles.field} name="accountId">
      <Label>Account ID</Label>
      <Input value="USR-12345" placeholder="Auto-generated" />
      <Description>This field cannot be edited</Description>
    </TextField>
  );
}
