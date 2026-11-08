"use client";
import { InputOTP, Label, TextField } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
import { Slots, styles } from "./parts";
export function Basic() {
  return (
    <TextField name="code" xstyle={styles.field}>
      <div {...stylex.props(styles.heading)}>
        <Label>Verification code</Label>
        <p {...stylex.props(styles.muted)}>Enter the six-digit code to continue.</p>
      </div>
      <InputOTP length={6} name="code">
        <Slots />
      </InputOTP>
    </TextField>
  );
}
