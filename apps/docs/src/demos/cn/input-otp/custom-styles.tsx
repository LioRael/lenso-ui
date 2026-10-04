// Generated from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e); Apache-2.0.
"use client";

// Adapted from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e), Apache-2.0.
import { InputOTP, Label, Link, TextField } from "@lenso/ui";
import { Slots, styles } from "../../en/input-otp/parts";
export function CustomStyles() {
  return (
    <TextField name="code" xstyle={[styles.field, styles.customWidth]}>
      <Label>验证账户</Label>
      <InputOTP length={6} name="code">
        <Slots custom />
      </InputOTP>
      <Link xstyle={styles.resendLink} href="#">
        重新发送
      </Link>
    </TextField>
  );
}
