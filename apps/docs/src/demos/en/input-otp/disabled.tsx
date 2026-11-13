"use client";
import { Description, InputOTP, Label, TextField } from "@lenso/ui";
import { Slots, styles } from "./parts";
export function Disabled() {
  return (
    <TextField disabled name="code" xstyle={styles.field}>
      <Label>Verify account</Label>
      <Description>Code verification is currently disabled</Description>
      <InputOTP disabled maxLength={6} name="code">
        <Slots />
      </InputOTP>
    </TextField>
  );
}
