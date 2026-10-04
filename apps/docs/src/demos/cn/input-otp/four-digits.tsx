// Generated from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e); Apache-2.0.
"use client";

// Adapted from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e), Apache-2.0.
import { InputOTP, Label, TextField } from "@lenso/ui";
import { styles } from "../../en/input-otp/parts";
export function FourDigits() {
  return (
    <TextField name="pin" xstyle={styles.field}>
      <Label>输入 PIN</Label>
      <InputOTP length={4} name="pin">
        <InputOTP.Group>
          <InputOTP.Slot aria-label="Digit 1" />
          <InputOTP.Slot aria-label="Digit 2" />
          <InputOTP.Slot aria-label="Digit 3" />
          <InputOTP.Slot aria-label="Digit 4" />
        </InputOTP.Group>
      </InputOTP>
    </TextField>
  );
}
