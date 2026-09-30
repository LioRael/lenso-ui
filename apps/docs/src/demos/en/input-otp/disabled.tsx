"use client";
// Adapted from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e), Apache-2.0.
import { Description, InputOTP, Label, TextField } from "@lenso/ui";
import { Slots, styles } from "./parts";
export function Disabled() {
  return (
    <TextField disabled name="code" xstyle={styles.field}>
      <Label>Verify account</Label>
      <Description>Code verification is currently disabled</Description>
      <InputOTP disabled length={6} name="code">
        <Slots />
      </InputOTP>
    </TextField>
  );
}
