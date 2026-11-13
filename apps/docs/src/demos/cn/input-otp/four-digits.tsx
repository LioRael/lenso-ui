"use client";

import { InputOTP, Label, TextField } from "@lenso/ui";
import { styles } from "../../en/input-otp/parts";
export function FourDigits() {
  return (
    <TextField name="pin" xstyle={styles.field}>
      <Label>输入 PIN</Label>
      <InputOTP maxLength={4} name="pin">
        <InputOTP.Group>
          <InputOTP.Slot aria-label="Digit 1" index={0} />
          <InputOTP.Slot aria-label="Digit 2" index={1} />
          <InputOTP.Slot aria-label="Digit 3" index={2} />
          <InputOTP.Slot aria-label="Digit 4" index={3} />
        </InputOTP.Group>
      </InputOTP>
    </TextField>
  );
}
