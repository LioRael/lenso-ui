"use client";

import { InputOTP, Label, TextField } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
import { Slots, styles } from "../../en/input-otp/parts";
export function Basic() {
  return (
    <TextField name="code" xstyle={styles.field}>
      <div {...stylex.props(styles.heading)}>
        <Label>验证码</Label>
        <p {...stylex.props(styles.muted)}>输入六位验证码以继续。</p>
      </div>
      <InputOTP maxLength={6} name="code">
        <Slots />
      </InputOTP>
    </TextField>
  );
}
