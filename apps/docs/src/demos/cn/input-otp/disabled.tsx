// Generated from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e); Apache-2.0.
"use client";

// Adapted from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e), Apache-2.0.
import { Description, InputOTP, Label, TextField } from "@lenso/ui";
import { Slots, styles } from "../../en/input-otp/parts";
export function Disabled() {
  return (
    <TextField disabled name="code" xstyle={styles.field}>
      <Label>验证账户</Label>
      <Description>验证码校验当前已禁用</Description>
      <InputOTP disabled length={6} name="code">
        <Slots />
      </InputOTP>
    </TextField>
  );
}
