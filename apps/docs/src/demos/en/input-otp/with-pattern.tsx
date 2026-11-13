"use client";
import { Description, InputOTP, Label, TextField } from "@lenso/ui";
import { Slots, styles } from "./parts";
export function WithPattern() {
  return (
    <TextField name="code" xstyle={styles.field}>
      <Label>Enter code (letters only)</Label>
      <Description>Only alphabetic characters are allowed</Description>
      <InputOTP maxLength={6} name="code" pattern="alphanumeric">
        <Slots />
      </InputOTP>
    </TextField>
  );
}
