"use client";
// Adapted from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e), Apache-2.0.
import { Description, InputOTP, Label, TextField } from "@lenso/ui";
import { Slots, styles } from "./parts";
export function WithPattern() {
  return (
    <TextField name="code" xstyle={styles.field}>
      <Label>Enter code (letters only)</Label>
      <Description>Only alphabetic characters are allowed</Description>
      <InputOTP length={6} name="code" validationType="alpha">
        <Slots />
      </InputOTP>
    </TextField>
  );
}
