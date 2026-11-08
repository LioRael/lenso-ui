"use client";

import { Description, InputOTP, Label, TextField } from "@lenso/ui";
import { Slots, styles } from "../../en/input-otp/parts";
export function WithPattern() {
  return (
    <TextField name="code" xstyle={styles.field}>
      <Label>输入验证码（仅字母）</Label>
      <Description>仅允许输入字母</Description>
      <InputOTP length={6} name="code" validationType="alpha">
        <Slots />
      </InputOTP>
    </TextField>
  );
}
